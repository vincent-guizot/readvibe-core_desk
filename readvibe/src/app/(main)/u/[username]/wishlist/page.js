'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AiOutlineShareAlt,
  AiOutlineCheck,
  AiOutlineUnorderedList,
  AiOutlineAppstore
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '@/lib/store';

export default function PublicWishlistPage() {
  const params = useParams();
  const username = params?.username || 'adminreadvibe';

  const [savedBookIds, setSavedBookIds] = useState(['morisaki-bookshop']);
  const [copiedLink, setCopiedLink] = useState(false);

  // Exact 4 books from public wishlist.png
  const publicBooks = [
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
      author: 'Antoine de Saint-Exupery',
      coverUrl: '/assets/books/little-prince.jpg',
      priority: 'Low priority',
      priorityBadgeColor: '#EBE7E1',
      priorityTextColor: '#666666',
      note: 'A classic I would love to revisit.',
      moods: ['Mindful']
    }
  ];

  const toggleSaveWishlist = (id) => {
    if (savedBookIds.includes(id)) {
      setSavedBookIds(savedBookIds.filter((bId) => bId !== id));
    } else {
      setSavedBookIds([...savedBookIds, id]);
    }
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
              Admin ReadVibe
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
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Admin ReadVibe"
              className="rounded-circle shadow-sm"
              style={{ width: '56px', height: '56px', objectFit: 'cover' }}
            />
            <div>
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                Admin ReadVibe
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
            Explore the stories Admin ReadVibe is looking forward to reading.
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
        {/* ================= LEFT COLUMN: 18 BOOKS TO DISCOVER ================= */}
        <div className="col-lg-8">
          {/* Controls Bar */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
            <h5
              className="fw-bold mb-0"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              18 books to discover
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
              const isSaved = savedBookIds.includes(item.id);
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
                        onClick={() => toggleSaveWishlist(item.id)}
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
                        className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: '#D96B50', fontSize: '13px' }}
                      >
                        View book →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination */}
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
          {/* Widget 1: A shared shelf, a little inspiration */}
          <div
            className="card border-0 rounded-4 shadow-sm p-4 mb-4 position-relative overflow-hidden text-center"
            style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
          >
            <h5
              className="fw-bold mb-2 text-start"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.25 }}
            >
              A shared shelf,
              <br />
              a little inspiration.
            </h5>
            <p className="text-muted small mb-3 text-start" style={{ fontSize: '13px' }}>
              Find something you love? Save it to your own reading list.
            </p>

            <img
              src="/assets/illustrations/book-stack-with-flower-vase.png"
              alt="Book stack"
              className="img-fluid mx-auto my-2"
              style={{ maxHeight: '140px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/illustrations/books.png';
              }}
            />

            <div className="text-start mt-2">
              <Link
                href="/discover"
                className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                Explore more books →
              </Link>
            </div>
          </div>

          {/* Widget 2: Wishlist moods */}
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
            <h6
              className="fw-bold mb-1"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              Wishlist moods
            </h6>
            <p className="text-muted small mb-3" style={{ fontSize: '12px' }}>
              The feelings behind these reads.
            </p>
            <div className="d-flex flex-wrap gap-2">
              {['Cozy', 'Reflective', 'Hopeful', 'Mindful'].map((m) => (
                <span
                  key={m}
                  className="badge rounded-pill px-3 py-1.5"
                  style={{
                    backgroundColor: m === 'Cozy' ? '#FEECE8' : m === 'Reflective' ? '#F3EEF7' : m === 'Hopeful' ? '#EBF4ED' : '#EAF2F2',
                    color: m === 'Cozy' ? '#D96B50' : m === 'Reflective' ? 'var(--rv-ink-plum)' : '#2B5E3B',
                    fontSize: '12px'
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Widget 3: Shared by choice */}
          <div
            className="card border-0 rounded-4 shadow-sm p-4 position-relative overflow-hidden"
            style={{ backgroundColor: '#EBF2EC', borderColor: '#D7E5D9' }}
          >
            <div className="position-absolute bottom-0 end-0 p-3 opacity-30" style={{ fontSize: '3.5rem' }}>
              🍃
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: '20px' }}>🌐</span>
              <h5
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Shared by choice
              </h5>
            </div>
            <p className="text-muted small mb-0" style={{ maxWidth: '240px' }}>
              Only books and notes made public by this reader appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
