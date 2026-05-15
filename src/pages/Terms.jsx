// src/pages/Terms.jsx
//
// Terms of Service route — /terms.
// Thin binding: LegalPage chassis + termsContent + showToc.
// 26 numbered sections — TOC enabled for scan navigation.

import LegalPage from "@/components/legal/LegalPage";
import { termsContent } from "@/data/legalContent";
import "./Terms.css";

function Terms() {
  return <LegalPage content={termsContent} showToc={true} />;
}

export default Terms;