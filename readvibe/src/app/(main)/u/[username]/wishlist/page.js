'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AiOutlineShareAlt,
  AiOutlineCheck,
  AiOutlineUnorderedList,
  AiOutlineAppstore
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { useAuth, useWishlist, useBooks } from '@/hooks';

export default function PublicWishlistPage() {
  const params = useParams();
  const username = params?.username || 'adminreadvibe';

  const { user } = useAuth();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const { books: allBooks } = useBooks();

  const [copiedLink, setCopiedLink] = useState(false);

  const isCurrent = user && (user.username === username || username === 'adminreadvibe');
  const profileName = isCurrent && user?.name ? user.name : (username === 'adminreadvibe' ? 'Admin ReadVibe' : username);
  const profileAvatar = isCurrent && user?.avatar ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

  // Fallback 4 curated public books
  const defaultPublicBooks = [
    {
      id: 'the-comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      coverUrl: '/assets/books/comfort-book.jpg',
      priority: 'High priority',
      priorityBadgeColor: '#FEECE8',
      priorityTextColor: '#D96B50',
      note: 'For slow evenings after a long week.',
      moods: ['Cozy', 'Reflective']
    },
    {
      id: 'morisaki-bookshop',
      title: 'Days at the Morisaki Bookshop',
      author: 'Satoshi Yagisawa',
      coverUrl: '/assets/books/morisaki.jpg',
      priority: 'High priority',
      priorityBadgeColor: '#FEECE8',
      priorityTextColor: '#D96B50',
      note: 'A friend recommended this cozy bookshop story.',
      moods: ['Cozy']
    },
    {
      id: 'cerulean-sea',
      title: 'The House in the Cerulean Sea',
      author: 'TJ Klune',
      coverUrl: '/assets/books/cerulean-sea.jpg',
      priority: 'Medium priority',
      priorityBadgeColor: '#F3EEF7',
      priorityTextColor: '#7A5B87',
      note: 'Saving this for my next fantasy escape.',
      moods: ['Hopeful']
    },
    {
      id: 'the-little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: '/assets/books/little-prince.jpg',
      priority: 'Low priority',
      priorityBadgeColor: '#EBE7E1',
      priorityTextColor: '#666666',
      note: 'A classic I would love to revisit.',
      moods: ['Mindful']
    }
  ];

  const publicBooks = useMemo(() => {
    if (isCurrent && wishlist && wishlist.length > 0) {
      return wishlist.map((w) => {
        const book = allBooks.find((b) => b.id === w.bookId || b.slug === w.bookId) || {
          id: w.bookId,
          title: w.bookId,
          author: 'Unknown Author',
          coverUrl: '/assets/books/midnight-library.jpg',
          moods: ['Cozy']
        };
        const isHigh = w.priority === 'High' || w.priority === 'Next up';
        const isLow = w.priority === 'Low' || w.priority === 'Someday';
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          priority: `${w.priority || 'Medium'} priority`,
          priorityBadgeColor: isHigh ? '#FEECE8' : isLow ? '#EBE7E1' : '#F3EEF7',
          priorityTextColor: isHigh ? '#D96B50' : isLow ? '#666666' : '#7A5B87',
          note: w.reason || 'Saved to reading wishlist.',
          moods: book.moods || ['Cozy']
        };
      });
    }
    return defaultPublicBooks;
  }, [isCurrent, wishlist, allBooks]);

  const handleToggleSave = (bookId) => {
    toggleWishlist(bookId, 'Medium', 'Saved from shared public shelf');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-secondary text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <span className="text-secondary">Readers</span>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/u/${username}`} className="text-secondary text-decoration-none">
              {profileName}
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Wishlist
          </li>
        </ol>
      </nav>

      {/* Header Banner: User profile on left, Artwork on right */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        {/* User metadata & title */}
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <img
              src={profileAvatar}
              alt={profileName}
              className="rounded-circle shadow-sm"
              style={{ width: '56px', height: '56px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent';
              }}
            />
            <div>
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                {profileName}
              </h4>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">@{username}</span>
                <Link
                  href={`/u/${username}`}
                  className="small text-decoration-none fw-semibold"
                  style={{ color: '#D96B50', fontSize: '13px' }}
                >
                  View profile →
                </Link>
              </div>
            </div>
          </div>

          <h1
            className="display-5 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            A few books on my someday shelf.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '1.05rem' }}>
            Explore the stories {profileName} is looking forward to reading.
          </p>
        </div>

        {/* Right header: Public badge, share button, and book artwork */}
        <div className="d-flex align-items-center gap-4 flex-shrink-0">
          <div className="d-none d-xl-block">
            <img
              src="/assets/illustrations/book-stack1.png"
              alt="Books illustration"
              style={{ maxHeight: '115px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/illustrations/book-stack-with-flower-vase.png';
              }}
            />
          </div>

          <div className="d-flex flex-column align-items-end gap-2">
            <span
              className="badge rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#EBF4ED', color: '#2B5E3B', fontSize: '12px' }}
            >
              🌐 Public wishlist
            </span>

            <button
              type="button"
              onClick={handleShare}
              className="btn btn-sm btn-white border rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)' }}
            >
              <AiOutlineShareAlt size={15} /> {copiedLink ? 'Link copied!' : 'Share wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="row g-4">
        {/* ================= LEFT COLUMN: BOOKS TO DISCOVER ================= */}
        <div className="col-lg-8">
          {/* Controls Bar */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
            <h5
              className="fw-bold mb-0"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              {publicBooks.length} books to discover
            </h5>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-2.5 py-1 text-muted fw-semibold small shadow-sm"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                All priorities ▾
              </button>
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-2.5 py-1 text-muted fw-semibold small shadow-sm"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                Priority first ▾
              </button>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-rv-plum text-white px-2 py-1"
                  title="List view"
                >
                  <AiOutlineUnorderedList size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-white border text-muted px-2 py-1"
                  style={{ backgroundColor: '#FFFFFF' }}
                  title="Grid view"
                >
                  <AiOutlineAppstore size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Book Cards List */}
          <div className="d-flex flex-column gap-3 mb-4">
            {publicBooks.map((item) => {
              const isSaved = isWishlisted(item.id);
              return (
                <div
                  key={item.id}
                  className="card border-0 rounded-4 shadow-sm p-4 bg-white position-relative"
                  style={{ border: '1px solid #ECE4DA' }}
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

                    {/* Book Metadata & Reader's note */}
                    <div className="col">
                      <Link href={`/books/${item.id}`} className="text-decoration-none">
                        <h5
                          className="fw-bold mb-0"
                          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                        >
                          {item.title}
                        </h5>
                      </Link>
                      <div className="text-muted small mb-2">by {item.author}</div>

                      <div className="mb-2">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold"
                          style={{
                            backgroundColor: item.priorityBadgeColor,
                            color: item.priorityTextColor,
                            fontSize: '11px'
                          }}
                        >
                          ! {item.priority}
                        </span>
                      </div>

                      {/* Reader's note */}
                      <div className="mb-2">
                        <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                          Reader&apos;s note
                        </span>
                        <div className="text-secondary small" style={{ fontSize: '13px' }}>
                          {item.note}
                        </div>
                      </div>

                      {/* Mood tags */}
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Mood</span>
                        {item.moods.map((m) => (
                          <span
                            key={m}
                            className="badge rounded-pill px-2.5 py-0.5"
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
                    </div>

                    {/* Save to Wishlist & View Action */}
                    <div className="col-12 col-md-auto d-flex flex-column align-items-md-end justify-content-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSave(item.id)}
                        className={`btn btn-sm rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 ${
                          isSaved
                            ? 'btn-success text-white shadow-sm'
                            : 'btn-white border text-dark shadow-sm'
                        }`}
                        style={{
                          backgroundColor: isSaved ? '#5C826A' : '#FFFFFF',
                          borderColor: isSaved ? '#5C826A' : '#E0D8CE',
                          fontSize: '13px'
                        }}
                      >
                        {isSaved ? <AiOutlineCheck size={14} /> : <BsBookmark size={13} />}
                        <span>{isSaved ? 'Saved to my wishlist' : 'Save to my wishlist'}</span>
                      </button>

                      <Link
                        href={`/books/${item.id}`}
                        className="small text-muted text-decoration-none fw-semibold"
                        style={{ fontSize: '12px' }}
                      >
                        View book details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <span className="text-muted small" style={{ fontSize: '13px' }}>
              Showing {publicBooks.length} of {publicBooks.length} books
            </span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SIDEBAR WIDGETS ================= */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: About this list */}
            <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
              <h6
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                About this list
              </h6>
              <div className="d-flex flex-column gap-3 small">
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '18px' }}>📖</span>
                  <div>
                    <span className="fw-bold text-dark me-1">{publicBooks.length}</span>
                    <span className="text-muted">curated titles</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '18px' }}>🚩</span>
                  <div>
                    <span className="fw-bold text-dark me-1">
                      {publicBooks.filter((b) => b.priority?.toLowerCase().includes('high')).length}
                    </span>
                    <span className="text-muted">high priority picks</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '18px' }}>✨</span>
                  <div>
                    <span className="fw-bold text-dark me-1">
                      {new Set(publicBooks.flatMap((b) => b.moods || [])).size}
                    </span>
                    <span className="text-muted">reading vibes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Start your own list */}
            <div
              className="card border-0 rounded-4 shadow-sm p-4 position-relative overflow-hidden"
              style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
            >
              <div className="position-absolute top-0 end-0 p-3 opacity-25" style={{ fontSize: '3rem' }}>
                🌿
              </div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Build your own wishlist
              </h5>
              <p className="text-muted small mb-3">
                Save the books that speak to you and keep your next chapters within reach.
              </p>
              <Link
                href="/wishlist"
                className="btn btn-sm btn-rv-plum text-white rounded-3 px-3 py-2 fw-semibold shadow-sm text-center"
                style={{ width: 'fit-content' }}
              >
                Go to my wishlist →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
