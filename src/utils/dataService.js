// src/utils/dataService.js
//
// The ONLY file in ATLAS that touches localStorage (Phase 1) or Firebase (Phase 3).
// Components must import from here — they never call storage APIs directly.
//
// Every function that takes a stepId validates it exists in roadmapData before writing.
// saveDeliverable deduplicates by fileName + size and returns { skipped: true } on dupe.
// getNextStep walks array order — it never parses M{N}-S{NN} ids.

import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firestore as db, storage } from "@/utils/firebase";
import { onAuthChange } from "@/utils/auth";
import { roadmapData } from "@/data/roadmapData";

// ─── Storage keys ───────────────────────────────────────────────────────────
// Only two localStorage keys remain in Phase 3:
//   - UI state (accordion open/closed, filter chips) — per-client, no cross-device sync needed
//   - Schema version — per-client migration guard (see Block 3F decision)
// All user data (progress, deliverables, scheduled posts) now lives in Firestore.
const KEY_UI_STATE = "atlas:uiState"; // { [key]: value }
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

/** Pre-built Set of all valid step ids — O(1) lookup vs linear scan per call. */
const VALID_STEP_IDS = new Set(roadmapData.map((s) => s.id));

/**
 * Throws if stepId is not a string matching an entry in roadmapData.
 * Every mutating function calls this first.
 */
function assertValidStepId(stepId) {
  if (typeof stepId !== "string" || stepId.length === 0) {
    throw new Error(`[dataService] invalid stepId: ${String(stepId)}`);
  }
  if (!VALID_STEP_IDS.has(stepId)) {
    throw new Error(
      `[dataService] stepId "${stepId}" not found in roadmapData`,
    );
  }
}

/** Generates a short, locally-unique id for deliverable records. */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Firestore cache + hydration ────────────────────────────────────────────
//
// Components call getCompletedSteps(), getDeliverables(), etc. SYNCHRONOUSLY.
// Phase 3 keeps that contract by hydrating an in-memory cache from Firestore
// via onSnapshot, then serving reads from the cache. Writes go to Firestore;
// the snapshot listener echoes them back into the cache so subsequent reads
// see the new state.
//
// Hydration lifecycle:
//   - Module load: cache is empty, isHydrated = false.
//   - onAuthChange fires with a user → attachListeners(uid) sets up 3 onSnapshot
//     listeners. After all 3 have fired their first callback, hydrationPromise
//     resolves and isHydrated flips true. Layout.jsx awaits this before rendering.
//   - onAuthChange fires with null (sign-out) → detachListeners() + clearCache().
//     A fresh hydrationPromise is created so the next sign-in re-gates correctly.

const cache = {
  completedSteps: [],
  deliverables: {}, // { [stepId]: Deliverable[] }
  scheduledPosts: [],
  currentUserId: null,
  isHydrated: false,
  unsubscribers: [],
  hydrationResolvers: null,
  hydrationPromise: null,
  // Tracks which of the 3 collections have fired their first onSnapshot.
  // When all three are true, we resolve hydrationPromise.
  firstSnapshotFired: {
    completedSteps: false,
    deliverables: false,
    scheduledPosts: false,
  },
};

function buildHydrationPromise() {
  cache.hydrationPromise = new Promise((resolve, reject) => {
    cache.hydrationResolvers = { resolve, reject };
  });
}

// Initialize the first hydration promise at module load so callers can
// await it even before sign-in (the promise just won't resolve yet).
buildHydrationPromise();

function checkHydrationComplete() {
  const { completedSteps, deliverables, scheduledPosts } =
    cache.firstSnapshotFired;
  if (completedSteps && deliverables && scheduledPosts && !cache.isHydrated) {
    cache.isHydrated = true;
    if (cache.hydrationResolvers) {
      cache.hydrationResolvers.resolve();
    }
  }
}

function clearCache() {
  cache.completedSteps = [];
  cache.deliverables = {};
  cache.scheduledPosts = [];
  cache.currentUserId = null;
  cache.isHydrated = false;
  cache.firstSnapshotFired = {
    completedSteps: false,
    deliverables: false,
    scheduledPosts: false,
  };
  // Create a fresh hydration promise so the next sign-in re-gates correctly.
  buildHydrationPromise();
}

function detachListeners() {
  for (const unsub of cache.unsubscribers) {
    try {
      unsub();
    } catch (err) {
      console.error("[dataService] unsubscribe failed:", err);
    }
  }
  cache.unsubscribers = [];
}

/**
 * Attaches onSnapshot listeners for the signed-in user.
 * Resolves hydrationPromise after all 3 collections have fired their first
 * snapshot callback (which Firestore guarantees, even for empty collections).
 *
 * Firestore paths:
 *   users/{uid}/progress/completedSteps   — single doc with { ids: string[] }
 *   users/{uid}/deliverables              — collection, one doc per stepId, doc.files: Deliverable[]
 *   users/{uid}/scheduledPosts            — collection, one doc per post id
 */
