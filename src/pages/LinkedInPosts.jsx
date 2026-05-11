// src/pages/LinkedInPosts.jsx
//
// Sub-page of /step/:id. Renders scheduled LinkedIn posts for a company-step.
//
// Gate (§LinkedIn Posts Page Spec):
//   - step must exist and be type "company-step"  → else redirect to /step/:id
//   - step must be in completedSteps              → else redirect to /step/:id
//   - step must not be locked                     → else redirect to /roadmap
//     (consistent with StepDetail / GenerateProject)
//
// Data sources:
//   - roadmapData[id]              → step + step.apply.linkedInSchedule (live, for per-post files)
//   - companiesData[step.companyId] → display name in header
//   - getScheduledLinkedInPosts()   → status, scheduledFor, postedAt for each post
//
// Derivation:
//   - postNumber: 1-based index in array
//   - type: from leading emoji in content
//       🧵 → Thread, 📊 → Model Drop, 🎯 → Pitch Post, 🔍 → Analysis Drop, else → Post
//   - title: first line of content, stripped of leading emoji + quotes
//   - Overdue: status === "Scheduled" && scheduledFor < today (midnight cutoff)
//
// "Post on LinkedIn":
//   - opens linkedin.com/post/new in a new tab
//   - writes the post body to clipboard
//   - 2-second "Copied + LinkedIn opened ✓" feedback via Framer Motion
//
// Phase 2A renders entry.content verbatim (no Gemini enhancement) — that swap is Phase 3.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { roadmapData } from "@/data/roadmapData";
import { companiesData } from "@/data/companiesData";
import {
  getCompletedSteps,
  getNextStep,
  getScheduledLinkedInPosts,
  setLinkedInPostStatus,
} from "@/utils/dataService";

import "./LinkedInPosts.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function deriveStatus(stepId) {
  const completed = getCompletedSteps();
  if (completed.includes(stepId)) return "complete";
  const next = getNextStep();
  if (next && next.id === stepId) return "active";
  return "locked";
}

// Match the same emoji vocabulary used in linkedInSchedule entries.
// Order matters: longest/most-specific first if any overlap (none today).
const EMOJI_TYPE_MAP = [
  { emoji: "🧵", label: "Thread" },
  { emoji: "📊", label: "Model Drop" },
  { emoji: "🎯", label: "Pitch Post" },
  { emoji: "🔍", label: "Analysis Drop" },
];

function derivePostType(content) {
  if (typeof content !== "string") return "Post";
  const trimmed = content.trimStart();
  for (const { emoji, label } of EMOJI_TYPE_MAP) {
    if (trimmed.startsWith(emoji)) return label;
  }
  return "Post";
}

// First line of content, with leading emoji + quotes stripped.
function derivePostTitle(content) {
  if (typeof content !== "string") return "";
  const firstLine = content.split("\n", 1)[0] || "";
  let cleaned = firstLine.trim();
  // Strip leading emoji marker if present.
  for (const { emoji } of EMOJI_TYPE_MAP) {
    if (cleaned.startsWith(emoji)) {
      cleaned = cleaned.slice(emoji.length).trim();
      break;
    }
  }
  // Strip surrounding quotes.
  cleaned = cleaned.replace(/^["“”'']+|["“”'']+$/g, "").trim();
  // Strip a leading em-dash "— " separator left over after emoji strip.
  cleaned = cleaned.replace(/^[—–-]\s*/, "");
  return cleaned;
}

