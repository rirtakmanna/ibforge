// src/utils/dataService.js
//
// The ONLY file in ATLAS that touches localStorage (Phase 1) or Firebase (Phase 3).
// Components must import from here — they never call storage APIs directly.
//
// Every function that takes a stepId validates it exists in roadmapData before writing.
// saveDeliverable deduplicates by fileName + size and returns { skipped: true } on dupe.
// getNextStep walks array order — it never parses M{N}-S{NN} ids.

import { roadmapData } from "@/data/roadmapData";

// ─── Storage keys ───────────────────────────────────────────────────────────
const KEY_COMPLETED_STEPS = "atlas:completedSteps";
const KEY_DELIVERABLES = "atlas:deliverables"; // { [stepId]: [{...}] }
const KEY_UI_STATE = "atlas:uiState"; // { [key]: value }
const KEY_LINKEDIN_POSTS = "atlas:linkedInPosts"; // [{ stepId, day, content, scheduledFor, status, postedAt }]
const KEY_SCHEMA_VERSION = "atlas:schemaVersion";

// ─── Internal helpers ───────────────────────────────────────────────────────

/** Reads JSON from localStorage. Returns fallback on parse error or missing key. */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[dataService] readJson failed for "${key}":`, err);
    return fallback;
  }
}

/** Writes JSON to localStorage. Throws on quota or serialization error so callers can react. */
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[dataService] writeJson failed for "${key}":`, err);
    throw err;
  }
}

/**
 * Throws if stepId is not a string matching an entry in roadmapData.
 * Every mutating function calls this first.
 */
function assertValidStepId(stepId) {
  if (typeof stepId !== "string" || stepId.length === 0) {
    throw new Error(`[dataService] invalid stepId: ${String(stepId)}`);
  }
  const exists = roadmapData.some((s) => s.id === stepId);
  if (!exists) {
    throw new Error(
      `[dataService] stepId "${stepId}" not found in roadmapData`,
    );
  }
}

/** Generates a short, locally-unique id for deliverable records. */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Schema version ─────────────────────────────────────────────────────────

export function getSchemaVersion() {
  const v = readJson(KEY_SCHEMA_VERSION, null);
  return v === null ? 1 : Number(v);
}

export function setSchemaVersion(n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(
      `[dataService] schema version must be a positive integer, got ${n}`,
    );
  }
  writeJson(KEY_SCHEMA_VERSION, n);
}

// Initialize schema version on first read.
if (
  typeof localStorage !== "undefined" &&
  localStorage.getItem(KEY_SCHEMA_VERSION) === null
) {
  try {
    writeJson(KEY_SCHEMA_VERSION, 1);
  } catch {
    // Non-fatal — module load shouldn't crash if storage is unavailable.
  }
}

// ─── Progress: completed steps + current/next step ──────────────────────────

/**
 * Returns the curriculum module number (1–14) of the next unlocked step.
 * If all steps are complete, returns the module of the final step.
 */
export function getCurrentPhase() {
  const next = getNextStep();
  if (next) return next.phase;
  // All complete — return the last module.
  const last = roadmapData[roadmapData.length - 1];
  return last ? last.phase : 1;
}

/**
 * Returns the array of completed step ids (in completion order).
 * Always returns an array, never null.
 */
export function getCompletedSteps() {
  const arr = readJson(KEY_COMPLETED_STEPS, []);
  return Array.isArray(arr) ? arr : [];
}

/**
 * Marks a step complete. Validates id exists in roadmapData.
 * Enforces Pattern B chain rule: a Pattern B step cannot complete unless
 * all earlier Pattern B steps in the same learnChain are already complete.
 *
 * Returns { ok: true, alreadyComplete?: true }.
 * Throws on invalid id or chain violation.
 */
export function markStepComplete(stepId) {
  assertValidStepId(stepId);

  const completed = getCompletedSteps();
  if (completed.includes(stepId)) {
    return { ok: true, alreadyComplete: true };
  }

  // Pattern B chain enforcement.
  const stepIndex = roadmapData.findIndex((s) => s.id === stepId);
  const step = roadmapData[stepIndex];
  if (step.type === "learn" && step.pattern === "B" && step.learnChain) {
    const chainPredecessors = roadmapData
      .slice(0, stepIndex)
      .filter(
        (s) =>
          s.type === "learn" &&
          s.pattern === "B" &&
          s.learnChain === step.learnChain,
      );
    const blocking = chainPredecessors.find((s) => !completed.includes(s.id));
    if (blocking) {
      throw new Error(
        `Cannot complete mid-chain: complete ${blocking.title} first.`,
      );
    }
  }

  const next = [...completed, stepId];
  writeJson(KEY_COMPLETED_STEPS, next);

  // Write-then-read verification for critical writes.
  const verify = readJson(KEY_COMPLETED_STEPS, []);
  if (!Array.isArray(verify) || !verify.includes(stepId)) {
    throw new Error(
      `[dataService] markStepComplete verification failed for ${stepId}`,
    );
  }

  return { ok: true };
}

