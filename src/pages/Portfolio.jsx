// src/pages/Portfolio.jsx
//
// Portfolio page — every uploaded deliverable, sectioned by step, downloadable.
//
// Architecture:
//   - Reads roadmapData (array order) + dataService.getDeliverables(stepId) per step.
//   - groupByStep() iterates roadmapData in order, includes only steps with ≥1 file.
//   - Filter chips appear only when ≥2 distinct steps have files.
//   - Filter state persists via saveUIState('portfolioFilter', stepId | 'all').
//   - Delete uses a custom confirm modal (not window.confirm).
//   - Files render newest-first within each step section.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapData } from '@/data/roadmapData';
import {
  getDeliverables,
  deleteDeliverable,
  saveUIState,
  getUIState,
} from '@/utils/dataService';
import {
  formatDate,
  formatBytes,
  moduleNumberFromId,
} from '@/utils/helpers';
import './Portfolio.css';

// ─── Helpers (page-local) ──────────────────────────────────────────────────

/**
 * Walks roadmapData in array order. For each step, calls getDeliverables(stepId).
 * Returns [{ step, files }] where files.length > 0. Excludes empty steps.
 * Files are sorted newest-first by uploadedAt.
 */
function groupByStep() {
  const groups = [];
  for (const step of roadmapData) {
    let files;
    try {
      files = getDeliverables(step.id);
    } catch {
      files = [];
    }
    if (!Array.isArray(files) || files.length === 0) continue;
    const sorted = [...files].sort((a, b) => {
      const ta = new Date(a.uploadedAt || 0).getTime();
      const tb = new Date(b.uploadedAt || 0).getTime();
      return tb - ta; // newest first
    });
    groups.push({ step, files: sorted });
  }
  return groups;
}

/**
 * Returns the step-type label rendered in the TYPE column.
 * LEARN / WATCH / BUILD — BUILD covers company-step deliverables.
 */
