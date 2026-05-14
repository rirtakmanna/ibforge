// src/components/landing/LandingFooter.jsx
//
// Site-wide footer for Landing + legal pages (Privacy, Terms, Refund).
// Extracted from Landing.jsx in Phase 4A Chat 6 (Step 7A) to remove
// duplication across Landing + 3 legal pages.
//
// Markup is identical to the original inline footer block — same three
// regions (brand cluster / italic tagline / mono copyright), same SMIL
// rotor pattern in the logo (the §4(c) exception inherited from
// LandingNav.jsx). Reveal animation also identical: motion.footer with
// scroll-reveal variants matching Section 9 of Landing.
//
// Reveal variants are owned LOCALLY here so this component can mount
// on any page without depending on Landing's variant exports. The
// variants are functionally identical to revealVariants in Landing.jsx;
// duplicated intentionally (one constant per component file, easier
// to find than chasing imports).
//
// Brand voice lock: locked tagline "Work counts when it exists." and
// locked copyright "© 2026 IBForge — Built by Rirtak Manna" — both
// per kickoff Section 10 spec, not editable without an explicit
// kickoff revision.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import "./LandingFooter.css";

// Section reveal — fade + 8px lift, matches Landing.jsx
// sectionRevealVariants. Single-fire on viewport entry.
const footerRevealVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
};

// Reduced-motion fallback — instant final state.
const footerStaticVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

function LandingFooter() {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? footerStaticVariants
    : footerRevealVariants;

  return (
    <motion.footer
      className="landing-footer"
      role="contentinfo"
      aria-label="IBForge footer"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      <div className="landing-footer-inner">
        {/* LEFT — logo + wordmark, internal link to landing top.
            Markup mirrors LandingNav.jsx exactly: static square SVG
            layered with rotor line SVG, plus IBForge text node. */}
        <Link
          to="/"
          className="landing-footer-brand"
          aria-label="IBForge — home"
        >
          <span className="landing-footer-mark" aria-hidden="true">
            <svg
              className="landing-footer-logo-static"
              width="24"
              height="24"
              viewBox="0 0 362 362"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="6"
                width="350"
                height="350"
                stroke="var(--color-electric-blue)"
                strokeWidth="16"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M208.215 178.807C208.215 179.371 207.898 179.888 207.396 180.144L106.681 231.438C106.216 231.675 105.661 231.654 105.216 231.381C104.771 231.108 104.5 230.624 104.5 230.103V210.085C104.5 209.509 104.83 208.984 105.349 208.733L180.449 172.551L105.349 136.369C104.83 136.119 104.5 135.594 104.5 135.018V115C104.5 114.478 104.771 113.993 105.216 113.721C105.661 113.448 106.216 113.426 106.681 113.663L207.396 164.959C207.898 165.215 208.215 165.732 208.215 166.296V178.807Z"
                fill="var(--color-electric-blue)"
                stroke="var(--color-electric-blue)"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M256 228.502C256.552 228.502 257 228.95 257 229.502V246.705C257 247.257 256.552 247.705 256 247.705H155.911C155.359 247.705 154.911 247.257 154.911 246.705V229.502C154.911 228.95 155.359 228.502 155.911 228.502H256Z"
                fill="var(--color-electric-blue)"
                stroke="var(--color-electric-blue)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              className="landing-footer-logo-rotor"
              width="24"
              height="24"
              viewBox="0 0 362 362"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="29.5"
                y1="36.5"
                x2="332.5"
                y2="36.5"
                stroke="var(--color-electric-blue)"
                strokeWidth="17"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 181 181"
                  to="360 181 181"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </line>
            </svg>
          </span>
          <span className="landing-footer-word">IBForge</span>
        </Link>

        {/* CENTER — locked tagline */}
        <p className="landing-footer-tagline">Work counts when it exists.</p>

        {/* RIGHT — copyright + author credit, two no-wrap spans
            separated by an em-dash divider that can fold to a new
            line at narrow widths. */}
        <p className="landing-footer-copyright">
          <span className="landing-footer-copyright-year">© 2026 IBForge</span>
          <span className="landing-footer-copyright-divider" aria-hidden="true">
            —
          </span>
          <span className="landing-footer-copyright-author">
            Built by Rirtak Manna
          </span>
        </p>
      </div>
    </motion.footer>
  );
}

export default LandingFooter;
