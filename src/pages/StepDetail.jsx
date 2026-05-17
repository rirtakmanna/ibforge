// src/pages/StepDetail.jsx
//
// Hub page for one roadmap step. Three layouts by step.type:
//   learn          → course / topic / Mark Complete (no upload gate)
//   watch          → same shape as learn, "Watch Video" button
//   company-step   → APPLY summary + BUILD panel (upload + Mark Complete)
//                    + sub-page nav (Generate / LinkedIn)
//
// LOCKED redirects to /roadmap — direct URL access cannot bypass the lock.
//
// Note on status derivation: useStepStatus is memoized on stepId, so the
// same step + a new completion does not auto-rerun. We read status
// directly here using a refreshKey-bumped state. dataService.js remains
// the only file touching storage — we just re-read after writes.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { roadmapData } from "@/data/roadmapData";
import { companiesData } from "@/data/companiesData";
import {
  getCompletedSteps,
  getDeliverables,
  getNextStep,
  getUserPlan,
  markStepComplete,
  scheduleLinkedInPosts,
} from "@/utils/dataService";
import DeliverableUpload from "@/components/DeliverableUpload";
import DeliverableList from "@/components/DeliverableList";
import "./StepDetail.css";

const TYPE_BADGE_LABEL = {
  "company-step": "BUILD",
  learn: "LEARN",
  watch: "WATCH",
};

function deriveStatus(stepId) {
  const completed = getCompletedSteps();
  if (completed.includes(stepId)) return "complete";
  const next = getNextStep();
  if (next && next.id === stepId) return "active";
  return "locked";
}

function getCompanyForStep(step) {
  if (!step || step.type !== "company-step" || !step.companyId) return null;
  return companiesData.find((c) => c.id === step.companyId) || null;
}

function getChainContext(step) {
  if (
    !step ||
    step.type !== "learn" ||
    step.pattern !== "B" ||
    !step.learnChain
  ) {
    return null;
  }
  const chain = roadmapData.filter(
    (s) =>
      s.type === "learn" && s.pattern === "B" && s.learnChain === step.learnChain,
  );
  const position = chain.findIndex((s) => s.id === step.id) + 1;
  return { name: step.learnChain, position, total: chain.length };
}

function StepDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState(null); // { kind: 'success'|'error', text }
  const [marking, setMarking] = useState(false);

  const step = useMemo(() => roadmapData.find((s) => s.id === id), [id]);
  const stepIndex = useMemo(
    () => (step ? roadmapData.findIndex((s) => s.id === step.id) : -1),
    [step],
  );
  const totalSteps = roadmapData.length;
  const positionLabel = step
    ? `${step.id} / Step ${stepIndex + 1} of ${totalSteps}`
    : "";

  // Status + deliverables — re-read on refreshKey change.
  const status = useMemo(
    () => (step ? deriveStatus(step.id) : "locked"),
    [step, refreshKey],
  );
  const [deliverables, setDeliverables] = useState(() =>
    step ? getDeliverables(step.id) : [],
  );

  // Reload deliverables whenever stepId or refreshKey changes.
  useEffect(() => {
    if (!step) return;
    setDeliverables(getDeliverables(step.id));
  }, [step, refreshKey]);

  // Redirect locked steps to /roadmap.
  // Also redirect trial users who directly navigate to a non-phase-1 step.
  useEffect(() => {
    if (!step) return;
    if (status === "locked") {
      navigate("/roadmap", { replace: true });
      return;
    }
    const plan = getUserPlan();
    if (plan === "trial" && step.phase !== 1) {
      navigate("/roadmap", { replace: true });
    }
  }, [step, status, navigate]);

  // Missing step id — defensive fallback.
  if (!step) {
    return (
      <div className="step-detail">
        <Link to="/roadmap" className="step-detail__back">
          ← BACK TO ROADMAP
        </Link>
        <div className="step-detail__missing">
          Step not found: {String(id)}
        </div>
      </div>
    );
  }

  // While the redirect effect is flushing, render nothing visible to avoid
  // a flash of the page content for a step the user shouldn't see.
  if (status === "locked") {
    return <div className="step-detail" aria-hidden="true" />;
  }

  const isComplete = status === "complete";
  const company = getCompanyForStep(step);
  const chainContext = getChainContext(step);
  const typeBadge = TYPE_BADGE_LABEL[step.type] || step.type.toUpperCase();

  const handleUploaded = () => {
    setRefreshKey((n) => n + 1);
  };

  const handleDeleted = () => {
    setRefreshKey((n) => n + 1);
  };

  const handleMarkComplete = async () => {
    if (marking) return;
    setFeedback(null);

    // Gate: company-step with deliverableRequired must have an upload.
    if (
      step.type === "company-step" &&
      step.build &&
      step.build.deliverableRequired
    ) {
      const current = getDeliverables(step.id);
      if (current.length === 0) {
        setFeedback({
          kind: "error",
          text: "Upload at least one deliverable before marking complete.",
        });
        return;
      }
    }

    setMarking(true);
    try {
      // Await the Firestore write. markStepComplete updates the in-memory
      // cache (optimistic) immediately after the setDoc resolves, so the
      // refreshKey bump below will re-derive status as "complete".
      await markStepComplete(step.id);

      // Company-step: also schedule LinkedIn posts. Await so any error is
      // caught here, but don't fail the mark-complete on a scheduling error.
      if (
        step.type === "company-step" &&
        step.apply &&
        Array.isArray(step.apply.linkedInSchedule) &&
        step.apply.linkedInSchedule.length > 0
      ) {
        try {
          await scheduleLinkedInPosts(
            step.id,
            step.apply.linkedInSchedule,
            new Date(),
          );
        } catch (err) {
          // Don't fail the mark-complete if scheduling fails — log and continue.
          console.error(
            "[StepDetail] scheduleLinkedInPosts failed:",
            err,
          );
        }
      }

      setFeedback({ kind: "success", text: "Step marked complete." });
    } catch (err) {
      console.error("[StepDetail] markStepComplete failed:", err);
      setFeedback({
        kind: "error",
        text:
          err && err.message
            ? err.message
            : "Could not mark step complete.",
      });
    } finally {
      setMarking(false);
      setRefreshKey((n) => n + 1);
    }
  };

  // Sub-page nav state for company-step.
  const linkedInDisabled = !isComplete;

  return (
    <motion.div
      className="step-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
    >
      <Link to="/roadmap" className="step-detail__back">
        ← BACK TO ROADMAP
      </Link>

      {/* ─── Header ─── */}
      <header className="step-detail__header">
        <div className="step-detail__position">{positionLabel}</div>

        {step.type === "learn" && step.courseName && (
          <div className="step-detail__course-name">{step.courseName}</div>
        )}
        {step.type === "watch" && step.courseName && (
          <div className="step-detail__course-name">{step.courseName}</div>
        )}

        <h1 className="step-detail__title">{step.title}</h1>

        <div className="step-detail__meta">
          <span
            className={`step-detail__badge step-detail__badge--${step.type}`}
          >
            {typeBadge}
          </span>
          {isComplete && (
            <span className="step-detail__status step-detail__status--complete">
              COMPLETE
            </span>
          )}
          {!isComplete && (
            <span className="step-detail__status step-detail__status--active">
              ACTIVE
            </span>
          )}
          {chainContext && (
            <span className="step-detail__chain-context">
              CHAIN · {chainContext.name} · {chainContext.position} of{" "}
              {chainContext.total}
            </span>
          )}
        </div>
      </header>

      <hr className="step-detail__divider" />

      {/* ─── LEARN / WATCH layout ─── */}
      {(step.type === "learn" || step.type === "watch") && (
        <section className="step-detail__panel">
          <div className="step-detail__panel-header">
            <div className="step-detail__panel-label">TOPIC</div>
          </div>
          {step.topic && (
            <p className="step-detail__topic">{step.topic}</p>
          )}

          {Array.isArray(step.learnBeforeValuation) &&
            step.learnBeforeValuation.length > 0 && (
              <div className="step-detail__sub-panel">
                <div className="step-detail__panel-label">
                  LEARN BEFORE VALUATION
                </div>
                <ul className="step-detail__list">
                  {step.learnBeforeValuation.map((item, i) => (
                    <li key={i} className="step-detail__list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="step-detail__cta-row">
            {step.courseUrl ? (
              <a
                href={step.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="step-detail__action step-detail__action--secondary"
              >
                {step.type === "watch" ? "WATCH VIDEO →" : "OPEN COURSE →"}
              </a>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="step-detail__action step-detail__action--complete"
              onClick={handleMarkComplete}
              disabled={isComplete || marking}
              aria-busy={marking}
            >
              {isComplete
                ? "✓ COMPLETE"
                : marking
                  ? "MARKING…"
                  : "MARK COMPLETE"}
            </button>
          </div>

          {feedback && (
            <div
              className={`step-detail__feedback step-detail__feedback--${feedback.kind}`}
              role={feedback.kind === "error" ? "alert" : "status"}
            >
              {feedback.text}
            </div>
          )}
        </section>
      )}

      {/* ─── COMPANY-STEP layout ─── */}
      {step.type === "company-step" && (
        <>
          {/* APPLY panel */}
          <section className="step-detail__panel">
            <div className="step-detail__panel-header">
              <div className="step-detail__panel-label">APPLY</div>
              {company && (
                <div className="step-detail__company">
                  {company.name} · {company.sector} · {company.geography}
                </div>
              )}
            </div>

            {step.apply && step.apply.focusDo && (
              <div className="step-detail__sub-panel">
                <div className="step-detail__panel-label">FOCUS</div>
                <p className="step-detail__topic">{step.apply.focusDo}</p>
              </div>
            )}

            {step.apply &&
              Array.isArray(step.apply.valuationMethods) &&
              step.apply.valuationMethods.length > 0 && (
                <div className="step-detail__sub-panel">
                  <div className="step-detail__panel-label">
                    VALUATION METHODS
                  </div>
                  <ul className="step-detail__list">
                    {step.apply.valuationMethods.map((m, i) => (
                      <li key={i} className="step-detail__list-item">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {step.apply &&
              Array.isArray(step.apply.financialModels) &&
              step.apply.financialModels.length > 0 && (
                <div className="step-detail__sub-panel">
                  <div className="step-detail__panel-label">
                    FINANCIAL MODELS
                  </div>
                  <ul className="step-detail__list">
                    {step.apply.financialModels.map((m, i) => (
                      <li key={i} className="step-detail__list-item">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Sub-page nav: Generate Project + LinkedIn Posts */}
            <div className="step-detail__subnav">
              <Link
                to={`/step/${step.id}/generate`}
                className="step-detail__action step-detail__action--secondary"
              >
                GENERATE PROJECT →
              </Link>
              {linkedInDisabled ? (
                <span
                  className="step-detail__action step-detail__action--secondary step-detail__action--disabled"
                  aria-disabled="true"
                  role="link"
                  title="Available after this step is marked complete"
                >
                  LINKEDIN POSTS →
                </span>
              ) : (
                <Link
                  to={`/step/${step.id}/linkedin`}
                  className="step-detail__action step-detail__action--secondary"
                >
                  LINKEDIN POSTS →
                </Link>
              )}
            </div>
          </section>

          {/* BUILD panel */}
          <section className="step-detail__panel">
            <div className="step-detail__panel-header">
              <div className="step-detail__panel-label">BUILD</div>
            </div>

            {step.build && step.build.deliverable && (
              <div className="step-detail__sub-panel">
                <div className="step-detail__panel-label">DELIVERABLE</div>
                <p className="step-detail__topic">
                  {step.build.deliverable}
                </p>
              </div>
            )}

            {step.build && step.build.qualityBar && (
              <div className="step-detail__sub-panel">
                <div className="step-detail__panel-label">QUALITY BAR</div>
                <p className="step-detail__topic">
                  {step.build.qualityBar}
                </p>
              </div>
            )}

            <div className="step-detail__sub-panel">
              <div className="step-detail__panel-label">UPLOAD</div>
              <DeliverableUpload
                stepId={step.id}
                acceptedFileTypes={
                  step.build && Array.isArray(step.build.acceptedFileTypes)
                    ? step.build.acceptedFileTypes
                    : []
                }
                onUploaded={handleUploaded}
              />
            </div>

            <div className="step-detail__sub-panel">
              <div className="step-detail__panel-label">UPLOADED FILES</div>
              <DeliverableList
                stepId={step.id}
                deliverables={deliverables}
                onDeleted={handleDeleted}
              />
            </div>

            <div className="step-detail__cta-row">
              <button
                type="button"
                className="step-detail__action step-detail__action--complete"
                onClick={handleMarkComplete}
                disabled={isComplete || marking}
                aria-busy={marking}
              >
                {isComplete
                  ? "✓ COMPLETE"
                  : marking
                    ? "MARKING…"
                    : "MARK COMPLETE"}
              </button>
            </div>

            {feedback && (
              <div
                className={`step-detail__feedback step-detail__feedback--${feedback.kind}`}
                role={feedback.kind === "error" ? "alert" : "status"}
              >
                {feedback.text}
              </div>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}

export default StepDetail;