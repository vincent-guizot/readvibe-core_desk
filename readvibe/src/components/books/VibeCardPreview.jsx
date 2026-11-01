'use client';

import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { motion } from 'framer-motion';

export function VibeCardPreview({
  book,
  theme = 'Paper',
  rating = 5,
  moods = [],
  caption = '',
  userName = 'Reader',
  userHandle = 'reader',
  finishedDate = 'Recently',
  showName = true,
  showDate = true,
  interactive = false,
  onRatingChange,
  cardRef,
}) {
  const themeStyles = {
    Paper: {
      background: 'linear-gradient(145deg, #FFF9F2 0%, #F5EDE4 100%)',
      textColor: 'var(--rv-ink-plum)',
      subTextColor: '#756F78',
      pillBg: 'rgba(53, 35, 63, 0.08)',
      pillText: 'var(--rv-ink-plum)',
      starColor: '#EF786B',
      borderColor: 'rgba(53, 35, 63, 0.12)',
      ornamentBg: 'radial-gradient(circle, rgba(239, 120, 107, 0.2) 0%, transparent 70%)',
    },
    Twilight: {
      background: 'linear-gradient(165deg, #2D1B36 0%, #150C1B 100%)',
      textColor: '#FFFFFF',
      subTextColor: 'rgba(255, 255, 255, 0.75)',
      pillBg: 'rgba(255, 255, 255, 0.16)',
      pillText: '#FFFFFF',
      starColor: '#FFB26B',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      ornamentBg: 'radial-gradient(circle, rgba(255, 178, 107, 0.25) 0%, transparent 70%)',
    },
    Botanical: {
      background: 'linear-gradient(150deg, #2C3D32 0%, #17241C 100%)',
      textColor: '#FFFFFF',
      subTextColor: '#B7C9BE',
      pillBg: 'rgba(255, 255, 255, 0.14)',
      pillText: '#E6EFEA',
      starColor: '#FFD3B6',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      ornamentBg: 'radial-gradient(circle, rgba(145, 169, 154, 0.3) 0%, transparent 70%)',
    },
    Sunset: {
      background: 'linear-gradient(150deg, #F97769 0%, #7E294A 100%)',
      textColor: '#FFFFFF',
      subTextColor: 'rgba(255, 255, 255, 0.85)',
      pillBg: 'rgba(255, 255, 255, 0.2)',
      pillText: '#FFFFFF',
      starColor: '#FFE082',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      ornamentBg: 'radial-gradient(circle, rgba(255, 224, 130, 0.35) 0%, transparent 70%)',
    },
  }[theme] || {
    background: 'linear-gradient(145deg, #FFF9F2 0%, #F5EDE4 100%)',
    textColor: 'var(--rv-ink-plum)',
    subTextColor: '#756F78',
    pillBg: 'rgba(53, 35, 63, 0.08)',
    pillText: 'var(--rv-ink-plum)',
    starColor: '#EF786B',
    borderColor: 'rgba(53, 35, 63, 0.12)',
    ornamentBg: 'radial-gradient(circle, rgba(239, 120, 107, 0.2) 0%, transparent 70%)',
  };

  return (
    <div
      ref={cardRef}
      className="rv-vibe-card-9-16 mx-auto position-relative overflow-hidden"
      style={{
        background: themeStyles.background,
        color: themeStyles.textColor,
        borderColor: themeStyles.borderColor,
      }}
    >
      {/* Background Ornament Glow */}
      <div
        className="position-absolute"
        style={{
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: themeStyles.ornamentBg,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div className="text-center pt-1 position-relative" style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <span style={{ fontSize: '1.1rem' }}>📖</span>
          <span
            className="fw-bold text-uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.15em', opacity: 0.85 }}
          >
            ReadVibe Wrapped
          </span>
        </div>
        <h4
          className="fw-bold mb-0 rv-editorial"
          style={{
            fontSize: '1.35rem',
            lineHeight: 1.25,
            color: themeStyles.textColor,
          }}
        >
          A chapter closed.
          <br />
          A feeling kept.
        </h4>
      </div>

      {/* Center Book Cover & Meta */}
      <div className="text-center my-auto py-2 position-relative" style={{ zIndex: 1 }}>
        <div className="d-inline-block position-relative mb-3">
          <img
            src={book?.coverUrl || '/assets/books/midnight-library.jpg'}
            alt={book?.title || 'Book cover'}
            className="rounded-3 shadow-lg object-fit-cover"
            style={{
              width: '125px',
              height: '185px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
            }}
            onError={(e) => {
              e.currentTarget.src = '/assets/books/midnight-library.jpg';
            }}
          />
        </div>

        <h5
          className="fw-bold mb-1 rv-editorial text-truncate px-2"
          style={{ color: themeStyles.textColor, fontSize: '1.25rem' }}
        >
          {book?.title || 'Untitled Book'}
        </h5>
        <p
          className="small mb-2"
          style={{ color: themeStyles.subTextColor, fontSize: '0.85rem' }}
        >
          {book?.author || 'Unknown Author'}
        </p>

        {/* Rating Stars */}
        <div className="d-flex justify-content-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                color: themeStyles.starColor,
                cursor: interactive ? 'pointer' : 'default',
                fontSize: '1.1rem',
              }}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
            >
              {star <= rating ? <AiFillStar /> : <AiOutlineStar />}
            </span>
          ))}
        </div>

        {/* Mood Tags */}
        {moods && moods.length > 0 && (
          <div className="d-flex flex-wrap justify-content-center gap-1 px-3 mb-2">
            {moods.slice(0, 3).map((m, idx) => (
              <span
                key={idx}
                className="badge rounded-pill fw-semibold px-2 py-1"
                style={{
                  backgroundColor: themeStyles.pillBg,
                  color: themeStyles.pillText,
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                }}
              >
                ✦ {m}
              </span>
            ))}
          </div>
        )}

        {/* Caption / Quote */}
        {caption && (
          <p
            className="small fst-italic px-3 mb-0"
            style={{
              color: themeStyles.textColor,
              fontSize: '0.85rem',
              lineHeight: 1.4,
              opacity: 0.9,
            }}
          >
            &ldquo;{caption}&rdquo;
          </p>
        )}
      </div>

      {/* Footer Branding */}
      <div
        className="text-center pt-2 border-top position-relative"
        style={{
          borderColor: themeStyles.borderColor,
          zIndex: 1,
        }}
      >
        {(showName || showDate) && (
          <p
            className="mb-0 fw-semibold"
            style={{ color: themeStyles.subTextColor, fontSize: '11px' }}
          >
            {showName && <span>{userName} (@{userHandle})</span>}
            {showName && showDate && <span> &bull; </span>}
            {showDate && <span>Finished {finishedDate}</span>}
          </p>
        )}
        <small
          style={{
            color: themeStyles.subTextColor,
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.75,
          }}
        >
          readvibe.app
        </small>
      </div>
    </div>
  );
}

export default VibeCardPreview;
