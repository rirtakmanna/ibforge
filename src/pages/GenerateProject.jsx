// src/pages/GenerateProject.jsx
//
// Thin route page at /step/:id/generate. Resolves the step from the URL,
// looks up its company, and renders <CompanyGeneratorPanel /> — the panel
// owns the 5-part AI_Template rendering and Copy buttons.
//
// Redirect rules (consistent with StepDetail's lock behavior):
//   - step not found in roadmapData      → /roadmap (replace)
//   - step.type !== "company-step"       → /step/:id (replace)
//                                          (Generate is only meaningful for
//                                          company-step; learn/watch steps
//                                          have no prompt to generate)
//   - step is locked                      → /roadmap (replace)
//
// While a redirect flushes, an aria-hidden empty div is rendered to
// prevent a flash of the wrong content. Same pattern as StepDetail's
// locked-redirect (D26 from Phase 2A Step 4.3).
//
// Status derivation: read directly via getCompletedSteps() + getNextStep()
// (NOT useStepStatus) — consistent with D25. GenerateProject does no writes,
// so there is no refreshKey needed here.

import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { roadmapData } from "@/data/roadmapData";
import { companiesData } from "@/data/companiesData";
import { getCompletedSteps, getNextStep } from "@/utils/dataService";
import CompanyGeneratorPanel from "@/components/CompanyGeneratorPanel";
import "./GenerateProject.css";

function deriveStatus(stepId) {
  const completed = getCompletedSteps();
  if (completed.includes(stepId)) return "complete";
  const next = getNextStep();
  if (next && next.id === stepId) return "active";
  return "locked";
}

function GenerateProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const step = useMemo(
    () => roadmapData.find((s) => s.id === id) || null,
    [id],
  );

  const company = useMemo(() => {
    if (!step || step.type !== "company-step" || !step.companyId) return null;
    return companiesData.find((c) => c.id === step.companyId) || null;
  }, [step]);

  const status = useMemo(() => (step ? deriveStatus(step.id) : null), [step]);

  // Redirect side-effects — kept out of render. replace:true so the locked
  // URL does not pollute history.
  useEffect(() => {
    if (!step) {
      navigate("/roadmap", { replace: true });
      return;
    }
    if (step.type !== "company-step") {
      navigate(`/step/${step.id}`, { replace: true });
      return;
    }
    if (status === "locked") {
      navigate("/roadmap", { replace: true });
    }
  }, [step, status, navigate]);

  // Render a flash-guard during the redirect tick. aria-hidden so screen
  // readers do not announce an empty page.
  if (!step || step.type !== "company-step" || status === "locked") {
    return <div aria-hidden="true" className="generate-project__redirect" />;
  }

  // Data-integrity fallback: a company-step whose companyId points at nothing
  // in companiesData. CompanyGeneratorPanel requires company — render a
  // clear error block instead of crashing. Matches the panel's own
  // GENERATION BLOCKED visual language (D32).
  if (!company) {
    return (
      <section className="generate-project">
        <Link to={`/step/${step.id}`} className="generate-project__back">
          ← Back to step
        </Link>
        <header className="generate-project__header">
          <h1 className="generate-project__title">{step.title}</h1>
          <p className="generate-project__subtitle">Generate Project</p>
        </header>
        <div className="generate-project__error" role="alert">
          <p className="generate-project__error-label">GENERATION BLOCKED</p>
          <p className="generate-project__error-message">
            Company data is missing for{" "}
            <code>companyId = {step.companyId}</code>. Update companiesData.js
            and reload.
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="generate-project"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <Link to={`/step/${step.id}`} className="generate-project__back">
        ← Back to step
      </Link>

      <header className="generate-project__header">
        <p className="generate-project__eyebrow">{company.name}</p>
        <h1 className="generate-project__title">Generate Project</h1>
        <p className="generate-project__subtitle">
          5-part prompt for spinning up{" "}
          <span className="generate-project__subtitle-em">
            {company.name} — IB Build
          </span>{" "}
          as a new Claude Project.
        </p>
      </header>

      <CompanyGeneratorPanel step={step} company={company} />
    </motion.section>
  );
}

export default GenerateProject;