// Friendly date: "14 May 2026". Locale-independent month name.
function formatScheduledDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Midnight-cutoff overdue check: scheduledFor strictly before today's 00:00 local.
function isOverdue(scheduledFor) {
  if (!scheduledFor) return false;
  const d = new Date(scheduledFor);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

// Effective UI status: stored Posted wins; else Overdue if past; else Scheduled.
function getEffectiveStatus(post) {
  if (post.status === "Posted") return "Posted";
  if (isOverdue(post.scheduledFor)) return "Overdue";
  return "Scheduled";
}

// ─── Per-post card ──────────────────────────────────────────────────────────

function PostCard({ post, total, filesToUpload, onStatusChange }) {
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const postType = derivePostType(post.content);
  const title = derivePostTitle(post.content);
  const dateLabel = formatScheduledDate(post.scheduledFor);
  const effectiveStatus = getEffectiveStatus(post);

  const handlePostOnLinkedIn = async () => {
    // Open new tab first (must happen inside the click handler to avoid
    // popup blockers). Clipboard write follows; if it fails, the tab is
    // still open and the operator can paste from their own buffer.
    window.open(
      "https://www.linkedin.com/post/new",
      "_blank",
      "noopener,noreferrer",
    );
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[LinkedInPosts] clipboard write failed:", err);
    }
  };

  const handleToggleStatus = () => {
    if (toggling) return;
    setToggling(true);
    try {
      const nextStatus = post.status === "Posted" ? "Scheduled" : "Posted";
      setLinkedInPostStatus(post.id, nextStatus);
      onStatusChange();
    } catch (err) {
      console.error("[LinkedInPosts] setLinkedInPostStatus failed:", err);
    } finally {
      setToggling(false);
    }
  };

  const statusChipClass = `lip__chip lip__chip--${effectiveStatus.toLowerCase()}`;
  const toggleLabel =
    post.status === "Posted" ? "MARK AS SCHEDULED" : "MARK AS POSTED";

  return (
    <motion.article
      className="lip__card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
    >
      <header className="lip__card-header">
        <div className="lip__card-meta">
          <span className="lip__post-num">
            POST {post.__index + 1} OF {total}
          </span>
          <span className="lip__type-badge">{postType}</span>
          <span className={statusChipClass}>{effectiveStatus}</span>
        </div>
        <div className="lip__schedule-line">
          Day {post.day} · {dateLabel}
        </div>
        {title && <h2 className="lip__card-title">{title}</h2>}
      </header>

      <section className="lip__body-section">
        <div className="lip__section-label">POST BODY</div>
        <pre className="lip__body">{post.content}</pre>
      </section>

      <section className="lip__files-section">
        <div className="lip__section-label">FILES TO UPLOAD WITH THIS POST</div>
        {Array.isArray(filesToUpload) && filesToUpload.length > 0 ? (
          <ul className="lip__files-list">
            {filesToUpload.map((f, i) => (
              <li key={i} className="lip__files-item">
                {typeof f === "string" ? f : f.name || f.description || ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="lip__files-empty">No additional files required.</p>
        )}
      </section>

      <div className="lip__card-actions">
        <motion.button
          type="button"
          className="lip__action lip__action--primary"
          onClick={handlePostOnLinkedIn}
          aria-label={`Post ${title || "post"} on LinkedIn`}
          animate={{ scale: copied ? 1.02 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {copied ? "COPIED + LINKEDIN OPENED ✓" : "POST ON LINKEDIN →"}
        </motion.button>

        <button
          type="button"
          className="lip__action lip__action--secondary"
          onClick={handleToggleStatus}
          disabled={toggling}
          aria-busy={toggling}
        >
          {toggleLabel}
        </button>
      </div>
    </motion.article>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function LinkedInPosts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const step = useMemo(() => roadmapData.find((s) => s.id === id), [id]);
  const status = useMemo(
    () => (step ? deriveStatus(step.id) : "locked"),
    // refreshKey kept as a dep so that a status flip elsewhere is reflected
    // if this page is revisited; it's not strictly needed today but is cheap.
    [step, refreshKey],
  );

  // ─── Redirects (effects only; never during render) ───
  useEffect(() => {
    if (!step) return;
    if (status === "locked") {
      navigate("/roadmap", { replace: true });
      return;
    }
    if (step.type !== "company-step") {
      navigate(`/step/${step.id}`, { replace: true });
      return;
    }
    // Spec: only reachable when step.id is in completedSteps.
    const completed = getCompletedSteps();
    if (!completed.includes(step.id)) {
      navigate(`/step/${step.id}`, { replace: true });
    }
  }, [step, status, navigate]);

  // Missing step id — defensive fallback before redirect effect can flush.
  if (!step) {
    return (
      <div className="lip">
        <Link to="/roadmap" className="lip__back">
          ← BACK TO ROADMAP
        </Link>
        <div className="lip__missing">Step not found: {String(id)}</div>
      </div>
    );
  }

  // Render nothing while redirect flushes (matches StepDetail/GenerateProject pattern).
  if (status === "locked") {
    return <div className="lip" aria-hidden="true" />;
  }
  if (step.type !== "company-step") {
    return <div className="lip" aria-hidden="true" />;
  }
  const completedRender = getCompletedSteps();
  if (!completedRender.includes(step.id)) {
    return <div className="lip" aria-hidden="true" />;
  }

  // ─── Data resolution ───
  const company =
    step.companyId && companiesData.find((c) => c.id === step.companyId);
  const companyName = company ? company.name : step.title;

  const liveSchedule = Array.isArray(step.apply && step.apply.linkedInSchedule)
    ? step.apply.linkedInSchedule
    : [];

  // Posts persisted for this step (already date-stamped at schedule time).
  // Match storage order to roadmapData order by day, then by their persisted
  // order — gives a stable POST N OF TOTAL count even if reload reorders.
  const persistedPosts = useMemo(
    () =>
      getScheduledLinkedInPosts()
        .filter((p) => p.stepId === step.id)
        // Preserve persisted order. If two share a day, the older record wins.
        .map((p, i) => ({ ...p, __index: i })),
    [step.id, refreshKey],
  );

  const handleStatusChange = () => setRefreshKey((n) => n + 1);

  return (
    <motion.div
      className="lip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
    >
      <Link to={`/step/${step.id}`} className="lip__back">
        ← BACK TO STEP
      </Link>

      <header className="lip__header">
        <div className="lip__position">{step.id} · LINKEDIN POSTS</div>
        <h1 className="lip__title">{companyName} — LinkedIn Posts</h1>
        <p className="lip__subtitle">
          Scheduled {persistedPosts.length}{" "}
          {persistedPosts.length === 1 ? "post" : "posts"}
        </p>
      </header>

      <hr className="lip__divider" />

      {persistedPosts.length === 0 ? (
        <div className="lip__empty">
          <p className="lip__empty-text">
            No LinkedIn posts scheduled for this step.
          </p>
        </div>
      ) : (
        <div className="lip__posts">
          {persistedPosts.map((post) => {
            // Per-post files: live read from roadmapData by index. Optional field;
            // empty when not provided (renders the "No additional files" line).
            const live = liveSchedule[post.__index];
            const filesToUpload =
              live && Array.isArray(live.filesToUpload)
                ? live.filesToUpload
                : [];
            return (
              <PostCard
                key={post.id}
                post={post}
                total={persistedPosts.length}
                filesToUpload={filesToUpload}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default LinkedInPosts;