/**
 * Returns the next unlocked step by ARRAY ORDER in roadmapData.
 * Never parses ids. Returns null if every step is complete.
 */
export function getNextStep() {
  const completed = new Set(getCompletedSteps());
  for (const step of roadmapData) {
    if (!completed.has(step.id)) return step;
  }
  return null;
}

/** Wipes all progress, deliverables, schedule, and UI state. For testing/reset only. */
export function resetProgress() {
  try {
    localStorage.removeItem(KEY_COMPLETED_STEPS);
    localStorage.removeItem(KEY_DELIVERABLES);
    localStorage.removeItem(KEY_LINKEDIN_POSTS);
    localStorage.removeItem(KEY_UI_STATE);
    writeJson(KEY_SCHEMA_VERSION, 1);
    return { ok: true };
  } catch (err) {
    console.error("[dataService] resetProgress failed:", err);
    return { ok: false, error: err };
  }
}

// ─── Deliverables ───────────────────────────────────────────────────────────

/**
 * Returns the array of deliverables for a stepId. Empty array if none.
 * Each entry: { id, fileName, size, uploadedAt, url }.
 *   - Phase 1: url is a blob URL (session-only, via URL.createObjectURL)
 *   - Phase 3: url is a Firebase Storage URL. Field name does not change.
 */
export function getDeliverables(stepId) {
  assertValidStepId(stepId);
  const all = readJson(KEY_DELIVERABLES, {});
  const arr = all && typeof all === "object" ? all[stepId] : null;
  return Array.isArray(arr) ? arr : [];
}

/**
 * Appends a deliverable to the array for stepId.
 * Validates stepId. Deduplicates by fileName + size (case-sensitive).
 *
 * Accepts: { fileName: string, size: number, url: string, uploadedAt?: string }
 * Returns: { ok: true, deliverable } | { skipped: true, reason: 'duplicate' }
 */
export function saveDeliverable(stepId, fileData) {
  assertValidStepId(stepId);
  if (!fileData || typeof fileData !== "object") {
    throw new Error("[dataService] saveDeliverable requires fileData object");
  }
  const { fileName, size, url } = fileData;
  if (typeof fileName !== "string" || fileName.length === 0) {
    throw new Error("[dataService] saveDeliverable requires fileName string");
  }
  if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
    throw new Error(
      "[dataService] saveDeliverable requires non-negative numeric size",
    );
  }
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("[dataService] saveDeliverable requires url string");
  }

  const all = readJson(KEY_DELIVERABLES, {});
  const existing = Array.isArray(all[stepId]) ? all[stepId] : [];

  // Dedup: same fileName AND same size already in array → skip.
  const isDuplicate = existing.some(
    (d) => d.fileName === fileName && d.size === size,
  );
  if (isDuplicate) {
    return { skipped: true, reason: "duplicate" };
  }

  const deliverable = {
    id: generateId(),
    fileName,
    size,
    url,
    uploadedAt: fileData.uploadedAt || new Date().toISOString(),
  };

  const nextAll = { ...all, [stepId]: [...existing, deliverable] };
  writeJson(KEY_DELIVERABLES, nextAll);

  return { ok: true, deliverable };
}

/**
 * Removes a deliverable by fileId from the array for stepId.
 * Validates stepId. Returns { ok: true, removed: boolean }.
 */
export function deleteDeliverable(stepId, fileId) {
  assertValidStepId(stepId);
  if (typeof fileId !== "string" || fileId.length === 0) {
    throw new Error("[dataService] deleteDeliverable requires fileId string");
  }

  const all = readJson(KEY_DELIVERABLES, {});
  const existing = Array.isArray(all[stepId]) ? all[stepId] : [];
  const next = existing.filter((d) => d.id !== fileId);

  if (next.length === existing.length) {
    return { ok: true, removed: false };
  }

  const nextAll = { ...all, [stepId]: next };
  writeJson(KEY_DELIVERABLES, nextAll);
  return { ok: true, removed: true };
}

// ─── UI state (accordion, filters, etc.) ────────────────────────────────────

