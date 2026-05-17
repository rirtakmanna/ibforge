// src/App.jsx
//
// Router only — no logic, no state. The <Routes> tree is wrapped in
// <ErrorBoundary> so a crash anywhere below shows the fallback, never a
// blank screen.
//
// /login is the only public route. All others are wrapped in <RequireAuth>:
//   Phase 1/2A: pass-through (renders children)
//   Phase 3:    real Firebase Auth guard (redirects to /login if signed out)

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";

import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Refund from "@/pages/Refund";
import Dashboard from "@/pages/Dashboard";
import Roadmap from "@/pages/Roadmap";
import StepDetail from "@/pages/StepDetail";
import GenerateProject from "@/pages/GenerateProject";
import LinkedInPosts from "@/pages/LinkedInPosts";
import Portfolio from "@/pages/Portfolio";
import Calendar from "@/pages/Calendar";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

// AdminGuard — waits for Firebase auth to resolve, then:
//   - no user        → redirect to /login
//   - wrong uid      → render generic "Page not found" (do not reveal /admin exists)
//   - correct uid    → render <Admin />
function AdminGuard() {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authed' | 'unauthed' | 'denied'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthState('unauthed');
      } else if (user.uid !== ADMIN_UID) {
        setAuthState('denied');
      } else {
        setAuthState('authed');
      }
    });
    return unsub;
  }, []);

  if (authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f' }} />
    );
  }

  if (authState === 'unauthed') {
    window.location.replace('/login');
    return null;
  }

  if (authState === 'denied') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#8b8b9a', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
        Page not found.
      </div>
    );
  }

  return <Admin />;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes — no auth, no Layout shell */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/admin" element={<AdminGuard />} />

          {/* Authenticated routes — all under <Layout /> via <Outlet /> */}
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/step/:id" element={<StepDetail />} />
            <Route path="/step/:id/generate" element={<GenerateProject />} />
            <Route path="/step/:id/linkedin" element={<LinkedInPosts />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