function typeLabel(step) {
  if (step.type === 'learn') return 'LEARN';
  if (step.type === 'watch') return 'WATCH';
  return 'BUILD';
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Portfolio() {
  // Re-grouping is cheap (10s of steps); recompute on demand via a refreshTick.
  const [refreshTick, setRefreshTick] = useState(0);
  const groups = useMemo(() => groupByStep(), [refreshTick]);

  // Persisted filter — restore on mount.
  const [filter, setFilter] = useState('all'); // 'all' | stepId
  useEffect(() => {
    const saved = getUIState('portfolioFilter');
    if (typeof saved === 'string' && saved.length > 0) {
      setFilter(saved);
    }
  }, []);

  // Delete confirmation state.
  const [pendingDelete, setPendingDelete] = useState(null); // { stepId, file }

  const visibleGroups = useMemo(() => {
    if (filter === 'all') return groups;
    return groups.filter((g) => g.step.id === filter);
  }, [groups, filter]);

  // Chips appear only when ≥2 distinct steps have files.
  const showChips = groups.length >= 2;

  const handleSelectFilter = useCallback((value) => {
    setFilter(value);
    try {
      saveUIState('portfolioFilter', value);
    } catch (err) {
      // Non-fatal — filter persistence is nice-to-have.
      console.warn('[Portfolio] saveUIState failed', err);
    }
  }, []);

  const handleDeleteRequest = useCallback((stepId, file) => {
    setPendingDelete({ stepId, file });
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    try {
      deleteDeliverable(pendingDelete.stepId, pendingDelete.file.id);
    } catch (err) {
      console.error('[Portfolio] deleteDeliverable failed', err);
    }
    setPendingDelete(null);
    setRefreshTick((n) => n + 1);
  }, [pendingDelete]);

  // ─── Empty state ─────────────────────────────────────────────────────────
  if (groups.length === 0) {
    return (
      <div className="portfolio">
        <header className="portfolio__header">
          <h1 className="portfolio__title">PORTFOLIO</h1>
        </header>
        <div className="portfolio__empty">
          <p className="portfolio__empty-title">NO DELIVERABLES UPLOADED</p>
          <p className="portfolio__empty-sub">
            Complete a step and upload a file to populate your portfolio.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="portfolio">
      <header className="portfolio__header">
        <h1 className="portfolio__title">PORTFOLIO</h1>

        {showChips && (
          <nav
            className="portfolio__chips"
            aria-label="Filter deliverables by step"
          >
            <button
              type="button"
              className={`portfolio__chip ${filter === 'all' ? 'portfolio__chip--active' : ''}`}
              onClick={() => handleSelectFilter('all')}
              aria-pressed={filter === 'all'}
            >
              ALL
            </button>
            {groups.map(({ step }) => (
              <button
                key={step.id}
                type="button"
                className={`portfolio__chip ${filter === step.id ? 'portfolio__chip--active' : ''}`}
                onClick={() => handleSelectFilter(step.id)}
                aria-pressed={filter === step.id}
                title={step.title}
              >
                {step.title}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="portfolio__body">
        {visibleGroups.map(({ step, files }) => (
          <section key={step.id} className="portfolio__section">
            <h2 className="portfolio__section-header">
              <span className="portfolio__section-dash" aria-hidden="true" />
              <span className="portfolio__section-label">
                {step.title.toUpperCase()} (MODULE {moduleNumberFromId(step.id)})
              </span>
              <span className="portfolio__section-dash" aria-hidden="true" />
            </h2>

            <div className="portfolio__table-wrap">
              <table className="portfolio__table">
                <thead>
                  <tr className="portfolio__thead-row">
                    <th scope="col" className="portfolio__th portfolio__th--code">
                      CODE
                    </th>
                    <th scope="col" className="portfolio__th portfolio__th--name">
                      NAME
                    </th>
                    <th scope="col" className="portfolio__th portfolio__th--type">
                      TYPE
                    </th>
                    <th scope="col" className="portfolio__th portfolio__th--date">
                      DATE
                    </th>
                    <th scope="col" className="portfolio__th portfolio__th--actions">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {files.map((file) => (
                      <motion.tr
                        key={file.id}
                        className="portfolio__row"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                      >
                        <td className="portfolio__td portfolio__td--code">
                          {step.id}
                        </td>
                        <td className="portfolio__td portfolio__td--name">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="portfolio__file-link"
                            download={file.fileName}
                          >
                            {file.fileName}
                          </a>
                          <span className="portfolio__size">
                            {formatBytes(file.size)}
                          </span>
                        </td>
                        <td className="portfolio__td portfolio__td--type">
                          {typeLabel(step)}
                        </td>
                        <td className="portfolio__td portfolio__td--date">
                          {formatDate(file.uploadedAt)}
                        </td>
                        <td className="portfolio__td portfolio__td--actions">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            download={file.fileName}
                            className="portfolio__action portfolio__action--download"
                            aria-label={`Download ${file.fileName}`}
                          >
                            DOWNLOAD
                          </a>
                          <button
                            type="button"
                            className="portfolio__action portfolio__action--delete"
                            onClick={() => handleDeleteRequest(step.id, file)}
                            aria-label={`Delete ${file.fileName}`}
                          >
                            DELETE
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>

      {/* ─── Delete confirmation modal ─── */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            className="portfolio__modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleDeleteCancel}
            role="presentation"
          >
            <motion.div
              className="portfolio__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-delete-title"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="portfolio-delete-title" className="portfolio__modal-title">
                DELETE DELIVERABLE
              </h2>
              <p className="portfolio__modal-body">
                This will permanently remove{' '}
                <span className="portfolio__modal-filename">
                  {pendingDelete.file.fileName}
                </span>{' '}
                from your portfolio. This action cannot be undone.
              </p>
              <div className="portfolio__modal-actions">
                <button
                  type="button"
                  className="portfolio__modal-btn portfolio__modal-btn--cancel"
                  onClick={handleDeleteCancel}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className="portfolio__modal-btn portfolio__modal-btn--delete"
                  onClick={handleDeleteConfirm}
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}