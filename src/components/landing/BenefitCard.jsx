// src/components/landing/BenefitCard.jsx
//
// Landing Section 3 benefit card. Reused 4× by Landing.jsx.
//
// Hover behavior per ATLAS_Brand_System.md §Logo Card Hover States:
//   - Background: electric-blue 3% tint fades in (150ms)
//   - Bottom bar: 2px electric-blue, scales 0 → 100% width left-to-right (200ms linear)
// Both effects use Framer Motion. The bar uses transformOrigin: 'left'.
//
// Props:
//   icon     — JSX element (an inline <svg>); the illustration for this card
//   title    — string; the card's H3 heading
//   body     — string; the one-sentence body copy
//
// The icon is passed as JSX (not a name string) so the SVG markup lives in
// Landing.jsx alongside the other card content. Keeps the SVGs grep-able
// from one file rather than buried in a sub-component dictionary.

import { useState } from "react";
import { motion } from "framer-motion";
import "./BenefitCard.css";

function BenefitCard({ icon, title, body }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="benefit-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
    >
      {/* Hover tint — fades to 3% opacity on hover.
          Per Brand System §Logo Card Hover States and CSS Custom Property
          Tokens §--color-electric-blue-03 ("logo card hover background only"). */}
      <motion.div
        className="benefit-card-tint"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.15, ease: "linear" }}
        aria-hidden="true"
      />

      <div className="benefit-card-content">
        <div className="benefit-card-icon" aria-hidden="true">
          {icon}
        </div>
        <h3 className="benefit-card-title">{title}</h3>
        <p className="benefit-card-body">{body}</p>
      </div>

      {/* Bottom accent bar — scales from 0 → 100% width on hover.
          transformOrigin: left → bar grows from left to right.
          Sharp corners (border-radius: 0) per Brand System §Sharp Corners
          Rule (the accent bar is NOT an exception). */}
      <motion.div
        className="benefit-card-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "linear" }}
        style={{ transformOrigin: "left" }}
        aria-hidden="true"
      />
    </div>
  );
}

export default BenefitCard;