function attachListeners(uid) {
  cache.currentUserId = uid;

  // 1. Progress (single doc) — completed steps
  const progressDocRef = doc(db, "users", uid, "progress", "completedSteps");
  const unsubProgress = onSnapshot(
    progressDocRef,
    (snapshot) => {
      const data = snapshot.data();
      cache.completedSteps = data && Array.isArray(data.ids) ? data.ids : [];
      cache.firstSnapshotFired.completedSteps = true;
      checkHydrationComplete();
    },
    (err) => {
      console.error("[dataService] progress snapshot error:", err);
      if (cache.hydrationResolvers && !cache.isHydrated) {
        cache.hydrationResolvers.reject(err);
      }
    },
  );
  cache.unsubscribers.push(unsubProgress);

  // 2. Deliverables (collection — one doc per stepId)
  const deliverablesColRef = collection(db, "users", uid, "deliverables");
  const unsubDeliverables = onSnapshot(
    deliverablesColRef,
    (snapshot) => {
      const next = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        next[docSnap.id] = Array.isArray(data.files) ? data.files : [];
      });
      cache.deliverables = next;
      cache.firstSnapshotFired.deliverables = true;
      checkHydrationComplete();
    },
    (err) => {
      console.error("[dataService] deliverables snapshot error:", err);
      if (cache.hydrationResolvers && !cache.isHydrated) {
        cache.hydrationResolvers.reject(err);
      }
    },
  );
  cache.unsubscribers.push(unsubDeliverables);

  // 3. Scheduled LinkedIn posts (collection — one doc per post)
  const postsColRef = collection(db, "users", uid, "scheduledPosts");
  const unsubPosts = onSnapshot(
    postsColRef,
    (snapshot) => {
      const next = [];
      snapshot.forEach((docSnap) => {
        next.push({ id: docSnap.id, ...docSnap.data() });
      });
      cache.scheduledPosts = next;
      cache.firstSnapshotFired.scheduledPosts = true;
      checkHydrationComplete();
    },
    (err) => {
      console.error("[dataService] scheduledPosts snapshot error:", err);
      if (cache.hydrationResolvers && !cache.isHydrated) {
        cache.hydrationResolvers.reject(err);
      }
    },
  );
  cache.unsubscribers.push(unsubPosts);
}

// Module-load side effect: subscribe to auth state. When the user signs in,
// attach Firestore listeners; on sign-out, detach + clear.
if (typeof window !== "undefined") {
  onAuthChange((user) => {
    if (user) {
      // If somehow already attached for the same uid, no-op.
      if (cache.currentUserId === user.uid && cache.unsubscribers.length > 0) {
        return;
      }
      // Different user (or first sign-in) → tear down and rebuild.
      if (cache.unsubscribers.length > 0) {
        detachListeners();
        clearCache();
      }
      attachListeners(user.uid);
    } else {
      // Signed out.
      detachListeners();
      clearCache();
    }
  });
}

// ─── Hydration API (exported for Layout / RequireAuth) ──────────────────────

/** Returns true once initial Firestore hydration has completed for the signed-in user. */
export function isDataHydrated() {
  return cache.isHydrated;
}

/**
 * Resolves once initial Firestore hydration completes for the current user.
 * If the user is not signed in, the promise stays pending until they sign in
 * and hydration finishes. Layout.jsx awaits this before rendering children.
 *
 * Rejects if any of the snapshot listeners reports a fatal error.
 */
