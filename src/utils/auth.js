// src/utils/auth.js
//
// Phase 1/2A: placeholder handlers — no real authentication wired yet.
// Phase 3 replaces the BODY of each function with Firebase Auth calls.
// The export SIGNATURES are stable from Phase 2A onward — components
// import from here and never change their import sites between phases.
//
// Functions intentionally return Promises so Phase 3 can swap in async
// Firebase calls without touching consumers.

const PLACEHOLDER_USER = {
  uid: "local-operator",
  displayName: "Operator",
  email: null,
  photoURL: null,
};

/**
 * Returns the current user object. Phase 1/2A: a static placeholder.
 * Phase 3: real Firebase auth.currentUser.
 */
export function getCurrentUser() {
  return PLACEHOLDER_USER;
}

/**
 * Phase 1/2A: no-op resolve.
 * Phase 3: triggers Google sign-in popup, resolves with the user object.
 */
export async function signInWithGoogle() {
  return PLACEHOLDER_USER;
}

/**
 * Phase 1/2A: no-op resolve. Caller is responsible for navigation.
 * Phase 3: signs the user out of Firebase, then caller navigates to /login.
 */
export async function signOut() {
  return { ok: true };
}

/**
 * Phase 1/2A: rejects — deletion is not yet available.
 * Phase 3: deletes the Firebase Auth user + their Firestore data + Storage files.
 */
export async function deleteAccount() {
  return { ok: false, reason: "not-available-until-phase-3" };
}