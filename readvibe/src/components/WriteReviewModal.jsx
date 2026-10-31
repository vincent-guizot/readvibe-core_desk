'use client';

import React, { useState } from 'react';
import { AiFillStar, AiOutlineStar, AiOutlineClose } from 'react-icons/ai';
import { readVibeStore } from '../lib/store';

export default function WriteReviewModal({ book, isOpen, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [mood, setMood] = useState(book?.moods?.[0] || 'Cozy');
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);

  if (!isOpen || !book) return null;

  const moodOptions = [
    'Cozy',
    'Hopeful',
    'Melancholy',
    'Thoughtful',
    'Inspiring',
    'Warm & Healing',
    'Bittersweet',
    'Mindful'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    readVibeStore.addReview({
      bookId: book.id,
      rating,
      mood,
      content,
      isSpoiler
    });
    if (onReviewAdded) onReviewAdded();
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: 'rgba(43, 19, 44, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 animate__animated animate__fadeInUp"
        style={{ maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom bg-light">
          <div>
            <span className="badge rounded-pill px-2.5 py-1 mb-1" style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px' }}>
              Reader Review
            </span>
            <h5 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
              Review: {book.title}
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

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto" style={{ flex: 1 }}>
          <div className="mb-4 text-center p-3 rounded-3" style={{ background: '#FAF7F2' }}>
            <label className="form-label fw-bold d-block mb-1 small text-muted">
              Overall Rating
            </label>
            <div className="d-flex justify-content-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="btn btn-link p-1 text-decoration-none border-0 shadow-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{ color: '#E27D60', cursor: 'pointer' }}
                >
                  {(hoverRating || rating) >= star ? (
                    <AiFillStar size={32} />
                  ) : (
                    <AiOutlineStar size={32} />
                  )}
                </button>
              ))}
            </div>
            <span className="fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
              {rating} of 5 Stars
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
              Primary vibe tag
            </label>
            <select
              className="form-select"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              {moodOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
              Your review
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="What stood out to you? Who would you recommend this to?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="spoilerCheck"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
            />
            <label className="form-check-label small text-muted" htmlFor="spoilerCheck">
              This review contains plot spoilers
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-light rounded-pill px-4 fw-semibold" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-rv-plum rounded-pill px-4 fw-bold shadow-sm">
              Post Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