export function waitForHydration() {
  return cache.hydrationPromise;
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
 *
 * Phase 3: reads from the in-memory cache populated by the onSnapshot listener
 * attached in attachListeners(). Synchronous — components don't need to await.
 * Returns [] until first snapshot fires (which is fine — Layout gates rendering
 * on waitForHydration() so components only see a populated cache).
 */
export function getCompletedSteps() {
  return Array.isArray(cache.completedSteps) ? [...cache.completedSteps] : [];
}

/**
 * Marks a step complete. Validates id exists in roadmapData.
 * Enforces Pattern B chain rule: a Pattern B step cannot complete unless
 * all earlier Pattern B steps in the same learnChain are already complete.
 *
 * Phase 3: writes to Firestore users/{uid}/progress/completedSteps.
 * The onSnapshot listener will echo the write back into cache.completedSteps,
 * so reads after this resolves see the new state.
 *
 * Returns { ok: true, alreadyComplete?: true }.
 * Throws on no signed-in user, invalid id, or chain violation.
 */
export async function markStepComplete(stepId) {
  assertValidStepId(stepId);

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error("[dataService] markStepComplete requires signed-in user");
  }

  const completed = getCompletedSteps();
  if (completed.includes(stepId)) {
    return { ok: true, alreadyComplete: true };
  }

  // Pattern B chain enforcement (unchanged — validates against current cache).
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

  // Write to Firestore. setDoc with merge replaces the ids array atomically.
  const progressDocRef = doc(db, "users", uid, "progress", "completedSteps");
  await setDoc(
    progressDocRef,
    { ids: next, updatedAt: serverTimestamp() },
    { merge: true },
  );

  // Optimistic cache update — snapshot listener will overwrite this with the
  // server's authoritative state on its next callback, but updating here avoids
  // a flicker where the UI shows the old state for ~50ms while the round-trip
  // completes.
  cache.completedSteps = next;

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

/**
 * Wipes server-side state for the signed-in user. Dev/testing utility.
 *
 * Phase 3: client-side recursive clear. NOT a Cloud Function — deleteAccount
 * (Step 3) is the Cloud Function path. resetProgress is a lighter dev tool
 * that keeps the user signed in.
 *
 * Clears:
 *   - Firestore: users/{uid}/progress/completedSteps (single doc)
 *   - Firestore: users/{uid}/deliverables/* (all docs in subcollection)
 *   - Firestore: users/{uid}/scheduledPosts/* (all docs in subcollection)
 *   - Storage:   deliverables/{uid}/* (all objects under user prefix, recursive)
 *
 * Preserves:
 *   - localStorage UI state (accordion open/closed, filter chips) — harmless
 *     and avoids a jarring reset of UI affordances.
 *   - The auth user (stays signed in).
 *
 * Order: Storage first, then Firestore subcollections, then Firestore doc.
 * Reason: if a later step fails, we'd rather have orphaned Firestore records
 * (cheap, easy to retry) than orphaned Storage files (cost money on free tier).
 *
 * Cache is cleared at the end so the UI reflects empty state immediately;
 * snapshot listeners will also fire with empty payloads as Firestore catches up.
 *
 * Returns { ok: true } on success.
 * Throws on no signed-in user. Internal errors are caught, logged, and
 * surfaced via { ok: false, error }.
 */
export async function resetProgress() {
  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error("[dataService] resetProgress requires signed-in user");
  }

  try {
    // 1. Storage: list and delete every object under deliverables/{uid}/.
    //    listAll is non-recursive at one prefix level, but our schema is
    //    deliverables/{uid}/{stepId}/{filename} — so we listAll the user
    //    prefix (returns stepId "prefixes"), then for each prefix listAll
    //    its items.
    const userStorageRef = storageRef(storage, `deliverables/${uid}`);
    let userStorageListing;
    try {
      userStorageListing = await listAll(userStorageRef);
    } catch (err) {
      // If the prefix has never had any uploads, listAll can throw on some
      // SDK versions. Treat as empty.
      if (err && err.code === "storage/object-not-found") {
        userStorageListing = { items: [], prefixes: [] };
      } else {
        throw err;
      }
    }

    // Delete top-level files (unlikely under our schema, but safe).
    const topLevelDeletes = userStorageListing.items.map((itemRef) =>
      deleteObject(itemRef),
    );

    // For each stepId prefix, listAll its files and delete them.
    const nestedDeletes = userStorageListing.prefixes.map(async (prefixRef) => {
      const stepListing = await listAll(prefixRef);
      await Promise.all(
        stepListing.items.map((itemRef) => deleteObject(itemRef)),
      );
    });

    await Promise.all([...topLevelDeletes, ...nestedDeletes]);

    // 2. Firestore: deliverables subcollection.
    const deliverablesColRef = collection(db, "users", uid, "deliverables");
    const deliverablesSnap = await getDocs(deliverablesColRef);
    await Promise.all(
      deliverablesSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)),
    );

    // 3. Firestore: scheduledPosts subcollection.
    const postsColRef = collection(db, "users", uid, "scheduledPosts");
    const postsSnap = await getDocs(postsColRef);
    await Promise.all(postsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));

    // 4. Firestore: progress doc.
    const progressDocRef = doc(db, "users", uid, "progress", "completedSteps");
    await deleteDoc(progressDocRef);

    // 5. Clear in-memory cache so the UI immediately reflects empty state.
    //    Snapshot listeners will also fire with empty payloads on their next
    //    callback, but updating here avoids a flicker.
    cache.completedSteps = [];
    cache.deliverables = {};
    cache.scheduledPosts = [];

    return { ok: true };
  } catch (err) {
    console.error("[dataService] resetProgress failed:", err);
    return { ok: false, error: err };
  }
}

// ─── Account deletion (Cloud Function path) ─────────────────────────────────

