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
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Roadmap from "@/pages/Roadmap";
import StepDetail from "@/pages/StepDetail";
import GenerateProject from "@/pages/GenerateProject";
import LinkedInPosts from "@/pages/LinkedInPosts";
import Portfolio from "@/pages/Portfolio";
import Calendar from "@/pages/Calendar";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes — no auth, no Layout shell */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

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
