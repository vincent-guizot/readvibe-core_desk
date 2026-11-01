'use client';

import React, { useState } from 'react';
import {
  AiOutlineClose,
  AiOutlineCheck,
  AiOutlineUser,
  AiOutlineInfoCircle
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '../../lib/store';

export default function AddToWishlistModal({ book, isOpen, onClose, onSaved }) {
  const [priority, setPriority] = useState('Soon'); // 'Someday' | 'Soon' | 'Next up'
  const [reason, setReason] = useState('');
  const [referrer, setReferrer] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  React.useEffect(() => {
    if (book) {
      setPriority(book.priority || 'Soon');
      setReason(book.reason || '');
      setReferrer(book.referrer || '');
      if (book.isPublic !== undefined) setIsPublic(book.isPublic);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    readVibeStore.addToWishlist({
      bookId: book.id,
      priority,
      reason,
      referrer,
      isPublic
    });
    if (onSaved) onSaved();
    onClose();
  };

  const priorityOptions = [
    { key: 'Someday', icon: '🌱', label: 'Someday', desc: 'A future possibility.' },
    { key: 'Soon', icon: '⏰', label: 'Soon', desc: 'In the near future.' },
    { key: 'Next up', icon: '⭐', label: 'Next up', desc: 'One of my top picks.' }
  ];

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(30, 20, 32, 0.65)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 animate__animated animate__fadeInUp position-relative"
        style={{ maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2.5">
            <span style={{ color: '#D96B50', fontSize: '22px' }}>
              <BsBookmarkFill />
            </span>
            <div>
              <h4 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                Add to your wishlist
              </h4>
              <p className="text-muted small mb-0">
                Keep a little space for your next great read.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 text-muted border-0 shadow-none"
            onClick={onClose}
            aria-label="Close"
          >
            <AiOutlineClose size={18} />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="row g-0 flex-grow-1 overflow-y-auto">
          {/* Left Column: Book Overview */}
          <div
            className="col-md-5 p-4 d-flex flex-column justify-content-between border-end"
            style={{ backgroundColor: '#F8F5FA' }}
          >
            <div>
              <div className="text-center mb-3">
                <img
                  src={book.coverUrl || '/assets/books/midnight-library.jpg'}
                  alt={book.title}
                  className="rounded-3 shadow img-fluid"
                  style={{ maxHeight: '220px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/books/midnight-library.jpg';
                  }}
                />
              </div>

              <h5 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                {book.title}
              </h5>
              <div className="text-muted small mb-2">{book.author}</div>

              {/* Mood tags */}
              <div className="d-flex flex-wrap gap-1.5 mb-3">
                <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px' }}>
                  {book.genre || 'Fiction'}
                </span>
                {book.moods?.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className="badge rounded-pill px-2.5 py-1"
                    style={{ backgroundColor: '#E4ECE5', color: '#2C5E3B', fontSize: '11px' }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              <p className="text-muted small" style={{ fontSize: '12px', lineHeight: 1.6 }}>
                {book.description ||
                  'Between life and death there is a library, and within that library are infinite versions of your life... A moving, imaginative novel about choice, regret and what it means to be human.'}
              </p>
            </div>

            {/* Floral decoration at bottom left */}
            <div className="pt-2 opacity-50" style={{ fontSize: '1.6rem' }}>
              🌿🌸
            </div>
          </div>

          {/* Right Column: Preferences Form */}
          <div className="col-md-7 p-4 bg-white d-flex flex-column justify-content-between">
            <form onSubmit={handleSubmit} id="wishlistForm">
              {/* Reading Priority */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-2 d-block">
                  Reading priority
                </label>
                <div className="row g-2">
                  {priorityOptions.map((opt) => {
                    const isSelected = priority === opt.key;
                    return (
                      <div className="col-4" key={opt.key}>
                        <button
                          type="button"
                          onClick={() => setPriority(opt.key)}
                          className="btn w-100 p-2.5 rounded-3 text-start border transition-all h-100 position-relative"
                          style={{
                            borderColor: isSelected ? '#D96B50' : '#EAE2D8',
                            backgroundColor: isSelected ? '#FFF8F6' : '#FFFFFF',
                            boxShadow: isSelected ? '0 0 0 1px #D96B50' : 'none'
                          }}
                        >
                          {isSelected && (
                            <span
                              className="position-absolute top-0 end-0 m-1.5 rounded-circle d-flex align-items-center justify-content-center text-white"
                              style={{ width: '16px', height: '16px', backgroundColor: '#D96B50', fontSize: '10px' }}
                            >
                              <AiOutlineCheck size={10} />
                            </span>
                          )}
                          <div className="d-flex align-items-center gap-1.5 fw-bold small text-dark mb-0.5">
                            <span>{opt.icon}</span>
                            <span style={{ fontSize: '13px' }}>{opt.label}</span>
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px', lineHeight: 1.2 }}>
                            {opt.desc}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Why do you want to read this? */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-dark mb-0">
                    Why do you want to read this?
                  </label>
                  <span className="text-muted" style={{ fontSize: '11px' }}>
                    {reason.length}/300
                  </span>
                </div>
                <textarea
                  className="form-control rounded-3"
                  rows={2}
                  maxLength={300}
                  placeholder="A friend recommended it. Saving this for a quiet weekend."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Recommended by */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1 d-block">
                  Recommended by <span className="text-muted fw-normal">(optional)</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <AiOutlineUser size={15} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 rounded-end-3"
                    placeholder="A friend, a podcast, or your own curiosity..."
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Wishlist Visibility */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1.5 d-block">
                  Wishlist visibility
                </label>
                <div className="d-flex flex-column gap-2">
                  {/* Public Radio */}
                  <label
                    className="d-flex align-items-start gap-2.5 p-2 rounded-3 border"
                    style={{
                      cursor: 'pointer',
                      borderColor: isPublic ? '#D96B50' : '#EAE2D8',
                      backgroundColor: isPublic ? '#FFF9F7' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="radio"
                      name="visibilityRadio"
                      className="form-check-input mt-1"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      style={{ accentColor: '#D96B50' }}
                    />
                    <div>
                      <div className="small fw-bold text-dark">
                        🌐 Public
                      </div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        Show this book and your reason on your public wishlist.
                      </div>
                    </div>
                  </label>

                  {/* Private Radio */}
                  <label
                    className="d-flex align-items-start gap-2.5 p-2 rounded-3 border"
                    style={{
                      cursor: 'pointer',
                      borderColor: !isPublic ? 'var(--rv-ink-plum)' : '#EAE2D8',
                      backgroundColor: !isPublic ? '#F9F6FA' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="radio"
                      name="visibilityRadio"
                      className="form-check-input mt-1"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      style={{ accentColor: 'var(--rv-ink-plum)' }}
                    />
                    <div>
                      <div className="small fw-bold text-dark">
                        🔒 Only me
                      </div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        Keep this wish just for yourself.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="d-flex align-items-center gap-1.5 text-muted mt-2" style={{ fontSize: '11px' }}>
                  <AiOutlineInfoCircle size={13} />
                  <span>You can change these details anytime.</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-top bg-light">
          <div className="d-flex align-items-center gap-1.5 text-muted small fst-italic" style={{ fontSize: '12px' }}>
            <span>🌱</span>
            <span>Ready when the mood is right.</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3.5 py-1.5 fw-semibold"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="wishlistForm"
              className="btn btn-sm text-white rounded-pill px-4 py-1.5 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#D96B50' }}
            >
              <BsBookmarkFill size={13} /> Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