/**
 * Permanently deletes the signed-in user's account.
 *
 * This is the Cloud Function path — NEVER attempt to delete data client-side.
 * The Web SDK has no recursive delete; client-side deletion is guaranteed to
 * orphan Firestore subcollection docs and Storage files. See PROJECT KICKOFF
 * §"WHY ACCOUNT DELETION IS A CLOUD FUNCTION (NOT CLIENT-SIDE)" for the full
 * rationale.
 *
 * Flow:
 *   1. Call the deleteAccount Cloud Function via httpsCallable.
 *      The function (deployed in Block 5B) runs under admin credentials and
 *      recursively deletes:
 *        - Firestore: users/{uid} and ALL subcollections
 *        - Storage:   deliverables/{uid}/ and ALL files beneath it
 *        - Auth:      the auth user record itself (LAST — guarantees no race)
 *   2. Wait for { success: true } from the function. If it throws or returns
 *      anything else, THROW — leave UI state untouched so the operator can
 *      see the error and retry. Partial cleanup on the client would create
 *      a half-deleted impression that doesn't match server reality.
 *   3. On success: clear localStorage (UI state, schema version) and redirect
 *      to /login. The auth user is already gone server-side, so the client
 *      is implicitly signed out — no signOut() call required (and calling it
 *      would race against the already-deleted user).
 *
 * Caller contract (Layout.jsx wires this in Block 5E.3):
 *   - Caller is responsible for the two-step confirm UX (warning dialog +
 *     email-match input). This function does ZERO confirmation work.
 *   - Caller should disable all UI and show a full-screen "Deleting your
 *     account…" overlay BEFORE awaiting this function. The Cloud Function
 *     can take 10–30s for users with many files.
 *   - On thrown error: caller dismisses the overlay and shows a toast.
 *     UI state remains untouched (this function only mutates state after
 *     server confirms success).
 *
 * Does NOT throw on "no signed-in user" — instead returns early with
 * { ok: false, reason: "not-signed-in" } since calling delete without a
 * user is a no-op rather than an error condition.
 *
 * Returns { ok: true } on success — but note that the function navigates
 * away to /login before the caller's await resolves, so success-path code
 * after the call is effectively unreachable. This is intentional: the only
 * way the caller observes a non-success outcome is via a thrown error.
 *
 * Throws on:
 *   - Cloud Function rejection (unauthenticated, internal error, etc.)
 *   - Cloud Function returns success: false
 *   - Network failure reaching the Cloud Function
 */
export async function deleteAccount() {
  const uid = cache.currentUserId;
  if (!uid) {
    return { ok: false, reason: "not-signed-in" };
  }

  // Call the Cloud Function. httpsCallable handles auth token injection
  // automatically — the function reads context.auth.uid server-side.
  const fns = getFunctions();
  const deleteFn = httpsCallable(fns, "deleteAccount");

  const result = await deleteFn();

  if (!result || !result.data || result.data.success !== true) {
    throw new Error(
      "[dataService] deleteAccount: Cloud Function returned non-success " +
        `(${JSON.stringify(result && result.data)})`,
    );
  }

  // Server-side state is gone. Clear client-side state and redirect.
  // localStorage.clear() is intentional — wipes both UI state and schema
  // version. The next sign-in (with any account) starts fresh.
  try {
    localStorage.clear();
  } catch (err) {
    // Non-fatal — redirect still happens. Log but don't throw.
    console.warn("[dataService] localStorage.clear() failed:", err);
  }

  // Hard redirect (not React Router navigate) — we want a full page reload
  // so the auth state, dataService cache, and any in-flight listeners are
  // all torn down cleanly. The detachListeners() path in onAuthChange will
  // also fire as the server-side auth user disappears, but a hard nav makes
  // the cleanup explicit.
  window.location.href = "/login";

  return { ok: true };
}

// ─── Deliverables ───────────────────────────────────────────────────────────

/**
 * Each entry: { id, fileName, size, uploadedAt, url, storagePath }.
 *   - Phase 3: url is a Firebase Storage download URL (long-lived signed URL).
 *   - storagePath is the Firebase Storage object path, used for deletion.
 *
 * Reads from the in-memory cache populated by the deliverables onSnapshot
 * listener. Defensive copy returned so callers can't mutate the cache.
 */
export function getDeliverables(stepId) {
  assertValidStepId(stepId);
  const arr = cache.deliverables[stepId];
  return Array.isArray(arr) ? [...arr] : [];
}

/**
 * Uploads a file to Firebase Storage and records the deliverable in Firestore.
 *
 * SIGNATURE CHANGE FROM PHASE 2A:
 *   Phase 2A: saveDeliverable(stepId, { fileName, size, url, uploadedAt? })
 *   Phase 3:  saveDeliverable(stepId, file) where file is a File instance.
 *             dataService now owns the Storage upload — callers pass the raw file.
 *
 * Process:
 *   1. Validate stepId and that `file` is a File instance.
 *   2. Dedup check by file.name + file.size against current cache.
 *   3. Upload to Storage at deliverables/{uid}/{stepId}/{timestamp}-{filename}.
 *      The timestamp prefix prevents Storage path collisions for same-named files.
 *   4. Get the download URL.
 *   5. setDoc the new deliverable into the array at users/{uid}/deliverables/{stepId}.
 *      Read existing array from cache, append, write back. Snapshot listener echoes.
 *   6. Optimistic cache update.
 *
 * Returns: { ok: true, deliverable } | { skipped: true, reason: 'duplicate' }
 * Throws on no signed-in user, invalid stepId, non-File argument, or upload failure.
 */
