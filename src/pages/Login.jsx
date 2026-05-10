// src/pages/Login.jsx — Phase 1 placeholder. Real Google Sign-In lands in Phase 3.

import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  return (
    <div
      style={{ padding: "var(--space-xl)", color: "var(--color-text-primary)" }}
    >
      <h1 style={{ font: "var(--text-h2)" }}>Login placeholder</h1>
      <p
        style={{
          font: "var(--text-body)",
          color: "var(--color-text-secondary)",
          marginTop: "var(--space-md)",
        }}
      >
        Real Google Sign-In is added in Phase 3. For now, click through to the
        Dashboard.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          marginTop: "var(--space-lg)",
          padding: "12px 24px",
          border: "2px solid var(--color-electric-blue)",
          color: "var(--color-electric-blue)",
          font: "var(--text-button)",
          letterSpacing: "var(--tracking-wide)",
          textTransform: "uppercase",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default Login;
