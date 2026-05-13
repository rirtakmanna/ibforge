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

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { roadmapData } from "@/data/roadmapData";
import { companiesData } from "@/data/companiesData";
import {
  getCompletedSteps,
  getNextStep,
  getScheduledLinkedInPosts,
  setLinkedInPostStatus,
  saveEnhancedPosts,
  saveEnhancedPostForId,
} from "@/utils/dataService";
import {
  generateBatchPosts,
  generateSinglePost,
  isSessionLimitReached,
} from "@/utils/geminiClient";

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

function PostCard({
  post,
  total,
  filesToUpload,
  onStatusChange,
  isBatchGenerating,
  onTransientMsg,
  companyName,
  stepTitle,
  qualityBar,
}) {
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  // ─── Per-post regenerate state (Block 5G.3) ───
  // isRegenerating: in-flight lock — disables button while request is pending.
  // cooldown:       2-second post-resolve lock (per §Gemini Rate Control).
  // confirmState:   "idle" | "confirming" — two-step confirm UX when the
  //                 post already has enhancedContent. Bypassed when fresh.
  // confirmTimerRef: 5-second timeout id that reverts confirmState to "idle"
  //                  if the operator doesn't confirm or cancel.
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [confirmState, setConfirmState] = useState("idle");
  const confirmTimerRef = useRef(null);

  // Cancel any pending confirm timer when the card unmounts (route change
  // away from /step/:id/linkedin) — otherwise the timer fires against a
  // stale setState and produces a React warning.
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        window.clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    };
  }, []);

  // Per Override 6: type badge and title both derive from the SEED (post.content).
  // The header acts as the stable identity for the post; the body is the
  // deliverable. Only the body swaps between seed and enhanced content.
  const postType = derivePostType(post.content);
  const title = derivePostTitle(post.content);
  const dateLabel = formatScheduledDate(post.scheduledFor);
  const effectiveStatus = getEffectiveStatus(post);

  // ─── Enhanced-vs-seed body resolution (Block 5C.4.4) ───
  // Non-empty string in enhancedContent → render that, mark "Enhanced with AI".
  // Otherwise → render seed content, mark "Offline Template".
  const hasEnhanced =
    typeof post.enhancedContent === "string" && post.enhancedContent.length > 0;
  const bodyToRender = hasEnhanced ? post.enhancedContent : post.content;
  const enhancementChipLabel = hasEnhanced ? "Enhanced with AI" : "Offline Template";
  const enhancementChipClass = hasEnhanced
    ? "lip__chip lip__chip--enhanced"
    : "lip__chip lip__chip--offline";

  const handlePostOnLinkedIn = async () => {
    // Open new tab first (must happen inside the click handler to avoid
    // popup blockers). Clipboard write follows; if it fails, the tab is
    // still open and the operator can paste from their own buffer.
    //
    // Copy whichever body we're showing — if Gemini enhanced it, the
    // operator wants the enhanced version on the clipboard, not the seed.
    window.open(
      "https://www.linkedin.com/post/new",
      "_blank",
      "noopener,noreferrer",
    );
    try {
      await navigator.clipboard.writeText(bodyToRender);
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

  // ─── Per-post regenerate (Block 5G.3) ────────────────────────────────────
  // Click flow:
  //   confirmState === "idle":
  //     - if hasEnhanced → setConfirmState("confirming"), start 5s revert timer
  //     - else            → fire generateSinglePost immediately
  //   confirmState === "confirming":
  //     - "Confirm Replace?" click → fire generateSinglePost
  //     - "Cancel" click             → revert to idle, clear timer
  //
  // Disabled when: batch generating, this card already regenerating, in
  // post-success cooldown, or session limit reached. The session-limit
  // check is read inside the click handler too — defensive in case the
  // limit was hit by another component since the last render.

  const sessionLimitHit = isSessionLimitReached();
  const regenerateDisabled =
    Boolean(isBatchGenerating) ||
    isRegenerating ||
    cooldown ||
    sessionLimitHit;

  const startConfirmTimer = () => {
    if (confirmTimerRef.current) {
      window.clearTimeout(confirmTimerRef.current);
    }
    confirmTimerRef.current = window.setTimeout(() => {
      setConfirmState("idle");
      confirmTimerRef.current = null;
    }, 5000);
  };

  const clearConfirmTimer = () => {
    if (confirmTimerRef.current) {
      window.clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  };

  const runRegenerate = async () => {
    clearConfirmTimer();
    setConfirmState("idle");

    // Defensive — UI should already block this, but be explicit.
    if (regenerateDisabled) return;

    setIsRegenerating(true);
    try {
      // Seed: ALWAYS the raw roadmapData content. Regenerating from the
      // existing enhancedContent would compound model drift across retries.
      // post.content is the seed; post.enhancedContent (if present) is
      // what we're replacing.
      const outcome = await generateSinglePost({
        seedContent: post.content,
        companyName,
        stepTitle,
        qualityBar,
        postType,
      });

      if (outcome && outcome.ok && typeof outcome.enhanced === "string") {
        try {
          await saveEnhancedPostForId(post.id, outcome.enhanced);
          if (typeof onTransientMsg === "function") {
            onTransientMsg(`Post ${post.__index + 1} regenerated.`, "success");
          }
          // Refresh page-level data so the chip swaps + body updates.
          onStatusChange();
        } catch (err) {
          console.error(
            "[LinkedInPosts] saveEnhancedPostForId failed:",
            err,
          );
          if (typeof onTransientMsg === "function") {
            onTransientMsg("Could not save enhanced post.", "error");
          }
        }
      } else {
        const reason =
          outcome && outcome.reason ? String(outcome.reason) : "unknown";
        if (typeof onTransientMsg === "function") {
          onTransientMsg(
            `Regenerate unavailable — keeping current post (${reason}).`,
            "info",
          );
        }
      }
    } catch (err) {
      console.error("[LinkedInPosts] runRegenerate failed:", err);
      if (typeof onTransientMsg === "function") {
        onTransientMsg("Regenerate failed — please try again.", "error");
      }
    } finally {
      // ALWAYS clear in-flight, ALWAYS enter cooldown — even on fallback or
      // throw. Per §Gemini Rate Control.
      setIsRegenerating(false);
      setCooldown(true);
      window.setTimeout(() => setCooldown(false), 2000);
    }
  };

  const handleRegenerateClick = () => {
    if (regenerateDisabled) return;
    if (confirmState === "confirming") {
      // Second click in confirm state = go ahead with replace.
      runRegenerate();
      return;
    }
    // First click.
    if (hasEnhanced) {
      // Existing content to replace → require confirm.
      setConfirmState("confirming");
      startConfirmTimer();
    } else {
      // Fresh post (no enhancedContent yet) → fire immediately.
      runRegenerate();
    }
  };

  const handleRegenerateCancel = () => {
    clearConfirmTimer();
    setConfirmState("idle");
  };

  // Button label state machine — priority order matters.
  let regenerateLabel;
  if (isBatchGenerating) regenerateLabel = "REGENERATE";
  else if (sessionLimitHit) regenerateLabel = "LIMIT REACHED";
  else if (isRegenerating) regenerateLabel = "REGENERATING…";
  else if (cooldown) regenerateLabel = "COOLDOWN…";
  else if (confirmState === "confirming") regenerateLabel = "CONFIRM REPLACE?";
  else regenerateLabel = "REGENERATE";

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
          <span className={enhancementChipClass}>{enhancementChipLabel}</span>
        </div>
        <div className="lip__schedule-line">
          Day {post.day} · {dateLabel}
        </div>
        {title && <h2 className="lip__card-title">{title}</h2>}
      </header>

      <section className="lip__body-section">
        <div className="lip__section-label">POST BODY</div>
        <pre className="lip__body">{bodyToRender}</pre>
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

      {/* AI lifecycle row — regenerate + (when in confirm state) cancel.
          Visually separated from the post-lifecycle row above so the two
          mental models don't get tangled. */}
      <div className="lip__card-ai-actions">
        <button
          type="button"
          className={
            confirmState === "confirming"
              ? "lip__action lip__action--ai lip__action--ai-confirm"
              : "lip__action lip__action--ai"
          }
          onClick={handleRegenerateClick}
          disabled={regenerateDisabled}
          aria-busy={isRegenerating}
          aria-disabled={regenerateDisabled}
          aria-label={
            confirmState === "confirming"
              ? `Confirm regenerate post ${post.__index + 1}`
              : `Regenerate post ${post.__index + 1} with AI`
          }
        >
          {regenerateLabel}
        </button>

        {confirmState === "confirming" && !isRegenerating && (
          <button
            type="button"
            className="lip__action lip__action--secondary lip__action--ai-cancel"
            onClick={handleRegenerateCancel}
            aria-label={`Cancel regenerate post ${post.__index + 1}`}
          >
            CANCEL
          </button>
        )}
      </div>
    </motion.article>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function LinkedInPosts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Batch generation state (Block 5C.4) ───
  // isGenerating: in-flight lock — disables button while request is pending.
  // cooldown:     2-second post-resolve lock — prevents rapid re-fire after
  //               success OR fallback OR timeout (per §Gemini Rate Control).
  // batchMsg:     transient inline message under the button — replaces the
  //               not-yet-built Toast system. Auto-clears in 4s.
  // batchMsgRef:  setTimeout id; cleared on unmount or when a new message arrives.
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [batchMsg, setBatchMsg] = useState(null); // { text, tone: "info"|"success"|"error" } | null
  const batchMsgTimerRef = useRef(null);

  // Always clear the timer if the component unmounts mid-message.
  useEffect(() => {
    return () => {
      if (batchMsgTimerRef.current) {
        window.clearTimeout(batchMsgTimerRef.current);
        batchMsgTimerRef.current = null;
      }
    };
  }, []);

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

  // ─── Batch generation: computed disabled flags ──────────────────────────
  // Per Override 4 (Generate-once gate, UI layer): the button must be
  // disabled when ANY post in this step already has enhancedContent.
  // Override 4 also requires that the data layer (saveEnhancedPosts) refuses
  // overwrite and that scheduleLinkedInPosts preserves enhancedContent —
  // both verified in Chat 4. This is the third (UI) layer.
  const alreadyEnhanced = persistedPosts.some(
    (p) =>
      typeof p.enhancedContent === "string" && p.enhancedContent.length > 0,
  );
  const sessionLimitHit = isSessionLimitReached();
  const buttonDisabled =
    isGenerating || cooldown || alreadyEnhanced || sessionLimitHit;

  // Reason-specific label — see §Gemini Rate Control + handoff "Disabled state copy".
  let buttonLabel;
  if (isGenerating) buttonLabel = "GENERATING…";
  else if (cooldown) buttonLabel = "COOLDOWN…";
  else if (alreadyEnhanced) buttonLabel = "ALL POSTS ALREADY ENHANCED";
  else if (sessionLimitHit) buttonLabel = "GENERATION LIMIT REACHED";
  else buttonLabel = "GENERATE ALL POSTS WITH AI ↗";

  // ─── Inline message helper (replaces not-yet-built Toast system) ────────
  // Sets a transient message that auto-clears after 4 seconds. Calling again
  // resets the timer cleanly.
  const setTransientMsg = (text, tone) => {
    if (batchMsgTimerRef.current) {
      window.clearTimeout(batchMsgTimerRef.current);
      batchMsgTimerRef.current = null;
    }
    setBatchMsg({ text, tone });
    batchMsgTimerRef.current = window.setTimeout(() => {
      setBatchMsg(null);
      batchMsgTimerRef.current = null;
    }, 4000);
  };

  // ─── Batch generation handler ───────────────────────────────────────────
  const handleBatchGenerate = async () => {
    // Defensive guard — UI should already prevent this, but be explicit.
    if (buttonDisabled) return;
    if (persistedPosts.length === 0) return;

    // Build the seed payload in the SAME order saveEnhancedPosts expects.
    // saveEnhancedPosts (Block 5C.3.1) resolves indices by sorting the step's
    // cached posts (day asc, id-suffix asc). Our persistedPosts array comes
    // straight out of getScheduledLinkedInPosts which is already sorted that
    // way upstream — so the persistedPosts order IS the canonical order, and
    // index = position in this array. (See "SCHEMA NOTE" in CHAT_HANDOFF.)
    const seedPosts = persistedPosts.map((p) => ({
      day: p.day,
      content: p.content,
    }));

    const company =
      step.companyId && companiesData.find((c) => c.id === step.companyId);
    const companyName = company ? company.name : step.title;
    const qualityBar =
      (step.build && step.build.qualityBar) ||
      (step.apply && step.apply.focusDo) ||
      "";

    setIsGenerating(true);
    try {
      const outcome = await generateBatchPosts({
        seedPosts,
        companyName,
        stepTitle: step.title,
        qualityBar,
      });

      if (outcome && outcome.ok && Array.isArray(outcome.enhanced)) {
        // saveEnhancedPosts performs atomic per-post write with overwrite
        // refusal. Returns { ok, saved, skipped }.
        const writeResult = await saveEnhancedPosts(step.id, outcome.enhanced);
        if (writeResult && writeResult.ok && writeResult.saved > 0) {
          setTransientMsg(
            writeResult.skipped > 0
              ? `Enhanced ${writeResult.saved} post${writeResult.saved === 1 ? "" : "s"} (${writeResult.skipped} already enhanced — skipped).`
              : `Enhanced ${writeResult.saved} post${writeResult.saved === 1 ? "" : "s"} with AI.`,
            "success",
          );
        } else {
          // Save returned no saves — either all skipped or unexpected shape.
          setTransientMsg(
            "Posts were already enhanced — nothing to update.",
            "info",
          );
        }
        // Bump refreshKey so persistedPosts re-reads the cache with the new
        // enhancedContent populated. Cards remount with the new values.
        setRefreshKey((n) => n + 1);
      } else {
        // Fallback path: timeout, network, bad batch, etc.
        const reason =
          outcome && outcome.reason ? String(outcome.reason) : "unknown";
        setTransientMsg(
          `Generation unavailable — using seed posts (${reason}).`,
          "info",
        );
      }
    } catch (err) {
      // Defensive — generateBatchPosts and saveEnhancedPosts both return
      // structured outcomes rather than throwing. Catch is a last-resort net.
      console.error("[LinkedInPosts] handleBatchGenerate failed:", err);
      setTransientMsg("Generation failed — please try again.", "error");
    } finally {
      // ALWAYS clear in-flight, ALWAYS enter cooldown — even on fallback or
      // throw. Per §Gemini Rate Control: cooldown applies after success OR
      // fallback OR timeout.
      setIsGenerating(false);
      setCooldown(true);
      window.setTimeout(() => setCooldown(false), 2000);
    }
  };

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

        {persistedPosts.length > 0 && (
          <div className="lip__batch-row">
            <button
              type="button"
              className="lip__action lip__action--primary lip__batch-btn"
              onClick={handleBatchGenerate}
              disabled={buttonDisabled}
              aria-busy={isGenerating}
              aria-disabled={buttonDisabled}
            >
              {buttonLabel}
            </button>

            <AnimatePresence>
              {batchMsg && (
                <motion.div
                  key={batchMsg.text}
                  className={`lip__batch-msg lip__batch-msg--${batchMsg.tone}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                  role={batchMsg.tone === "error" ? "alert" : "status"}
                  aria-live={batchMsg.tone === "error" ? "assertive" : "polite"}
                >
                  {batchMsg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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
                isBatchGenerating={isGenerating}
                onTransientMsg={setTransientMsg}
                companyName={companyName}
                stepTitle={step.title}
                qualityBar={
                  (step.build && step.build.qualityBar) ||
                  (step.apply && step.apply.focusDo) ||
                  ""
                }
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default LinkedInPosts;
