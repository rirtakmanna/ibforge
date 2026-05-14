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

import { motion, useReducedMotion } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import BenefitCard from "@/components/landing/BenefitCard";
import "./Landing.css";

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
          SECTION 5 — 14 Modules (Chat 3)
      ─────────────────────────────────────────────────────────────── */}
      <section className="landing-section" aria-label="Modules placeholder">
        <p className="landing-placeholder-text">SECTION 5 — 14 MODULES</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 6 — Proof of work (Chat 3)
      ─────────────────────────────────────────────────────────────── */}
      <section
        className="landing-section"
        aria-label="Proof of work placeholder"
      >
        <p className="landing-placeholder-text">SECTION 6 — PROOF OF WORK</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 7 — Pricing (Chat 3)
          id="pricing" — anchor target for Nav "Get access" button.
          Smooth scroll is enabled globally via html { scroll-behavior: smooth }
          in index.css. Anchor works as soon as STEP 2 wires the Nav button.
      ─────────────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="landing-section"
        aria-label="Pricing placeholder"
      >
        <p className="landing-placeholder-text">SECTION 7 — PRICING</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 8 — Refund inline note (inside pricing, Chat 3)
      ─────────────────────────────────────────────────────────────── */}
      <section className="landing-section" aria-label="Refund note placeholder">
        <p className="landing-placeholder-text">SECTION 8 — REFUND NOTE</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 9 — Trust block (Chat 3)
      ─────────────────────────────────────────────────────────────── */}
      <section className="landing-section" aria-label="Trust placeholder">
        <p className="landing-placeholder-text">SECTION 9 — TRUST</p>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 10 — Footer (Chat 3)
      ─────────────────────────────────────────────────────────────── */}
      <section className="landing-section" aria-label="Footer placeholder">
        <p className="landing-placeholder-text">SECTION 10 — FOOTER</p>
      </section>
    </div>
  );
}

export default Landing;
