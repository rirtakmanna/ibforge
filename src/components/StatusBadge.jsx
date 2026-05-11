// src/components/StatusBadge.jsx
//
// Three status states only — LOCKED / ACTIVE / COMPLETE.
// No intermediate states. Brand System §Status System.
//
// Variants:
//   inline (default) — small badge for use in cards, table rows, headers
//   full-width      — full-width pill, used on StepDetail header
//
// ACTIVE state shows an 8×8 pulsing dot (Framer Motion, opacity loop).
// The dot is the ONLY rounded element on the badge (Brand System §Visual
// Direction — sole exception to sharp-corners rule).

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import "./StatusBadge.css";

const LABELS = {
  locked: "LOCKED",
  active: "ACTIVE",
  complete: "COMPLETE",
};

function StatusBadge({ status, variant = "inline", showIcon = true }) {
  const safeStatus = LABELS[status] ? status : "locked";
  const label = LABELS[safeStatus];

  return (
    <span
      className={`status-badge status-badge--${safeStatus} status-badge--${variant}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showIcon && safeStatus === "locked" && (
        <Lock className="status-badge-icon" aria-hidden="true" />
      )}
      {showIcon && safeStatus === "active" && (
        <motion.span
          className="status-badge-dot"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
          aria-hidden="true"
        />
      )}
      {showIcon && safeStatus === "complete" && (
        <Check className="status-badge-icon" aria-hidden="true" />
      )}
      <span className="status-badge-label">{label}</span>
    </span>
  );
}

export default StatusBadge;