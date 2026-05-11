// src/components/PhaseHeader.jsx
//
// Brand System §Phase Progress Box (label format) + §Status System (complete state).
//
// Visual header strip for one curriculum module on the Roadmap page.
// Sits inside AccordionSection as the trigger's visual content — it does NOT
// own the click handler or render the chevron. Those live in AccordionSection.
//
// Renders:
//   - "MODULE {N} — {UPPERCASE TITLE}"  (JetBrains Mono 12px, muted by default)
//   - "{completed}/{total} steps"        (JetBrains Mono 11px, muted)
//   - Complete state: green title, green count, green left accent
//
// Props:
//   moduleNumber — number  (1–14, required)
//   total        — number  (count of steps in this module, required)
//   completed    — number  (count of those steps marked complete, required)
//
// Module title is looked up by moduleNumber via src/data/moduleTitles.js
// (single source of truth for curriculum module titles).

import { getModuleTitle } from "@/data/moduleTitles";
import "./PhaseHeader.css";

function PhaseHeader({ moduleNumber, total, completed }) {
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeCompleted = Number.isFinite(completed) ? completed : 0;
  const isComplete = safeTotal > 0 && safeCompleted >= safeTotal;
  const title = getModuleTitle(moduleNumber);

  return (
    <div
      className={`phase-header${isComplete ? " phase-header--complete" : ""}`}
      data-module={moduleNumber}
    >
      <div className="phase-header__label">
        <span className="phase-header__module-num">MODULE {moduleNumber}</span>
        <span className="phase-header__dash">—</span>
        <span className="phase-header__title">{title.toUpperCase()}</span>
      </div>
      <div
        className="phase-header__count"
        aria-label={`${safeCompleted} of ${safeTotal} steps complete`}
      >
        {safeCompleted}/{safeTotal} steps
      </div>
    </div>
  );
}

export default PhaseHeader;