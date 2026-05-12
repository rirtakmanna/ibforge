// src/components/RequireAuth.jsx
//
// Auth guard wrapper. Phase 3: gates on TWO conditions before rendering children:
//   1. Firebase Auth has confirmed a signed-in user (onAuthChange callback fired).
//   2. dataService cache has hydrated (waitForHydration resolved).
//
// Without (2), components mount against an empty cache and flicker as Firestore
// snapshots arrive. The hydration gate eliminates that flicker entirely.
//
// Three auth states (not two):
//   - "unknown"        → initial state before first onAuthChange callback.
//                        Render <LoadingScreen />. Do NOT redirect — we don't
//                        yet know if the user is signed in.
//   - "authenticated"  → user object received. Await hydration, then render children.
//   - "unauthenticated"→ user is null. <Navigate to="/login" replace />.
//
// LoadingScreen reuses the animated ATLAS logo (inlined — Login.css is not
// guaranteed to be loaded on first paint of a direct /portfolio URL hit while
// signed out, so logo positioning is self-contained here).

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthChange } from "@/utils/auth";
import { waitForHydration } from "@/utils/dataService";

function LoadingScreen() {
  const LOGO_SIZE = 80;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "relative",
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            display: "inline-block",
          }}
        >
          <svg
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            viewBox="0 0 362 362"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", inset: 0 }}
          >
            <rect
              x="6"
              y="6"
              width="350"
              height="350"
              stroke="var(--color-electric-blue)"
              strokeWidth="16"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M208.215 178.807C208.215 179.371 207.898 179.888 207.396 180.144L106.681 231.438C106.216 231.675 105.661 231.654 105.216 231.381C104.771 231.108 104.5 230.624 104.5 230.103V210.085C104.5 209.509 104.83 208.984 105.349 208.733L180.449 172.551L105.349 136.369C104.83 136.119 104.5 135.594 104.5 135.018V115C104.5 114.478 104.771 113.993 105.216 113.721C105.661 113.448 106.216 113.426 106.681 113.663L207.396 164.959C207.898 165.215 208.215 165.732 208.215 166.296V178.807Z"
              fill="var(--color-electric-blue)"
              stroke="var(--color-electric-blue)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M256 228.502C256.552 228.502 257 228.95 257 229.502V246.705C257 247.257 256.552 247.705 256 247.705H155.911C155.359 247.705 154.911 247.257 154.911 246.705V229.502C154.911 228.95 155.359 228.502 155.911 228.502H256Z"
              fill="var(--color-electric-blue)"
              stroke="var(--color-electric-blue)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            viewBox="0 0 362 362"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <line
              x1="29.5"
              y1="36.5"
              x2="332.5"
              y2="36.5"
              stroke="var(--color-electric-blue)"
              strokeWidth="17"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 181 181"
                to="360 181 181"
                dur="4s"
                repeatCount="indefinite"
              />
            </line>
          </svg>
        </span>
        <span
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          LOADING…
        </span>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  // undefined = unknown (initial), null = unauthenticated, object = authenticated
  const [user, setUser] = useState(undefined);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (cancelled) return;

      setUser(firebaseUser);

      if (firebaseUser) {
        // Authenticated: wait for dataService cache to hydrate before
        // letting children render. Prevents empty-cache flicker.
        try {
          await waitForHydration();
        } catch (err) {
          // Defensive: if hydration ever rejects, we still let children
          // render with an empty cache rather than spinning forever.
          // Components handle empty data gracefully (Phase 2A behavior).
          // eslint-disable-next-line no-console
          console.error("RequireAuth: hydration failed", err);
        }
      }

      if (cancelled) return;
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // State 1: still waiting for first onAuthChange callback OR hydration.
  // Do NOT redirect yet — we don't know the auth state.
  if (!authReady) {
    return <LoadingScreen />;
  }

  // State 2: confirmed unauthenticated → redirect to /login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // State 3: authenticated + hydrated → render protected tree.
  return children;
}

export default RequireAuth;