// src/components/StepCard.jsx
//
// Brand System §Step Card + §Status System + §Learn Chain Visual.
//
// One row in the Roadmap step list.
//
// Layout (single row):
//   [POSITION CODE]  [TYPE BADGE]  [TITLE — flexes]  [STATUS BADGE]
//
// States (all from useStepStatus(stepId)):
//   LOCKED   — greyed, cursor: not-allowed, native title tooltip, NOT clickable
//   ACTIVE   — Electric Blue accent on the position code; entire card clickable → /step/:id
//   COMPLETE — Success Green on status badge; entire card clickable → /step/:id
//
// Pattern B (continuous case study) overlay:
//   When step.type === 'learn' && step.pattern === 'B', renders a 3px Electric
//   Blue left border (Brand System §Learn Chain Visual Part 1).
//   Chain connector top/bottom half-rendering is delegated to AccordionSection
//   in a later phase — Step 3 only implements Part 1 (per-card left accent).
//
// Type badge text mapping:
//   'company-step' → 'BUILD'   (Portfolio TYPE column also uses BUILD — DD8)
//   'learn'        → 'LEARN'
//   'watch'        → 'WATCH'
//
// Props:
//   step — full step object from roadmapData.js (required)
//
// No other props. StepCard derives everything it needs from `step` + the
// useStepStatus hook keyed by step.id.

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStepStatus } from "@/utils/useStepStatus";
import StatusBadge from "@/components/StatusBadge";
import "./StepCard.css";

const TYPE_LABEL = {
  "company-step": "BUILD",
  learn: "LEARN",
  watch: "WATCH",
};

function StepCard({ step }) {
  const { status, isLocked, isActive, isComplete } = useStepStatus(step.id);

  const typeLabel = TYPE_LABEL[step.type] || step.type?.toUpperCase() || "STEP";
  const isPatternB = step.type === "learn" && step.pattern === "B";

  // Class assembly
  const classes = [
    "step-card",
    `step-card--${status}`,
    isPatternB ? "step-card--chain" : "",
    `step-card--type-${step.type || "unknown"}`,
  ]
    .filter(Boolean)
    .join(" ");

  // Inner content shared by both Link and div renderings
  const content = (
    <>
      <span className="step-card__code">{step.id}</span>
      <span
        className={`step-card__type step-card__type--${step.type || "unknown"}`}
      >
        {typeLabel}
      </span>
      <span className="step-card__title" title={step.title}>
        {step.title}
      </span>
      <span className="step-card__status">
        <StatusBadge status={status} />
      </span>
    </>
  );

  // Framer Motion entrance — staggered by parent (AccordionSection in 3.D)
  const itemVariant = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  if (isLocked) {
    return (
      <motion.div
        className={classes}
        variants={itemVariant}
        role="listitem"
        aria-disabled="true"
        title="Complete the previous step to unlock"
        data-step-id={step.id}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={classes}
      variants={itemVariant}
      role="listitem"
      data-step-id={step.id}
    >
      <Link
        to={`/step/${step.id}`}
        className="step-card__link"
        aria-label={`Open ${step.id} — ${step.title} (${status})`}
      >
        {content}
      </Link>
    </motion.div>
  );
}

export default StepCard;
