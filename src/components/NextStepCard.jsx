// src/components/NextStepCard.jsx
//
// Brand System §NextStepCard.
//
// Displays the single next actionable step. Always content-sized — never stretches.
//
// Props:
//   step      — the next-step object from roadmapData (or null when nothing is active)
//   completed — boolean: true when all roadmap steps are complete
//
// States:
//   1. step provided        → renders position code, type badge, title, optional company,
//                             and a "Continue →" primary button → /step/:id
//   2. step null + completed → "All steps complete" celebratory state
//   3. step null + !completed → "Begin Phase 1 →" empty state (user hasn't started)
//      In practice this happens only when roadmapData is empty or the first step has
//      no resolvable id; Dashboard guards both cases.
//
// The component is pure — no dataService calls. Dashboard derives `step` and
// `completed`, passes them in.

import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import "./NextStepCard.css";

function NextStepCard({ step, completed = false }) {
  const navigate = useNavigate();

  if (!step) {
    if (completed) {
      return (
        <section
          className="next-step-card next-step-card--complete"
          aria-label="All steps complete"
        >
          <div className="next-step-card-header">
            <span className="next-step-card-label">STATUS</span>
          </div>
          <h2 className="next-step-card-title next-step-card-title--complete">
            <CheckCircle2
              className="next-step-card-complete-icon"
              aria-hidden="true"
            />
            All steps complete
          </h2>
          <p className="next-step-card-body">
            Every roadmap step is finished. Review your portfolio for the
            full deliverable record.
          </p>
        </section>
      );
    }

    // Empty state — user has not begun yet (or roadmap data is unavailable)
    return (
      <section
        className="next-step-card next-step-card--empty"
        aria-label="Begin roadmap"
      >
        <div className="next-step-card-header">
          <span className="next-step-card-label">NEXT</span>
        </div>
        <h2 className="next-step-card-title">Begin Module 1</h2>
        <p className="next-step-card-body">
          Open the roadmap and start with the first step.
        </p>
        <button
          type="button"
          className="next-step-card-button"
          onClick={() => navigate("/roadmap")}
        >
          <span>BEGIN ROADMAP</span>
          <ArrowRight className="next-step-card-button-icon" aria-hidden="true" />
        </button>
      </section>
    );
  }

  const stepTypeLabel =
    step.type === "company-step"
      ? "COMPANY STEP"
      : step.type === "watch"
      ? "WATCH"
      : "LEARN";

  return (
    <section className="next-step-card" aria-label="Next step">
      <div className="next-step-card-header">
        <span className="next-step-card-label">NEXT</span>
        <StatusBadge status="active" />
      </div>

      <div className="next-step-card-meta">
        <span className="next-step-card-code">{step.id}</span>
        <span className="next-step-card-type">{stepTypeLabel}</span>
      </div>

      <h2 className="next-step-card-title">{step.title}</h2>

      {step.courseName && (
        <p className="next-step-card-subtitle">{step.courseName}</p>
      )}

      <button
        type="button"
        className="next-step-card-button"
        onClick={() => navigate(`/step/${step.id}`)}
      >
        <span>CONTINUE</span>
        <ArrowRight className="next-step-card-button-icon" aria-hidden="true" />
      </button>
    </section>
  );
}

export default NextStepCard;