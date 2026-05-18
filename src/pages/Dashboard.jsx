// src/pages/Dashboard.jsx
//
// Dashboard — Cockpit redesign (Phase 5 issue #1).
//
// 5-band vertical stack:
//   Band A — IBFORGE // SYSTEM STATUS header + live clock
//   Band B — Position panel (380px) + Active panel (flex-1)
//   Band C — Module Status table (14 rows, status chips)
//   Band D — Queue (next 3 unlocked steps after active)
//   Band E — Output (4 monotonic counters)
//
// All data flows through dataService.js — components never touch storage.
//
// Onboarding modal integration is preserved verbatim from the prior layout.
// Modal floats above the Cockpit bands; the redesign and onboarding are
// independent systems.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCurrentPhase,
  getCompletedSteps,
  getDeliverables,
  getNextStep,
  getScheduledLinkedInPosts,
  hasCompletedOnboarding,
  markOnboardingComplete,
} from "@/utils/dataService";
import OnboardingModal from "@/components/OnboardingModal";
import { roadmapData } from "@/data/roadmapData";
import { MODULE_TITLES, getModuleTitle } from "@/data/moduleTitles";
import "./Dashboard.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function readSnapshot() {
  return {
    currentModule: getCurrentPhase(),
    completedSteps: getCompletedSteps() || [],
    nextStep: getNextStep(),
  };
}

