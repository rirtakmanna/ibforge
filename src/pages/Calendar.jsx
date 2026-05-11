// src/pages/Calendar.jsx
//
// Calendar page — month view with electric-blue dot indicators on days that
// have scheduled LinkedIn posts. Clicking a day with posts reveals them in a
// panel below the grid (LinkedInCard compact variant).
//
// Data: reads getScheduledLinkedInPosts() from dataService.
// Each post has { id, stepId, day, content, scheduledFor (ISO), status, postedAt }.
//
// Performance:
//   - Posts grouped by date key (YYYY-MM-DD) once per render via useMemo.
//   - Day cells read from the lookup map — never iterate all posts per cell.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LinkedInCard from '@/components/LinkedInCard';
import { getScheduledLinkedInPosts } from '@/utils/dataService';
import { formatDate, formatDateKey } from '@/utils/helpers';
import './Calendar.css';

// ─── Date helpers (page-local) ─────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

/**
 * Returns the Monday on or before the 1st of {year, month}.
 * Calendar always starts on Monday (ISO week).
 */
function firstGridDay(year, month) {
  const first = startOfMonth(year, month);
  const dayOfWeek = first.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Convert to Monday-start: 0 → 6, 1 → 0, 2 → 1, ... , 6 → 5
  const offset = (dayOfWeek + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Returns 42 consecutive days starting from firstGridDay (6 weeks × 7). */
function buildGridDays(year, month) {
  const start = firstGridDay(year, month);
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Calendar() {
  // Today's date — frozen at mount (don't refetch on every render).
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // The month currently being viewed.
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // The day the user has selected to inspect (or null = none).
  const [selectedKey, setSelectedKey] = useState(null);

  // Load posts once on mount. Re-trigger via refreshTick if needed in future.
  const [refreshTick] = useState(0); // reserved — Step 4 may need to refetch
  const posts = useMemo(() => {
    try {
      return getScheduledLinkedInPosts();
    } catch (err) {
      console.error('[Calendar] failed to load posts', err);
      return [];
    }
  }, [refreshTick]);

  // Build a date-keyed lookup: { 'YYYY-MM-DD': [post, post, ...] }
  const postsByDate = useMemo(() => {
    const map = new Map();
    for (const p of posts) {
      if (!p || !p.scheduledFor) continue;
      const key = formatDateKey(p.scheduledFor);
      if (!key) continue;
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    // Sort posts within each day by day offset (then by id for stability).
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return String(a.id).localeCompare(String(b.id));
      });
    }
    return map;
  }, [posts]);

  // Build the 42-cell grid for the current viewed month.
  const gridDays = useMemo(
    () => buildGridDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const totalScheduled = posts.length;

  // ─── Navigation handlers ──────────────────────────────────────────────
  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedKey(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedKey(null);
  }, []);

  const handleToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedKey(formatDateKey(today));
  }, [today]);

  const handleSelectDay = useCallback((day) => {
    const key = formatDateKey(day);
    setSelectedKey((curr) => (curr === key ? null : key));
  }, []);

  // Keyboard navigation on the grid wrapper.
  const handleGridKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevMonth();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextMonth();
      }
    },
    [handlePrevMonth, handleNextMonth],
  );

  // Clear selection if it falls outside the current view window.
  useEffect(() => {
    if (!selectedKey) return;
    const stillInView = gridDays.some(
      (d) => formatDateKey(d) === selectedKey && d.getMonth() === viewMonth,
    );
    if (!stillInView) setSelectedKey(null);
  }, [gridDays, selectedKey, viewMonth]);

  // ─── Render ──────────────────────────────────────────────────────────
  const selectedPosts =
    selectedKey && postsByDate.has(selectedKey)
      ? postsByDate.get(selectedKey)
      : [];
  const selectedDate = selectedKey ? new Date(`${selectedKey}T00:00:00`) : null;

  return (
    <div className="calendar">
      <header className="calendar__header">
        <h1 className="calendar__title">CALENDAR</h1>
        <p className="calendar__subtitle">
          {totalScheduled === 0
            ? 'No posts scheduled yet'
            : `${totalScheduled} scheduled ${totalScheduled === 1 ? 'post' : 'posts'}`}
        </p>
      </header>

      {totalScheduled === 0 && (
        <div className="calendar__empty-banner">
          Complete a company step to populate your calendar with LinkedIn posts.
        </div>
      )}

      <div className="calendar__nav" role="group" aria-label="Calendar navigation">
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="calendar__month-label" aria-live="polite">
          {monthLabel(viewYear, viewMonth)}
        </h2>
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          →
        </button>
        <button
          type="button"
          className="calendar__today-btn"
          onClick={handleToday}
        >
          TODAY
        </button>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="calendar__grid-wrap"
        role="grid"
        aria-label={`${monthLabel(viewYear, viewMonth)} calendar`}
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
      >
        <div className="calendar__weekdays" role="row">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="calendar__weekday"
              role="columnheader"
              aria-label={label}
            >
              {label.toUpperCase()}
            </div>
          ))}
        </div>

        <div className="calendar__grid">
          {gridDays.map((day) => {
            const key = formatDateKey(day);
            const inMonth = day.getMonth() === viewMonth;
            const isToday = isSameDay(day, today);
            const isSelected = selectedKey === key;
            const dayPosts = postsByDate.get(key) || [];
            const hasPosts = dayPosts.length > 0;
            return (
              <button
                key={key}
                type="button"
                className={[
                  'calendar__cell',
                  !inMonth && 'calendar__cell--out',
                  isToday && 'calendar__cell--today',
                  isSelected && 'calendar__cell--selected',
                  hasPosts && 'calendar__cell--has-posts',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelectDay(day)}
                role="gridcell"
                aria-selected={isSelected}
                aria-label={
                  hasPosts
                    ? `${formatDate(day)} — ${dayPosts.length} ${dayPosts.length === 1 ? 'post' : 'posts'} scheduled`
                    : formatDate(day)
                }
              >
                <span className="calendar__cell-num">{day.getDate()}</span>
                {hasPosts && (
                  <span
                    className="calendar__cell-dot"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Posts panel ─── */}
      <section
        className="calendar__panel"
        aria-live="polite"
        aria-label="Posts on selected day"
      >
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.div
              key={selectedKey}
              className="calendar__panel-inner"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            >
              <h3 className="calendar__panel-title">
                {formatDate(selectedDate).toUpperCase()}
              </h3>
              {selectedPosts.length === 0 ? (
                <p className="calendar__panel-empty">
                  No posts scheduled for this day.
                </p>
              ) : (
                <div className="calendar__panel-cards">
                  {selectedPosts.map((post) => (
                    <LinkedInCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="instruction"
              className="calendar__panel-instruction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Select a day with a dot indicator to view scheduled posts.
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}