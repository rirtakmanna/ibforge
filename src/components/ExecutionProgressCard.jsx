// src/components/ExecutionProgressCard.jsx
//
// Dashboard Row 1 RIGHT — Execution Progress card (75% width).
//
// Per Chat 1 APPROVED DESIGN (binding):
//   - Replaces the Phase 1 "EXECUTION STATUS" section-title strip entirely.
//     The card's internal "EXECUTION PROGRESS" header is the new section label.
//   - Contains: header label + overall ProgressBar + counter.
//   - ProgressBar fill: Electric Blue → Success Green gradient (handled in
//     ProgressBar.css, not here).
//
// Props:
//   completed — number (count of completed steps)
//   total     — number (total step count in roadmap)
//   label     — string, defaults to "EXECUTION PROGRESS" (kept overridable
//               so the future Roadshow Status surface can reuse this card)
//
// Pure presentational — no dataService calls. Dashboard derives and passes in.

import ProgressBar from "@/components/ProgressBar";
import "./ExecutionProgressCard.css";

function ExecutionProgressCard({
  completed = 0,
  total = 0,
  label = "EXECUTION PROGRESS",
}) {
  const safeCompleted = Number.isFinite(completed) ? completed : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const hasTotal = safeTotal > 0;

  return (
    <section
      className="execution-progress-card"
      aria-label="Overall execution progress"
    >
      <header className="execution-progress-card-header">
        <span className="execution-progress-card-label">{label}</span>
      </header>

      <div className="execution-progress-card-bar">
        <ProgressBar
          value={safeCompleted}
          max={hasTotal ? safeTotal : 1}
          label={`Overall progress: ${safeCompleted} of ${safeTotal} steps complete`}
        />
      </div>

      <div className="execution-progress-card-counter">
        <span className="execution-progress-card-counter-num">
          {safeCompleted}
        </span>
        <span className="execution-progress-card-counter-sep">/</span>
        <span className="execution-progress-card-counter-total">
          {safeTotal}
        </span>
        <span className="execution-progress-card-counter-label">
          {" "}STEPS COMPLETE
        </span>
      </div>
    </section>
  );
}

export default ExecutionProgressCard;