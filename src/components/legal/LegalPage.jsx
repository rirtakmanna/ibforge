// src/components/legal/LegalPage.jsx
//
// Chassis component for all customer-facing legal pages
// (Privacy, Terms, Refund). Renders LandingNav + page header
// (H1 + last-updated caption) + optional TOC + body content +
// LandingFooter.
//
// Page-specific files (Privacy.jsx, Terms.jsx, Refund.jsx) are
// thin: they import this chassis and pass a `content` prop
// shaped per the schema below.
//
// CONTENT SCHEMA (passed via the `content` prop):
//   {
//     title:       string             — H1 text (e.g. "Privacy Policy")
//     lastUpdated: string             — date in "15 May 2026" format
//     sections:    Section[]          — ordered body sections
//   }
//
//   Section = {
//     id:    string  — URL anchor (e.g. "introduction"); also TOC target
//     title: string  — H2 heading text + TOC label
//     body:  Node[]  — ordered array of content nodes
//   }
//
//   Node = one of:
//     { type: "paragraph", text: string }
//     { type: "list",      items: string[] }                — unordered list
//     { type: "heading",   level: 3 | 4, text: string }     — sub-headings
//
// BINDING DESIGN DECISIONS this chassis enforces:
//
//   OVERRIDE 10 — POLICY CONTENT AS JSX TREE, NOT MARKDOWN/HTML
//   (Chat 6, binding):
//   This file is the SOLE renderer of legal content. The dispatcher
//   below converts the Node[] schema directly to JSX. Never
//   dangerouslySetInnerHTML. Never react-markdown. Never raw
//   HTML string. If a future content edit needs a new node type,
//   add a new case to renderNode() below — don't introduce an
//   escape hatch.
//
//   OVERRIDE 11 — SINGLE PUBLIC INBOX (Chat 6, binding):
//   Content authored by Step 7C uses hello@ibforge.in throughout.
//   This chassis doesn't enforce that directly — it's a content rule.
//   But the email shows up as a paragraph node, no special handling.
//
// PROPS:
//   content:  required, schema above
//   showToc:  boolean, default false. When true, renders an inline
//             TOC between the page header and the first body section.
//             Privacy + Terms pass true (14 and 26 sections); Refund
//             passes false (4 short sections — TOC adds nothing).
//
// Brand voice: page content is the authority. Chassis chrome is quiet.
// No call-to-action language, no marketing copy in this file.

import { motion, useReducedMotion } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import "./LegalPage.css";

// ───────────────────────────────────────────────────────────────
// Scroll-reveal variants — page header fades in once on mount.
// Body sections do NOT animate per-section (would be distracting
// on a long-form legal document where the user is scanning, not
// scrolling for delight). Only the header gets the entrance lift.
// ───────────────────────────────────────────────────────────────
const headerRevealVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
};

const headerStaticVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

// ───────────────────────────────────────────────────────────────
// Node renderer — dispatches by `type` field.
//
// New node types: add a new branch below. Anything not recognised
// falls through to a console.warn so silent typos are visible.
// Never throw on an unknown node — a legal page should still render
// even if one entry has a typo (better partial render than blank
// page in production).
// ───────────────────────────────────────────────────────────────
function renderNode(node, key) {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="legal-page-paragraph">
          {node.text}
        </p>
      );

    case "list":
      return (
        <ul key={key} className="legal-page-list" role="list">
          {node.items.map((item, i) => (
            <li key={i} className="legal-page-list-item">
              {item}
            </li>
          ))}
        </ul>
      );

    case "heading": {
      // level 3 = H3, level 4 = H4. Default to H3 if unspecified.
      // Higher levels (H5, H6) intentionally not supported — legal
      // pages rarely need more than two levels of sub-structure.
      const level = node.level === 4 ? 4 : 3;
      const className =
        level === 3
          ? "legal-page-subheading legal-page-subheading--3"
          : "legal-page-subheading legal-page-subheading--4";
      return level === 3 ? (
        <h3 key={key} className={className}>
          {node.text}
        </h3>
      ) : (
        <h4 key={key} className={className}>
          {node.text}
        </h4>
      );
    }

    default:
      // eslint-disable-next-line no-console
      console.warn(
        `[LegalPage] Unknown node type "${node.type}". Skipped.`,
        node,
      );
      return null;
  }
}

function LegalPage({ content, showToc = false }) {
  const prefersReducedMotion = useReducedMotion();
  const revealVariants = prefersReducedMotion
    ? headerStaticVariants
    : headerRevealVariants;

  // Defensive: if content is malformed, render the chassis chrome
  // with a quiet message rather than crashing. This is more graceful
  // than an error boundary catch for what's almost always a content
  // typo during 7C editing.
  if (!content || !Array.isArray(content.sections)) {
    return (
      <div className="legal-page">
        <LandingNav />
        <main className="legal-page-main">
          <div className="legal-page-inner">
            <p className="legal-page-paragraph">
              Content unavailable. Please reload the page.
            </p>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  const { title, lastUpdated, sections } = content;

  return (
    <div className="legal-page">
      <LandingNav />

      <main className="legal-page-main" role="main">
        <div className="legal-page-inner">
          {/* ─── Page header — H1 + last-updated caption ─────────── */}
          <motion.header
            className="legal-page-header"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            // animate (not whileInView) — header is above-the-fold on
            // every legal page load, fires once on mount.
          >
            <h1 className="legal-page-title">{title}</h1>
            <p
              className="legal-page-last-updated"
              aria-label={`Last updated on ${lastUpdated}`}
            >
              LAST UPDATED · {lastUpdated.toUpperCase()}
            </p>
          </motion.header>

          {/* ─── Optional TOC ──────────────────────────────────────
              Renders only when showToc is true. Inline above the
              body content (NOT a sticky sidebar — see kickoff
              decision in chat 7). Clicking a link smooth-scrolls
              to the section's anchor; scroll-margin-top on each
              section heading offsets for the sticky nav height. */}
          {showToc && (
            <nav
              className="legal-page-toc"
              aria-label={`${title} — table of contents`}
            >
              <p className="legal-page-toc-label">Contents</p>
              <ol className="legal-page-toc-list">
                {sections.map((section) => (
                  <li key={section.id} className="legal-page-toc-item">
                    <a href={`#${section.id}`} className="legal-page-toc-link">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* ─── Body — sections rendered in order ─────────────────
              Each section: H2 (anchored via id for TOC target) +
              body nodes rendered via renderNode dispatcher. */}
          <div className="legal-page-body">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="legal-page-section"
                aria-labelledby={`${section.id}-heading`}
              >
                <h2
                  id={`${section.id}-heading`}
                  className="legal-page-section-heading"
                >
                  {section.title}
                </h2>
                {Array.isArray(section.body) &&
                  section.body.map((node, i) =>
                    renderNode(node, `${section.id}-node-${i}`),
                  )}
              </section>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default LegalPage;
