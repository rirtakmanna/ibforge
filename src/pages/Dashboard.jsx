// src/pages/Dashboard.jsx — Phase 1 placeholder.
// One real dataService call so window.dataService populates for the smoke test.

import { getCurrentPhase } from "@/utils/dataService";

function Dashboard() {
  const phase = getCurrentPhase();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Current module: {phase}</p>
    </div>
  );
}

export default Dashboard;
