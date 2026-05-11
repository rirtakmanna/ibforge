// src/components/ProgressBar.jsx
//
// Animated horizontal progress bar — Brand System §Progress Display
// + §Animation Specifications #6 Progress Bar Fill.
//
// Props:
//   value      — number (completed count)
//   max        — number (total count, must be > 0)
//   variant    — "default" (6px) | "compact" (4px, used in PhaseProgressList)
//   complete   — boolean override; when true, fill is Success Green regardless of value/max
//   label      — string for aria-label (e.g. "Roadmap progress: 12 of 145 steps")
//
// Fill is gradient Electric Blue → Success Green by default.
// When value === max OR complete prop is true, fill is solid Success Green.

import { motion } from "framer-motion";
import "./ProgressBar.css";

function clampPercentage(value, max) {
  if (typeof max !== "number" || max <= 0) return 0;
  const raw = (value / max) * 100;
  if (Number.isNaN(raw)) return 0;
  if (raw < 0) return 0;
  if (raw > 100) return 100;
  return raw;
}

function ProgressBar({
  value = 0,
  max = 1,
  variant = "default",
  complete = false,
  label,
}) {
  const percentage = clampPercentage(value, max);
  const isComplete = complete || (max > 0 && value >= max);
  const ariaLabel =
    label || `Progress: ${value} of ${max}`;

  return (
    <div
      className={`progress-bar progress-bar--${variant}${
        isComplete ? " is-complete" : ""
      }`}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <motion.div
        className="progress-bar-fill"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: percentage / 100 }}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  );
}

export default ProgressBar;