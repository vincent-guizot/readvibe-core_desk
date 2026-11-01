'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiFillStar, AiOutlineBook } from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '../../lib/store';
import AddToWishlistModal from './AddToWishlistModal';

export default function BookCard({ book, onWishlistChange }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  useEffect(() => {
    setInWishlist(readVibeStore.isInWishlist(book.id));
  }, [book.id]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      readVibeStore.removeFromWishlist(book.id);
      setInWishlist(false);
      if (onWishlistChange) onWishlistChange();
    } else {
      setIsWishlistModalOpen(true);
    }
  };

  return (
    <>
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden rv-card bg-white position-relative">
        {/* Wishlist toggle bookmark ribbon button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="btn btn-sm rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm border-0 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: inWishlist ? '#FFEBE6' : 'rgba(255, 255, 255, 0.92)',
            color: inWishlist ? '#D96B50' : '#8C827A',
            zIndex: 10,
            width: '34px',
            height: '34px',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease'
          }}
          title={inWishlist ? 'In your Wishlist (Click to remove)' : 'Bookmark to Wishlist'}
        >
          {inWishlist ? <BsBookmarkFill size={16} style={{ color: '#D96B50' }} /> : <BsBookmark size={16} />}
        </button>

        {/* Book Cover Link */}
        <Link href={`/books/${book.id}`} className="text-decoration-none">
          <div
            className="p-3 text-center position-relative d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#FAF7F2', minHeight: '230px' }}
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="rounded-3 shadow"
              style={{
                width: '125px',
                height: '185px',
                objectFit: 'cover',
                transition: 'transform 0.25s ease'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
              }}
            />
          </div>
        </Link>

        {/* Book Info */}
        <div className="card-body p-3 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="badge rounded-pill px-2 py-0.5 text-truncate" style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px', maxWidth: '120px' }}>
              {book.genre}
            </span>
            <div className="d-flex align-items-center gap-1 small fw-bold" style={{ color: '#E27D60' }}>
              <AiFillStar size={14} />
              <span>{book.rating}</span>
            </div>
          </div>

          <Link href={`/books/${book.id}`} className="text-decoration-none">
            <h6
              className="fw-bold mb-0 text-truncate"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', fontSize: '1.05rem' }}
              title={book.title}
            >
              {book.title}
            </h6>
          </Link>
          <small className="text-muted mb-2 text-truncate">{book.author}</small>

          {/* Mood Tags */}
          <div className="d-flex flex-wrap gap-1 mb-3">
            {book.moods?.slice(0, 2).map((m) => (
              <span
                key={m}
                className="badge rounded-pill fw-semibold"
                style={{ backgroundColor: '#FAF7F2', color: '#756F78', border: '1px solid #EADFD5', fontSize: '10px' }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {book.pages} pages
            </small>
            <Link
              href={`/books/${book.id}`}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold"
              style={{ fontSize: '12px' }}
            >
              View vibe
            </Link>
          </div>
        </div>
      </div>

      <AddToWishlistModal
        book={book}
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSaved={() => {
          setInWishlist(true);
          if (onWishlistChange) onWishlistChange();
        }}
      />
    </>
  );
}
