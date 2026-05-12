// src/components/LinkedInCard.jsx
//
// Renders one scheduled LinkedIn post. Two variants:
//   compact  — Calendar usage. Type badge + title + day chip + Copy.
//   full     — LinkedIn Posts sub-page (Step 4). Adds scheduled date + body.
//
// Post type is derived from the leading emoji marker in post.content:
//   🧵 → Thread        (electric blue accent)
//   📊 → Model Drop    (warning amber accent)
//   🎤 → Pitch Post    (success green accent)
//   anything else → Post (muted accent)
//
// roadmapData stores { day, content }. dataService.scheduleLinkedInPosts adds
// { id, stepId, scheduledFor (ISO), status, postedAt }. This component reads
// from either shape — required fields are `content` and `day`.

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { firstLine, formatDate, stripLeadingMarker } from "@/utils/helpers";
import "./LinkedInCard.css";

// ─── Type derivation ───────────────────────────────────────────────────────

const TYPE_BY_MARKER = {
  "🧵": { key: "thread", label: "Thread" },
  "📊": { key: "model-drop", label: "Model Drop" },
  "🎤": { key: "pitch", label: "Pitch Post" },
};

function deriveType(content) {
  if (typeof content !== "string") return { key: "post", label: "Post" };
  // Iterate keys explicitly — emoji code points are multi-char in JS, so
  // we can't use content[0] reliably.
  for (const marker of Object.keys(TYPE_BY_MARKER)) {
    if (content.startsWith(marker)) return TYPE_BY_MARKER[marker];
  }
  return { key: "post", label: "Post" };
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function LinkedInCard({
  post,
  variant = "compact",
  companyName = null,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (copied) return; // in-flight lock + cooldown collapsed into one flag
    if (!post || typeof post.content !== "string") return;
    try {
      await navigator.clipboard.writeText(post.content);
    } catch (err) {
      // Clipboard can fail on insecure contexts or when permission denied.
      console.warn("[LinkedInCard] clipboard write failed", err);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copied, post]);

  if (!post) return null;

  const type = deriveType(post.content);
  const title = stripLeadingMarker(firstLine(post.content));

  return (
    <article
      className={`lic lic--${variant} lic--${type.key}`}
      aria-label={`${type.label} post — ${title}`}
    >
      <header className="lic__header">
        <span className={`lic__badge lic__badge--${type.key}`}>
          {type.label.toUpperCase()}
        </span>
        <span
          className="lic__day"
          aria-label={`Day ${post.day} of the post series`}
        >
          DAY {post.day}
        </span>
      </header>

      <h3 className="lic__title" title={title}>
        {title}
      </h3>

      {variant === "full" && (
        <>
          {(companyName || post.scheduledFor) && (
            <p className="lic__meta">
              {companyName && (
                <span className="lic__meta-company">{companyName}</span>
              )}
              {companyName && post.scheduledFor && (
                <span className="lic__meta-divider" aria-hidden="true">
                  ·
                </span>
              )}
              {post.scheduledFor && (
                <span className="lic__meta-date">
                  Scheduled {formatDate(post.scheduledFor)}
                </span>
              )}
            </p>
          )}

          <div className="lic__body">
            {post.content}
          </div>
        </>
      )}

      <footer className="lic__footer">
        <button
          type="button"
          className="lic__copy"
          onClick={handleCopy}
          disabled={copied}
          aria-label={copied ? `${type.label} post copied` : `Copy ${type.label} post: ${title}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                className="lic__copy-label lic__copy-label--copied"
              >
                COPIED ✓
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                className="lic__copy-label"
              >
                COPY
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </footer>
    </article>
  );
}