export async function saveDeliverable(stepId, file) {
  assertValidStepId(stepId);

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error("[dataService] saveDeliverable requires signed-in user");
  }

  if (!(file instanceof File)) {
    throw new Error(
      "[dataService] saveDeliverable requires a File instance " +
        "(Phase 3 signature change — see function docstring)",
    );
  }

  const fileName = file.name;
  const size = file.size;

  if (typeof fileName !== "string" || fileName.length === 0) {
    throw new Error("[dataService] file.name is empty");
  }
  if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
    throw new Error("[dataService] file.size is not a valid number");
  }

  // Dedup: same fileName AND same size already in array → skip.
  const existing = Array.isArray(cache.deliverables[stepId])
    ? cache.deliverables[stepId]
    : [];
  const isDuplicate = existing.some(
    (d) => d.fileName === fileName && d.size === size,
  );
  if (isDuplicate) {
    return { skipped: true, reason: "duplicate" };
  }

  // 1. Upload to Storage.
  // Path: deliverables/{uid}/{stepId}/{timestamp}-{filename}
  // Timestamp prefix prevents collisions if user uploads two different files
  // with the same name to the same step at different times.
  const timestamp = Date.now();
  const storagePath = `deliverables/${uid}/${stepId}/${timestamp}-${fileName}`;
  const fileRef = storageRef(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  const url = await getDownloadURL(fileRef);

  // 2. Build the deliverable record.
  const deliverable = {
    id: generateId(),
    fileName,
    size,
    url,
    storagePath, // Used by deleteDeliverable to remove the Storage object.
    uploadedAt: new Date().toISOString(),
  };

  // 3. Write to Firestore. Array-in-doc shape: one doc per stepId, files array inside.
  const nextFiles = [...existing, deliverable];
  const deliverableDocRef = doc(db, "users", uid, "deliverables", stepId);
  await setDoc(
    deliverableDocRef,
    { files: nextFiles, updatedAt: serverTimestamp() },
    { merge: true },
  );

  // 4. Optimistic cache update — snapshot listener will overwrite with
  // server-authoritative state on next callback.
  cache.deliverables = { ...cache.deliverables, [stepId]: nextFiles };

  return { ok: true, deliverable };
}

/**
 * Removes a deliverable from Firestore AND deletes the file from Storage.
 *
 * Order matters:
 *   1. Find the record (need its storagePath for Storage deletion).
 *   2. Delete the Storage object first. If this fails, abort — better to
 *      have a Firestore record pointing at a phantom file than a Storage
 *      file with no record (orphaned files cost money on the free tier).
 *   3. Update the Firestore array (filter out the deleted entry).
 *   4. Optimistic cache update.
 *
 * If the array becomes empty after deletion, the document is left in place
 * with an empty `files` array — Firestore doesn't need explicit cleanup.
 *
 * Returns { ok: true, removed: boolean }.
 * Throws on no signed-in user, invalid stepId, or Storage delete failure.
 */
export async function deleteDeliverable(stepId, fileId) {
  assertValidStepId(stepId);
  if (typeof fileId !== "string" || fileId.length === 0) {
    throw new Error("[dataService] deleteDeliverable requires fileId string");
  }

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error("[dataService] deleteDeliverable requires signed-in user");
  }

  const existing = Array.isArray(cache.deliverables[stepId])
    ? cache.deliverables[stepId]
    : [];
  const target = existing.find((d) => d.id === fileId);

  if (!target) {
    return { ok: true, removed: false };
  }

  // 1. Delete from Storage first. If this fails, throw — don't orphan files.
  if (target.storagePath) {
    try {
      await deleteObject(storageRef(storage, target.storagePath));
    } catch (err) {
      // If the object already doesn't exist (404), proceed to Firestore cleanup.
      // For any other error, surface it.
      if (err && err.code === "storage/object-not-found") {
        console.warn(
          `[dataService] Storage object already gone: ${target.storagePath}`,
        );
      } else {
        throw err;
      }
    }
  }

  // 2. Update Firestore array.
  const nextFiles = existing.filter((d) => d.id !== fileId);
  const deliverableDocRef = doc(db, "users", uid, "deliverables", stepId);
  await setDoc(
    deliverableDocRef,
    { files: nextFiles, updatedAt: serverTimestamp() },
    { merge: true },
  );

  // 3. Optimistic cache update.
  cache.deliverables = { ...cache.deliverables, [stepId]: nextFiles };

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
 *
 * Phase 3: reads from the in-memory cache populated by the scheduledPosts
 * onSnapshot listener attached in attachListeners(). Synchronous — components
 * don't need to await. Returns [] until first snapshot fires (gated by
 * waitForHydration in Layout).
 */
