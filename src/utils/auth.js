// src/utils/auth.js
//
// Firebase Auth wrapper. Public API: getCurrentUser, onAuthChange,
// signInWithGoogle, getGoogleRedirectResult, signOut.
//
// Account deletion is NOT in this file — it lives in dataService.deleteAccount()
// because it must call the deleteAccount Cloud Function via httpsCallable and
// the Cloud Function does ALL the work (recursive Firestore + Storage + Auth
// delete under admin credentials). Components import deleteAccount from
// dataService, not from auth.
//
// Components import from here; they never touch firebase/auth directly.
// dataService.js calls onAuthChange to hydrate its in-memory cache on sign-in.
//
// signInWithGoogle uses popup first, falls back to redirect on popup-blocked.
// Login.jsx is responsible for calling getGoogleRedirectResult on mount to
// capture the user after a redirect-flow round-trip.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/utils/firebase";

// ─── Provider ──────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
// Force account chooser every time — friendlier for users with multiple Google accounts.
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Current user (sync read) ──────────────────────────────────────────────
//
// auth.currentUser is null until either:
//   (a) onAuthStateChanged has fired with a user, OR
//   (b) getRedirectResult has resolved after a redirect-flow sign-in.
// Consumers that need to react to changes should use onAuthChange instead of
// polling getCurrentUser().

export function getCurrentUser() {
  return auth.currentUser;
}

// ─── Auth state subscription ───────────────────────────────────────────────
//
// Wraps onAuthStateChanged so dataService.js can hydrate its cache when the
// user signs in, and tear it down on sign-out, without importing firebase/auth.
// Returns the unsubscribe function — caller is responsible for cleanup.

export function onAuthChange(callback) {
  if (typeof callback !== "function") {
    throw new Error("[auth] onAuthChange requires a callback function");
  }
  return onAuthStateChanged(auth, callback);
}

// ─── Sign in: popup with redirect fallback ─────────────────────────────────
//
// Popup path: resolves with the user object.
// Redirect path: never resolves — the page navigates away, then getRedirectResult
// is called by Login.jsx on the next page load to retrieve the user.
//
// Errors caught:
//   auth/popup-blocked          → fallback to redirect
//   auth/popup-closed-by-user   → reject so Login.jsx can show "Sign-in cancelled"
//   anything else               → reject — Login.jsx surfaces the error

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    // Popup blocked by browser → fall back to redirect flow.
    if (err && err.code === "auth/popup-blocked") {
      console.warn("[auth] popup blocked, falling back to redirect");
      await signInWithRedirect(auth, googleProvider);
      // Redirect flow never returns here — page is gone before this resolves.
      return null;
    }
    // User dismissed the popup — let caller render a friendly state.
    if (err && err.code === "auth/popup-closed-by-user") {
      const cancelled = new Error("Sign-in cancelled by user");
      cancelled.code = "auth/popup-closed-by-user";
      throw cancelled;
    }
    // Anything else: surface for Login.jsx to display.
    console.error("[auth] signInWithGoogle failed:", err);
    throw err;
  }
}

// ─── Redirect result (called by Login.jsx on mount in Step 2) ──────────────
//
// Exported so Login.jsx can call it once on mount to capture a user from a
// redirect-flow sign-in. Returns the user or null if there's no pending redirect.

export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error("[auth] getRedirectResult failed:", err);
    throw err;
  }
}

// ─── Sign out ──────────────────────────────────────────────────────────────
//
// Returns { ok: true } on success. Caller (Layout's AvatarMenu) handles
// navigation to /login.

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { ok: true };
  } catch (err) {
    console.error("[auth] signOut failed:", err);
    throw err;
  }
}
