// src/components/RequireAuth.jsx
//
// Auth guard wrapper. Phase 1/2A: pass-through (renders children unconditionally).
// Phase 3: this body changes to read from Firebase Auth and redirect to /login
// if the user is signed out. Component import sites do NOT change between phases.

function RequireAuth({ children }) {
  return children;
}

export default RequireAuth;
