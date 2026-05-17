import { useEffect } from 'react';
import { motion } from 'framer-motion';
import './ScreenshotModal.css';

export default function ScreenshotModal({ url, name, onClose }) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="screenshot-modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Payment screenshot — ${name}`}
    >
      <motion.div
        className="screenshot-modal__panel"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="screenshot-modal__header">
          <span className="screenshot-modal__title">Payment Screenshot — {name}</span>
          <button
            className="screenshot-modal__close"
            onClick={onClose}
            aria-label="Close screenshot modal"
          >
            ✕
          </button>
        </div>
        <div className="screenshot-modal__body">
          <img
            src={url}
            alt={`Payment screenshot for ${name}`}
            className="screenshot-modal__img"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}