'use client';

import React from 'react';
import Link from 'next/link';
import { AiOutlineHeart, AiOutlineEye } from 'react-icons/ai';

export default function RecommendationCard({ match, onWishlist, onPreview }) {
  const book = match.book || match;
  const matchPercent = Math.round(match.matchScore ? match.matchScore * 100 : 88);

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 d-flex flex-row gap-3">
      <img
        src={book.image || 'https://via.placeholder.com/100x150'}
        alt={book.title}
        className="rounded-3 shadow-sm"
        style={{ width: '95px', height: '145px', objectFit: 'cover' }}
      />
      <div className="d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="badge rounded-pill bg-success-subtle text-success fw-bold" style={{ fontSize: '11px' }}>
            ⚡ {matchPercent}% Match
          </span>
          <button
            type="button"
            className="btn btn-sm btn-light p-1 rounded-circle"
            onClick={() => onWishlist(book)}
            title="Tambah ke Wishlist"
          >
            <AiOutlineHeart size={18} style={{ color: 'var(--rv-vibe-coral)' }} />
          </button>
        </div>

        <h6 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
          {book.title}
        </h6>
        <small className="text-muted mb-2">{book.author?.name || 'Penulis'}</small>

        <div className="bg-light p-2 rounded-2 mb-2 flex-grow-1">
          <small className="text-muted d-block fst-italic" style={{ fontSize: '11px' }}>
            "{match.explanation || 'Resonansi mood yang selaras dengan suasana hatimu.'}"
          </small>
        </div>

        <div className="d-flex gap-2 mt-auto">
          <Link
            href={`/books/${book.id}`}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            style={{ fontSize: '11px' }}
          >
            Lihat Detail
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-rv-plum rounded-pill px-3"
            onClick={() => onPreview(book)}
            style={{ fontSize: '11px' }}
          >
            Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
