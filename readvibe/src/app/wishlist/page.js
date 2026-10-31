'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiOutlineBook,
  AiOutlineEdit,
  AiOutlineEllipsis,
  AiOutlineShareAlt,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineLink
} from 'react-icons/ai';
import { BsBookmarks, BsBookmark } from 'react-icons/bs';
import { readVibeStore } from '../../lib/store';
import AddToWishlistModal from '../../components/AddToWishlistModal';

export default function WishlistPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState(null);

  // Exact 4 initial books from wishlist.png
  const wishlistItems = [
    {
      id: 'the-comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      coverUrl: '/assets/books/comfort-book.jpg',
      moods: ['Cozy', 'Uplifting', 'Thoughtful'],
      priority: 'High',
      priorityColor: '#FDF0ED',
      priorityTextColor: '#D96B50',
      reason: 'For slow evenings after a long week.',
      dateAdded: '12 Jan 2025'
    },
    {
      id: 'morisaki-bookshop',
      title: 'Days at the Morisaki Bookshop',
      author: 'Satoshi Yagisawa',
      coverUrl: '/assets/books/morisaki.jpg',
      moods: ['Reflective', 'Cozy', 'Everyday Life'],
      priority: 'High',
      priorityColor: '#FDF0ED',
      priorityTextColor: '#D96B50',
      reason: 'A friend recommended this cozy bookshop story.',
      dateAdded: '3 Jan 2025'
    },
    {
      id: 'cerulean-sea',
      title: 'The House in the Cerulean Sea',
      author: 'TJ Klune',
      coverUrl: '/assets/books/cerulean-sea.jpg',
      moods: ['Hopeful', 'Fantasy', 'Heartwarming'],
      priority: 'Medium',
      priorityColor: '#F3EEF7',
      priorityTextColor: '#7A5B87',
      reason: 'Saving this for my next fantasy escape.',
      dateAdded: '28 Dec 2024'
    },
    {
      id: 'the-little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: '/assets/books/little-prince.jpg',
      moods: ['Mindful', 'Classic', 'Philosophical'],
      priority: 'Low',
      priorityColor: '#EAE6DF',
      priorityTextColor: '#666666',
      reason: 'A classic I would love to revisit.',
      dateAdded: '14 Dec 2024'
    }
  ];

  const handleStartReading = (bookId) => {
    readVibeStore.startReadingBook(bookId);
    router.push(`/reader/${bookId}`);
  };

  const filteredItems = wishlistItems.filter((item) => {
    if (activeTab === 'High') return item.priority === 'High';
    if (activeTab === 'Recent') return true;
    return true;
  });

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-secondary text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Wishlist
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        <div>
          <h1
            className="display-5 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            Stories you cannot wait to meet.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '1.05rem' }}>
            Keep your next chapters close, with a little reason for each.
          </p>
        </div>

        {/* Header Right: Artwork & Sharing Controls */}
        <div className="d-flex align-items-center gap-4 flex-shrink-0">
          <div className="d-none d-xl-block">
            <img
              src="/assets/illustrations/book-stack1.png"
              alt="Books illustration"
              style={{ maxHeight: '110px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/illustrations/book-stack-with-flower-vase.png';
              }}
            />
          </div>

          <div className="d-flex flex-column align-items-end gap-1">
            <div className="d-flex align-items-center gap-2">
              {/* Privacy Dropdown button */}
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)' }}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <AiOutlineEye size={15} /> : <AiOutlineLock size={15} />}
                <span>{isPrivate ? 'Private ▾' : 'Public ▾'}</span>
              </button>

              {/* Share Wishlist button */}
              <Link
                href="/u/adminreadvibe/wishlist"
                className={`btn btn-sm rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 ${
                  isPrivate ? 'btn-light text-muted border opacity-75' : 'btn-rv-plum text-white shadow-sm'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <AiOutlineShareAlt size={15} /> Share wishlist
              </Link>
            </div>
            {isPrivate && (
              <span className="text-muted small" style={{ fontSize: '11px' }}>
                Set to public to enable sharing.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Sort Bar */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between border-bottom pb-2 mb-4 gap-3">
        <div className="d-flex align-items-center gap-4">
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
              activeTab === 'All' ? 'fw-bold' : 'text-muted'
            }`}
            style={{
              color: activeTab === 'All' ? 'var(--rv-ink-plum)' : '#6C757D',
              borderBottom: activeTab === 'All' ? '2.5px solid #D96B50' : 'none'
            }}
            onClick={() => setActiveTab('All')}
          >
            All books (18)
          </button>
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
              activeTab === 'High' ? 'fw-bold' : 'text-muted'
            }`}
            style={{
              color: activeTab === 'High' ? 'var(--rv-ink-plum)' : '#6C757D',
              borderBottom: activeTab === 'High' ? '2.5px solid #D96B50' : 'none'
            }}
            onClick={() => setActiveTab('High')}
          >
            High priority (5)
          </button>
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
              activeTab === 'Recent' ? 'fw-bold' : 'text-muted'
            }`}
            style={{
              color: activeTab === 'Recent' ? 'var(--rv-ink-plum)' : '#6C757D',
              borderBottom: activeTab === 'Recent' ? '2.5px solid #D96B50' : 'none'
            }}
            onClick={() => setActiveTab('Recent')}
          >
            Recently added
          </button>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-3 px-3 py-1 text-muted fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <span>Priority first ▾</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Book Rows (col-lg-8) & Right Sidebars (col-lg-4) */}
      <div className="row g-4">
        {/* ================= LEFT COLUMN: BOOK CARDS ================= */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3 mb-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card border-0 rounded-4 shadow-sm p-4 bg-white position-relative"
                style={{
                  border: '1px solid #ECE4DA',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                <div className="row g-3 align-items-center">
                  {/* Book Cover */}
                  <div className="col-auto">
                    <Link href={`/books/${item.id}`}>
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="rounded-3 shadow-sm"
                        style={{ width: '82px', height: '120px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/books/midnight-library.jpg';
                        }}
                      />
                    </Link>
                  </div>

                  {/* Book Metadata & Reason */}
                  <div className="col">
                    <Link href={`/books/${item.id}`} className="text-decoration-none">
                      <h5
                        className="fw-bold mb-0"
                        style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                      >
                        {item.title}
                      </h5>
                    </Link>
                    <div className="text-muted small mb-2">{item.author}</div>

                    {/* Mood pills */}
                    <div className="d-flex flex-wrap gap-1.5 mb-3">
                      {item.moods.map((m) => (
                        <span
                          key={m}
                          className="badge rounded-pill px-2.5 py-1"
                          style={{
                            backgroundColor: '#F3EEF7',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Why I want to read it */}
                    <div>
                      <span
                        className="small fw-bold d-block text-uppercase text-muted"
                        style={{ fontSize: '10px', letterSpacing: '0.05em' }}
                      >
                        WHY I WANT TO READ IT
                      </span>
                      <p className="text-secondary small mb-1" style={{ fontSize: '13px' }}>
                        {item.reason}
                      </p>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        Added {item.dateAdded}
                      </span>
                    </div>
                  </div>

                  {/* Priority Badge & Action Buttons */}
                  <div className="col-12 col-md-auto d-flex flex-column align-items-md-end justify-content-between gap-2">
                    {/* Priority Badge & Ellipsis */}
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge rounded-pill px-3 py-1 fw-semibold"
                        style={{
                          backgroundColor: item.priorityColor,
                          color: item.priorityTextColor,
                          fontSize: '11px'
                        }}
                      >
                        🚩 {item.priority} priority
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-1 text-muted border-0 shadow-none"
                      >
                        <AiOutlineEllipsis size={18} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex flex-column gap-2 w-100" style={{ minWidth: '130px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartReading(item.id)}
                        className="btn btn-sm btn-rv-plum rounded-3 py-1.5 fw-bold shadow-sm"
                        style={{ fontSize: '13px' }}
                      >
                        Start reading
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBookForEdit(item)}
                        className="btn btn-sm btn-white border rounded-3 py-1.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)', fontSize: '13px' }}
                      >
                        <AiOutlineEdit size={13} /> Edit note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pagination Info & Button */}
          <div className="d-flex flex-column align-items-center gap-2 pt-2">
            <span className="text-muted small" style={{ fontSize: '13px' }}>
              Showing 4 of 18 books
            </span>
            <button
              type="button"
              className="btn btn-sm btn-white border rounded-pill px-4 py-2 fw-semibold text-muted shadow-sm"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              Load more books ▾
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SIDEBAR WIDGETS ================= */}
        <div className="col-lg-4">
          {/* Widget 1: Your Next Read */}
          <div
            className="card border-0 rounded-4 shadow-sm p-4 mb-4 position-relative overflow-hidden"
            style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
          >
            <div className="position-absolute top-0 end-0 p-3 opacity-25" style={{ fontSize: '3rem' }}>
              🌿
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: '24px' }}>📖</span>
              <h5
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your next read
              </h5>
            </div>
            <p className="text-muted small mb-3">
              Start with something that fits today.
            </p>
            <Link
              href="/vibe-matcher"
              className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
              style={{ color: '#D96B50' }}
            >
              Find my vibe →
            </Link>
          </div>

          {/* Widget 2: Wishlist at a glance */}
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
            <h6
              className="fw-bold mb-3"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              Wishlist at a glance
            </h6>
            <div className="d-flex flex-column gap-3 small">
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '18px' }}>📖</span>
                <div>
                  <span className="fw-bold text-dark me-1">18</span>
                  <span className="text-muted">saved books</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '18px' }}>🚩</span>
                <div>
                  <span className="fw-bold text-dark me-1">5</span>
                  <span className="text-muted">high priority</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '18px' }}>🍃</span>
                <div>
                  <span className="fw-bold text-dark me-1">4</span>
                  <span className="text-muted">moods to explore</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Made for sharing */}
          <div
            className="card border-0 rounded-4 shadow-sm p-4 position-relative overflow-hidden"
            style={{ backgroundColor: '#EBF2EC', borderColor: '#D7E5D9' }}
          >
            <div className="position-absolute bottom-0 end-0 p-3 opacity-30" style={{ fontSize: '3.5rem' }}>
              🍃
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: '20px' }}>🔗</span>
              <h5
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Made for sharing
              </h5>
            </div>
            <p className="text-muted small mb-3">
              Let friends discover the books on your list. You choose when to make it public.
            </p>
            <Link
              href="/settings"
              className="btn btn-sm btn-white border rounded-3 px-3 py-1.5 fw-semibold shadow-sm d-inline-block text-center"
              style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)', width: 'fit-content' }}
            >
              Manage visibility
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Wishlist Modal */}
      {selectedBookForEdit && (
        <AddToWishlistModal
          book={selectedBookForEdit}
          isOpen={true}
          onClose={() => setSelectedBookForEdit(null)}
          onSaved={() => setSelectedBookForEdit(null)}
        />
      )}
    </div>
  );
}