export function getScheduledLinkedInPosts() {
  return Array.isArray(cache.scheduledPosts) ? [...cache.scheduledPosts] : [];
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
 * Phase 3: writes to Firestore users/{uid}/scheduledPosts/{postId}. Only the
 * mutable fields (status, postedAt) are written via merge — the post's
 * immutable fields (stepId, day, content, scheduledFor) are untouched.
 * Snapshot listener echoes the write back into cache.scheduledPosts.
 *
 * Returns { ok: true, post } on success.
 * Throws on no signed-in user, invalid postId, missing post, or invalid status.
 */
export async function setLinkedInPostStatus(postId, status) {
  if (typeof postId !== "string" || postId.length === 0) {
    throw new Error(
      "[dataService] setLinkedInPostStatus requires postId string",
    );
  }
  if (status !== "Scheduled" && status !== "Posted") {
    throw new Error(
      `[dataService] setLinkedInPostStatus status must be "Scheduled" or "Posted", got: ${String(status)}`,
    );
  }

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error(
      "[dataService] setLinkedInPostStatus requires signed-in user",
    );
  }

  const all = getScheduledLinkedInPosts();
  const index = all.findIndex((p) => p.id === postId);
  if (index === -1) {
    throw new Error(`[dataService] LinkedIn post not found: ${postId}`);
  }

  const current = all[index];
  const postedAt = status === "Posted" ? new Date().toISOString() : null;

  // Write only the mutable delta — merge preserves immutable fields.
  const postDocRef = doc(db, "users", uid, "scheduledPosts", postId);
  await setDoc(
    postDocRef,
    { status, postedAt, updatedAt: serverTimestamp() },
    { merge: true },
  );

  const updated = { ...current, status, postedAt };

  // Optimistic cache update — snapshot listener will overwrite on next callback.
  const next = [...all.slice(0, index), updated, ...all.slice(index + 1)];
  cache.scheduledPosts = next;

  return { ok: true, post: updated };
}

/**
 * Writes Gemini-enhanced content to the matching scheduled-post docs for a step.
 * Called once per step after a successful generateBatchPosts() call.
 *
 * Signature: saveEnhancedPosts(stepId, enhancedArray)
 *   where enhancedArray = [{ index: number, content: string }, ...]
 *   matching the return shape of generateBatchPosts() in geminiClient.js.
 *
 * Index resolution:
 *   The `index` field refers to position in the step's posts sorted by
 *   (day asc, id-suffix asc) — the same canonical order used by
 *   scheduleLinkedInPosts when assigning deterministic ids. This ensures
 *   `index` round-trips identically between the consumer (LinkedInPosts.jsx),
 *   the batch generator (geminiClient.js), and this writer.
 *
 * Generate-once enforcement (Override 4, layer 2 of 3):
 *   If a target post already has a non-empty `enhancedContent` string, that
 *   post is SKIPPED (not added to the batch). The remaining eligible posts
 *   are still written. Returns a per-call summary so the UI can react.
 *
 * Atomicity:
 *   All eligible writes are committed in a single writeBatch — they succeed
 *   or fail together. Skipped (already-enhanced) posts do not participate
 *   in the batch and do not affect its outcome.
 *
 * Returns: { ok: true, saved: number, skipped: number }
 *   - saved:   count of posts whose enhancedContent was written this call
 *   - skipped: count of posts that already had enhancedContent (refusal)
 *
 * Throws on:
 *   - no signed-in user
 *   - invalid stepId
 *   - enhancedArray not an array, or entries missing { index:number, content:string }
 *   - enhancedArray entry whose `index` does not map to a post in this step
 *
 * Snapshot listener echoes the new enhancedContent into cache.scheduledPosts.
 */