export function saveUIState(key, value) {
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("[dataService] saveUIState requires non-empty key string");
  }
  const all = readJson(KEY_UI_STATE, {});
  const next = { ...all, [key]: value };
  writeJson(KEY_UI_STATE, next);
  return { ok: true };
}

export function getUIState(key) {
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("[dataService] getUIState requires non-empty key string");
  }
  const all = readJson(KEY_UI_STATE, {});
  return all && typeof all === "object" ? all[key] : undefined;
}

// ─── LinkedIn schedule ──────────────────────────────────────────────────────

/**
 * Returns the array of all scheduled LinkedIn posts across all steps.
 * Each entry: { id, stepId, day, content, scheduledFor (ISO date), status, postedAt }
 */
export function getScheduledLinkedInPosts() {
  const arr = readJson(KEY_LINKEDIN_POSTS, []);
  return Array.isArray(arr) ? arr : [];
}

/**
 * Updates the status of a single scheduled LinkedIn post.
 * Accepts status: "Scheduled" | "Posted".
 * Overdue is derived at render time (status === "Scheduled" && scheduledFor < today)
 * and is NOT a stored value.
 *
 * When flipping to "Posted": stamps postedAt with current ISO timestamp.
 * When flipping to "Scheduled": clears postedAt (post un-marked).
 *
 * Returns { ok: true, post } on success.
 * Throws on invalid postId, missing post, or invalid status.
 */
export function setLinkedInPostStatus(postId, status) {
  if (typeof postId !== "string" || postId.length === 0) {
    throw new Error("[dataService] setLinkedInPostStatus requires postId string");
  }
  if (status !== "Scheduled" && status !== "Posted") {
    throw new Error(
      `[dataService] setLinkedInPostStatus status must be "Scheduled" or "Posted", got: ${String(status)}`,
    );
  }

  const all = getScheduledLinkedInPosts();
  const index = all.findIndex((p) => p.id === postId);
  if (index === -1) {
    throw new Error(`[dataService] LinkedIn post not found: ${postId}`);
  }

  const current = all[index];
  const updated = {
    ...current,
    status,
    postedAt: status === "Posted" ? new Date().toISOString() : null,
  };

  const next = [...all.slice(0, index), updated, ...all.slice(index + 1)];
  writeJson(KEY_LINKEDIN_POSTS, next);
  return { ok: true, post: updated };
}

/**
 * Schedules LinkedIn posts for a step. Called on company-step Mark Complete.
 * Validates stepId. Validates posts is an array of { day, content }.
 * scheduledFor = completionDate + day offset.
 *
 * Replaces any existing scheduled posts for this stepId (idempotent re-completion).
 */
export function scheduleLinkedInPosts(stepId, posts, completionDate) {
  assertValidStepId(stepId);
  if (!Array.isArray(posts)) {
    throw new Error("[dataService] scheduleLinkedInPosts requires posts array");
  }
  const completedAt =
    completionDate instanceof Date ? completionDate : new Date(completionDate);
  if (Number.isNaN(completedAt.getTime())) {
    throw new Error(
      "[dataService] scheduleLinkedInPosts requires valid completionDate",
    );
  }

  const existing = getScheduledLinkedInPosts().filter(
    (p) => p.stepId !== stepId,
  );

  const scheduled = posts.map((p) => {
    if (typeof p.day !== "number" || typeof p.content !== "string") {
      throw new Error(
        "[dataService] each linkedInSchedule entry needs { day:number, content:string }",
      );
    }
    const scheduledFor = new Date(completedAt);
    scheduledFor.setDate(scheduledFor.getDate() + p.day);
    return {
      id: generateId(),
      stepId,
      day: p.day,
      content: p.content,
      scheduledFor: scheduledFor.toISOString(),
      status: "Scheduled",
      postedAt: null,
    };
  });

  const next = [...existing, ...scheduled];
  writeJson(KEY_LINKEDIN_POSTS, next);
  return { ok: true, count: scheduled.length };
}

// ─── Browser console exposure (DEV ONLY) ────────────────────────────────────
// Lets the operator run dataService.markStepComplete("M1-S01") in DevTools
// for the Phase 1 smoke test. Removed in production builds via Vite's
// import.meta.env.PROD flag.
if (typeof window !== "undefined" && !import.meta.env.PROD) {
  window.dataService = {
    getCurrentPhase,
    markStepComplete,
    getCompletedSteps,
    getNextStep,
    saveDeliverable,
    getDeliverables,
    deleteDeliverable,
    saveUIState,
    getUIState,
    getScheduledLinkedInPosts,
    scheduleLinkedInPosts,
    setLinkedInPostStatus,
    resetProgress,
    getSchemaVersion,
    setSchemaVersion,
  };
}
