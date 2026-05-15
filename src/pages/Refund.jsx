// src/pages/Refund.jsx
//
// Refund Policy route — /refund.
// Thin binding: LegalPage chassis + refundContent.
//
// showToc={false} — 4 short sections + a contact line. A TOC on a
// page this short would be more chrome than content and add a
// visual layer the reader doesn't need.

import LegalPage from "@/components/legal/LegalPage";
import { refundContent } from "@/data/legalContent";
import "./Refund.css";

function Refund() {
  return <LegalPage content={refundContent} showToc={false} />;
}

export default Refund;