export async function saveEnhancedPosts(stepId, enhancedArray) {
  assertValidStepId(stepId);

  if (!Array.isArray(enhancedArray)) {
    throw new Error(
      "[dataService] saveEnhancedPosts requires enhancedArray (Array)",
    );
  }

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error("[dataService] saveEnhancedPosts requires signed-in user");
  }

  // Validate every entry up front so a malformed item doesn't trigger a
  // partial write.
  for (const entry of enhancedArray) {
    if (
      !entry ||
      typeof entry.index !== "number" ||
      !Number.isInteger(entry.index) ||
      entry.index < 0 ||
      typeof entry.content !== "string" ||
      entry.content.length === 0
    ) {
      throw new Error(
        "[dataService] saveEnhancedPosts entries must be { index:number, content:string }",
      );
    }
  }

  // Canonical sort: by day asc, then by the trailing -{index} numeric suffix
  // of the deterministic id ascending. This matches the order the batch
  // generator and the LinkedInPosts page use.
  const stepPosts = getScheduledLinkedInPosts()
    .filter((p) => p.stepId === stepId)
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      const aIdx = Number(a.id.split("-").pop());
      const bIdx = Number(b.id.split("-").pop());
      return aIdx - bIdx;
    });

  if (stepPosts.length === 0) {
    throw new Error(
      `[dataService] saveEnhancedPosts: no scheduled posts for stepId "${stepId}"`,
    );
  }

  // Resolve indices to post docs. Refuse the whole call if any index is OOB.
  const resolved = enhancedArray.map((entry) => {
    if (entry.index >= stepPosts.length) {
      throw new Error(
        `[dataService] saveEnhancedPosts: index ${entry.index} out of range ` +
          `(step "${stepId}" has ${stepPosts.length} posts)`,
      );
    }
    return { post: stepPosts[entry.index], content: entry.content };
  });

  // Partition into eligible (no existing enhancedContent) vs skipped (already set).
  const eligible = [];
  let skipped = 0;
  for (const { post, content } of resolved) {
    if (
      typeof post.enhancedContent === "string" &&
      post.enhancedContent.length > 0
    ) {
      skipped += 1;
      continue;
    }
    eligible.push({ post, content });
  }

  if (eligible.length === 0) {
    return { ok: true, saved: 0, skipped };
  }

  // Atomic batch write — merge only the new field, leave everything else intact.
  const batch = writeBatch(db);
  for (const { post, content } of eligible) {
    const postDocRef = doc(db, "users", uid, "scheduledPosts", post.id);
    batch.set(
      postDocRef,
      { enhancedContent: content, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
  await batch.commit();

  // Optimistic cache update — snapshot listener will overwrite with
  // server-authoritative state on its next callback.
  const eligibleIds = new Set(eligible.map(({ post }) => post.id));
  cache.scheduledPosts = cache.scheduledPosts.map((p) => {
    if (!eligibleIds.has(p.id)) return p;
    const match = eligible.find(({ post }) => post.id === p.id);
    return { ...p, enhancedContent: match.content };
  });

  return { ok: true, saved: eligible.length, skipped };
}

/**
 * Writes Gemini-enhanced content to a SINGLE scheduled-post doc by its id.
 * Used by per-post regenerate (Block 5G) — the surgical complement to the
 * batch saveEnhancedPosts above.
 *
 * Signature: saveEnhancedPostForId(postId, enhancedContent)
 *
 * ── Asymmetry with saveEnhancedPosts (binding DESIGN DECISIONS entry) ──
 *   saveEnhancedPosts  : refuses overwrite. Generate-once enforced at data
 *                        layer. Returns { saved, skipped } so the batch UI
 *                        can report partial fills.
 *   saveEnhancedPostForId : OVERWRITES by design. The whole point of
 *                        per-post regenerate is to replace existing content.
 *                        Protected by UI two-step confirm (Block 5G.3),
 *                        NOT by data-layer refusal.
 *
 *   Both functions are correct. They serve different flows. Do not "unify"
 *   them — the asymmetry is the feature.
 *
 * ── Behaviour ──
 *   - Locates the target post in cache.scheduledPosts by `id`. Throws if
 *     the post is not found (the postId must belong to the current user).
 *   - Writes the new enhancedContent + updatedAt timestamp via setDoc merge.
 *     The post's immutable fields (stepId, day, content, scheduledFor) and
 *     mutable status fields (status, postedAt) are untouched.
 *   - Optimistic cache update — snapshot listener will overwrite with
 *     server-authoritative state on its next callback.
 *
 * Returns: { ok: true, post: <updated post record> }
 *
 * Throws on:
 *   - no signed-in user
 *   - invalid postId (non-string or empty)
 *   - invalid enhancedContent (non-string or empty)
 *   - postId not found in cache.scheduledPosts
 */
export async function saveEnhancedPostForId(postId, enhancedContent) {
  if (typeof postId !== "string" || postId.length === 0) {
    throw new Error(
      "[dataService] saveEnhancedPostForId requires postId string",
    );
  }
  if (
    typeof enhancedContent !== "string" ||
    enhancedContent.length === 0
  ) {
    throw new Error(
      "[dataService] saveEnhancedPostForId requires non-empty enhancedContent string",
    );
  }

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error(
      "[dataService] saveEnhancedPostForId requires signed-in user",
    );
  }

  // Locate the post in the cache. We need the existing record both to
  // verify the id is real for this user AND to return the updated record
  // so the caller can echo it into local UI state without waiting for
  // the snapshot listener.
  const all = getScheduledLinkedInPosts();
  const index = all.findIndex((p) => p.id === postId);
  if (index === -1) {
    throw new Error(
      `[dataService] saveEnhancedPostForId: post not found: ${postId}`,
    );
  }
  const current = all[index];

  // Write only the new field — merge preserves everything else.
  const postDocRef = doc(db, "users", uid, "scheduledPosts", postId);
  await setDoc(
    postDocRef,
    { enhancedContent, updatedAt: serverTimestamp() },
    { merge: true },
  );

  const updated = { ...current, enhancedContent };

  // Optimistic cache update — snapshot listener overwrites on next callback.
  const next = [...all.slice(0, index), updated, ...all.slice(index + 1)];
  cache.scheduledPosts = next;

  return { ok: true, post: updated };
}

/**
 * Validates stepId. Validates posts is an array of { day, content }.
 * scheduledFor = completionDate + day offset.
 *
 * Phase 3: writes to Firestore users/{uid}/scheduledPosts as one doc per post,
 * batched in a single atomic writeBatch.
 *
 * Idempotent re-completion strategy (deterministic ids):
 *   Each post gets a deterministic id of `${stepId}-day${day}-${index}` where
 *   index is the entry's position in the linkedInSchedule array. Re-completing
 *   the same step writes to the SAME doc ids — clean overwrite, no orphans.
 *
 * Status preservation:
 *   If a post with the same deterministic id already exists in the cache AND
 *   has status "Posted", that status and its postedAt timestamp are preserved.
 *   Re-completing a step does not silently revert a Posted entry to Scheduled.
 *
 * Returns { ok: true, count }.
 * Throws on no signed-in user, invalid stepId, invalid posts shape, or write failure.
 */
export async function scheduleLinkedInPosts(stepId, posts, completionDate) {
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

  const uid = cache.currentUserId;
  if (!uid) {
    throw new Error(
      "[dataService] scheduleLinkedInPosts requires signed-in user",
    );
  }

  // Index existing posts for this step by their deterministic id so we can
  // preserve "Posted" status across re-completion.
  const existingForStep = getScheduledLinkedInPosts().filter(
    (p) => p.stepId === stepId,
  );
  const existingById = new Map(existingForStep.map((p) => [p.id, p]));

  const scheduled = posts.map((p, index) => {
    if (typeof p.day !== "number" || typeof p.content !== "string") {
      throw new Error(
        "[dataService] each linkedInSchedule entry needs { day:number, content:string }",
      );
    }
    const scheduledFor = new Date(completedAt);
    scheduledFor.setDate(scheduledFor.getDate() + p.day);

    const id = `${stepId}-day${p.day}-${index}`;
    const prior = existingById.get(id);
    // Preserve `status` + `postedAt` (the original re-completion safety) AND
    // `enhancedContent` (Override 4 layer 3 — re-completion must never silently
    // wipe a Gemini-enhanced post). `enhancedContent` is null until the operator
    // runs the page-level batch generation; falsy `prior.enhancedContent` falls
    // through to null, which is the correct default for a freshly-scheduled post.
    const preservedEnhanced =
      prior &&
      typeof prior.enhancedContent === "string" &&
      prior.enhancedContent.length > 0
        ? prior.enhancedContent
        : null;
    const preserved =
      prior && prior.status === "Posted"
        ? {
            status: "Posted",
            postedAt: prior.postedAt,
            enhancedContent: preservedEnhanced,
          }
        : {
            status: "Scheduled",
            postedAt: null,
            enhancedContent: preservedEnhanced,
          };

    return {
      id,
      stepId,
      day: p.day,
      content: p.content,
      scheduledFor: scheduledFor.toISOString(),
      ...preserved,
    };
  });

  // Batched atomic write — all N posts succeed or none do.
  const batch = writeBatch(db);
  for (const post of scheduled) {
    const postDocRef = doc(db, "users", uid, "scheduledPosts", post.id);
    const { id, ...docData } = post;
    batch.set(
      postDocRef,
      { ...docData, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
  await batch.commit();

  // Optimistic cache update — replace all posts for this stepId.
  const otherPosts = getScheduledLinkedInPosts().filter(
    (p) => p.stepId !== stepId,
  );
  cache.scheduledPosts = [...otherPosts, ...scheduled];

  return { ok: true, count: scheduled.length };
}

// ─── Browser console exposure (DEV ONLY) ────────────────────────────────────
// Lets the operator run dataService.markStepComplete("M1-S01") in DevTools
// for the Phase 1 smoke test. Removed in production builds via Vite's
// import.meta.env.PROD flag.
if (typeof window !== "undefined" && !import.meta.env.PROD) {
  window.dataService = {
    // Hydration
    isDataHydrated,
    waitForHydration,
    // Progress
    getCurrentPhase,
    markStepComplete,
    getCompletedSteps,
    getNextStep,
    resetProgress,
    // Deliverables
    saveDeliverable,
    getDeliverables,
    deleteDeliverable,
    // UI state
    saveUIState,
    getUIState,
    // LinkedIn schedule
    getScheduledLinkedInPosts,
    scheduleLinkedInPosts,
    setLinkedInPostStatus,
    saveEnhancedPosts,
    saveEnhancedPostForId,
    // Schema version
    getSchemaVersion,
    setSchemaVersion,
  };
}
