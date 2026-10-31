'use client';

import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { readVibeStore } from '../lib/store';

export default function UpdateProgressModal({
  book,
  currentReading,
  isOpen,
  onClose,
  onUpdated,
  onProgressUpdated
}) {
  const [currentPage, setCurrentPage] = useState(currentReading?.currentPage || 0);
  const [notes, setNotes] = useState(currentReading?.notes || '');

  React.useEffect(() => {
    if (currentReading) {
      setCurrentPage(currentReading.currentPage || 0);
      setNotes(currentReading.notes || '');
    }
  }, [currentReading, book]);

  if (!isOpen || !book) return null;

  const totalPages = book.pages || currentReading?.totalPages || 300;
  const percentage = Math.min(100, Math.round((currentPage / totalPages) * 100));

  const handleSubmit = (e) => {
    e.preventDefault();
    readVibeStore.updateReadingProgress(book.id, currentPage, notes);
    if (onUpdated) onUpdated();
    if (onProgressUpdated) onProgressUpdated();
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: 'rgba(43, 19, 44, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 animate__animated animate__fadeInUp"
        style={{ maxWidth: '480px' }}
      >
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom bg-light">
          <div>
            <span className="badge rounded-pill px-2 py-1 mb-1" style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px' }}>
              Reading Progress
            </span>
            <h5 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
              {book.title}
            </h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 text-muted"
            onClick={onClose}
          >
            <AiOutlineClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="text-center p-3 rounded-3 mb-4" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="display-6 fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              {percentage}%
            </div>
            <div className="text-muted small">
              Page {currentPage} of {totalPages}
            </div>
            <div className="progress mt-2" style={{ height: '8px', backgroundColor: '#EADFD5' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${percentage}%`, backgroundColor: '#D96B50' }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
              Current page
            </label>
            <input
              type="number"
              min="0"
              max={totalPages}
              className="form-control"
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(0, Number(e.target.value))))}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
              Reading notes / thoughts so far (Optional)
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Record a thought, quote, or page impression..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-light rounded-pill px-4 fw-semibold" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-rv-plum rounded-pill px-4 fw-bold shadow-sm">
              Save Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
