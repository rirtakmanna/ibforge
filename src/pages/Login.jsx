// src/pages/Login.jsx
//
// Public entry point. Not wrapped in Layout — owns its full viewport.
// Centered ATLAS logo (animated icon + wordmark) + "Sign in with Google" primary button.
// Terminal dark background. No form fields. No other elements.
//
// Phase 1/2A: clicking the button calls signInWithGoogle (placeholder) and
// navigates to /. Phase 3 swaps in real Firebase Google popup auth + redirect.
//
// Animated logo: static SVG layer + rotating top-line SVG layer, 4s linear infinite.
// prefers-reduced-motion: handled by index.css global block (Phase 1) which stops
// SMIL animation via animation-play-state. No local override needed.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, signOut, onAuthChange } from "@/utils/auth";
import { getAccessRecord } from "@/utils/dataService";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/utils/firebase";
import "./Login.css";

function GoogleIcon() {
  // Google "G" mark — official 4-color glyph.
  return (
    <svg
      className="login-google-icon"
      width="20"
      height="20"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function AtlasLogoAnimated() {
  // Two-layer logo per Brand System §Logo System:
  // - Static SVG: square border + chevron + underscore bar + top horizontal line
  // - Rotating SVG: a single line that orbits 360° around (179.5, 179.5), 4s linear infinite
  // Wrapper is position: relative, overflow: visible (line protrudes at extremes).
  return (
    <span className="login-logo" aria-label="IBForge">
      <span className="login-logo-icon" aria-hidden="true">
        <svg
          className="login-logo-static"
          width="120"
          height="120"
          viewBox="0 0 362 362"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="6"
            width="350"
            height="350"
            stroke="var(--color-electric-blue)"
            strokeWidth="12"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M208.215 178.807C208.215 179.371 207.898 179.888 207.396 180.144L106.681 231.438C106.216 231.675 105.661 231.654 105.216 231.381C104.771 231.108 104.5 230.624 104.5 230.103V210.085C104.5 209.509 104.83 208.984 105.349 208.733L180.449 172.551L105.349 136.369C104.83 136.119 104.5 135.594 104.5 135.018V115C104.5 114.478 104.771 113.993 105.216 113.721C105.661 113.448 106.216 113.426 106.681 113.663L207.396 164.959C207.898 165.215 208.215 165.732 208.215 166.296V178.807Z"
            fill="var(--color-electric-blue)"
            stroke="var(--color-electric-blue)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M256 228.502C256.552 228.502 257 228.95 257 229.502V246.705C257 247.257 256.552 247.705 256 247.705H155.911C155.359 247.705 154.911 247.257 154.911 246.705V229.502C154.911 228.95 155.359 228.502 155.911 228.502H256Z"
            fill="var(--color-electric-blue)"
            stroke="var(--color-electric-blue)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="login-logo-rotor"
          width="120"
          height="120"
          viewBox="0 0 362 362"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="29.5"
            y1="36.5"
            x2="332.5"
            y2="36.5"
            stroke="var(--color-electric-blue)"
            strokeWidth="13"
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
      <span className="login-logo-wordmark">IBForge</span>
    </span>
  );
}

function errorMessageFor(err) {
  // Map Firebase Auth error codes to user-facing strings.
  // Cancellations are NOT errors — they're soft, muted messages.
  const code = err?.code || "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return { text: "Sign-in cancelled.", severity: "info" };
    case "auth/popup-blocked":
      return {
        text: "Popup blocked. Trying redirect — please wait.",
        severity: "info",
      };
    case "auth/network-request-failed":
      return {
        text: "Network error. Check your connection and try again.",
        severity: "error",
      };
    case "auth/invalid-credential":
    case "auth/internal-error":
      return { text: "Sign-in failed. Try again.", severity: "error" };
    default:
      // Surface unknown codes during development; users see a generic message.
      // eslint-disable-next-line no-console
      if (code) console.warn("Login: unhandled auth error code", code);
      return { text: "Sign-in failed. Try again.", severity: "error" };
  }
}

// Maps claimCode Cloud Function error codes to user-facing strings.
function codeErrorMessageFor(err) {
  const code = err?.code || err?.message || "";
  if (code.includes("INVALID_CODE"))
    return "Code not recognised. Check for typos.";
  if (code.includes("CODE_ALREADY_USED"))
    return "This code has already been redeemed.";
  if (code.includes("CODE_EMAIL_MISMATCH"))
    return "This code was issued for a different email.";
  if (code.includes("unauthenticated"))
    return "Sign in first, then enter your code.";
  return "Couldn't redeem the code. Try again or email hello@ibforge.in.";
}

// Normalise code input: uppercase, strip anything not A-Z 0-9 or hyphen.
function normalizeCode(raw) {
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").trim();
}

function Login() {
  const navigate = useNavigate();
  const codeInputRef = useRef(null);

  // authState:
  //   "unknown"         → waiting for first onAuthChange callback
  //   "unauthenticated" → no Firebase user
  //   "no-access"       → signed in, no access record (Branch 2)
  //   (redirect)        → signed in + access record → /dashboard immediately
  const [authState, setAuthState] = useState("unknown");
  const [currentUser, setCurrentUser] = useState(null);

  // Branch 1 state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(null);

  // Branch 2 state
  const [codeInput, setCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemCooldown, setRedeemCooldown] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        setCurrentUser(null);
        setAuthState("unauthenticated");
        return;
      }

      setCurrentUser(user);

      // Check access record to decide which branch to show.
      // Failure is treated as no-access — user lands on code entry,
      // which is a recoverable surface.
      try {
        const record = await getAccessRecord(user.uid);
        if (record) {
          // Has access — go straight to Dashboard.
          navigate("/dashboard", { replace: true });
        } else {
          setAuthState("no-access");
        }
      } catch (err) {
        console.error("Login: access record check failed", err);
        setAuthState("no-access");
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [navigate]);

  // Focus code input when Branch 2 becomes visible.
  useEffect(() => {
    if (authState === "no-access" && codeInputRef.current) {
      const id = requestAnimationFrame(() => codeInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [authState]);

  // ── Branch 1 handlers ──────────────────────────────────────────────────

  async function handleSignIn() {
    if (isSigningIn) return;
    setSignInError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // onAuthChange fires on success and handles navigation.
    } catch (err) {
      setSignInError(errorMessageFor(err));
      setIsSigningIn(false);
    }
  }

  // ── Branch 2 handlers ──────────────────────────────────────────────────

  async function handleRedeem() {
    if (isRedeeming || redeemCooldown) return;
    const code = normalizeCode(codeInput);
    if (!code) return;

    setCodeError(null);
    setIsRedeeming(true);

    try {
      const claimCode = httpsCallable(functions, "claimCode");
      await claimCode({ code });
      // Success — navigate to Dashboard. Onboarding modal fires there.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setCodeError(codeErrorMessageFor(err));
      setIsRedeeming(false);
      setRedeemCooldown(true);
      setTimeout(() => setRedeemCooldown(false), 2000);
    }
  }

  function handleCodeKeyDown(e) {
    if (e.key === "Enter") handleRedeem();
  }

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      // onAuthChange fires with null → setAuthState("unauthenticated")
      // Reset Branch 1 state so the sign-in button is clean on return.
      setIsSigningIn(false);
      setSignInError(null);
    } catch (err) {
      console.error("Login: sign out failed", err);
      setIsSigningOut(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const isCheckingSession = authState === "unknown";

  // Branch 1 — not signed in
  const branch1ButtonLabel = isCheckingSession
    ? "CHECKING SESSION…"
    : isSigningIn
    ? "SIGNING IN…"
    : "SIGN IN WITH GOOGLE";
  const branch1ButtonDisabled = isCheckingSession || isSigningIn;

  // Branch 2 — signed in, no access
  const redeemDisabled = isRedeeming || redeemCooldown || normalizeCode(codeInput).length === 0;

  return (
    <main className="login" role="main">
      <div className="login-card">
        <AtlasLogoAnimated />

        {/* ── Branch 2: signed in, no access record ── */}
        {authState === "no-access" && (
          <>
            <div className="login-code-header">
              <p className="login-tagline">Enter your access code</p>
              <p className="login-code-account">
                Signed in as{" "}
                <span className="login-code-email">
                  {currentUser?.email || ""}
                </span>
              </p>
            </div>

            <div className="login-code-field">
              <input
                ref={codeInputRef}
                type="text"
                className="login-code-input"
                placeholder="IBFORGE-2026-XXXX"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-label="Access code"
                disabled={isRedeeming}
              />
              <button
                type="button"
                className="login-button login-button--redeem"
                onClick={handleRedeem}
                disabled={redeemDisabled}
                aria-busy={isRedeeming}
              >
                <span>
                  {isRedeeming ? "CHECKING…" : "REDEEM CODE →"}
                </span>
              </button>
            </div>

            {codeError && (
              <p
                className="login-code-error"
                role="alert"
                aria-live="assertive"
              >
                {codeError}
              </p>
            )}

            <button
              type="button"
              className="login-signout-link"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out…" : "Wrong account? Sign out →"}
            </button>
          </>
        )}

        {/* ── Branch 1: not signed in (or checking session) ── */}
        {(authState === "unauthenticated" || authState === "unknown") && (
          <>
            <p className="login-tagline">
              An execution-enforced IB Analyst Training OS
            </p>
            <button
              type="button"
              className="login-button"
              onClick={handleSignIn}
              disabled={branch1ButtonDisabled}
              aria-busy={isSigningIn || isCheckingSession}
            >
              <GoogleIcon />
              <span>{branch1ButtonLabel}</span>
            </button>
            {signInError && (
              <p
                role={signInError.severity === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`login-error login-error--${signInError.severity}`}
              >
                {signInError.text}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Login;
