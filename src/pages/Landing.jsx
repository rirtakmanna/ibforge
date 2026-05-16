// src/pages/Landing.jsx
//
// Public landing page at "/" — shell-less, no Layout wrapper, no auth guard.
// Strangers land here. Logged-in operators also land here at "/" — they get
// to /dashboard via the Nav "Get access" button's pricing scroll OR by typing
// /dashboard directly. There is no auto-redirect from / for logged-in users.
//
// 10 sections, in order:
//   1. Nav                — sticky top bar (STEP 2)
//   2. Hero               — headline + journey arc + primary CTA (STEP 3)
//   3. Benefits           — 4 graphic benefit cards (STEP 4)
//   4. Audience filter    — "for you" / "not for you" (STEP 5)
//   5. Modules            — 14-module grid (Chat 3)
//   6. Proof              — 3 screenshot cards (Chat 3)
//   7. Pricing            — trial + full access cards (Chat 3) — id="pricing"
//   8. Refund inline note — within pricing section (Chat 3)
//   9. Trust              — founder + links (Chat 3)
//  10. Footer             — wordmark + tagline + copyright (Chat 3)
//
// Brand voice lock (ATLAS_Brand_System.md §Brand Voice):
//   No exclamation marks. No emoji. No congratulatory language.
//   Short sentences. Active voice. State facts not feelings.

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/utils/firebase";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import BenefitCard from "@/components/landing/BenefitCard";
import "./Landing.css";

