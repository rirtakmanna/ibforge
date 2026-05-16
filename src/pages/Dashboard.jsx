// src/pages/Dashboard.jsx
//
// Dashboard — APPROVED DESIGN (Chat 1, binding; see CHAT_HANDOFF.md).
//
// New grid structure (replaces the Phase 1 section-title + Row 1/Row 2 spec):
//
//   Row 1 — 25fr / 75fr
//     Left 25%:  PositionCard (clickable, position-only)
//     Right 75%: ExecutionProgressCard (header label + ProgressBar + counter)
//
//   Row 2 — 75fr / 25fr
//     Left 75%:  MODULE PROGRESS section
//                  ├ header strip: "MODULE PROGRESS" label
//                  │                + conditional "Jump to current → M{N}" link
//                  └ PhaseProgressList (14 boxes)
//     Right 25%: NextStepCard (content-sized — never stretches)
//
// Tablet (768–1023px): Row 1 stays side-by-side at 25/75. Row 2 splits
// vertically: NextStepCard full-width directly under Row 1, then Module
// Progress full-width below.
//
// Mobile (<768px): single column stack — Current Position → Execution
// Progress → Next Step → Module Progress.
//
// Removed: the Phase 1 "EXECUTION STATUS" <header> strip is gone. Its
// section-identifier role is now played by ExecutionProgressCard's
// internal "EXECUTION PROGRESS" header label.
//
// All data flows through dataService.js (the monopoly layer).
//
// The "Jump to current" link smooth-scrolls to the module box matching
// snapshot.currentModule using scrollIntoView, with a prefers-reduced-motion
// guard (instant jump when reduced motion is requested).

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentPhase,
  getCompletedSteps,
  getNextStep,
  hasCompletedOnboarding,
  markOnboardingComplete,
} from "@/utils/dataService";
import OnboardingModal from "@/components/OnboardingModal";
import { roadmapData } from "@/data/roadmapData";
import PositionCard from "@/components/PositionCard";
import ExecutionProgressCard from "@/components/ExecutionProgressCard";
import PhaseProgressList from "@/components/PhaseProgressList";
import NextStepCard from "@/components/NextStepCard";
import "./Dashboard.css";

// Canonical module titles — single source of truth for Dashboard.
// Sourced from ATLAS_Roadmap.md module section headers. Edit here only.
const MODULE_TITLES = {
  1: "Accounting Foundation",
  2: "Financial Modelling",
  3: "DCF Valuation",
  4: "Trading Comps & Precedents",
  5: "Strategic Analysis",
  6: "IT Services Modelling",
  7: "Bank & FIG Valuation",
  8: "LBO Modelling",
  9: "Merger Modelling",
  10: "Pharma & Hospitality",
  11: "SOTP & Conglomerates",
  12: "Credit Analysis",
  13: "Pitchbook Construction",
  14: "Interview & Portfolio",
};

function readSnapshot() {
  return {
    currentModule: getCurrentPhase(),
    completedSteps: getCompletedSteps() || [],
    nextStep: getNextStep(),
  };
}

function Dashboard() {
  const [snapshot, setSnapshot] = useState(readSnapshot);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if the onboarding modal should appear.
  // Runs once on mount after auth + hydration (guaranteed by RequireAuth gate).
  useEffect(() => {
    let cancelled = false;
    hasCompletedOnboarding().then((done) => {
      if (!cancelled && !done) setShowOnboarding(true);
    });
    return () => { cancelled = true; };
  }, []);

  const handleOnboardingDismiss = useCallback(() => {
    setShowOnboarding(false);
  }, []);
  // Re-read state when localStorage changes in another tab. Phase 3 swaps
  // this for Firestore listeners.
  useEffect(() => {
    function onStorage(e) {
      if (!e.key || !e.key.startsWith("atlas:")) return;
      setSnapshot(readSnapshot());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Derived values
  const totalSteps = roadmapData.length;
  const activeIndex = useMemo(() => {
    if (!snapshot.nextStep || !snapshot.nextStep.id) return 0;
    const idx = roadmapData.findIndex((s) => s.id === snapshot.nextStep.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [snapshot.nextStep]);

  const completedCount = snapshot.completedSteps.length;
  const allComplete = completedCount > 0 && completedCount >= totalSteps;
  const currentStepId = snapshot.nextStep ? snapshot.nextStep.id : null;
  const positionCode = currentStepId; // Display string equals id in Phase 2A.

  // Per-module aggregation
  const modules = useMemo(() => {
    const completedSet = new Set(snapshot.completedSteps);
    const byModule = new Map();
    for (const step of roadmapData) {
      const n = step.phase;
      if (!byModule.has(n))
        byModule.set(n, { number: n, total: 0, completed: 0 });
      const bucket = byModule.get(n);
      bucket.total += 1;
      if (completedSet.has(step.id)) bucket.completed += 1;
    }
    return Array.from(byModule.values())
      .sort((a, b) => a.number - b.number)
      .map((mod) => ({
        ...mod,
        title: MODULE_TITLES[mod.number] || `Module ${mod.number}`,
      }));
  }, [snapshot.completedSteps]);

  // "Jump to current" visibility rule per APPROVED DESIGN:
  //   shown when getNextStep() !== null AND NOT (currentModule===1 AND completed===0)
  const showJumpLink =
    snapshot.nextStep !== null &&
    !(snapshot.currentModule === 1 && completedCount === 0);

  // Smooth-scroll to data-module="{N}" — respects prefers-reduced-motion.
  const handleJumpToCurrent = useCallback(
    (e) => {
      e.preventDefault();
      if (!snapshot.currentModule) return;
      const target = document.querySelector(
        `[data-module="${snapshot.currentModule}"]`
      );
      if (!target) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [snapshot.currentModule]
  );

  // Precomputed strings — Vite/OXC parser rejects template literals inside
  // JSX attribute expressions. Compute here, reference as plain identifiers.
  const jumpHref = "#module-" + snapshot.currentModule;
  const jumpAriaLabel =
    "Jump to current module: Module " + snapshot.currentModule;

  return (
    <div className="dashboard">
      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}
      {/* ── Row 1 — Position (25fr) | Execution Progress (75fr) ── */}
      <section
        className="dashboard-row1"
        aria-label="Current position and execution progress"
      >
        <div className="dashboard-row1-position">
          <PositionCard
            currentStepId={currentStepId}
            positionCode={positionCode}
            stepIndex={activeIndex}
            totalSteps={totalSteps}
          />
        </div>
        <div className="dashboard-row1-progress">
          <ExecutionProgressCard
            completed={completedCount}
            total={totalSteps}
          />
        </div>
      </section>

      {/* ── Row 2 — Module Progress (75fr) | Next Step (25fr) ── */}
      <section
        className="dashboard-row2"
        aria-label="Module progress and next step"
      >
        <div className="dashboard-row2-modules">
          <header className="dashboard-modules-header">
            <span className="dashboard-modules-label">MODULE PROGRESS</span>
            {showJumpLink && (
              <a
                href={jumpHref}
                className="dashboard-modules-jump"
                onClick={handleJumpToCurrent}
                aria-label={jumpAriaLabel}
              >
                Jump to current → M{snapshot.currentModule}
              </a>
            )}
          </header>
          <div className="dashboard-modules-body">
            <PhaseProgressList modules={modules} />
          </div>
        </div>
        <div className="dashboard-row2-next">
          <NextStepCard step={snapshot.nextStep} completed={allComplete} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;