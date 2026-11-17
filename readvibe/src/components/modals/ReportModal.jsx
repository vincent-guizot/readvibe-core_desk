'use client';

import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineLock, AiOutlineFlag } from 'react-icons/ai';

export default function ReportModal({ isOpen, onClose, targetTitle = 'The Midnight Library', reviewSnippet = 'I did not expect the final chapter to unfold this way...', reviewerName = 'Alex L.' }) {
  const [reason, setReason] = useState('Unmarked spoilers');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'Unmarked spoilers',
    'Spam or advertising',
    'Harassment or hateful content',
    'Inappropriate content',
    'Something else'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: 'rgba(43, 19, 44, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 position-relative animate__animated animate__fadeInUp"
        style={{ maxWidth: '540px' }}
      >
        {/* Close button */}
        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle p-2 text-muted position-absolute top-0 end-0 m-3 border-0"
          onClick={onClose}
        >
          <AiOutlineClose size={18} />
        </button>

        {submitted ? (
          <div className="p-5 text-center">
            <div className="mb-3 text-success fs-1">✓</div>
            <h5 className="fw-bold mb-2" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
              Thank you for your report
            </h5>
            <p className="text-muted small mb-0">
              Our moderation team will review this review shortly to keep ReadVibe thoughtful and welcoming.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 p-md-5">
            {/* Header Icon */}
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '48px', height: '48px', backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }}
            >
              <AiOutlineFlag size={22} />
            </div>

            <h3 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
              Report content
            </h3>
            <p className="text-muted small mb-4">
              Help keep ReadVibe thoughtful and welcoming.
            </p>

            {/* Quoted review box */}
            <div className="p-3 rounded-4 mb-4" style={{ backgroundColor: '#FAF7F2', border: '1px solid #EADFD5' }}>
              <small className="text-muted d-block mb-2" style={{ fontSize: '11px' }}>
                Review you&apos;re reporting
              </small>
              <div className="d-flex align-items-start gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: '32px', height: '32px', backgroundColor: '#E4DAEC', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                >
                  {reviewerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="fw-bold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                    {reviewerName}
                  </p>
                  <small className="text-muted fst-italic d-block mb-1" style={{ fontSize: '11px' }}>
                    Review of {targetTitle}
                  </small>
                  <p className="small text-muted mb-0" style={{ fontSize: '12px' }}>
                    &ldquo;{reviewSnippet}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Radio options */}
            <label className="form-label small fw-bold text-dark mb-2">
              Why are you reporting this review?
            </label>
            <div className="d-flex flex-column gap-2 mb-4">
              {reasons.map((r) => {
                const isSelected = reason === r;
                return (
                  <label
                    key={r}
                    htmlFor={`report-${r}`}
                    className="p-2.5 px-3 rounded-3 d-flex align-items-center gap-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? '#FFF7F5' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #D96B50' : '1px solid #EADFD5',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      id={`report-${r}`}
                      checked={isSelected}
                      onChange={() => setReason(r)}
                      style={{ accentColor: '#D96B50', width: '16px', height: '16px' }}
                    />
                    <span className="small text-dark fw-medium">{r}</span>
                  </label>
                );
              })}
            </div>

            {/* Additional details */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark mb-1">
                Additional details (optional)
              </label>
              <div className="position-relative">
                <textarea
                  className="form-control rounded-3"
                  rows={3}
                  placeholder="Tell us a little more about the issue..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <span className="position-absolute bottom-0 end-0 p-2 text-muted" style={{ fontSize: '11px' }}>
                  {details.length}/500
                </span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="d-flex align-items-center gap-1.5 text-muted small mb-4" style={{ fontSize: '12px' }}>
              <AiOutlineLock size={14} /> Your report is private. The author won&apos;t see who submitted it.
            </div>

            {/* Footer */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pt-3 border-top">
              <small className="text-muted" style={{ fontSize: '11px' }}>
                Our moderation team will review the content.
              </small>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5"
                  onClick={onClose}
                  style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm rounded-pill px-3 py-1.5 text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                  style={{ backgroundColor: '#D96B50' }}
                >
                  <AiOutlineFlag size={14} /> Submit report
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}