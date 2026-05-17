import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { firestore } from '@/utils/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import SubmissionRow from '@/components/admin/SubmissionRow';
import CodesTable from '@/components/admin/CodesTable';
import ScreenshotModal from '@/components/admin/ScreenshotModal';
// Toast handled via local feedback state — see useFeedback below
import './Admin.css';

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

const HISTORY_TABS = ['APPROVED', 'REJECTED', 'ALL'];

export default function Admin() {
  const navigate = useNavigate();

  // Submissions state
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState('ALL');
  const [screenshotModal, setScreenshotModal] = useState(null); // { url, name }

  // Codes state
  const [codes, setCodes] = useState([]);
  const [codesFilter, setCodesFilter] = useState('ALL'); // ALL | ACTIVE | USED | TRIAL | FULL
  const [codesSearch, setCodesSearch] = useState('');

  // Mint form state
  const [mintEmail, setMintEmail] = useState('');
  const [mintPlan, setMintPlan] = useState('trial');
  const [isMinting, setIsMinting] = useState(false);

  // Action loading state — keyed by submissionId
  const [actionLoading, setActionLoading] = useState({});
  // Local feedback toast — { message, type: 'success'|'error'|'info' } | null
  const [feedback, setFeedback] = useState(null);

  function toast(message, type = 'success') {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }

  // Real-time subscriptions
  useEffect(() => {
    const pendingQ = query(
      collection(firestore, 'submissions'),
      where('status', '==', 'PENDING'),
      orderBy('submittedAt', 'desc')
    );
    const unsubPending = onSnapshot(pendingQ, (snap) => {
      setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const historyQ = query(
      collection(firestore, 'submissions'),
      where('status', 'in', ['APPROVED', 'REJECTED']),
      orderBy('reviewedAt', 'desc')
    );
    const unsubHistory = onSnapshot(historyQ, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const codesQ = query(collection(firestore, 'access-codes'), orderBy('createdAt', 'desc'));
    const unsubCodes = onSnapshot(codesQ, (snap) => {
      setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubPending();
      unsubHistory();
      unsubCodes();
    };
  }, []);

  // Approve
  const handleApprove = useCallback(async (submissionId) => {
    if (actionLoading[submissionId]) return;
    setActionLoading((prev) => ({ ...prev, [submissionId]: 'approving' }));
    try {
      const functions = getFunctions(undefined, 'asia-south2');
      const approveSubmission = httpsCallable(functions, 'approveSubmission');
      const result = await approveSubmission({ submissionId });
      toast(`Approved — code: ${result.data.code}`, 'success');
    } catch (err) {
      toast(`Approve failed: ${err.message}`, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [submissionId]: null }));
    }
  }, [actionLoading]);

  // Reject
  const handleReject = useCallback(async (submissionId, reason) => {
    if (actionLoading[submissionId]) return;
    setActionLoading((prev) => ({ ...prev, [submissionId]: 'rejecting' }));
    try {
      const functions = getFunctions(undefined, 'asia-south2');
      const rejectSubmission = httpsCallable(functions, 'rejectSubmission');
      await rejectSubmission({ submissionId, reason });
      toast('Submission rejected. Email sent.', 'info');
    } catch (err) {
      toast(`Reject failed: ${err.message}`, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [submissionId]: null }));
    }
  }, [actionLoading]);

  // Manual mint
  const handleMint = useCallback(async (e) => {
    e.preventDefault();
    if (isMinting || !mintEmail.trim()) return;
    setIsMinting(true);
    try {
      const functions = getFunctions(undefined, 'asia-south2');
      const mintManualCode = httpsCallable(functions, 'mintManualCode');
      const result = await mintManualCode({ email: mintEmail.trim(), plan: mintPlan });
      toast(`Minted ${result.data.code} for ${mintEmail}`, 'success');
      setMintEmail('');
    } catch (err) {
      toast(`Mint failed: ${err.message}`, 'error');
    } finally {
      setIsMinting(false);
    }
  }, [isMinting, mintEmail, mintPlan]);

  // Filtered history
  const filteredHistory = historyTab === 'ALL'
    ? history
    : history.filter((s) => s.status === historyTab);

  // Filtered + searched codes
  const filteredCodes = codes.filter((c) => {
    const matchesFilter =
      codesFilter === 'ALL' ||
      (codesFilter === 'ACTIVE' && !c.used) ||
      (codesFilter === 'USED' && c.used) ||
      (codesFilter === 'TRIAL' && c.plan === 'trial') ||
      (codesFilter === 'FULL' && c.plan === 'full');
    const searchLower = codesSearch.toLowerCase();
    const matchesSearch =
      !searchLower ||
      (c.id || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="admin">
      {feedback && (
        <div className={`admin__feedback admin__feedback--${feedback.type}`} role="status" aria-live="polite">
          {feedback.message}
        </div>
      )}

      <div className="admin__header">
        <div className="admin__title-row">
          <span className="admin__eyebrow">IBFORGE ADMIN</span>
          <h1 className="admin__title">Operations Console</h1>
        </div>
        <div className="admin__stats">
          <span className="admin__stat">
            <span className="admin__stat-value">{pending.length}</span>
            <span className="admin__stat-label">PENDING</span>
          </span>
          <span className="admin__stat-divider" />
          <span className="admin__stat">
            <span className="admin__stat-value">{history.filter((s) => s.status === 'APPROVED').length}</span>
            <span className="admin__stat-label">APPROVED</span>
          </span>
          <span className="admin__stat-divider" />
          <span className="admin__stat">
            <span className="admin__stat-value">{codes.filter((c) => !c.used).length}</span>
            <span className="admin__stat-label">CODES ACTIVE</span>
          </span>
        </div>
      </div>

      {/* ─── SECTION A: Submission Queue ─── */}
      <section className="admin__section">
        <div className="admin__section-header">
          <h2 className="admin__section-title">
            Pending submissions
            <span className="admin__count-badge">{pending.length}</span>
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="admin__empty">
            <span className="admin__empty-icon">✓</span>
            <span>Queue clear. No pending submissions.</span>
          </div>
        ) : (
          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>UTR</th>
                  <th>Screenshot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pending.map((sub) => (
                    <SubmissionRow
                      key={sub.id}
                      submission={sub}
                      actionState={actionLoading[sub.id]}
                      onApprove={() => handleApprove(sub.id)}
                      onReject={(reason) => handleReject(sub.id, reason)}
                      onScreenshot={(url, name) => setScreenshotModal({ url, name })}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── SECTION B: History ─── */}
      <section className="admin__section">
        <div className="admin__section-header">
          <h2 className="admin__section-title">History</h2>
          <div className="admin__tabs" role="tablist">
            {HISTORY_TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={historyTab === tab}
                className={`admin__tab${historyTab === tab ? ' admin__tab--active' : ''}`}
                onClick={() => setHistoryTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="admin__empty">No {historyTab === 'ALL' ? '' : historyTab.toLowerCase() + ' '}submissions yet.</div>
        ) : (
          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>UTR</th>
                  <th>Status</th>
                  <th>Code Issued</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((sub) => (
                  <tr key={sub.id} className={`admin__history-row admin__history-row--${sub.status.toLowerCase()}`}>
                    <td className="admin__mono">{formatDate(sub.submittedAt)}</td>
                    <td>{sub.name}</td>
                    <td className="admin__mono admin__email">{sub.email}</td>
                    <td className="admin__mono">{sub.utr}</td>
                    <td>
                      <span className={`admin__status-chip admin__status-chip--${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="admin__mono">{sub.codeIssued || '—'}</td>
                    <td className="admin__mono admin__muted">{formatDate(sub.reviewedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── SECTION C: Codes Table ─── */}
      <CodesTable
        codes={filteredCodes}
        codesFilter={codesFilter}
        codesSearch={codesSearch}
        onFilterChange={setCodesFilter}
        onSearchChange={setCodesSearch}
        totalCount={codes.length}
      />

      {/* ─── SECTION D: Manual Mint ─── */}
      <section className="admin__section admin__section--mint">
        <div className="admin__section-header">
          <h2 className="admin__section-title">Mint a code without a submission</h2>
        </div>
        <form className="admin__mint-form" onSubmit={handleMint}>
          <div className="admin__mint-field">
            <label className="admin__mint-label" htmlFor="mint-email">Email</label>
            <input
              id="mint-email"
              type="email"
              className="admin__input"
              placeholder="customer@email.com"
              value={mintEmail}
              onChange={(e) => setMintEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="admin__mint-field">
            <span className="admin__mint-label">Plan</span>
            <div className="admin__radio-group" role="radiogroup" aria-label="Plan type">
              {['trial', 'full'].map((p) => (
                <label key={p} className={`admin__radio-label${mintPlan === p ? ' admin__radio-label--selected' : ''}`}>
                  <input
                    type="radio"
                    name="mint-plan"
                    value={p}
                    checked={mintPlan === p}
                    onChange={() => setMintPlan(p)}
                    className="admin__radio-input"
                  />
                  {p.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="admin__mint-btn"
            disabled={isMinting || !mintEmail.trim()}
          >
            {isMinting ? 'Minting…' : 'Mint and email'}
          </button>
        </form>
      </section>

      {/* Screenshot modal */}
      <AnimatePresence>
        {screenshotModal && (
          <ScreenshotModal
            url={screenshotModal.url}
            name={screenshotModal.name}
            onClose={() => setScreenshotModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}