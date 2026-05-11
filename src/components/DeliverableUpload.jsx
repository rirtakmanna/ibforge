// src/components/DeliverableUpload.jsx
//
// Upload surface for company-step deliverables.
//
// Five visual states per ATLAS_Brand_System.md §Upload Zone:
//   default · hover · drag-over · uploading · success · rejection
//
// Rejection covers TWO cases:
//   1. File extension not in acceptedFileTypes
//   2. saveDeliverable returned { skipped: true, reason: 'duplicate' }
//
// Phase 2A: file.url is a blob URL via URL.createObjectURL. Session-only.
//   Phase 3 replaces this with the Firebase Storage URL — the field name
//   does not change. The "uploading" progress bar here is the indeterminate
//   Framer Motion sweep from Brand System §Loading Indicator. No real
//   upload happens in 2A (saveDeliverable is synchronous localStorage),
//   so the uploading state is shown for ~400ms for UX continuity and
//   to match the Phase 3 mental model.

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { saveDeliverable } from "@/utils/dataService";
import "./DeliverableUpload.css";

const REJECTION_DURATION_MS = 2500;
const UPLOADING_DURATION_MS = 400;

function getExtension(fileName) {
  if (typeof fileName !== "string") return "";
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  return fileName.slice(idx).toLowerCase();
}

function DeliverableUpload({ stepId, acceptedFileTypes, onUploaded }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [phase, setPhase] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'rejection'
  const [feedback, setFeedback] = useState(null); // { fileName, message }

  const acceptAttr = Array.isArray(acceptedFileTypes)
    ? acceptedFileTypes.join(",")
    : "";

  const showRejection = useCallback((fileName, message) => {
    setFeedback({ fileName, message });
    setPhase("rejection");
    window.setTimeout(() => {
      setPhase("idle");
      setFeedback(null);
    }, REJECTION_DURATION_MS);
  }, []);

  const processFile = useCallback(
    (file) => {
      if (!file) return;

      const ext = getExtension(file.name);
      const normalized = Array.isArray(acceptedFileTypes)
        ? acceptedFileTypes.map((t) => String(t).toLowerCase())
        : [];

      if (normalized.length > 0 && !normalized.includes(ext)) {
        showRejection(
          file.name,
          `Upload ${normalized.join(" or ")} files only`,
        );
        return;
      }

      setPhase("uploading");

      // Phase 2A: synchronous save. Wrap in a short timer to surface the
      // uploading state visually — Phase 3 will replace this with a real
      // promise from Firebase Storage and the timer goes away.
      window.setTimeout(() => {
        let url;
        try {
          url = URL.createObjectURL(file);
        } catch (err) {
          console.error("[DeliverableUpload] createObjectURL failed:", err);
          showRejection(file.name, "Could not create file preview");
          return;
        }

        let result;
        try {
          result = saveDeliverable(stepId, {
            fileName: file.name,
            size: file.size,
            url,
          });
        } catch (err) {
          console.error("[DeliverableUpload] saveDeliverable threw:", err);
          showRejection(file.name, "Save failed");
          return;
        }

        if (result && result.skipped) {
          // Revoke the blob we just made — we're not keeping it.
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* noop */
          }
          showRejection(file.name, "Already uploaded for this step");
          return;
        }

        setFeedback({ fileName: file.name, message: "" });
        setPhase("success");
        if (typeof onUploaded === "function") {
          onUploaded(result.deliverable);
        }
        // Success stays visible until the next interaction or until the
        // list re-renders. Brand spec doesn't auto-dismiss success.
      }, UPLOADING_DURATION_MS);
    },
    [acceptedFileTypes, onUploaded, showRejection, stepId],
  );

  const handleFileInput = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
    // Reset so re-selecting the same file re-fires onChange.
    e.target.value = "";
  };

  const handleClick = () => {
    if (phase === "uploading") return;
    if (inputRef.current) inputRef.current.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (phase === "uploading") return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (phase === "uploading") return;
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // Resolve modifier class.
  let modifier = "";
  if (phase === "rejection") modifier = "upload-zone--rejection";
  else if (phase === "uploading") modifier = "upload-zone--uploading";
  else if (phase === "success") modifier = "upload-zone--success";
  else if (isDragOver) modifier = "upload-zone--drag-over";

  const acceptedDisplay = Array.isArray(acceptedFileTypes)
    ? acceptedFileTypes.join(" · ")
    : "";

  return (
    <div className={`upload-zone ${modifier}`.trim()}>
      <input
        ref={inputRef}
        type="file"
        className="upload-zone__input"
        accept={acceptAttr}
        onChange={handleFileInput}
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        className="upload-zone__surface"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={phase === "uploading"}
        aria-label="Upload deliverable file"
        aria-busy={phase === "uploading"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" && (
            <motion.div
              key="idle"
              className="upload-zone__content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="upload-zone__label">
                {isDragOver ? "DROP FILE TO UPLOAD" : "UPLOAD DELIVERABLE"}
              </div>
              {acceptedDisplay && (
                <div className="upload-zone__hint">{acceptedDisplay}</div>
              )}
            </motion.div>
          )}

          {phase === "uploading" && (
            <motion.div
              key="uploading"
              className="upload-zone__content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="upload-zone__label">UPLOADING…</div>
              <div className="upload-zone__progress" aria-hidden="true">
                <motion.div
                  className="upload-zone__progress-bar"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </div>
            </motion.div>
          )}

          {phase === "success" && feedback && (
            <motion.div
              key="success"
              className="upload-zone__content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="upload-zone__label">
                ✓ {feedback.fileName} UPLOADED
              </div>
            </motion.div>
          )}

          {phase === "rejection" && feedback && (
            <motion.div
              key="rejection"
              className="upload-zone__content"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="upload-zone__label">✗ {feedback.fileName}</div>
              <div className="upload-zone__hint">{feedback.message}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default DeliverableUpload;
