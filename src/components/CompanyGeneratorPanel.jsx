// src/components/CompanyGeneratorPanel.jsx
//
// Renders the 5-part AI_Template prompt for one company-step.
//
// PHASE 2A: local fill only. No Gemini, no network. The Instructions part
// is built by filling AI_Template.md's body with placeholder values from
// roadmapData + companiesData. Phase 3 replaces ONLY the Instructions
// builder with a Gemini call — the 5-part rendering contract is stable.
//
// Section ordering follows AI_Template.md §GENERATOR OUTPUT SECTIONS:
//   1. Project Name
//   2. Files to Upload
//   3. Project Description
//   4. Instructions
//   5. All Chats
// Plus a standalone Emergency Mode block below the 5 parts.
//
// Props:
//   step    — roadmapData entry (must be type "company-step")
//   company — companiesData entry matched by step.companyId
//
// Both required. Parent (GenerateProject) resolves them from the URL :id.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import "./CompanyGeneratorPanel.css";

// ─── Fallback strings (AI_Template.md §NULL FIELD HANDLING) ─────────────────
const FALLBACK_FOCUS_IGNORE = "None specified for this build.";
const FALLBACK_LEARN_BEFORE = "Standard IB fundamentals.";
const FALLBACK_ADDITIONAL = "None.";

// ─── Emergency Mode static body (AI_Template.md §Minimum Execution Mode) ────
const EMERGENCY_MODE_TEXT = `Stuck. Answer only:
- What drives revenue?
- What drives margin?
- What is the valuation?
- What breaks it?
- What filing supports each answer?
Then: build immediately.`;

// ─── All Chats list (AI_Template.md §All Chats) ─────────────────────────────
// Returns an ARRAY of { number, text } so the JSX can render each chat as
// its own card with its own Copy button. The operator pastes each chat's
// text as the FIRST MESSAGE of a fresh Claude Project chat — copying a
// single concatenated block was the wrong abstraction.
// Item 8 is conditional on buildOrder ≥ 2. Phase 2A treats every build as
// the user's first → item 8 excluded. When a future phase adds a real
// buildOrder flag, gate the push of item 8 on it.
function buildAllChats(companyName) {
  const items = [
    `Entering IBProjectPhase 0 — ${companyName}. Lead this phase under the Execution Loop.`,
    `Entering IBProjectPhase 1 — Historical Rebuild. Lead this phase under the Execution Loop.`,
    `Entering IBProjectPhase 2 — Business Mechanics. Lead this phase under the Execution Loop.`,
    `Entering IBProjectPhase 3 — Assumptions. Lead this phase under the Execution Loop.`,
    `Entering IBProjectPhase 4 — Forecast Engine. Lead module by module under the Execution Loop.`,
    `Entering IBProjectPhase 5 — Valuation. Lead this phase under the Execution Loop.`,
    `Entering IBProjectPhase 6 — Stress Test. Break this model.`,
    // Item 8 omitted: conditional on buildOrder >= 2 — see comment above.
  ];
  return items.map((text, i) => ({ number: i + 1, text }));
}

// ─── Files to Upload — structured rows for HTML table rendering ─────────────
// Returns an ARRAY of { category, description }. The operator never pastes
// this anywhere — they read it and upload the listed files into Claude
// Project. So no markdown, no Copy button — just a clean HTML table.
function buildFilesToUploadRows(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  return files.map((f) => ({
    category: String(f.category || ""),
    description: String(f.description || ""),
  }));
}

// ─── Part 1 — Project Name ──────────────────────────────────────────────────
function buildProjectName(company) {
  return `${company.name} — IB Build`;
}

// ─── Part 3 — Project Description ───────────────────────────────────────────
function buildDescription(company) {
  return [
    `IB valuation build for ${company.name} — ${company.sector} — ${company.geography}.`,
    ``,
    `Building institutional-quality model across 8 phases. Each chat covers one phase or one sheet. Never mix phases in a single chat.`,
    ``,
    `Focus priority: ${company.focusPriorityDo}.`,
    ``,
    `Complexity: ${company.complexity}.`,
  ].join("\n");
}

