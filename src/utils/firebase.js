// src/utils/firebase.js
//
// Firebase app initialization. The ONLY file in ATLAS that calls initializeApp().
// firebase.js exports the four singletons consumed by auth.js and dataService.js.
// No component imports from here directly.
//
// Offline persistence is enabled so Firestore writes queue locally when offline
// and sync automatically on reconnect (per Project Instructions §Gemini Timeout Strategy).

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// ─── Config validation ─────────────────────────────────────────────────────
// Fail loudly at module load if any env var is missing. The default Firebase
// error ("auth/invalid-api-key") is unhelpful; this surfaces the real cause.

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[firebase] Missing required environment variables: ${missing.join(", ")}. ` +
      `Copy .env.example to .env and fill in your Firebase project config.`,
  );
}

// ─── Project identity ──────────────────────────────────────────────────────
// Firebase project: IBForge (display name — updated Phase 4C.5)
// Project ID (immutable, set during Phase 0): see VITE_FIREBASE_PROJECT_ID in .env
// Renaming the project ID is not supported by Google. Migration would require
// creating a new project and re-importing all data — destructive for live customers.
// The firebaseConfig values below are unchanged; only this comment block is new.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ─── Initialize ────────────────────────────────────────────────────────────

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// initializeFirestore (not getFirestore) is required to enable persistent cache
// with multi-tab support. Must be called BEFORE any other firestore() reads.
export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

// getFunctions(app, region) — the region MUST match the function's deployment
// region (us-central1, per Phase 3 MY_PROGRESS § Cloud Function constants).
// v2 onCall functions deploy to a different URL pattern than v1; without an
// explicit region the SDK builds the wrong URL and the browser sees a CORS
// preflight failure against cloudfunctions.net instead of the actual call
// resolving via Firebase's wire protocol.
export const functions = getFunctions(app, "us-central1");

// ─── Dev console exposure ──────────────────────────────────────────────────
// Lets the operator run `firebase.auth.currentUser` in DevTools during
// Phase 3 smoke tests. Removed in production builds via Vite's PROD flag.
if (typeof window !== "undefined" && !import.meta.env.PROD) {
  window.firebase = { app, auth, firestore, storage, functions };
}