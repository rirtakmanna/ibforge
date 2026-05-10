// src/utils/useStepStatus.js
//
// Single source of truth for "is this step locked / active / complete".
// All components that need step status import this hook — none derive
// status inline from getCompletedSteps + getNextStep.

import { useMemo } from "react";
import { getCompletedSteps, getNextStep } from "@/utils/dataService";

/**
 * useStepStatus(stepId)
 *   → { status: "locked" | "active" | "complete", isLocked, isActive, isComplete }
 *
 * Active = the single step returned by getNextStep().
 * Complete = stepId is in getCompletedSteps().
 * Locked = anything else.
 *
 * Note: this hook reads localStorage on every render. That is acceptable for
 * Phase 1 (synchronous, fast, low call volume). When Firestore replaces
 * localStorage in Phase 3, dataService keeps the synchronous read interface
 * via an in-memory cache populated by the Firestore subscription — this
 * hook does not change.
 */
export function useStepStatus(stepId) {
  return useMemo(() => {
    if (typeof stepId !== "string" || stepId.length === 0) {
      return {
        status: "locked",
        isLocked: true,
        isActive: false,
        isComplete: false,
      };
    }

    const completed = getCompletedSteps();
    if (completed.includes(stepId)) {
      return {
        status: "complete",
        isLocked: false,
        isActive: false,
        isComplete: true,
      };
    }

    const next = getNextStep();
    if (next && next.id === stepId) {
      return {
        status: "active",
        isLocked: false,
        isActive: true,
        isComplete: false,
      };
    }

    return {
      status: "locked",
      isLocked: true,
      isActive: false,
      isComplete: false,
    };
  }, [stepId]);
}
