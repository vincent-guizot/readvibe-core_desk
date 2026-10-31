'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineClose,
  AiOutlineCheck,
  AiOutlineCalendar,
  AiOutlineLock
} from 'react-icons/ai';
import { readVibeStore } from '../lib/store';

export default function FinishBookModal({ book, isOpen, onClose, onFinished, onBookFinished }) {
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [finishedDate, setFinishedDate] = useState('2026-10-29');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [createVibeCard, setCreateVibeCard] = useState(true);

  if (!isOpen || !book) return null;

  const moodList = [
    { label: 'Reflective', icon: '📖' },
    { label: 'Hopeful', icon: '☀️' },
    { label: 'Cozy', icon: '☕' },
    { label: 'Mindful', icon: '🍃' },
    { label: 'Bittersweet', icon: '🤍' }
  ];

  const toggleMood = (label) => {
    if (selectedMoods.includes(label)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== label));
    } else {
      setSelectedMoods([...selectedMoods, label]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    readVibeStore.markBookAsFinished({
      bookId: book.id,
      rating,
      dateFinished: finishedDate,
      favoriteQuote,
      moods: selectedMoods,
      privateNotes: personalNotes
    });

    if (onFinished) onFinished();
    if (onBookFinished) onBookFinished();
    onClose();

    if (createVibeCard) {
      router.push(`/vibe-card?bookId=${book.id}`);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(30, 20, 32, 0.65)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden position-relative w-100 animate__animated animate__fadeInUp"
        style={{ maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Decorative corner leaves */}
        <div
          className="position-absolute top-0 start-0 p-3 opacity-50 pointer-events-none d-none d-sm-block"
          style={{ fontSize: '2rem', userSelect: 'none' }}
        >
          🌿🌸
        </div>
        <div
          className="position-absolute top-0 end-0 p-3 opacity-50 pointer-events-none d-none d-sm-block"
          style={{ fontSize: '2rem', userSelect: 'none', marginRight: '40px' }}
        >
          🌸🌿
        </div>

        {/* Close button */}
        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 p-2 text-muted border-0 shadow-none z-3"
          onClick={onClose}
          aria-label="Close"
        >
          <AiOutlineClose size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-4 pb-2 px-4 z-2 position-relative">
          {/* Green checkmark circle */}
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
            style={{ width: '42px', height: '42px', backgroundColor: '#7C9885', color: '#FFFFFF' }}
          >
            <AiOutlineCheck size={22} />
          </div>

          <h3
            className="fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            One last page. So much to keep.
          </h3>
          <p className="text-muted small mb-3">
            Mark this book as finished and save how it made you feel.
          </p>

          {/* Book Summary Card */}
          <div
            className="d-flex align-items-center gap-3 p-2.5 rounded-3 border text-start mx-auto"
            style={{ maxWidth: '480px', backgroundColor: '#FCFAF7', borderColor: '#EAE2D8' }}
          >
            <img
              src={book.coverUrl || '/assets/books/midnight-library.jpg'}
              alt={book.title}
              className="rounded shadow-sm flex-shrink-0"
              style={{ width: '46px', height: '64px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/books/midnight-library.jpg';
              }}
            />
            <div>
              <h6 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                {book.title}
              </h6>
              <div className="text-muted small">{book.author}</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>{book.pages || 304} pages</div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-4 py-3 overflow-y-auto" style={{ flex: 1 }}>
          <div className="mx-auto" style={{ maxWidth: '480px' }}>
            {/* Rating and Date Finished Row */}
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-dark mb-1">Your rating</label>
                <div className="d-flex align-items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0 text-decoration-none border-0 shadow-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{ color: '#D96B50', cursor: 'pointer' }}
                    >
                      {(hoverRating || rating) >= star ? (
                        <AiFillStar size={26} />
                      ) : (
                        <AiOutlineStar size={26} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-muted small" style={{ fontSize: '12px' }}>
                  {rating} out of 5
                </div>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-bold text-dark mb-1">Date finished</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control form-control-sm rounded-3"
                    value={finishedDate}
                    onChange={(e) => setFinishedDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* How did this book feel? */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark mb-1.5 d-block">
                How did this book feel?
              </label>
              <div className="d-flex flex-wrap gap-2">
                {moodList.map((m) => {
                  const isSelected = selectedMoods.includes(m.label);
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => toggleMood(m.label)}
                      className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 transition-all"
                      style={{
                        backgroundColor: isSelected ? 'var(--rv-ink-plum)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : 'var(--rv-ink-plum)',
                        borderColor: isSelected ? 'var(--rv-ink-plum)' : '#E0D8CE',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        fontSize: '13px'
                      }}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite quote (optional) */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark mb-1 d-block">
                Favorite quote <span className="text-muted fw-normal">(optional)</span>
              </label>
              <textarea
                className="form-control rounded-3"
                rows={2}
                placeholder="Add a short quote you would like to remember..."
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                style={{ fontSize: '13px' }}
              />
              <span className="text-muted small" style={{ fontSize: '11px' }}>
                This can appear on your Vibe Card.
              </span>
            </div>

            {/* Personal notes (optional) */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark mb-1 d-block">
                Personal notes <span className="text-muted fw-normal">(optional)</span>
              </label>
              <div className="position-relative">
                <textarea
                  className="form-control rounded-3 pe-4"
                  rows={2}
                  placeholder="Private reflections..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
                <span className="position-absolute bottom-0 end-0 p-2 text-muted opacity-75">
                  <AiOutlineLock size={14} />
                </span>
              </div>
              <span className="text-muted small" style={{ fontSize: '11px' }}>
                Private. Only you can see these notes.
              </span>
            </div>

            {/* Create Vibe Card Next Box */}
            <div
              className="p-3 rounded-3 mb-4 d-flex align-items-center gap-3 border"
              style={{ backgroundColor: '#F4EFF7', borderColor: '#E5DCE9' }}
            >
              <span style={{ fontSize: '24px' }}>✨</span>
              <div className="flex-grow-1">
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="createVibeCardCheck"
                    checked={createVibeCard}
                    onChange={(e) => setCreateVibeCard(e.target.checked)}
                    style={{ accentColor: 'var(--rv-ink-plum)', cursor: 'pointer' }}
                  />
                  <label
                    className="form-check-label fw-bold small text-dark"
                    htmlFor="createVibeCardCheck"
                    style={{ cursor: 'pointer' }}
                  >
                    Create a Vibe Card next
                  </label>
                </div>
                <div className="text-muted small" style={{ fontSize: '12px' }}>
                  Preview a shareable card after saving your finished read.
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex align-items-center justify-content-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-pill px-4 py-2 fw-semibold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm text-white rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                style={{ backgroundColor: 'var(--rv-ink-plum)' }}
              >
                <AiOutlineCheck size={16} /> Save finished read
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-muted small" style={{ fontSize: '11px' }}>
                You can edit your rating and notes later.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
