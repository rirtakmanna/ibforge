import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { auth, functions } from "@/utils/firebase";
import { getAccessRecord } from "@/utils/dataService";

import "./Access.css";

/**
 * Google "G" mark — official 4-color glyph. Mirrors Login.jsx's GoogleIcon
 * so both sign-in buttons render the same logo at the same size.
 */
function GoogleIcon() {
  return (
    <svg
      className="access-google-icon"
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

/**
 * /access — code entry page.
 *
 * Three branches based on auth + access state:
 *   1. No Firebase user            → sign-in prompt (Google)
 *   2. User signed in, no access   → code entry form
 *   3. User signed in + access     → redirect to /dashboard
 *
 * Public route (registered outside RequireAuth). Auth is acquired here
 * via signInWithPopup; we do NOT redirect to /login because the spec
 * requires the user to stay on /access through the full flow.
 */

const BRANCH_LOADING = "loading";
const BRANCH_NO_AUTH = "no-auth";
const BRANCH_CODE_ENTRY = "code-entry";

const SUBMIT_IDLE = "idle";
const SUBMIT_PENDING = "submitting";
const SUBMIT_ERROR = "error";

// Map Cloud Function thrown codes to brand-voice copy. Short, factual, no apology.
function mapClaimError(error) {
  const message = error?.message || "";
  const details = error?.details;

  // Firebase callable errors surface the function's HttpsError message in `error.message`.
  // The thrown strings from claimCode are: INVALID_CODE, CODE_ALREADY_USED, CODE_EMAIL_MISMATCH.
  if (message.includes("INVALID_CODE") || details === "INVALID_CODE") {
    return "Code not recognised. Check for typos.";
  }
  if (
    message.includes("CODE_ALREADY_USED") ||
    details === "CODE_ALREADY_USED"
  ) {
    return "This code has already been redeemed.";
  }
  if (
    message.includes("CODE_EMAIL_MISMATCH") ||
    details === "CODE_EMAIL_MISMATCH"
  ) {
    return "This code was issued for a different email.";
  }
  if (error?.code === "unauthenticated") {
    return "Sign in expired. Sign in again to redeem.";
  }
  if (error?.code === "unavailable" || error?.code === "deadline-exceeded") {
    return "Network problem. Check your connection and try again.";
  }

  return "Couldn't redeem this code. Email hello@ibforge.in if this keeps happening.";
}

// Normalize user input: uppercase, drop everything that is not [A-Z 0-9 -].
// Pasted "ibforge-trial-a3kp" → "IBFORGE-TRIAL-A3KP".
function normalizeCode(raw) {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .trim();
}

export default function Access() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef(null);

  // Branch state — derived from Firebase auth + access record check.
  // Starts as "loading" until firstauthcheck resolves to avoid a sign-in flash.
  const [branch, setBranch] = useState(BRANCH_LOADING);
  const [user, setUser] = useState(null);

  // Code-entry form state
  const [code, setCode] = useState("");
  const [submitState, setSubmitState] = useState(SUBMIT_IDLE);
  const [submitError, setSubmitError] = useState("");

  // Sign-in error state (no-auth branch)
  const [signInError, setSignInError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // ─── Branch resolution: watch auth state, check access record on sign-in ───
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (cancelled) return;

      if (!firebaseUser) {
        setUser(null);
        setBranch(BRANCH_NO_AUTH);
        return;
      }

      setUser(firebaseUser);

      // Signed in — does an access record exist?
      try {
        const record = await getAccessRecord(firebaseUser.uid);
        if (cancelled) return;

        if (record) {
          // Already redeemed. Send to dashboard — they should never see /access again.
          navigate("/dashboard", { replace: true });
        } else {
          setBranch(BRANCH_CODE_ENTRY);
        }
      } catch (err) {
        if (cancelled) return;
        // If the access check fails, fall through to code-entry rather than
        // bouncing the user out — claimCode will surface the real error.
        // eslint-disable-next-line no-console
        console.error("Access record check failed:", err);
        setBranch(BRANCH_CODE_ENTRY);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [navigate]);

  // ─── Autofocus the code input when the code-entry branch mounts ───
  useEffect(() => {
    if (branch === BRANCH_CODE_ENTRY && inputRef.current) {
      inputRef.current.focus();
    }
  }, [branch]);

  // ─── Sign-in handler (no-auth branch) ───
  async function handleSignIn() {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setSignInError("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged effect will pick this up and flip the branch.
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Sign-in failed:", err);
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        // User dismissed the popup — silent, no error message.
        setSignInError("");
      } else if (err?.code === "auth/unauthorized-domain") {
        setSignInError(
          "Sign-in unavailable on this domain. Email hello@ibforge.in.",
        );
      } else {
        setSignInError("Sign-in failed. Try again.");
      }
      setIsSigningIn(false);
    }
  }

  // ─── Claim handler (code-entry branch) ───
  async function handleClaim(event) {
    event.preventDefault();
    if (submitState === SUBMIT_PENDING) return;

    const normalized = normalizeCode(code);
    if (!normalized) {
      setSubmitState(SUBMIT_ERROR);
      setSubmitError("Enter a code to redeem.");
      return;
    }

    setSubmitState(SUBMIT_PENDING);
    setSubmitError("");

    try {
      const claimCode = httpsCallable(functions, "claimCode");
      const result = await claimCode({ code: normalized });

      if (result?.data?.success) {
        // Access granted. Hard-replace to /dashboard so /access leaves the history stack.
        navigate("/dashboard", { replace: true });
        return;
      }

      // Defensive — function should always throw on failure, but if it returns
      // success: false, surface a generic error rather than silently advancing.
      setSubmitState(SUBMIT_ERROR);
      setSubmitError("Couldn't redeem this code. Try again.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("claimCode failed:", err);
      setSubmitState(SUBMIT_ERROR);
      setSubmitError(mapClaimError(err));
    }
  }

  function handleInputChange(event) {
    setCode(event.target.value);
    // Clear stale error the moment the user edits — no point holding onto it.
    if (submitState === SUBMIT_ERROR) {
      setSubmitState(SUBMIT_IDLE);
      setSubmitError("");
    }
  }

  // ─── Motion variants (respect prefers-reduced-motion) ───
  const cardReveal = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
      };

  return (
    <div className="access-page">
      <LandingNav />

      <main className="access-main">
        <motion.section
          className="access-card"
          aria-labelledby="access-heading"
          initial={cardReveal.initial}
          animate={cardReveal.animate}
          transition={cardReveal.transition}
        >
          {branch === BRANCH_LOADING && (
            <div className="access-loading" role="status" aria-live="polite">
              <span className="access-loading-label">CHECKING ACCESS</span>
              <div className="access-loading-bar" aria-hidden="true">
                <motion.div
                  className="access-loading-bar-fill"
                  animate={
                    prefersReducedMotion ? { x: 0 } : { x: ["-100%", "100%"] }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          duration: 1.5,
                          ease: "linear",
                          repeat: Infinity,
                          repeatType: "loop",
                        }
                  }
                />
              </div>
            </div>
          )}

          {branch === BRANCH_NO_AUTH && (
            <>
              <header className="access-header">
                <h1 id="access-heading" className="access-title">
                  Sign in to redeem your IBForge code
                </h1>
                <p className="access-subtitle">
                  Trial or full — both redeem on this page after sign-in
                </p>
              </header>

              <button
                type="button"
                className="access-google-button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                aria-busy={isSigningIn}
              >
                <GoogleIcon />
                <span>{isSigningIn ? "Signing in…" : "Sign in with Google"}</span>
              </button>

              {signInError && (
                <p className="access-error" role="alert" aria-live="assertive">
                  {signInError}
                </p>
              )}

              <p className="access-footnote">
                No code yet? Get a free Module 1 trial code from{" "}
                <a className="access-footnote-link" href="/#pricing">
                  the pricing section
                </a>
                .
              </p>
            </>
          )}

          {branch === BRANCH_CODE_ENTRY && (
            <>
              <header className="access-header">
                <h1 id="access-heading" className="access-title">
                  Enter your access code
                </h1>
                <p className="access-subtitle">
                  Trial or full — both redeem here
                </p>
              </header>

              <form className="access-form" onSubmit={handleClaim} noValidate>
                <label className="access-label" htmlFor="access-code-input">
                  ACCESS CODE
                </label>
                <input
                  ref={inputRef}
                  id="access-code-input"
                  className="access-input"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  placeholder="IBFORGE-XXXX-XXXX"
                  value={code}
                  onChange={handleInputChange}
                  disabled={submitState === SUBMIT_PENDING}
                  aria-invalid={submitState === SUBMIT_ERROR}
                  aria-describedby={
                    submitState === SUBMIT_ERROR
                      ? "access-error-msg"
                      : undefined
                  }
                />

                <button
                  type="submit"
                  className="access-submit-button"
                  disabled={submitState === SUBMIT_PENDING || !code.trim()}
                  aria-busy={submitState === SUBMIT_PENDING}
                >
                  {submitState === SUBMIT_PENDING ? "Redeeming…" : "Redeem"}
                </button>

                {submitState === SUBMIT_ERROR && (
                  <p
                    id="access-error-msg"
                    className="access-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {submitError}
                  </p>
                )}
              </form>

              <p className="access-signed-in">
                Signed in as{" "}
                <span className="access-signed-in-email">{user?.email}</span>
              </p>
            </>
          )}
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
}
