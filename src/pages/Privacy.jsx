// src/pages/Privacy.jsx
//
// Privacy Policy route — /privacy.
// Thin binding: LegalPage chassis + privacyContent + showToc.
// All rendering, animation, and styling live in LegalPage chassis.
// Content lives in src/data/legalContent.js.

import LegalPage from "@/components/legal/LegalPage";
import { privacyContent } from "@/data/legalContent";
import "./Privacy.css";

function Privacy() {
  return <LegalPage content={privacyContent} showToc={true} />;
}

export default Privacy;