function formatClock(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hour}:${minute}`;
}

function formatPercent(completed, total) {
  if (total === 0) return "0% complete";
  const pct = (completed / total) * 100;
  if (pct >= 10) return `${Math.round(pct)}% complete`;
  // Below 10%, one decimal place is more honest than rounding.
  return `${pct.toFixed(1)}% complete`;
}

function deriveStepType(step) {
  if (!step) return "";
  if (step.type === "company-step") return "BUILD";
  if (step.type === "learn") return "LEARN";
  if (step.type === "watch") return "WATCH";
  return String(step.type || "").toUpperCase();
}

function deriveQueueSubtitle(step) {
  if (!step) return "";
  if (step.type === "company-step") {
    return (step.build && step.build.deliverable) || "";
  }
  if (step.type === "learn") {
    return step.courseName || "";
  }
  if (step.type === "watch") {
    return step.videoTitle || step.courseName || "";
  }
  return "";
}

// ─── Component ──────────────────────────────────────────────────────────────

function Dashboard() {
  const [snapshot, setSnapshot] = useState(readSnapshot);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  // Onboarding — runs once on mount after auth + hydration (RequireAuth gates).
  useEffect(() => {
    let cancelled = false;
    hasCompletedOnboarding().then((done) => {
      if (!cancelled && !done) setShowOnboarding(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOnboardingDismiss = useCallback(() => {
    setShowOnboarding(false);
    // Persist so the modal doesn't reappear on next sign-in.
    markOnboardingComplete().catch((err) => {
      console.error("[Dashboard] markOnboardingComplete failed:", err);
    });
  }, []);

  // Cross-tab storage sync (Phase 3 swaps for Firestore listeners).
  useEffect(() => {
    function onStorage(e) {
      if (!e.key || !e.key.startsWith("atlas:")) return;
      setSnapshot(readSnapshot());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Live clock — updates every 60s.
  useEffect(() => {
    const id = setInterval(() => {
      setClock(formatClock(new Date()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // ─── Derived state ────────────────────────────────────────────────────────

  const totalSteps = roadmapData.length;
  const completedCount = snapshot.completedSteps.length;
  const allComplete = completedCount > 0 && completedCount >= totalSteps;

  const activeIndex = useMemo(() => {
    if (!snapshot.nextStep || !snapshot.nextStep.id) return 0;
    const idx = roadmapData.findIndex((s) => s.id === snapshot.nextStep.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [snapshot.nextStep]);

  const currentStep = snapshot.nextStep || null;
  const positionCode = currentStep ? currentStep.id : "—";
  const positionPercent = formatPercent(completedCount, totalSteps);
  const positionCounter = currentStep
    ? `STEP ${activeIndex} / ${totalSteps}`
    : `${totalSteps} / ${totalSteps}`;

  // CTA label depends on whether the active step has any uploaded deliverables.
  // We can't synchronously read deliverables for a specific step without a
  // dataService call. Defer to a simple heuristic: if completedSteps is empty
  // AND we're at the first step, "BEGIN"; otherwise "RESUME". This matches the
  // self-paced framing — "BEGIN" only on absolute first action.
  const ctaLabel =
    !currentStep
      ? "VIEW PORTFOLIO →"
      : completedCount === 0 && activeIndex === 1
        ? "BEGIN STEP →"
        : "RESUME STEP →";

  const ctaHref = currentStep ? `/step/${currentStep.id}` : "/portfolio";

  // Active panel label state.
  const activeLabel = allComplete
    ? "COMPLETE"
    : currentStep
      ? "ACTIVE"
      : "NEXT";

  // ─── Module status derivation ──────────────────────────────────────────────
  // For each module 1–14, compute: total steps, completed steps, status.
  // Status = COMPLETE if all done, IN PROGRESS if any done OR active step
  // is in this module, otherwise LOCKED.

  const modules = useMemo(() => {
    const completedSet = new Set(snapshot.completedSteps);
    const activeModuleNumber = currentStep ? currentStep.phase : null;

    // Group steps by phase (module number).
    const byModule = new Map();
    for (const step of roadmapData) {
      const n = step.phase;
      if (!byModule.has(n)) {
        byModule.set(n, { number: n, total: 0, completed: 0 });
      }
      const bucket = byModule.get(n);
      bucket.total += 1;
      if (completedSet.has(step.id)) bucket.completed += 1;
    }

    return Array.from(byModule.values())
      .sort((a, b) => a.number - b.number)
      .map((mod) => {
        let status;
        if (mod.completed >= mod.total) {
          status = "complete";
        } else if (mod.completed > 0 || mod.number === activeModuleNumber) {
          status = "progress";
        } else {
          status = "locked";
        }
        return {
          ...mod,
          title: getModuleTitle(mod.number) || MODULE_TITLES[mod.number] || `Module ${mod.number}`,
          status,
        };
      });
  }, [snapshot.completedSteps, currentStep]);

  // ─── Queue derivation — next 3 unlocked after the active step ──────────────

  const queue = useMemo(() => {
    if (!currentStep) return [];
    const idx = roadmapData.findIndex((s) => s.id === currentStep.id);
    if (idx < 0) return [];
    // The active step itself lives in Band B — exclude it from the queue.
    return roadmapData.slice(idx + 1, idx + 4);
  }, [currentStep]);

  // ─── Output counters ───────────────────────────────────────────────────────

  const modulesComplete = useMemo(
    () => modules.filter((m) => m.status === "complete").length,
    [modules],
  );

  const totalModules = modules.length;

  const deliverablesShipped = useMemo(() => {
    // We can't summon getDeliverables here cleanly without adding it to imports.
    // Add `getDeliverables` to the top-level import from "@/utils/dataService".
    let count = 0;
    for (const id of snapshot.completedSteps) {
      const arr = getDeliverables(id) || [];
      count += arr.length;
    }
    return count;
  }, [snapshot.completedSteps]);

  const linkedInLive = useMemo(() => {
    const posts = getScheduledLinkedInPosts() || [];
    const total = posts.length;
    const posted = posts.filter((p) => p.status === "Posted").length;
    return { posted, total };
  }, [snapshot.completedSteps]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="dashboard">
      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}

      {/* ── Band A — IBFORGE // SYSTEM STATUS ── */}
      <section className="dashboard-band-a" aria-label="System status">
        <span className="dashboard-band-a-label">IBFORGE // SYSTEM STATUS</span>
        <span className="dashboard-band-a-clock">{clock}</span>
      </section>

      {/* ── Band B — Position (380px) + Active (flex-1) ── */}
      <section
        className="dashboard-band-b"
        aria-label="Current position and active step"
      >
        <div className="dashboard-band-b-position">
          <div>
            <div
              className={
                allComplete
                  ? "dashboard-position-mcode dashboard-position-mcode-empty"
                  : "dashboard-position-mcode"
              }
            >
              {allComplete ? "ALL COMPLETE" : positionCode}
            </div>
            <div className="dashboard-position-divider" />
            <div className="dashboard-position-counter">{positionCounter}</div>
            <div className="dashboard-position-percent">{positionPercent}</div>
          </div>
          <div className="dashboard-position-bar-track">
            <div
              className={
                allComplete
                  ? "dashboard-position-bar-fill dashboard-position-bar-fill-complete"
                  : "dashboard-position-bar-fill"
              }
              style={{
                transform: `scaleX(${totalSteps === 0 ? 0 : completedCount / totalSteps})`,
              }}
            />
          </div>
        </div>

        <div className="dashboard-band-b-active">
          <span
            className={
              allComplete
                ? "dashboard-active-label dashboard-active-label-complete"
                : "dashboard-active-label"
            }
          >
            {activeLabel}
          </span>
          {currentStep ? (
            <>
              <h2 className="dashboard-active-title">{currentStep.title}</h2>
              <div className="dashboard-active-meta">
                {currentStep.type} · Module {currentStep.phase}
              </div>
            </>
          ) : (
            <>
              <h2 className="dashboard-active-title">
                You've completed every step.
              </h2>
              <div className="dashboard-active-meta">
                Review your portfolio of deliverables.
              </div>
            </>
          )}
          <Link
            to={ctaHref}
            className="dashboard-active-cta"
            aria-label={
              currentStep
                ? `Resume ${currentStep.id}: ${currentStep.title}`
                : "View portfolio"
            }
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* ── Band C — Module Status ── */}
      <section className="dashboard-band-c" aria-label="Module status">
        <div className="dashboard-band-section-header">MODULE STATUS</div>
        <div className="dashboard-modules-list">
          {modules.map((mod) => {
            const moduleCode = `M${String(mod.number).padStart(2, "0")}`;
            const chipSymbol =
              mod.status === "complete"
                ? "●"
                : mod.status === "progress"
                  ? "◐"
                  : "○";
            const chipLabel =
              mod.status === "complete"
                ? "COMPLETE"
                : mod.status === "progress"
                  ? "IN PROGRESS"
                  : "LOCKED";
            const chipClass =
              mod.status === "complete"
                ? "dashboard-module-chip dashboard-module-chip-complete"
                : mod.status === "progress"
                  ? "dashboard-module-chip dashboard-module-chip-progress"
                  : "dashboard-module-chip dashboard-module-chip-locked";
            const fillClass =
              mod.status === "complete"
                ? "dashboard-module-bar-fill dashboard-module-bar-fill-complete"
                : "dashboard-module-bar-fill";

            return (
              <Link
                key={mod.number}
                to={`/roadmap?module=${mod.number}`}
                className="dashboard-module-row"
                aria-label={`${moduleCode} ${mod.title} — ${mod.completed} of ${mod.total} steps, ${chipLabel}`}
              >
                <span className="dashboard-module-code">{moduleCode}</span>
                <span className="dashboard-module-title">{mod.title}</span>
                <span
                  className="dashboard-module-bar-track"
                  role="progressbar"
                  aria-valuenow={mod.completed}
                  aria-valuemax={mod.total}
                >
                  <span
                    className={fillClass}
                    style={{
                      transform: `scaleX(${mod.total === 0 ? 0 : mod.completed / mod.total})`,
                    }}
                  />
                </span>
                <span className="dashboard-module-count">
                  {mod.completed}/{mod.total}
                </span>
                <span className={chipClass}>
                  <span className="dashboard-module-chip-symbol" aria-hidden="true">
                    {chipSymbol}
                  </span>
                  <span className="dashboard-module-chip-label">
                    {chipLabel}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Band D — Queue ── */}
      <section className="dashboard-band-d" aria-label="Up next">
        <div className="dashboard-band-section-header">
          QUEUE — NEXT 3 IN ORDER
        </div>
        {queue.length === 0 ? (
          <div className="dashboard-queue-empty">
            {allComplete ? (
              <>
                All steps complete —{" "}
                <Link to="/portfolio">see your portfolio →</Link>
              </>
            ) : (
              "End of roadmap — final step in progress."
            )}
          </div>
        ) : (
          <div className="dashboard-queue-list">
            {queue.map((step) => {
              const stepType = deriveStepType(step);
              const subtitle = deriveQueueSubtitle(step);
              const typeClass =
                stepType === "BUILD"
                  ? "dashboard-queue-type dashboard-queue-type-build"
                  : "dashboard-queue-type";
              return (
                <Link
                  key={step.id}
                  to={`/step/${step.id}`}
                  className="dashboard-queue-row"
                  aria-label={`${step.id}: ${step.title}`}
                >
                  <span className="dashboard-queue-marker" aria-hidden="true">
                    ▸
                  </span>
                  <span className="dashboard-queue-code">{step.id}</span>
                  <div className="dashboard-queue-content">
                    <div className="dashboard-queue-title">{step.title}</div>
                    {subtitle && (
                      <div className="dashboard-queue-subtitle">{subtitle}</div>
                    )}
                  </div>
                  <span className={typeClass}>{stepType}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Band E — Output ── */}
      <section className="dashboard-band-e" aria-label="Output totals">
        <div className="dashboard-band-section-header">OUTPUT</div>
        <div className="dashboard-output-grid">
          <div className="dashboard-output-cell">
            <span className="dashboard-output-label">STEPS COMPLETE</span>
            <span className="dashboard-output-value">
              {completedCount} / {totalSteps}
            </span>
          </div>
          <div className="dashboard-output-cell">
            <span className="dashboard-output-label">MODULES COMPLETE</span>
            <span className="dashboard-output-value">
              {modulesComplete} / {totalModules}
            </span>
          </div>
          <div className="dashboard-output-cell">
            <span className="dashboard-output-label">DELIVERABLES SHIPPED</span>
            <span className="dashboard-output-value">
              {deliverablesShipped}
            </span>
          </div>
          <div className="dashboard-output-cell">
            <span className="dashboard-output-label">
              LINKEDIN POSTS LIVE
            </span>
            <span className="dashboard-output-value">
              {linkedInLive.total === 0
                ? "0"
                : `${linkedInLive.posted} / ${linkedInLive.total}`}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;