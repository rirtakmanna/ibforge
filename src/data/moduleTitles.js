// src/data/moduleTitles.js
//
// Curriculum module titles — single source of truth.
//
// roadmapData.js intentionally has NO module-title field; module titles live
// here as display metadata. The 14 modules and their titles are curriculum
// constants (not user data, not operator-edited via the data layer per se),
// so they sit in src/data/ as a sibling file alongside roadmapData.js.
//
// Usage:
//   - Roadmap page (PhaseHeader) imports from here.
//   - Dashboard's PhaseProgressList currently inlines its own copy of these
//     same titles. A future phase (post-Phase 2A) can refactor Dashboard to
//     import from here; for now the two copies must agree. If you rename a
//     module, update BOTH locations in the same commit.
//
// Format rule: stored in Title Case here. Components uppercase at render time
// (Brand System §Phase Progress Box format `MODULE {N} — {FULL TITLE IN
// UPPERCASE}`). Never store the values uppercase — display transform belongs
// in CSS / template, not data.
//
// Source: ATLAS_Roadmap.md §Module-by-module breakdown table.

export const MODULE_TITLES = {
  1: "Accounting Foundation",
  2: "3-Statement Integrated Model",
  3: "DCF Valuation",
  4: "Trading Comps & Precedent Transactions",
  5: "Strategic Analysis & Capital Allocation",
  6: "Platform Valuation & Driver Modelling",
  7: "Bank Modelling & DDM",
  8: "LBO + Paper LBO + Covenants",
  9: "M&A Process & Merger Model",
  10: "Pharma & Healthcare Valuation",
  11: "Conglomerate & SOTP Valuation",
  12: "Credit Analysis & Lending",
  13: "Pitchbooks & Equity Research",
  14: "Interview Prep, Deal Tracking & Networking",
};

/**
 * Returns the title for a curriculum module number (1–14).
 * Falls back to a safe string if the number is out of range.
 * @param {number} moduleNumber
 * @returns {string}
 */
export function getModuleTitle(moduleNumber) {
  return MODULE_TITLES[moduleNumber] || `Module ${moduleNumber}`;
}
