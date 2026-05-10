// src/utils/helpers.js
//
// Pure utilities and the useOnlineStatus hook. No storage access.
// React is imported only for hooks; non-hook helpers stay framework-free.

import { useEffect, useState } from "react";

// ─── Date formatting ────────────────────────────────────────────────────────

/**
 * Formats a Date or ISO string as "DD MMM YYYY" (e.g. "14 May 2026").
 * Returns empty string on invalid input — never throws.
 */
export function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Formats a Date as "YYYY-MM-DD" — used as Calendar grid keys. */
export function formatDateKey(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Adds N days to a Date and returns a new Date. */
export function addDays(date, days) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

// ─── String helpers ─────────────────────────────────────────────────────────

/** Truncates a string to maxLen, appending "…" if truncated. */
export function truncate(str, maxLen = 80) {
  if (typeof str !== "string") return "";
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Returns the first non-empty line of a string. */
export function firstLine(str) {
  if (typeof str !== "string") return "";
  const lines = str
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[0] || "";
}

/** Strips a leading emoji + space from a line, plus surrounding straight/smart quotes. */
export function stripLeadingMarker(line) {
  if (typeof line !== "string") return "";
  // Remove leading emoji-like character(s) and following whitespace.
  // Conservative regex: any non-letter, non-digit, non-ASCII-punct prefix.
  const noEmoji = line.replace(/^[^\p{L}\p{N}\s]+\s*/u, "");
  // Strip wrapping quotes.
  return noEmoji.replace(/^["“'‘]+|["”'’]+$/g, "").trim();
}

// ─── Bytes ──────────────────────────────────────────────────────────────────

/** Formats a byte count as "1.2 MB" / "512 KB" / "234 B". */
export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Roadmap id helpers ─────────────────────────────────────────────────────
//
// IMPORTANT: never derive ordering or unlock state from these. They are display
// helpers only. dataService.getNextStep() walks roadmapData array order — that
// is the single source of truth for step sequence.

/** Extracts the module number (1–14) from an id like "M1-S09" or "M14-S145B". */
export function moduleNumberFromId(id) {
  if (typeof id !== "string") return null;
  const m = /^M(\d{1,2})-/.exec(id);
  return m ? Number(m[1]) : null;
}

/** Extracts the step suffix (e.g. "S09", "S05B") from an id. */
export function stepSuffixFromId(id) {
  if (typeof id !== "string") return "";
  const m = /-(S\d+[A-Z]?)$/.exec(id);
  return m ? m[1] : "";
}

// ─── Online status hook ─────────────────────────────────────────────────────
//
// Project Instructions §Gemini Timeout Strategy requires this hook for offline
// banner + Gemini call gating. Components consume { isOnline } and react.

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
