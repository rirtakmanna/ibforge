import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/utils/firebase';
import './SubmissionRow.css';

export default function SubmissionRow({
  submission,
  actionState,
  onApprove,
  onReject,
  onScreenshot,
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  const isLoading = !!actionState;
  const isApproving = actionState === 'approving';
  const isRejecting = actionState === 'rejecting';

  async function handleScreenshotClick() {
    if (!submission.screenshotPath) return;
    setLoadingScreenshot(true);
    try {
      const url = await getDownloadURL(ref(storage, submission.screenshotPath));
      onScreenshot(url, submission.name);
    } catch {
      // silently ignore — show nothing
    } finally {
      setLoadingScreenshot(false);
    }
  }

  function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    onReject(rejectReason.trim());
    setRejectOpen(false);
    setRejectReason('');
  }

  return (
    <motion.tr
      className="submission-row"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
    >
      <td className="admin__mono">{formatDate(submission.submittedAt)}</td>
      <td>{submission.name}</td>
      <td className="admin__mono admin__email">{submission.email || '—'}</td>
      <td className="admin__mono">{submission.utr}</td>
      <td>
        {submission.screenshotPath ? (
          <button
            className="submission-row__screenshot-btn"
            onClick={handleScreenshotClick}
            disabled={loadingScreenshot}
            aria-label="View payment screenshot"
          >
            {loadingScreenshot ? '…' : '📎 View'}
          </button>
        ) : (
          <span className="admin__muted">—</span>
        )}
      </td>
      <td>
        <div className="submission-row__actions">
          <button
            className="submission-row__btn submission-row__btn--approve"
            onClick={onApprove}
            disabled={isLoading}
            aria-label="Approve submission"
          >
            {isApproving ? '…' : 'Approve'}
          </button>

          {rejectOpen ? (
            <form className="submission-row__reject-form" onSubmit={handleRejectSubmit}>
              <input
                className="submission-row__reject-input admin__input"
                type="text"
                placeholder="Rejection reason (sent to customer)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
                required
              />
              <div className="submission-row__reject-actions">
                <button
                  type="submit"
                  className="submission-row__btn submission-row__btn--reject-confirm"
                  disabled={!rejectReason.trim() || isLoading}
                >
                  {isRejecting ? '…' : 'Confirm reject'}
                </button>
                <button
                  type="button"
                  className="submission-row__btn submission-row__btn--cancel"
                  onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="submission-row__btn submission-row__btn--reject"
              onClick={() => setRejectOpen(true)}
              disabled={isLoading}
              aria-label="Reject submission"
            >
              Reject
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}