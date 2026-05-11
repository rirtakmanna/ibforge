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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "@/utils/auth";
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
    <span className="login-logo" aria-label="ATLAS">
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
            stroke-width="2.5"
            stroke-linejoin="round"
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
      <span className="login-logo-wordmark">ATLAS</span>
    </span>
  );
}

function Login() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSignIn() {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch {
      // Phase 3 wires real error handling. Phase 1/2A: placeholder cannot fail.
      setIsSigningIn(false);
    }
  }

  return (
    <main className="login" role="main">
      <div className="login-card">
        <AtlasLogoAnimated />
        <p className="login-tagline">
          An execution-enforced IB Analyst Training OS
        </p>
        <button
          type="button"
          className="login-button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          aria-busy={isSigningIn}
        >
          <GoogleIcon />
          <span>{isSigningIn ? "SIGNING IN…" : "SIGN IN WITH GOOGLE"}</span>
        </button>
        <p className="login-footnote">
          Sign-in is not yet wired. Phase 3 enables Google authentication.
        </p>
      </div>
    </main>
  );
}

export default Login;