// ───────────────────────────────────────────────────────────────
// Trial form helper — mask email for confirmation display.
// "rirtakmanna@gmail.com" → "ri••••••••@gmail.com"
// Keeps the first 2 chars + domain visible. Privacy-respecting
// without being unhelpful (user can still recognise their own).
// ─────────────────────────────────────────────────────────────── */
function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local.slice(0, 2)}${"•".repeat(Math.min(local.length - 2, 8))}@${domain}`;
}

// ───────────────────────────────────────────────────────────────
// SCROLL-REVEAL VARIANTS (Step 5.5 STEP 1)
// Applied to Sections 2, 3, 4. Section 1 (Nav) is sticky-always —
// no reveal. Sections 5–10 are placeholders, rebuilt in Step 6
// with their own animation baked in.
//
// Pattern: fade in (opacity 0 → 1) + 8px lift (y: 8 → 0).
// Easing: [0, 0, 0.2, 1] — Brand System exit-ease, matches modal entrance.
// Trigger: viewport once:true, margin "-10% 0px" (fires 10% before section enters).
// ─────────────────────────────────────────────────────────────── */
const sectionRevealVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
};

// Section 3 (Benefits) gets staggered children — grid items reveal in
// sequence at 60ms intervals AFTER the parent section's 8px lift completes.
// delayChildren = 0.4s matches the parent transition duration above, so
// children begin revealing only when the parent has settled.
const benefitsGridVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1],
      delayChildren: 0.4,
      staggerChildren: 0.06,
    },
  },
};

// Each benefit card item — fades in + 6px lift, 250ms ease-out.
// Lift smaller than the section's 8px to feel like it "settles into"
// the already-revealed parent rather than reasserting itself.
const benefitCardItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
  },
};

// ───────────────────────────────────────────────────────────────
// JOURNEY ARC VARIANTS (Step 5.5 STEP 2 — Section 2 Hero)
// Three-layer orchestration on the 14-dot rising curve:
//   1. <path> draws left-to-right via pathLength 0 → 1 (800ms)
//   2. 14 <circle> dots fade in sequentially, 50ms stagger,
//      starting 240ms in (after path is 30% drawn) so they track the line
//   3. Two <text> labels (M1, M14) fade in 200ms after the last dot lands
//      (~940ms in) — no stagger between the two
//
// Single-fire on viewport entry. SVG is self-contained: its own
// whileInView, independent of the Hero section's reveal.
// ─────────────────────────────────────────────────────────────── */

// Parent SVG variant — orchestrates children. delayChildren staggers
// the child cascade against the parent's "visible" transition start.
// staggerChildren applies to direct motion children that don't set their
// own delay. The path and dots set explicit delays so they layer correctly.
const arcSvgVariants = {
  hidden: {},
  visible: {
    transition: {
      // Direct children that inherit "visible" without their own delay
      // get this stagger. We use it only for the 14 dots — path and
      // labels override with explicit transition.delay.
      staggerChildren: 0.05,
      delayChildren: 0.24, // dots begin after path is 30% drawn
    },
  },
};

// Path draw — pathLength 0 → 1 over 800ms, ease-out, no delay.
// Fires immediately when the SVG enters viewport.
const arcPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0 },
      opacity: { duration: 0.1, delay: 0 },
    },
  },
};

// Each dot — fades in over 150ms. The cascade timing comes from the
// parent SVG's staggerChildren (50ms) + delayChildren (240ms).
const arcDotVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
};

// Labels — fade in 200ms, both at once, after all dots have landed.
// Total dot sequence ends at 240 + (14 × 50) = 940ms in.
// Labels start at 0.94s so they don't compete with the dot cascade.
const arcLabelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1], delay: 0.94 },
  },
};

// Reduced-motion variants — instant final state, no movement, no fade.
// Swapped in via useReducedMotion() hook inside the component.
const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

// Static variants for arc children — they need their full final shape
// (pathLength:1 for the path, scale:1 for dots). The generic staticVariants
// above only covers opacity + y, which is wrong for path/circle/text.
const arcPathStaticVariants = {
  hidden: { pathLength: 1, opacity: 1 },
  visible: { pathLength: 1, opacity: 1 },
};

const arcDotStaticVariants = {
  hidden: { opacity: 1, scale: 1 },
  visible: { opacity: 1, scale: 1 },
};

const arcLabelStaticVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

// ───────────────────────────────────────────────────────────────
// AUDIENCE CARD BORDER DRAW-DOWN (Step 5.5 STEP 4 — Section 4)
// Replaces the static CSS border-left with a 3px absolutely-positioned
// motion.div per card. Animates scaleY 0 → 1 with transformOrigin top
// over 500ms ease-out. Two cards get an 80ms stagger (left draws first)
// via the grid's staggerChildren.
//
// Variant names "draw"/"drawn" avoid colliding with "hidden"/"visible"
// from the section's reveal variants above.
// ─────────────────────────────────────────────────────────────── */
const audienceGridDrawVariants = {
  draw: {},
  drawn: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const audienceBorderVariants = {
  draw: { scaleY: 0 },
  drawn: {
    scaleY: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
  },
};

// Static fallback — border is at final scaleY 1 from the start, no draw.
const audienceBorderStaticVariants = {
  draw: { scaleY: 1 },
  drawn: { scaleY: 1 },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 5 — 14 Modules grid: data + variants
// Static curriculum copy embedded at module scope. Source: ATLAS_Roadmap.md
// module table + each module's stated goal and final deliverable.
// Not derived from roadmapData.js at runtime — landing copy is editorial,
// not user-facing data. Editing this array does NOT require a re-upload
// of roadmapData.js to project knowledge.
// ─────────────────────────────────────────────────────────────────
const landingModules = [
  {
    n: 1,
    name: "Accounting Foundation",
    duration: "2.5 weeks",
    outcome:
      "Read, normalise, and reconstruct any listed company's three financial statements from primary filings.",
    deliverable: "4 company accounting workbooks (Infosys, HDFC, Sun Pharma, Zalando)",
  },
  {
    n: 2,
    name: "3-Statement Integrated Model",
    duration: "2 weeks",
    outcome:
      "Build a fully linked 3-statement operating model where every driver flows through P&L, balance sheet, and cash flow.",
    deliverable: "Guzman y Gomez 3-Statement Model",
  },
  {
    n: 3,
    name: "DCF Valuation",
    duration: "2 weeks",
    outcome:
      "Run a defensible DCF with explicit WACC build, terminal value, and sensitivity tables on a real company.",
    deliverable: "Guzman y Gomez DCF on top of the 3-Statement Model",
  },
  {
    n: 4,
    name: "Trading Comps & Precedent Transactions",
    duration: "1.5 weeks",
    outcome:
      "Build trading comps and precedent transactions tables and triangulate a defensible valuation range.",
    deliverable: "ITC Trading Comps + Precedent Transactions Workbook",
  },
  {
    n: 5,
    name: "Strategic Analysis & Capital Allocation",
    duration: "1.5 weeks",
    outcome:
      "Read a company's capital allocation history and form a view on whether management creates or destroys value.",
    deliverable: "ITC Capital Allocation + Moat Analysis Memo",
  },
  {
    n: 6,
    name: "Driver-Based Revenue Models",
    duration: "2.5 weeks",
    outcome:
      "Move beyond growth-rate modelling — build revenue from unit drivers (volumes, pricing, mix) per sector logic.",
    deliverable: "Infosys Driver Model + Zomato SOTP and Reverse DCF",
  },
  {
    n: 7,
    name: "Bank Modelling & DDM",
    duration: "2 weeks",
    outcome:
      "Model a bank from loan book, NIM components, and credit costs — and value it with a Dividend Discount Model.",
    deliverable: "HDFC Bank Full Model + DDM",
  },
  {
    n: 8,
    name: "LBO + Paper LBO + Covenants",
    duration: "2.5 weeks",
    outcome:
      "Build a working LBO with sources & uses, debt schedules, covenant tracking, and verbal paper-LBO fluency.",
    deliverable: "L&T Technology Services LBO + 5 Paper LBO reps",
  },
  {
    n: 9,
    name: "M&A Process & Merger Model",
    duration: "2.5 weeks",
    outcome:
      "Run accretion / dilution analysis on a real merger and explain the deal economics from buyer and seller views.",
    deliverable: "VW / Porsche Merger Model",
  },
  {
    n: 10,
    name: "Specialist Models (Pharma, Gaming)",
    duration: "2 weeks",
    outcome:
      "Apply sector-specific valuation — pharma pipeline rNPV, gaming GGR build — where standard DCF logic breaks.",
    deliverable: "Sun Pharma rNPV + Genting Singapore GGR Model",
  },
  {
    n: 11,
    name: "Industrial Conglomerate (SOTP)",
    duration: "2 weeks",
    outcome:
      "Build a Sum-of-the-Parts valuation on a multi-segment industrial business with order book mechanics.",
    deliverable: "ITC and L&T parent SOTP Models",
  },
  {
    n: 12,
    name: "Due Diligence & Credit Analysis",
    duration: "2 weeks",
    outcome:
      "Run commercial DD and credit analysis on a target — leverage capacity, downside cases, covenant headroom.",
    deliverable: "HDFC Bank Credit Case Study",
  },
  {
    n: 13,
    name: "Pitchbook & Communication",
    duration: "2 weeks",
    outcome:
      "Convert valuation work into a 15-slide IB-style sell-side pitchbook with football field and strip profiles.",
    deliverable: "Zalando Sell-Side Pitchbook (15 slides) + 3 Strip Profiles",
  },
  {
    n: 14,
    name: "Interview Prep & Networking",
    duration: "1.5 weeks",
    outcome:
      "Convert technical capability into job offers — pitch fluency, paper LBO drills, deal tracking, cold outreach.",
    deliverable: "Coverage Portfolio + Live Deal Tracker + Outreach Tracker + Mock Interview Log",
  },
];

// Section 5 — module grid variants
const moduleGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04, // 40ms between squares
      delayChildren: 0.1,
    },
  },
};

const moduleSquareVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const moduleTooltipVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.1 } },
};

// Static fallback for prefers-reduced-motion (module grid + tooltip)
const moduleStaticVariants = {
  hidden: { opacity: 1, scale: 1, y: 0 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 6 — Proof of Work: data + variants
// Three real screenshots of the live app, served from /public/landing/.
// Sequencing: StepDetail → Portfolio → Calendar — shows the execution
// loop: a locked step is completed, the deliverable lands in Portfolio,
// the LinkedIn post auto-schedules on Calendar. Each card carries one
// caption — no hover state per kickoff spec.
//
// Swap targets later (when DCF / 3-statement models exist): edit only
// the `src` and `caption` fields in this constant. No JSX changes.
// ─────────────────────────────────────────────────────────────────
const landingProof = [
  {
    src: "/landing/03-step-detail.png",
    alt: "ATLAS Step Detail page showing M4-S37 active with Topic, Open Course, and Mark Complete controls",
    caption: "A locked step, a real deliverable, a real upload.",
  },
  {
    src: "/landing/04-portfolio.png",
    alt: "ATLAS Portfolio page showing ITC Limited Trading Comps Workbook deliverable in Module 4",
    caption: "Every uploaded file, organised by step.",
  },
  {
    src: "/landing/05-calendar.png",
    alt: "ATLAS Calendar page showing scheduled LinkedIn posts on May 2026",
    caption: "LinkedIn posts scheduled the day you finish.",
  },
];

// Section 6 grid orchestrator — 100ms stagger between the 3 cards,
// 100ms delayChildren so children begin AFTER the section's own lift settles.
const proofGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Each proof card — scale 0.96 → 1.0 + fade, 300ms ease-out per kickoff spec.
// No hover animation (per kickoff: "No hover animation").
const proofCardVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 7 — Pricing: variants
// Per kickoff: "2 cards reveal together (no stagger). Amber honesty box
// fades 200ms after parent." Grid is a no-stagger reveal — both cards
// share the same enter timing as their parent section. The amber box
// is the only delayed child: it fades in 200ms after the right card
// has settled, drawing the eye to it as the last beat on the section.
//
// Trial accordion: height 0 → auto + opacity 0 → 1 over 250ms ease-out
// per kickoff. Framer Motion's height: "auto" animation works via a
// layout dependency — we measure the natural height once and animate
// to that value. Wrapped in AnimatePresence so the accordion can also
// collapse if the user clicks the trigger again.
// ─────────────────────────────────────────────────────────────────

// Pricing grid orchestrator — children inherit reveal timing from
// the parent section; no own stagger between the two cards (they
// reveal together). delayChildren:0.1 hands timing off cleanly so
// the section lift fully settles before card content paints.
const pricingGridVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
    },
  },
};

// Each pricing card — fade + 6px lift, 250ms ease-out. Matches the
// audience card pattern (Section 4) for visual consistency between
// "two-card decision moment" sections.
const pricingCardVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
  },
};

// Amber Udemy honesty box — fades in 200ms after the right card has
// settled. The right card's "visible" transition is 250ms (cardVariants
// duration) + 100ms delayChildren = ~350ms total from section entry.
// We add another 200ms delay = 550ms from section entry. Total = "the
// honesty box appears LAST as the section's closing beat."
const pricingAmberVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1], delay: 0.55 },
  },
};

// Trial accordion form — height 0 → auto, opacity 0 → 1, 250ms ease-out.
// Framer Motion supports height: "auto" natively; it measures children
// at runtime. Combined with AnimatePresence in JSX so the same variant
// also handles collapse on re-click.
const trialAccordionVariants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } },
  expanded: { height: "auto", opacity: 1, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } },
};

// ─────────────────────────────────────────────────────────────────
// SECTION 9 — Trust block: variants
// Per kickoff: "Stagger 100ms, left first." Two-column reveal where
// the founder card (left) leads and the links column (right) follows
// 100ms later. Both fade + 6px lift, 250ms ease-out — matches the
// pricing card pattern for visual consistency between two-column
// sections (pricing → trust both pair-reveal the same way).
//
// Grid orchestrator: 100ms staggerChildren, 100ms delayChildren so
// children begin AFTER the parent section's lift has settled.
// ─────────────────────────────────────────────────────────────────
const trustGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Each column — founder card and links column share this variant.
// JSX order in the DOM determines which is "left first" — founder
// card sits first, gets the lead reveal. Lift smaller (6px) than the
// section's own lift (8px) to feel like settling-in, not reassertion.
const trustColumnVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
  },
};

function Landing() {
  // prefers-reduced-motion: swap animated variants for static end-state.
  // The hook returns true when the OS-level setting is enabled. We compute
  // the active variant maps ONCE per render — no per-section ternaries.
  const prefersReducedMotion = useReducedMotion();
  const revealVariants = prefersReducedMotion ? staticVariants : sectionRevealVariants;
  const gridVariants = prefersReducedMotion ? staticVariants : benefitsGridVariants;
  const cardItemVariants = prefersReducedMotion ? staticVariants : benefitCardItemVariants;

  // Arc-specific variants. The arc's children (path, dots, labels) need
  // their own static fallbacks because the generic staticVariants only
  // covers opacity + y — the arc children also animate pathLength and scale.
  const arcSvgVariantsActive = prefersReducedMotion ? staticVariants : arcSvgVariants;
  const arcPathVariantsActive = prefersReducedMotion ? arcPathStaticVariants : arcPathVariants;
  const arcDotVariantsActive = prefersReducedMotion ? arcDotStaticVariants : arcDotVariants;
  const arcLabelVariantsActive = prefersReducedMotion ? arcLabelStaticVariants : arcLabelVariants;

  // Audience border-draw variants. Grid orchestrator passes through
  // regardless of reduced-motion (it has no own animation, only stagger).
  // The border child swaps to its static fallback when reduced-motion is on.
  const audienceBorderVariantsActive = prefersReducedMotion
    ? audienceBorderStaticVariants
    : audienceBorderVariants;

  // Shared viewport config — fires 10% before section enters, single-fire.
  const revealViewport = { once: true, margin: "-10% 0px" };

  // ───────────────────────────────────────────────────────────────
  // Section 5 — module grid interaction state
  // hoverModule: which module is currently hovered/focused (desktop).
  // openModule:  which module is currently click-toggled (mobile/touch).
  // Both can drive the tooltip — hoverModule for pointer/keyboard,
  // openModule for tap. Mutually independent so a touch user who
  // taps + moves their finger doesn't lose the tooltip.
  // toggleModule: click handler — taps the same square again to close.
  // ───────────────────────────────────────────────────────────────
  const [hoverModule, setHoverModule] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const toggleModule = (n) => setOpenModule((prev) => (prev === n ? null : n));

  // ───────────────────────────────────────────────────────────────
  // Section 7 — Pricing card interaction state
  //
  // isTrialFormOpen: drives the accordion expand on the trial card.
  //   Clicking "Get trial code" opens it; clicking again collapses.
  // trialEmail: controlled input value for the email field.
  // handleTrialSubmit: Phase 4A placeholder — preventDefault + log only.
  //   Phase 4B wires this to the Resend serverless function.
  // handleUpiPay: Phase 4A placeholder — preventDefault only.
  //   Phase 4C wires this to the UPI checkout flow.
  // ───────────────────────────────────────────────────────────────
  const [isTrialFormOpen, setIsTrialFormOpen] = useState(false);
  const [trialEmail, setTrialEmail] = useState("");

  // Trial-form flow state machine:
  //   "idle"        — form visible, ready for input
  //   "submitting"  — issueTrialCode callable in flight; button disabled
  //   "success"     — code sent; form replaced by confirmation block
  //   "error"       — inline error message above the form; user can retry
  // sentToEmail captures the value at submit time so the masked confirmation
  // doesn't change if the user keeps typing afterward (shouldn't happen
  // since success replaces the form, but defensive).
  const [trialStatus, setTrialStatus] = useState("idle");
  const [trialErrorMsg, setTrialErrorMsg] = useState("");
  const [sentToEmail, setSentToEmail] = useState("");

  // Reset trial state on close. Re-opening shows a fresh empty form —
  // never stale confirmation text from a previous send.
  const closeTrialForm = () => {
    setIsTrialFormOpen(false);
    setTrialStatus("idle");
    setTrialErrorMsg("");
    setTrialEmail("");
    setSentToEmail("");
  };

  const handleTrialSubmit = async (e) => {
    e.preventDefault();
    if (trialStatus === "submitting") return; // in-flight lock

    // Lightweight client-side email format check before firing the callable.
    // Server validates again — this just avoids a guaranteed-bad round-trip.
    const trimmed = trialEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setTrialStatus("error");
      setTrialErrorMsg("Enter a valid email address.");
      return;
    }

    setTrialStatus("submitting");
    setTrialErrorMsg("");

    try {
      const issueTrialCode = httpsCallable(functions, "issueTrialCode");
      await issueTrialCode({ email: trimmed });
      setSentToEmail(trimmed);
      setTrialStatus("success");
    } catch (err) {
      // Firebase Callable wraps thrown HttpsError as { code, message, details }.
      // Map known codes to brand-voice copy; everything else is a generic line.
      // Per §Commercial Context Rules: no apology language, no marketing.
      const code = err?.code || "";
      const serverMessage = err?.message || "";

      let userMessage;
      if (
        code === "functions/resource-exhausted" ||
        /rate/i.test(serverMessage)
      ) {
        userMessage =
          "You already requested a code recently. Check your inbox or wait 60 seconds.";
      } else if (
        code === "functions/invalid-argument" ||
        /email/i.test(serverMessage)
      ) {
        userMessage = "Enter a valid email address.";
      } else {
        userMessage =
          "Couldn't send the code. Email hello@ibforge.in if this keeps happening.";
      }

      setTrialStatus("error");
      setTrialErrorMsg(userMessage);
      // eslint-disable-next-line no-console
      console.error("[issueTrialCode]", code || "unknown", serverMessage);
    }
  };

  const handleUpiPay = (e) => {
    e.preventDefault();
    // TODO Phase 4C: open UPI checkout flow (likely a Razorpay redirect
    // or upi:// intent on mobile). Phase 4A: no-op.
    // eslint-disable-next-line no-console
    console.log("[upi-pay-placeholder] checkout requested");
  };

  return (
    <div className="landing">
      {/* ───────────────────────────────────────────────────────────────
          SECTION 1 — Nav
      ─────────────────────────────────────────────────────────────── */}
      <LandingNav />

      {/* ───────────────────────────────────────────────────────────────
          SECTION 2 — Hero
          Headline in --text-display (60px Space Grotesk Bold). Brand voice
          rules: no exclamation marks, no emoji, short sentences. The line
          break inside the headline is intentional — the second line is the
          "what" beat, set apart visually.

          STEP 5.5 STEP 1: Section wrapper swapped to motion.section with
          fade + 8px lift on scroll-into-view. Inner content (headline, arc,
          CTAs) is unchanged — the reveal applies to the section as a single
          unit. The journey arc draw-on-scroll comes in STEP 2 (sub-step B).
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-hero"
        aria-labelledby="hero-headline"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={revealVariants}
      >
        <div className="landing-hero-inner">
          <h1 id="hero-headline" className="landing-hero-headline">
            Not a course.
            <br />
            A record of what you actually built.
          </h1>

          <p className="landing-hero-subhead">
            IBForge is the structure I&apos;m walking myself — from financial
            data work to a 10-model investment banking portfolio.
          </p>

          {/* Journey arc — 14 dots rising from baseline (M1) to peak (M14).
              viewBox is 700×200; responsive via width:100%; height:auto in CSS.

              STEP 5.5 STEP 2: Three-layer draw-on-scroll orchestration.
              The outer motion.svg owns the whileInView trigger and the
              staggerChildren cascade for the 14 dots. The path draws
              independently (its own delay:0). The labels fade in last
              (their own delay:0.94). Baseline reference line stays static
              — it's structural background, not part of the reveal. */}
          <div className="landing-hero-arc" aria-hidden="true">
            <motion.svg
              viewBox="0 0 700 200"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="14-module journey arc from accounting fundamentals to interview readiness"
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              variants={arcSvgVariantsActive}
            >
              {/* Baseline reference line — static, not part of the reveal */}
              <line
                x1="40"
                y1="160"
                x2="660"
                y2="160"
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              {/* The rising curve — quadratic-style, from (40, 160) up to (660, 40).
                  Path drawn with a single cubic Bézier. Framer Motion animates
                  pathLength 0 → 1, which it implements internally via
                  stroke-dasharray + stroke-dashoffset. No manual CSS needed. */}
              <motion.path
                d="M 40 160 C 220 160, 380 130, 660 40"
                stroke="var(--color-electric-blue)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                variants={arcPathVariantsActive}
              />

              {/* 14 dots — each inherits the parent's staggerChildren (50ms)
                  + delayChildren (240ms). Coordinates pre-calculated to sit
                  ON the path (sampled at t = 0, 1/13, 2/13 ... 13/13).
                  Last dot is slightly larger to emphasize the M14 endpoint. */}
              <motion.circle cx="40"  cy="160" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="88"  cy="159" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="136" cy="156" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="184" cy="152" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="231" cy="147" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="279" cy="141" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="327" cy="133" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="374" cy="124" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="422" cy="113" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="469" cy="100" r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="517" cy="86"  r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="565" cy="70"  r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="612" cy="54"  r="4" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />
              <motion.circle cx="660" cy="40"  r="6" fill="var(--color-electric-blue)" variants={arcDotVariantsActive} />

              {/* Labels — endpoint anchors only. JetBrains Mono terminal style.
                  Their own delay:0.94 fires them after the last dot lands. */}
              <motion.text
                x="40"
                y="185"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--color-text-secondary)"
                textAnchor="start"
                letterSpacing="0.5"
                variants={arcLabelVariantsActive}
              >
                M1 — ACCOUNTING
              </motion.text>
              <motion.text
                x="660"
                y="25"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--color-text-secondary)"
                textAnchor="end"
                letterSpacing="0.5"
                variants={arcLabelVariantsActive}
              >
                M14 — INTERVIEW READY
              </motion.text>
            </motion.svg>
          </div>

          <div className="landing-hero-ctas">
            <a
              href="#pricing"
              className="landing-hero-cta-primary"
            >
              Try Module 1 free
            </a>
            <a
              href="#pricing"
              className="landing-hero-cta-secondary"
            >
              Skip trial — get full access ↓
            </a>
          </div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 3 — Benefits
          Four cards, 2×2 grid desktop, 1-column mobile.
          Each card: inline SVG illustration + H3 + one sentence.
          Hover: Logo Card Hover State (tint + scaling bottom bar).
          SVG icons inlined below — kept here (not in BenefitCard) so all
          four illustrations live in one file for visual review.

          STEP 5.5 STEP 1: Section wrapper reveals as a unit. The inner grid
          uses benefitsGridVariants — its own parent reveal duplicates the
          section's reveal pattern, plus delayChildren:0.4 + staggerChildren:0.06
          to orchestrate the 4 cards in sequence AFTER the parent has settled.
          Each card is wrapped in motion.div with cardItemVariants — they
          inherit "visible" from the parent grid through Framer Motion's
          variant propagation, so no per-card animate prop is needed.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-benefits"
        aria-labelledby="benefits-heading"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={revealVariants}
      >
        <div className="landing-benefits-inner">
          <h2 id="benefits-heading" className="landing-benefits-heading">
            What you actually get
          </h2>

          <motion.div
            className="landing-benefits-grid"
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            variants={gridVariants}
          >
            {/* Card 1 — Locked step sequence
                Illustration: vertical step chain, one active (filled) dot,
                two locked (outlined) dots. Reinforces the sequence lock.

                STEP 5.5 STEP 3 (Override 8 — decorative idle): the active
                (topmost, filled) dot pulses subtly. scale 1.0 → 1.15 → 1.0,
                2.0s loop, repeat infinite. The two locked dots stay static.
                transformOrigin is set to the circle's center so the scale
                grows in place rather than from the SVG origin. */}
            <motion.div variants={cardItemVariants} className="landing-benefit-card-wrap">
              <BenefitCard
                title="Locked step sequence"
                body="Each step unlocks only when the previous step is complete and its deliverable is uploaded. No skipping."
                icon={
                  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <line x1="28" y1="10" x2="28" y2="46"
                          stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
                    <motion.circle
                      cx="28" cy="12" r="6"
                      fill="currentColor" stroke="currentColor" strokeWidth="1.5"
                      style={{ transformOrigin: "28px 12px", transformBox: "fill-box" }}
                      animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.15, 1] }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 2.0, ease: [0.4, 0, 0.6, 1], repeat: Infinity, repeatType: "loop" }
                      }
                    />
                    <circle cx="28" cy="28" r="6"
                            fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="28" cy="44" r="6"
                            fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                  </svg>
                }
              />
            </motion.div>

            {/* Card 2 — Real files, real portfolio
                Illustration: 3 stacked file rectangles with ".xlsx" label
                on the topmost. Suggests a deliverable archive.

                STEP 5.5 STEP 3 (Override 8 — decorative idle): the topmost
                file (with the .xlsx label) drifts y 0 → -1.5 → 0 over 3.0s,
                repeat infinite. The label is grouped with the rect via
                motion.g so they move together as a single visual unit.
                Two underlying files stay static. */}
            <motion.div variants={cardItemVariants} className="landing-benefit-card-wrap">
              <BenefitCard
                title="Real files, real portfolio"
                body="Every step demands a deliverable — a model, an analysis, a memo. Uploaded, stored, downloadable, linkable from your LinkedIn."
                icon={
                  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <rect x="14" y="20" width="28" height="32"
                          fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                    <rect x="11" y="16" width="28" height="32"
                          fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
                    <motion.g
                      animate={prefersReducedMotion ? { y: 0 } : { y: [0, -1.5, 0] }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 3.0, ease: [0.4, 0, 0.6, 1], repeat: Infinity, repeatType: "loop" }
                      }
                    >
                      <rect x="8" y="12" width="28" height="32"
                            fill="var(--color-bg-primary)" stroke="currentColor" strokeWidth="1.5" />
                      <text x="22" y="32" fontFamily="var(--font-mono)" fontSize="7"
                            fill="currentColor" textAnchor="middle">.xlsx</text>
                    </motion.g>
                  </svg>
                }
              />
            </motion.div>

            {/* Card 3 — 10 real companies, full models
                Illustration: 4 abstract company squares in a 2×2 grid with
                ticker-style codes (representative of the 10 companies).

                STEP 5.5 STEP 3 (Override 8 — decorative idle): the +7
                square (bottom-right, x=30 y=30) pulses its stroke-opacity
                1.0 → 0.5 → 1.0 over 2.5s, repeat infinite. INFY, TCS, RIL
                squares stay static. Only the stroke (border) pulses — the
                label text stays fully opaque. */}
            <motion.div variants={cardItemVariants} className="landing-benefit-card-wrap">
              <BenefitCard
                title="10 real companies, full models"
                body="From Infosys to Tata Motors — ten Indian listed companies. Full 3-statement models, DCFs, comparables. Real numbers, real deliverables."
                icon={
                  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <rect x="6" y="6" width="20" height="20"
                          fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="16" y="19" fontFamily="var(--font-mono)" fontSize="6"
                          fill="currentColor" textAnchor="middle">INFY</text>
                    <rect x="30" y="6" width="20" height="20"
                          fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="40" y="19" fontFamily="var(--font-mono)" fontSize="6"
                          fill="currentColor" textAnchor="middle">TCS</text>
                    <rect x="6" y="30" width="20" height="20"
                          fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="16" y="43" fontFamily="var(--font-mono)" fontSize="6"
                          fill="currentColor" textAnchor="middle">RIL</text>
                    <motion.rect
                      x="30" y="30" width="20" height="20"
                      fill="none" stroke="currentColor" strokeWidth="1.5"
                      initial={{ strokeOpacity: 1 }}
                      animate={prefersReducedMotion ? { strokeOpacity: 1 } : { strokeOpacity: [1, 0.5, 1] }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 2.5, ease: [0.4, 0, 0.6, 1], repeat: Infinity, repeatType: "loop" }
                      }
                    />
                    <text x="40" y="43" fontFamily="var(--font-mono)" fontSize="6"
                          fill="currentColor" textAnchor="middle">+7</text>
                  </svg>
                }
              />
            </motion.div>

            {/* Card 4 — Deliverable to LinkedIn post
                Illustration: file icon on left, arrow, post card on right.
                The arrow indicates the workflow direction.

                STEP 5.5 STEP 3 (Override 8 — decorative idle): the arrow
                connecting the file to the post card drifts x 0 → 1.5 → 0
                over 2.5s, repeat infinite. The arrow is built from one
                path (shaft + head). File icon and LinkedIn post card stay
                static. Direction: rightward drift then return — matches
                the arrow's pointing direction. */}
            <motion.div variants={cardItemVariants} className="landing-benefit-card-wrap">
              <BenefitCard
                title="Deliverable to LinkedIn post"
                body="Every completed step generates a LinkedIn post from your actual work — scheduled on a calendar, ready to publish."
                icon={
                  <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <rect x="4" y="14" width="16" height="20"
                          fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="7" y1="20" x2="17" y2="20"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="7" y1="24" x2="17" y2="24"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="7" y1="28" x2="14" y2="28"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <motion.path
                      d="M 24 24 L 32 24 M 28 20 L 32 24 L 28 28"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round" fill="none"
                      animate={prefersReducedMotion ? { x: 0 } : { x: [0, 1.5, 0] }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 2.5, ease: [0.4, 0, 0.6, 1], repeat: Infinity, repeatType: "loop" }
                      }
                    />
                    <rect x="36" y="14" width="16" height="20"
                          fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="40" cy="19" r="1.5" fill="currentColor" />
                    <line x1="44" y1="19" x2="49" y2="19"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="39" y1="25" x2="49" y2="25"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="39" y1="29" x2="46" y2="29"
                          stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  </svg>
                }
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 4 — Audience Filter
          Two cards side by side: "This is for you if" (green left-border,
          3 inclusion items) and "This is not for you if" (red left-border,
          3 exclusion items). Mobile: cards stack vertically.

          The exclusion card is intentional — sending the wrong customer
          away before they pay is more valuable than persuading them to
          stay. Brand voice: no exclamation marks, no apologies, no soft
          language. Each line is a fact, not a feeling.

          STEP 5.5 STEP 1: Section wrapper reveals as a unit. Per scope, the
          two cards stagger by 80ms on their border draw-down — but that is
          STEP 4 (sub-step D), not STEP 1. STEP 1 reveals both cards
          together with the section's single lift.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-audience"
        aria-labelledby="audience-heading"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={revealVariants}
      >
        <div className="landing-audience-inner">
          <h2 id="audience-heading" className="landing-audience-heading">
            Who this is for
          </h2>

          <motion.div
            className="landing-audience-grid"
            initial="draw"
            whileInView="drawn"
            viewport={revealViewport}
            variants={audienceGridDrawVariants}
          >
            {/* LEFT card — inclusion
                STEP 5.5 STEP 4: static CSS border-left removed; 3px
                absolutely-positioned motion.div draws scaleY 0 → 1 from
                the top on scroll-into-view. Border color comes from
                .landing-audience-card-border--include in Landing.css. */}
            <div className="landing-audience-card landing-audience-card--include">
              <motion.div
                className="landing-audience-card-border landing-audience-card-border--include"
                variants={audienceBorderVariantsActive}
                style={{ transformOrigin: "top" }}
                aria-hidden="true"
              />
              <h3 className="landing-audience-card-title">
                This is for you if
              </h3>
              <ul className="landing-audience-list" role="list">
                <li className="landing-audience-item">
                  You work in financial data and want to build, not just record
                </li>
                <li className="landing-audience-item">
                  You learn by doing, not by watching
                </li>
                <li className="landing-audience-item">
                  You will spend 6 or more hours a week on this for 4 to 6 months
                </li>
              </ul>
            </div>

            {/* RIGHT card — exclusion
                Stagger: 80ms after the left card via the grid's
                staggerChildren. Border color comes from
                .landing-audience-card-border--exclude in Landing.css. */}
            <div className="landing-audience-card landing-audience-card--exclude">
              <motion.div
                className="landing-audience-card-border landing-audience-card-border--exclude"
                variants={audienceBorderVariantsActive}
                style={{ transformOrigin: "top" }}
                aria-hidden="true"
              />
              <h3 className="landing-audience-card-title">
                This is not for you if
              </h3>
              <ul className="landing-audience-list" role="list">
                <li className="landing-audience-item">
                  You want a certificate, not a portfolio
                </li>
                <li className="landing-audience-item">
                  You expect job placement or guaranteed outcomes
                </li>
                <li className="landing-audience-item">
                  You cannot commit time to building 10 real models
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 5 — The 14 Modules (Chat 4)
          14 module squares: 7×2 desktop, 4×4 mobile. M1 = TRIAL accent,
          M14 = FINISH accent. Hover (desktop) / tap (mobile) opens tooltip
          with module name, outcome, key deliverable. Data from the
          landingModules constant at module scope above.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-section landing-modules-section"
        aria-labelledby="landing-modules-heading"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="landing-modules-inner">
          <header className="landing-modules-header">
            <p className="landing-modules-eyebrow">The Roadmap</p>
            <h2 id="landing-modules-heading" className="landing-modules-heading">
              14 modules. 26 weeks. Built in order.
            </h2>
            <p className="landing-modules-sub">
              Each module locks until the previous deliverable is in your portfolio.
              Hover any module to see what it produces.
            </p>
          </header>

          <motion.ul
            className="landing-modules-grid"
            role="list"
            variants={prefersReducedMotion ? moduleStaticVariants : moduleGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {landingModules.map((mod) => {
              const isTrial = mod.n === 1;
              const isFinish = mod.n === 14;
              const squareClass = [
                "landing-module-square",
                isTrial && "landing-module-square--trial",
                isFinish && "landing-module-square--finish",
              ]
                .filter(Boolean)
                .join(" ");

              const [isOpen, setOpen] = [openModule === mod.n, () => toggleModule(mod.n)];

              return (
                <motion.li
                  key={mod.n}
                  className="landing-module-cell"
                  variants={
                    prefersReducedMotion ? moduleStaticVariants : moduleSquareVariants
                  }
                >
                  <button
                    type="button"
                    className={squareClass}
                    aria-expanded={isOpen}
                    aria-controls={`landing-module-tooltip-${mod.n}`}
                    onClick={setOpen}
                    onMouseEnter={() => setHoverModule(mod.n)}
                    onMouseLeave={() => setHoverModule(null)}
                    onFocus={() => setHoverModule(mod.n)}
                    onBlur={() => setHoverModule(null)}
                  >
                    <span className="landing-module-num">M{mod.n}</span>
                    {isTrial && <span className="landing-module-badge">TRIAL</span>}
                    {isFinish && <span className="landing-module-badge">FINISH</span>}
                  </button>

                  <AnimatePresence>
                    {(hoverModule === mod.n || openModule === mod.n) && (
                      <motion.div
                        id={`landing-module-tooltip-${mod.n}`}
                        className="landing-module-tooltip"
                        role="tooltip"
                        variants={
                          prefersReducedMotion
                            ? moduleStaticVariants
                            : moduleTooltipVariants
                        }
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <p className="landing-module-tooltip-num">
                          MODULE {mod.n} · {mod.duration}
                        </p>
                        <p className="landing-module-tooltip-name">{mod.name}</p>
                        <p className="landing-module-tooltip-outcome">{mod.outcome}</p>
                        <p className="landing-module-tooltip-deliverable-label">
                          Deliverable
                        </p>
                        <p className="landing-module-tooltip-deliverable">
                          {mod.deliverable}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 6 — Proof of Work (Chat 5)
          Three real screenshots of the live app — proves the system
          works before the customer pays. Loop shown: StepDetail (lock
          + deliverable spec + Mark Complete) → Portfolio (uploaded
          file lands here, organised by step) → Calendar (LinkedIn
          post auto-schedules on completion).

          Section wrapper reveals as a unit. Inner grid stagger-cascades
          3 cards at 100ms intervals, each card scale 0.96 → 1.0 + fade
          over 300ms ease-out per kickoff. No hover animation.

          Screenshots served from /public/landing/ — direct path, no
          import. Operator can swap to DCF / 3-statement model
          screenshots later via single src + caption edits.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-section landing-proof-section"
        aria-labelledby="landing-proof-heading"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="landing-proof-inner">
          <header className="landing-proof-header">
            <p className="landing-proof-eyebrow">Proof of work</p>
            <h2 id="landing-proof-heading" className="landing-proof-heading">
              The system, running.
            </h2>
            <p className="landing-proof-sub">
              Screenshots from the live app. Every locked step, every
              uploaded file, every scheduled post — exactly what the
              product produces when you complete a module.
            </p>
          </header>

          <motion.ul
            className="landing-proof-grid"
            role="list"
            variants={prefersReducedMotion ? moduleStaticVariants : proofGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {landingProof.map((card) => (
              <motion.li
                key={card.src}
                className="landing-proof-card"
                variants={
                  prefersReducedMotion ? moduleStaticVariants : proofCardVariants
                }
              >
                <div className="landing-proof-image-wrap">
                  <img
                    className="landing-proof-image"
                    src={card.src}
                    alt={card.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="landing-proof-caption">{card.caption}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 7 — Pricing (Chat 5)
          id="pricing" — anchor target for the Hero CTA + Nav "Get access".

          Two cards side-by-side desktop, stacked mobile:
            LEFT — Trial (₹0, Module 1 free, accordion email form)
            RIGHT — Full Access (₹1,699 founder price, ₹2,499 struck through,
                                 amber Udemy honesty box)

          Both cards reveal together (no stagger between them — per kickoff:
          "2 cards reveal together"). The amber honesty box is the lone
          delayed beat: fades in 200ms after the right card has settled,
          giving the page its closing rhythm before the refund / trust /
          footer sections.

          Form handlers are Phase 4A placeholders — preventDefault + log.
          Phase 4B wires the trial code email via Resend.
          Phase 4C wires the UPI payment flow.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        id="pricing"
        className="landing-section landing-pricing-section"
        aria-labelledby="landing-pricing-heading"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="landing-pricing-inner">
          <header className="landing-pricing-header">
            <p className="landing-pricing-eyebrow">Pricing</p>
            <h2 id="landing-pricing-heading" className="landing-pricing-heading">
              Try Module 1 free. Or commit to the full 14 modules.
            </h2>
          </header>

          <motion.div
            className="landing-pricing-grid"
            variants={prefersReducedMotion ? moduleStaticVariants : pricingGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {/* ─── LEFT CARD — Trial ──────────────────────────────── */}
            <motion.article
              className="landing-pricing-card landing-pricing-card--trial"
              variants={prefersReducedMotion ? moduleStaticVariants : pricingCardVariants}
              aria-labelledby="trial-card-heading"
            >
              <header className="landing-pricing-card-header">
                <h3 id="trial-card-heading" className="landing-pricing-card-title">
                  Module 1 — free
                </h3>
                <p className="landing-pricing-card-price-row">
                  <span className="landing-pricing-card-price">₹0</span>
                </p>
              </header>

              <ul className="landing-pricing-list landing-pricing-list--grow" role="list">
                <li className="landing-pricing-item">
                  7 steps in Module 1 (Accounting fundamentals)
                </li>
                <li className="landing-pricing-item">
                  Real deliverable upload, real portfolio entry
                </li>
                <li className="landing-pricing-item">
                  One trial code, single use
                </li>
              </ul>

              {/* Footer slot — same height whether the CTA or the form is
                  showing. AnimatePresence mode="wait" swaps content in
                  place: the CTA fades out fully before the form fades in
                  (and vice versa). The slot itself has min-height so the
                  card doesn't reflow during the swap.

                  Close button sits ABOVE the form (per spec). Form has its
                  own vertical layout inside the slot. */}
              <div className="landing-pricing-trial-footer">
                <AnimatePresence mode="wait" initial={false}>
                  {!isTrialFormOpen ? (
                    <motion.button
                      key="trial-cta"
                      type="button"
                      className="landing-pricing-cta landing-pricing-cta--trial"
                      aria-expanded={false}
                      aria-controls="trial-form-panel"
                      onClick={() => setIsTrialFormOpen(true)}
                      variants={
                        prefersReducedMotion
                          ? moduleStaticVariants
                          : trialAccordionVariants
                      }
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      Get trial code
                    </motion.button>
                  ) : (
                    <motion.div
                      key="trial-form"
                      id="trial-form-panel"
                      className="landing-pricing-trial-form-wrap"
                      variants={
                        prefersReducedMotion
                          ? moduleStaticVariants
                          : trialAccordionVariants
                      }
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      {/* Close button — sits above the form/confirmation per spec.
                          Same button regardless of state; closes + resets all
                          derived trial state via closeTrialForm(). */}
                      <button
                        type="button"
                        className="landing-pricing-trial-close"
                        aria-expanded={true}
                        aria-controls="trial-form-panel"
                        onClick={closeTrialForm}
                      >
                        ← Close
                      </button>

                      {trialStatus === "success" ? (
                        // ─── SUCCESS STATE ────────────────────────────────
                        // Form is replaced entirely by confirmation block.
                        // aria-live="polite" so screen readers announce the
                        // result without interrupting whatever the user is
                        // currently focused on (likely the Close button).
                        <div
                          className="landing-pricing-trial-success"
                          role="status"
                          aria-live="polite"
                        >
                          <p className="landing-pricing-trial-success-headline">
                            Check your email.
                          </p>
                          <p className="landing-pricing-trial-success-body">
                            Code sent to{" "}
                            <span className="landing-pricing-trial-success-email">
                              {maskEmail(sentToEmail)}
                            </span>
                            . Enter it at{" "}
                            <a
                              href="/access"
                              className="landing-pricing-trial-success-link"
                            >
                              ibforge.in/access
                            </a>{" "}
                            to begin Module 1.
                          </p>
                        </div>
                      ) : (
                        // ─── IDLE / SUBMITTING / ERROR STATE ──────────────
                        // Same form in all three states. Error message renders
                        // above the form when present. Submit button text +
                        // disabled state change on submitting.
                        <>
                          {trialStatus === "error" && trialErrorMsg && (
                            <p
                              className="landing-pricing-trial-error"
                              role="alert"
                              aria-live="assertive"
                            >
                              {trialErrorMsg}
                            </p>
                          )}
                          <form
                            className="landing-pricing-trial-form"
                            onSubmit={handleTrialSubmit}
                            noValidate
                          >
                            <label
                              className="landing-pricing-trial-label"
                              htmlFor="trial-email-input"
                            >
                              Email
                            </label>
                            <input
                              id="trial-email-input"
                              className="landing-pricing-trial-input"
                              type="email"
                              name="email"
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={trialEmail}
                              onChange={(e) => setTrialEmail(e.target.value)}
                              disabled={trialStatus === "submitting"}
                              aria-invalid={trialStatus === "error"}
                            />
                            <button
                              type="submit"
                              className="landing-pricing-trial-submit"
                              disabled={trialStatus === "submitting"}
                              aria-busy={trialStatus === "submitting"}
                            >
                              {trialStatus === "submitting"
                                ? "Sending…"
                                : "Email me a code"}
                            </button>
                          </form>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>

            {/* ─── RIGHT CARD — Full Access ──────────────────────── */}
            <motion.article
              className="landing-pricing-card landing-pricing-card--full"
              variants={prefersReducedMotion ? moduleStaticVariants : pricingCardVariants}
              aria-labelledby="full-card-heading"
            >
              <header className="landing-pricing-card-header">
                <h3 id="full-card-heading" className="landing-pricing-card-title">
                  Full access — all 14 modules
                </h3>
                <p className="landing-pricing-card-price-row">
                  <span className="landing-pricing-card-price-strike">
                    ₹2,499
                  </span>
                  <span className="landing-pricing-card-price landing-pricing-card-price--accent">
                    ₹1,999
                  </span>
                </p>
                <p className="landing-pricing-card-founder-tag">
                  Founder pricing — first 20 customers
                </p>
              </header>

              <ul className="landing-pricing-list" role="list">
                <li className="landing-pricing-item">
                  All 14 modules, locked step sequence
                </li>
                <li className="landing-pricing-item">
                  10 real company financial models to build
                </li>
                <li className="landing-pricing-item">
                  Portfolio page with every deliverable, ready for LinkedIn
                </li>
                <li className="landing-pricing-item">
                  Email support at hello@ibforge.in
                </li>
              </ul>

              {/* Amber Udemy honesty box — independent reveal (200ms after
                  parent card settles). Animates opacity only; the box's
                  static position in the layout doesn't change. Static
                  fallback under reduced-motion just renders it at opacity 1
                  from the start, no fade. */}
              <motion.aside
                className="landing-pricing-honesty"
                role="note"
                variants={prefersReducedMotion ? moduleStaticVariants : pricingAmberVariants}
              >
                <p className="landing-pricing-honesty-label">
                  Honest cost note
                </p>
                <p className="landing-pricing-honesty-body">
                  Courses I reference are on Udemy. Udemy subscription
                  runs around ₹700 per month. You will need 1 to 2 months
                  of subscription to cover all referenced courses.
                </p>
                <p className="landing-pricing-honesty-math">
                  Total cost to you: ₹1,999 (IBForge) + around ₹1,400
                  (Udemy 2 months) ≈ ₹3,400.
                </p>
              </motion.aside>

              <button
                type="button"
                className="landing-pricing-cta landing-pricing-cta--full"
                onClick={handleUpiPay}
              >
                Pay ₹1,999 via UPI →
              </button>
            </motion.article>
          </motion.div>

          {/* ───────────────────────────────────────────────────────────
              SECTION 8 — Refund inline note (embedded inside Section 7
              per kickoff: "inside pricing section, below both cards").
              Inherits Section 7's whileInView reveal — no own variant.
              Plain paragraph, secondary text tone, generous max-width
              for readability. The 7-day window is the calming closing
              beat of the pricing section before Trust and Footer.
          ─────────────────────────────────────────────────────────── */}
          <div className="landing-pricing-refund" role="note" aria-label="Refund policy summary">
            <p className="landing-pricing-refund-body">
              Refund policy: full refund within 7 days, no questions
              asked, to the same UPI ID you paid from. After 7 days,
              no refunds — by then you have seen enough of the product
              to know if it fits how you operate, and we cannot refund
              work-in-progress because the value of IBForge is the
              doing, not the having.
            </p>
            <p className="landing-pricing-refund-link-row">
              Full refund terms:{" "}
              <a
                href="/refund"
                className="landing-pricing-refund-link"
              >
                ibforge.in/refund
              </a>
            </p>
          </div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 9 — Trust block (Chat 6)
          Two columns desktop, stacked mobile. Founder card (left) carries
          the locked bio + contact line per kickoff. Links column (right)
          carries the 4 routing/anchor links — Privacy, Terms, Refund,
          and a "Module 1 Trial" anchor that scrolls back to #pricing.

          Stagger 100ms, left first — handled by trustGridVariants at
          module scope. Both columns share trustColumnVariants (fade +
          6px lift, 250ms ease-out). DOM order = visual order = reveal
          order: founder card first, links column second.

          The section is intentionally quiet — no accent borders, no
          colored highlights. Trust is the rest beat between the
          commercial press of pricing and the closing footer wordmark.
      ─────────────────────────────────────────────────────────────── */}
      <motion.section
        className="landing-section landing-trust-section"
        aria-labelledby="landing-trust-heading"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="landing-trust-inner">
          <header className="landing-trust-header">
            <p className="landing-trust-eyebrow">Who built this</p>
            <h2 id="landing-trust-heading" className="landing-trust-heading">
              Built by someone walking the same path.
            </h2>
          </header>

          <motion.div
            className="landing-trust-grid"
            variants={prefersReducedMotion ? moduleStaticVariants : trustGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {/* ─── LEFT — Founder card ─────────────────────────────
                Locked bio copy per kickoff. Contact line is a mailto
                link to hello@ibforge.in — opens the user's email client
                with the From-line pre-populated. */}
            <motion.article
              className="landing-trust-card landing-trust-card--founder"
              variants={prefersReducedMotion ? moduleStaticVariants : trustColumnVariants}
              aria-labelledby="founder-card-heading"
            >
              <h3 id="founder-card-heading" className="landing-trust-card-title">
                Rirtak Manna
              </h3>
              <p className="landing-trust-card-role">
                IB Professional · MBA Financial Management, NMIMS
              </p>
              <p className="landing-trust-card-body">
                I build IBForge because I&apos;m on this exact path
                myself — from financial data work to real Investment
                Banking — and I needed a structure that actually produced
                models, not certificates. At my previous firm I structured historical financials for listed companies; that work taught me what an IB analyst&apos;s desk actually looks like. The roadmap
                inside IBForge is the one I&apos;m walking.
              </p>
              <p className="landing-trust-card-contact-row">
                <span className="landing-trust-card-contact-label">Contact</span>
                <a
                  href="mailto:hello@ibforge.in"
                  className="landing-trust-card-contact-link"
                >
                  hello@ibforge.in
                </a>
              </p>
            </motion.article>

            {/* ─── RIGHT — Links column ────────────────────────────
                Four anchor + route links. Privacy / Terms / Refund are
                separate public routes built in Step 7 (next). Module 1
                Trial is an in-page anchor to #pricing — same target as
                the Hero CTAs and Nav "Get access" button.

                Each link is a single line, semantic <a>, electric-blue
                on hover. JetBrains Mono caption label sits above the
                list to mark this as a navigation column, not a content
                column. */}
            <motion.div
              className="landing-trust-links"
              variants={prefersReducedMotion ? moduleStaticVariants : trustColumnVariants}
              aria-labelledby="trust-links-heading"
            >
              <p id="trust-links-heading" className="landing-trust-links-label">
                Reference
              </p>
              <ul className="landing-trust-links-list" role="list">
                <li className="landing-trust-links-item">
                  <a className="landing-trust-link" href="/privacy">
                    Privacy Policy
                  </a>
                </li>
                <li className="landing-trust-links-item">
                  <a className="landing-trust-link" href="/terms">
                    Terms of Service
                  </a>
                </li>
                <li className="landing-trust-links-item">
                  <a className="landing-trust-link" href="/refund">
                    Refund Policy
                  </a>
                </li>
                <li className="landing-trust-links-item">
                  <a className="landing-trust-link" href="#pricing">
                    Module 1 Trial
                  </a>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 10 — Footer
          Extracted to <LandingFooter /> in Chat 7 Step 7A.
          The component owns its own scroll-reveal variants + SMIL
          rotor logo markup. Same visual output as the inline version
          it replaced — verify by diffing the rendered DOM if needed.
          Reused by the legal-page chassis (Step 7B) so all four
          customer-facing pages close with the same footer.
      ─────────────────────────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}

export default Landing;
