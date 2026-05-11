// src/components/PositionCard.jsx
//
// Dashboard Row 1 LEFT — Current Position card (25% width).
//
// Per Chat 1 APPROVED DESIGN (binding):
//   - Whole card is a <Link> to /step/{currentStepId}
//   - Shows only: position code (M{N}-S{NN}) + "/ Step X of Y"
//   - ProgressBar and counter MOVED OUT to ExecutionProgressCard (Row 1 right)
//   - Hover: border → Electric Blue (Brand §Hover State, 150ms linear)
//
// Brand System §Position Indicator:
//   M{N}-S{NN} in JetBrains Mono 48px, Electric Blue, -0.025em tracking.
//
// Props:
//   currentStepId — string ("M3-S04") or null when no active step exists.
//                   Used to build the /step/{id} route.
//   positionCode  — string displayed. Usually equal to currentStepId but kept
//                   as a separate prop so Dashboard owns the display string
//                   (e.g. could surface a different label in a future state).
//   stepIndex     — number (1-based index of active step in roadmapData)
//   totalSteps    — number (total step count)
//
// Empty state: when currentStepId is null (all steps complete), the card is
// rendered as a non-link <section> with "—" placeholder. The celebratory
// "all complete" layout lives upstream in Dashboard.

import { Link } from "react-router-dom";
import "./PositionCard.css";

function PositionCard({
  currentStepId,
  positionCode,
  stepIndex,
  totalSteps = 0,
}) {
  const hasPosition = Boolean(currentStepId && positionCode);
  const safeIndex = Number.isFinite(stepIndex) ? stepIndex : 0;
  const safeTotal = Number.isFinite(totalSteps) ? totalSteps : 0;

  const inner = (
    <div className="position-card-code-row">
      <span className="position-card-code">
        {hasPosition ? positionCode : "—"}
      </span>
      {hasPosition && safeTotal > 0 && (
        <span className="position-card-of">
          / Step {safeIndex} of {safeTotal}
        </span>
      )}
    </div>
  );

  if (!hasPosition) {
    return (
      <section
        className="position-card position-card--empty"
        aria-label="Current position"
      >
        {inner}
      </section>
    );
  }

  return (
    <Link
      to={`/step/${currentStepId}`}
      className="position-card position-card--link"
      aria-label={`Current position ${positionCode} — open step`}
    >
      {inner}
    </Link>
  );
}

export default PositionCard;