// src/pages/Roadmap.jsx
//
// The Roadmap page. Renders all 14 curriculum modules as accordion sections.
// Each section: <PhaseHeader /> as the trigger content, list of <StepCard />
// inside the body. Default-open module is derived from getCurrentPhase() or
// the `?phase={N}` deep-link from PhaseProgressList; user toggles persist.
//
// Composition only — page-level logic stays thin. StepCard owns per-step
// status derivation (via useStepStatus); PhaseHeader owns module-title
// rendering; AccordionSection owns expand/collapse + persistence.
//
// Performance: modulesData is memoized. Per Performance Rule §pagination,
// we DON'T virtualize here — ATLAS's full step count (~145) is well below
// the 500-item threshold and the entire list is mounted once when Roadmap
// loads. AccordionSection collapses bodies via Framer Motion height: 0,
// but the StepCards still mount inside collapsed accordions (cheap — no
// network, no Firestore in 2A). Re-evaluate if step count grows >300.

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { roadmapData } from "@/data/roadmapData";
import { getCurrentPhase, getCompletedSteps } from "@/utils/dataService";
import { getModuleTitle } from "@/data/moduleTitles";
import AccordionSection from "@/components/AccordionSection";
import PhaseHeader from "@/components/PhaseHeader";
import StepCard from "@/components/StepCard";
import "./Roadmap.css";

function Roadmap() {
  const [searchParams] = useSearchParams();
  const deepLinkPhaseRaw = searchParams.get("phase");
  const deepLinkPhase = deepLinkPhaseRaw ? Number(deepLinkPhaseRaw) : null;

  // Group steps by curriculum module (phase). Walk array order so step
  // sequence within each module is preserved (intentional gaps, B-suffixes).
  const modulesData = useMemo(() => {
    const completed = new Set(getCompletedSteps());

    const byPhase = new Map();
    for (const step of roadmapData) {
      const phase = step.phase;
      if (!byPhase.has(phase)) {
        byPhase.set(phase, { number: phase, steps: [] });
      }
      byPhase.get(phase).steps.push(step);
    }

    const modules = Array.from(byPhase.values()).sort(
      (a, b) => a.number - b.number,
    );

    return modules.map((mod) => {
      const completedCount = mod.steps.reduce(
        (n, s) => (completed.has(s.id) ? n + 1 : n),
        0,
      );
      return {
        number: mod.number,
        title: getModuleTitle(mod.number),
        total: mod.steps.length,
        completed: completedCount,
        steps: mod.steps,
      };
    });
  }, []);

  // Default-open phase: deep-link wins; otherwise getCurrentPhase().
  const currentPhase = useMemo(() => getCurrentPhase(), []);
  const defaultOpenPhase =
    deepLinkPhase && Number.isFinite(deepLinkPhase)
      ? deepLinkPhase
      : currentPhase;

  // Page-entrance fade (Brand System §Page transitions — fade only inside
  // /roadmap itself; route-to-route transitions are handled at App level).
  const pageVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } },
  };

  if (modulesData.length === 0) {
    return (
      <motion.main
        className="roadmap"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        <header className="roadmap__header">
          <h1 className="roadmap__title">ROADMAP</h1>
        </header>
        <div className="roadmap__empty">
          <p className="roadmap__empty-title">NO MODULES TO DISPLAY</p>
          <p className="roadmap__empty-sub">
            roadmapData.js appears empty. Verify the data file is populated.
          </p>
        </div>
      </motion.main>
    );
  }

  const totalSteps = modulesData.reduce((n, m) => n + m.total, 0);
  const totalCompleted = modulesData.reduce((n, m) => n + m.completed, 0);

  return (
    <motion.main
      className="roadmap"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <header className="roadmap__header">
        <h1 className="roadmap__title">ROADMAP</h1>
        <div className="roadmap__counter" aria-live="polite">
          <span className="roadmap__counter-num">
            {totalCompleted}/{totalSteps}
          </span>
          <span className="roadmap__counter-label">steps complete</span>
        </div>
      </header>

      <div className="roadmap__list">
        {modulesData.map((mod) => {
          const storageKey = `accordion:roadmap:M${mod.number}`;
          const isDefaultOpen = mod.number === defaultOpenPhase;
          const triggerLabel = `Module ${mod.number} — ${mod.title}, ${mod.completed} of ${mod.total} steps complete`;

          return (
            <AccordionSection
              key={mod.number}
              storageKey={storageKey}
              triggerLabel={triggerLabel}
              defaultOpen={isDefaultOpen}
              header={
                <PhaseHeader
                  moduleNumber={mod.number}
                  total={mod.total}
                  completed={mod.completed}
                />
              }
            >
              {mod.steps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
            </AccordionSection>
          );
        })}
      </div>
    </motion.main>
  );
}

export default Roadmap;