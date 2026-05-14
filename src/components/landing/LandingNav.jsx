// src/components/landing/LandingNav.jsx
//
// Public-page nav bar. Reused by Landing, Privacy, Terms, Refund pages.
//
// Behavior:
//   - Sticky top, transparent over hero by default
//   - Border-bottom appears (animated) once page scrolls past the hero
//   - Two CTAs:
//       "I have a code" → /access  (route exists from Phase 4B onward;
//                                    in 4A it 404s — accepted per kickoff)
//       "Get access"   → #pricing  (smooth-scrolls to Section 7 anchor;
//                                    works because html { scroll-behavior: smooth }
//                                    is set globally in index.css)
//
// Logo SVG markup lifted from Layout.jsx (Phase 4A Chat 1 — IBForge brand).
// Kept inline (not imported from Layout) because Landing is shell-less and
// must not depend on the authenticated app shell.
//
// Brand voice: button labels follow the no-exclamation, sentence-case rule.

import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import "./LandingNav.css";

function LandingNav() {
  // Scroll-aware bottom border — opacity ramps from 0 → 1 over the first
  // 64px of scroll (the nav's own height). useScroll returns a MotionValue
  // for the whole document; we map a small early range to 0..1 opacity.
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 64], [0, 1]);

  return (
    <motion.header className="landing-nav" role="banner" aria-label="IBForge">
      <div className="landing-nav-inner">
        {/* Logo + wordmark — internal link to landing top */}
        <Link to="/" className="landing-nav-brand" aria-label="IBForge — home">
          <span className="landing-nav-mark" aria-hidden="true">
            <svg
              className="landing-nav-logo-static"
              width="28"
              height="28"
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
              className="landing-nav-logo-rotor"
              width="28"
              height="28"
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
          <span className="landing-nav-word">IBForge</span>
        </Link>

        {/* CTA cluster — right-aligned */}
        <div className="landing-nav-ctas">
          <Link to="/access" className="landing-nav-cta landing-nav-cta--ghost">
            I have a code
          </Link>
          <a
            href="#pricing"
            className="landing-nav-cta landing-nav-cta--primary"
          >
            Get access
          </a>
        </div>
      </div>

      {/* Animated bottom border — opacity-only, no layout shift */}
      <motion.div
        className="landing-nav-border"
        style={{ opacity: borderOpacity }}
        aria-hidden="true"
      />
    </motion.header>
  );
}

export default LandingNav;
