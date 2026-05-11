// src/components/PhaseProgressList.jsx
//
// Brand System §Phase Progress Box.
//
// Renders one bordered box per curriculum module (1–14).
// Each box: MODULE {N} — {UPPERCASE TITLE} + compact ProgressBar + "{x}/{y} steps".
// Entire box is a clickable Link → /roadmap?phase={moduleNumber}.
// Hover: border shifts to Electric Blue.
// Complete state (all steps done): green border, green title, green fill.
//
// Module titles are pulled from the section comment headers in roadmapData.js
// at build time — but since we don't have a comment-parser available, we
// derive titles from a static map keyed by module number. The map is the
// single source of truth for what each module is called on Dashboard.
// If the roadmap renames a module, update this map only — roadmapData.js
// doesn't carry module-level titles as data.
//
// Data flow:
//   - roadmapData filtered into per-module step buckets (by step.phase === N)
//   - completed = count of bucket steps whose id is in getCompletedSteps()
//   - total = bucket.length
//
// Props:
//   modules — array of { number, title, total, completed }
// Dashboard derives this once and passes it in; PhaseProgressList stays pure.

import { Link } from "react-router-dom";
import ProgressBar from "@/components/ProgressBar";
import "./PhaseProgressList.css";

function PhaseProgressList({ modules = [] }) {
  if (!Array.isArray(modules) || modules.length === 0) {
    return (
      <div className="phase-progress-list-empty">
        No modules to display.
      </div>
    );
  }

  return (
    <ul className="phase-progress-list" aria-label="Module progress">
      {modules.map((mod) => {
        const completed = Number.isFinite(mod.completed) ? mod.completed : 0;
        const total = Number.isFinite(mod.total) ? mod.total : 0;
        const isComplete = total > 0 && completed >= total;
        const moduleNumber = mod.number;
        const moduleTitle = mod.title || `Module ${moduleNumber}`;
        const titleUpper = moduleTitle.toUpperCase();

        return (
          <li
            key={moduleNumber}
            data-module={moduleNumber}
            className={`phase-progress-item${isComplete ? " is-complete" : ""}`}
          >
            <Link
              to={`/roadmap?phase=${moduleNumber}`}
              className="phase-progress-link"
              aria-label={`Go to Module ${moduleNumber}: ${moduleTitle}`}
            >
              <div className="phase-progress-title">
                MODULE {moduleNumber} — {titleUpper}
              </div>
              <div className="phase-progress-meta">
                <div className="phase-progress-bar-wrap">
                  <ProgressBar
                    value={completed}
                    max={total || 1}
                    variant="compact"
                    complete={isComplete}
                    label={`Module ${moduleNumber} progress: ${completed} of ${total} steps`}
                  />
                </div>
                <span className="phase-progress-count">
                  {completed}/{total} steps
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default PhaseProgressList;