// ─── Part 4 — Instructions (the long one) ───────────────────────────────────
function buildInstructions(step, company) {
  const a = step.apply || {};
  const b = step.build || {};

  const learnBefore = Array.isArray(a.learnBeforeValuation)
    ? a.learnBeforeValuation.join("; ")
    : a.learnBeforeValuation || FALLBACK_LEARN_BEFORE;

  const valuationMethods = Array.isArray(a.valuationMethods)
    ? a.valuationMethods.join("; ")
    : a.valuationMethods || "";

  const financialModels = Array.isArray(a.financialModels)
    ? a.financialModels.join("; ")
    : a.financialModels || "";

  const additional = Array.isArray(a.additionalRequirements)
    ? a.additionalRequirements.join("; ")
    : a.additionalRequirements || FALLBACK_ADDITIONAL;

  const focusIgnore = company.focusPriorityIgnore || FALLBACK_FOCUS_IGNORE;

  return `# Instructions

## Role & Mandate

You are acting as my Senior Investment Banking Associate — Direct Manager, Audit Lead, and Reasoning Attacker, all in one.

Your three responsibilities, in order of priority:

1. Enforce Structure. Run all 8 phases under the Execution Loop. Hold every phase gate. Do not advance until the gate criteria are met.

2. Pressure-test against filings. Every assumption I submit must be sourced to a specific AR page, footnote, or management commentary. If I give you a number without a source, reject the submission and send me back to find it.

3. Attack reasoning. Before I feel confident about any conclusion, destroy the logic. Find the assumption that breaks the model. Never praise. Never agree without a reason to agree.

You are not here to be agreeable. You are here to enforce modelling rigor.

---

## Company Context

- Company: ${company.name}
- Geography: ${company.geography}
- Sector: ${company.sector}
- Complexity: ${company.complexity}
- Focus Priority: ${company.focusPriorityDo}
- Ignore This Pass: ${focusIgnore}
- Learn Before Valuation: ${learnBefore}
- Valuation Methods: ${valuationMethods}
- Financial Models & Analysis: ${financialModels}
- Deliverables: ${b.deliverable || ""}
- Additional Requirements & Friction Points: ${additional}

---

## Core Rules

1. No Hand-Holding → logic only, no formulas
2. First-Principles → reject "consensus / average / feels right"
3. Historical-First → no forecast before clean statements, margin understanding, and WC + capital clarity
4. No Plugs → no hidden fixes
5. Hard Redirect → if I drift into formatting or low-value detail: STOP and force forward movement
6. No Unsourced Assumptions → every driver submitted for audit must carry a filing source. No source = submission rejected immediately, before logic is reviewed.

---

## Submission Protocol

Submit work in this format for every section:
1. The Logic — plain English of approach
2. The Source — AR year, page or footnote reference for every key input
3. The Syntax — formula structure written explicitly
4. The Output — resulting data table

Audit task, in order:
- Filing check first
- Logic check second
- Reasoning attack third

---

## Final Stress Test

Before closing the project:
- Run downside case
- Stress WACC and terminal growth
- Compare implied vs market multiples
- Extract market-implied growth
- Compare ROIC vs WACC
- Identify three structural risks

If assumptions are unrealistic, challenge them.`;
}

// ─── Header block prepended above Part 1 (AI_Template.md spec) ──────────────
function buildHeader(company) {
  return [
    `Generated by ATLAS CompanyGeneratorPanel`,
    `Template version: 1.0`,
    `Company: ${company.name} | Sector: ${company.sector} | Geography: ${company.geography}`,
    `Generated: ${new Date().toISOString()}`,
  ].join("\n");
}

// ─── Public — assemble all 5 parts + header + emergency block ───────────────
//
// Returns either { ok: true, parts: { header, name, files, description,
// instructions, allChats, emergency } } or { ok: false, error: string }.
// GenerateProject calls this; future Gemini integration calls this too and
// overrides parts.instructions with the Gemini response.
export function buildPromptParts(step, company) {
  if (!step || step.type !== "company-step") {
    return { ok: false, error: "Step must be a company-step." };
  }
  if (!company) {
    return {
      ok: false,
      error: `Company not found for step ${step.id}. Check companyId in roadmapData.`,
    };
  }

  // Required-field check per AI_Template.md §NULL FIELD HANDLING.
  //
  // valuationMethods and financialModels are INTENTIONALLY OPTIONAL.
  // Some company-steps (e.g. M1 accounting workbook extractions like
  // M1-S16 Infosys, M1-S17 HDFC) have valuationMethods: [] because no
  // valuation is performed at that stage — the workbook is reopened in
  // a later module where valuation is added. Treating empty arrays as
  // "missing" would block every M1 company-step. When these fields are
  // empty/absent, buildInstructions() renders a fallback line.
  const required = {
    "company.name": company.name,
    "company.sector": company.sector,
    "company.geography": company.geography,
    "company.complexity": company.complexity,
    "company.focusPriorityDo": company.focusPriorityDo,
    "step.build.deliverable": step.build && step.build.deliverable,
  };
  for (const [field, value] of Object.entries(required)) {
    const missing =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0);
    if (missing) {
      return {
        ok: false,
        error: `${field} is missing for ${company.name} — update the appropriate data file.`,
      };
    }
  }

  return {
    ok: true,
    parts: {
      header: buildHeader(company),
      name: buildProjectName(company),
      // files: ARRAY of { category, description } — rendered as HTML table.
      files: buildFilesToUploadRows(company.filesToUpload),
      description: buildDescription(company),
      instructions: buildInstructions(step, company),
      // allChats: ARRAY of { number, text } — one card + one Copy per entry.
      allChats: buildAllChats(company.name),
      emergency: EMERGENCY_MODE_TEXT,
    },
  };
}

