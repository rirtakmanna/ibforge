// src/main.jsx
//
// Entry point. CSS import order is intentional and locked:
//   1. fonts.css      — Google Fonts @import (must load first so @font-face is registered)
//   2. variables.css  — brand tokens (must come before any rule that uses var(--…))
//   3. index.css      — global reset + base body styles
//   4. App            — router and component tree

import React from "react";
import ReactDOM from "react-dom/client";

import "@/styles/fonts.css";
import "@/styles/variables.css";
import "@/index.css";

import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
