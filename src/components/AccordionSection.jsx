// src/components/AccordionSection.jsx
//
// Reusable accordion section. Roadmap page renders one of these per
// curriculum module; the trigger's visual content is <PhaseHeader />, and
// the body is the list of <StepCard /> elements.
//
// State persistence:
//   Open/closed boolean persists via dataService.saveUIState(key, value),
//   reads via dataService.getUIState(key). Caller supplies a unique
//   `storageKey` per section — Roadmap uses `accordion:roadmap:M{N}`.
//
// Animation:
//   - Body: Framer Motion animates `height: 0 ↔ "auto"` and opacity.
//   - Chevron: rotates 0° → 180° via Framer Motion animate.
//   - Children that declare Framer Motion `variants` are staggered by 50ms
//     on entrance via this component's internal variants wrapper.
//   - prefers-reduced-motion is honored globally by index.css; we don't
//     duplicate the override here.
//
// Accessibility:
//   - Trigger is a real <button> with type="button".
//   - Trigger has aria-expanded and aria-controls.
//   - Body has matching id and role="region".
//   - aria-label on the trigger announces module + state for screen readers
//     (the caller supplies a `triggerLabel` prop for this).
//
// Props:
//   storageKey    — string  (required) e.g. "accordion:roadmap:M1"
//   header        — ReactNode (required) — visual content of the trigger
//                   (Roadmap passes <PhaseHeader moduleNumber=... ... />)
//   triggerLabel  — string (required) — aria-label for the button,
//                   e.g. "Module 1 — Accounting Foundation, 0 of 19 complete"
//   defaultOpen   — boolean (optional, default false) — initial state when
//                   no persisted value exists yet
//   children      — ReactNode (required) — the body content

import { useEffect, useId, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { saveUIState, getUIState } from "@/utils/dataService";
import "./AccordionSection.css";

function AccordionSection({
  storageKey,
  header,
  triggerLabel,
  defaultOpen = false,
  children,
}) {
  // Resolve initial state from persisted UI state, with defaultOpen as fallback.
  const [isOpen, setIsOpen] = useState(() => {
    if (!storageKey) return defaultOpen;
    const persisted = getUIState(storageKey);
    if (typeof persisted === "boolean") return persisted;
    return defaultOpen;
  });

  // useId for stable, collision-free ARIA wiring across many instances on the page.
  const reactId = useId();
  const bodyId = `accordion-body-${reactId}`;

  // Persist on toggle. Skip the initial mount so we don't overwrite with the default.
  useEffect(() => {
    if (!storageKey) return;
    // Read current to avoid writing when nothing changed (cheap, but neat).
    const current = getUIState(storageKey);
    if (current !== isOpen) {
      saveUIState(storageKey, isOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, storageKey]);

  const handleToggle = () => setIsOpen((open) => !open);

  // Stagger container for children that declare their own Framer Motion variants
  // (e.g. StepCard's `itemVariant`). 50ms stagger per Brand System §Animation 8.
  const listVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
      },
    }),
    [],
  );

  return (
    <section className={`accordion${isOpen ? " accordion--open" : ""}`}>
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        aria-label={triggerLabel}
        onClick={handleToggle}
      >
        <div className="accordion__header-slot">{header}</div>
        <motion.span
          className="accordion__chevron"
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          <ChevronDown size={18} strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={bodyId}
            role="region"
            className="accordion__body"
            key="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              className="accordion__body-inner"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default AccordionSection;