// ─── Single-part card with own Copy button ──────────────────────────────────
function PartCard({ partLabel, title, body, isMono = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[CompanyGeneratorPanel] copy failed:", err);
    }
  };

  return (
    <section className="cg-panel__part">
      <header className="cg-panel__part-header">
        <div className="cg-panel__part-label">{partLabel}</div>
        <h3 className="cg-panel__part-title">{title}</h3>
      </header>
      <pre
        className={
          isMono
            ? "cg-panel__part-body cg-panel__part-body--mono"
            : "cg-panel__part-body"
        }
      >
        {body}
      </pre>
      <div className="cg-panel__part-actions">
        <motion.button
          type="button"
          className="cg-panel__copy"
          onClick={handleCopy}
          aria-label={`Copy ${title}`}
          animate={{ scale: copied ? 1.02 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {copied ? "COPIED ✓" : "COPY →"}
        </motion.button>
      </div>
    </section>
  );
}

// ─── Part 2 card — Files to Upload (HTML table, no Copy button) ─────────────
// Reference checklist. Operator reads rows and uploads listed files into the
// Claude Project they are creating. No paste target → no Copy button.
function FilesTablePart({ partLabel, title, rows }) {
  return (
    <section className="cg-panel__part cg-panel__part--files">
      <header className="cg-panel__part-header">
        <div className="cg-panel__part-label">{partLabel}</div>
        <h3 className="cg-panel__part-title">{title}</h3>
      </header>
      {rows.length === 0 ? (
        <p className="cg-panel__files-empty">No files specified.</p>
      ) : (
        <div className="cg-panel__files-table-wrap">
          <table className="cg-panel__files-table">
            <thead>
              <tr>
                <th scope="col" className="cg-panel__files-th cg-panel__files-th--category">
                  Category
                </th>
                <th scope="col" className="cg-panel__files-th">
                  Instruction
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row.category}-${i}`}>
                  <td className="cg-panel__files-td cg-panel__files-td--category">
                    <span
                      className={`cg-panel__files-tag cg-panel__files-tag--${row.category
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="cg-panel__files-td">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Part 5 card — All Chats (one sub-card + one Copy per chat) ─────────────
// Each chat is pasted as the FIRST MESSAGE of a fresh Claude Project chat.
// The copied text intentionally omits the "1.", "2." prefix.
function ChatListPart({ partLabel, title, chats }) {
  return (
    <section className="cg-panel__part cg-panel__part--chats">
      <header className="cg-panel__part-header">
        <div className="cg-panel__part-label">{partLabel}</div>
        <h3 className="cg-panel__part-title">{title}</h3>
        <p className="cg-panel__part-subtitle">
          Paste each as the first message of a fresh Claude Project chat.
        </p>
      </header>
      <ol className="cg-panel__chat-list">
        {chats.map((chat) => (
          <ChatCard key={chat.number} number={chat.number} text={chat.text} />
        ))}
      </ol>
    </section>
  );
}

// ─── Single chat card — own Copy button, copies text only (no number prefix) ─
function ChatCard({ number, text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[CompanyGeneratorPanel] chat copy failed:", err);
    }
  };

  return (
    <li className="cg-panel__chat-card">
      <div className="cg-panel__chat-card-num">CHAT {number}</div>
      <p className="cg-panel__chat-card-text">{text}</p>
      <motion.button
        type="button"
        className="cg-panel__copy cg-panel__copy--chat"
        onClick={handleCopy}
        aria-label={`Copy chat ${number} text`}
        animate={{ scale: copied ? 1.02 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {copied ? "COPIED ✓" : "COPY →"}
      </motion.button>
    </li>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
function CompanyGeneratorPanel({ step, company }) {
  const result = useMemo(
    () => buildPromptParts(step, company),
    [step, company],
  );

  if (!result.ok) {
    return (
      <div className="cg-panel cg-panel--error" role="alert">
        <div className="cg-panel__error-label">GENERATION BLOCKED</div>
        <p className="cg-panel__error-message">{result.error}</p>
      </div>
    );
  }

  const { parts } = result;

  return (
    <div className="cg-panel">
      <pre className="cg-panel__header-block">{parts.header}</pre>

      <PartCard partLabel="PART 1" title="Project Name" body={parts.name} />

      <FilesTablePart
        partLabel="PART 2"
        title="Files to Upload"
        rows={parts.files}
      />

      <PartCard
        partLabel="PART 3"
        title="Project Description"
        body={parts.description}
      />
      <PartCard
        partLabel="PART 4"
        title="Instructions"
        body={parts.instructions}
        isMono
      />

      <ChatListPart
        partLabel="PART 5"
        title="All Chats"
        chats={parts.allChats}
      />

      <section className="cg-panel__part cg-panel__part--emergency">
        <header className="cg-panel__part-header">
          <div className="cg-panel__part-label cg-panel__part-label--emergency">
            EMERGENCY MODE
          </div>
          <h3 className="cg-panel__part-title">Paste when stuck</h3>
        </header>
        <pre className="cg-panel__part-body">{parts.emergency}</pre>
        <div className="cg-panel__part-actions">
          <button
            type="button"
            className="cg-panel__copy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(parts.emergency);
              } catch (err) {
                console.error(
                  "[CompanyGeneratorPanel] emergency copy failed:",
                  err,
                );
              }
            }}
            aria-label="Copy emergency mode block"
          >
            COPY →
          </button>
        </div>
      </section>
    </div>
  );
}

export default CompanyGeneratorPanel;
