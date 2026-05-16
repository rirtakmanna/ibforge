// src/components/OnboardingModal.jsx
//
// First-login onboarding overlay. Mounts on Dashboard only.
// Trigger: users/{uid}/onboardingComplete missing or false.
// Three slides. Skip visible from slide 1. Both Begin and Skip
// write onboardingComplete: true.
//
// Mobile: drag-to-swipe via Framer Motion drag constraints.
// Desktop: arrow button nav.
// prefers-reduced-motion: instant slide changes, no animation.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { markOnboardingComplete } from "@/utils/dataService";
import "./OnboardingModal.css";

const SLIDES = [
  {
    id: "locked-sequence",
    heading: "Locked sequence. No skipping.",
    body: "Modules unlock as you complete the step before. Module 1 has 7 steps. When all 7 are uploaded and confirmed, Module 2 unlocks. The order is the value — IB skills compound and skipping breaks the chain.",
  },
  {
    id: "portfolio-entry",
    heading: "Every deliverable becomes a portfolio entry.",
    body: "Excel models, PDFs, screenshots — everything you upload at a step lands in your Portfolio page automatically. When you finish a module, you have a real, dated record of what you built.",
  },
  {
    id: "commitment",
    heading: "Six hours a week. Four to six months.",
    body: "Plan for roughly 6 hours weekly. Most people complete IBForge in 4–6 months. If you can't commit that, stop now — the value of IBForge is the doing, and partial doing produces no portfolio.",
  },
];

const TOTAL = SLIDES.length;

// Slide variants — driven by direction (+1 right-to-left, -1 left-to-right).
function makeSlideVariants(reduceMotion) {
  if (reduceMotion) {
    return {
      enter: { opacity: 1, x: 0 },
      center: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
    };
  }
  return {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function OnboardingModal({ onDismiss }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dismissing, setDismissing] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slideVariants = makeSlideVariants(reduceMotion);
  const isLast = index === TOTAL - 1;

  // Focus trap: keep focus inside the modal.
  const modalRef = useRef(null);
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleSkip();
        return;
      }
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = useCallback(
    async (source) => {
      if (dismissing) return;
      setDismissing(true);
      try {
        await markOnboardingComplete();
      } catch (err) {
        console.error("[OnboardingModal] markOnboardingComplete failed:", err);
        // Non-fatal — dismiss anyway. The flag write failing is better than
        // trapping the user in the modal.
      }
      onDismiss(source);
    },
    [dismissing, onDismiss]
  );

  const handleBegin = useCallback(() => dismiss("begin"), [dismiss]);
  const handleSkip = useCallback(() => dismiss("skip"), [dismiss]);

  const goTo = useCallback(
    (nextIndex) => {
      setDirection(nextIndex > index ? 1 : -1);
      setIndex(nextIndex);
    },
    [index]
  );

  const handleNext = useCallback(() => {
    if (isLast) return;
    goTo(index + 1);
  }, [isLast, goTo, index]);

  const handlePrev = useCallback(() => {
    if (index === 0) return;
    goTo(index - 1);
  }, [index, goTo]);

  // Swipe support via Framer Motion drag.
  // dragConstraints locks to parent; onDragEnd inspects the drag offset.
  const SWIPE_THRESHOLD = 60; // px

  function handleDragEnd(_, info) {
    if (info.offset.x < -SWIPE_THRESHOLD && !isLast) {
      goTo(index + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && index > 0) {
      goTo(index - 1);
    }
  }

  const slide = SLIDES[index];

  return (
    <AnimatePresence>
      <motion.div
        className="onboarding-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        aria-modal="true"
        role="dialog"
        aria-label="Welcome to IBForge"
      >
        <div className="onboarding-modal" ref={modalRef}>
          {/* Skip link — always visible */}
          <button
            className="onboarding-skip"
            onClick={handleSkip}
            disabled={dismissing}
            aria-label="Skip introduction"
          >
            Skip
          </button>

          {/* Slide area */}
          <div className="onboarding-slides" aria-live="polite" aria-atomic="true">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={slide.id}
                className="onboarding-slide"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeInOut" }
                }
                drag={reduceMotion ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                <h2 className="onboarding-heading">{slide.heading}</h2>
                <p className="onboarding-body">{slide.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div
            className="onboarding-dots"
            role="tablist"
            aria-label="Slide indicators"
          >
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1} of ${TOTAL}`}
                className={
                  "onboarding-dot" + (i === index ? " onboarding-dot--active" : "")
                }
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          {/* Navigation row */}
          <div className="onboarding-nav">
            <button
              className="onboarding-btn onboarding-btn--ghost"
              onClick={handlePrev}
              disabled={index === 0 || dismissing}
              aria-label="Previous slide"
            >
              ←
            </button>

            {isLast ? (
              <button
                className="onboarding-btn onboarding-btn--primary"
                onClick={handleBegin}
                disabled={dismissing}
              >
                {dismissing ? "Starting…" : "Begin →"}
              </button>
            ) : (
              <button
                className="onboarding-btn onboarding-btn--primary"
                onClick={handleNext}
                disabled={dismissing}
                aria-label="Next slide"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}