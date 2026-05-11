// src/components/DeliverableList.jsx
//
// Presentational list of deliverables for one step.
// Parent (StepDetail) owns the deliverables state and passes it in.
// Delete-with-confirm is inline (no modal in 2A) — the row swaps into a
// confirmation prompt with Cancel + Delete buttons.
//
// Props:
//   stepId      — string (required) — passed to deleteDeliverable
//   deliverables — array (required) — items from getDeliverables(stepId)
//   onDeleted   — function (optional) — called with deleted id after success
//
// Each deliverable: { id, fileName, size, url, uploadedAt }

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { deleteDeliverable } from "@/utils/dataService";
import { formatBytes, formatDate } from "@/utils/helpers";
import "./DeliverableList.css";

function DeliverableRow({ deliverable, stepId, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = () => {
    setBusy(true);
    setError("");
    try {
      const result = deleteDeliverable(stepId, deliverable.id);
      if (result && result.ok) {
        // Revoke the blob URL so we don't leak memory. Safe to call on
        // strings that aren't blob URLs (no-op).
        try {
          if (deliverable.url && deliverable.url.startsWith("blob:")) {
            URL.revokeObjectURL(deliverable.url);
          }
        } catch {
          /* noop */
        }
        if (typeof onDeleted === "function") onDeleted(deliverable.id);
        // Parent will re-render with the new array — this row unmounts via exit anim.
      } else {
        setError("Delete failed");
        setBusy(false);
      }
    } catch (err) {
      console.error("[DeliverableList] delete threw:", err);
      setError("Delete failed");
      setBusy(false);
    }
  };

  return (
    <motion.li
      className="deliverable-list__row"
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
    >
      <div className="deliverable-list__main">
        <div className="deliverable-list__name" title={deliverable.fileName}>
          {deliverable.fileName}
        </div>
        <div className="deliverable-list__meta">
          <span className="deliverable-list__size">
            {formatBytes(deliverable.size)}
          </span>
          <span className="deliverable-list__dot" aria-hidden="true">
            ·
          </span>
          <span className="deliverable-list__date">
            {formatDate(deliverable.uploadedAt)}
          </span>
        </div>
      </div>

      {!confirming && (
        <div className="deliverable-list__actions">
          <a
            className="deliverable-list__action deliverable-list__action--download"
            href={deliverable.url}
            download={deliverable.fileName}
            aria-label={`Download ${deliverable.fileName}`}
          >
            DOWNLOAD
          </a>
          <button
            type="button"
            className="deliverable-list__action deliverable-list__action--delete"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${deliverable.fileName}`}
          >
            DELETE
          </button>
        </div>
      )}

      {confirming && (
        <div
          className="deliverable-list__confirm"
          role="group"
          aria-label="Confirm delete"
        >
          <span className="deliverable-list__confirm-text">
            Delete this file?
          </span>
          <button
            type="button"
            className="deliverable-list__action deliverable-list__action--cancel"
            onClick={() => setConfirming(false)}
            disabled={busy}
          >
            CANCEL
          </button>
          <button
            type="button"
            className="deliverable-list__action deliverable-list__action--confirm"
            onClick={handleDelete}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "DELETING…" : "CONFIRM"}
          </button>
        </div>
      )}

      {error && (
        <div className="deliverable-list__error" role="alert">
          {error}
        </div>
      )}
    </motion.li>
  );
}

function DeliverableList({ stepId, deliverables, onDeleted }) {
  const list = Array.isArray(deliverables) ? deliverables : [];

  if (list.length === 0) {
    return (
      <div className="deliverable-list__empty">
        No deliverables uploaded yet.
      </div>
    );
  }

  return (
    <ul className="deliverable-list" aria-label="Uploaded deliverables">
      <AnimatePresence initial={false}>
        {list.map((d) => (
          <DeliverableRow
            key={d.id}
            deliverable={d}
            stepId={stepId}
            onDeleted={onDeleted}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default DeliverableList;