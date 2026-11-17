'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineBook,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineArrowRight,
  AiOutlineCheck,
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill, BsStars } from 'react-icons/bs';
import { useBooks, useWishlist, useReading } from '@/hooks';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import WriteReviewModal from '@/components/WriteReviewModal';
import ReportModal from '@/components/ReportModal';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookIdentifier = params?.slug || params?.id || 'midnight-library';

  const { books, getBookById } = useBooks();
  const { isInWishlist, removeWishlist } = useWishlist();
  const { getBookProgress, isBookFinished, startBook } = useReading();

  // Find book from Redux
  const book = useMemo(() => {
    return (
      getBookById(bookIdentifier) ||
      books.find((b) => b.id === bookIdentifier || b.slug === bookIdentifier) ||
      books[0]
    );
  }, [bookIdentifier, books, getBookById]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic reading status
  const inWishlist = book ? isInWishlist(book.id) : false;
  const readingProgress = book ? getBookProgress(book.id) : null;
  const isFinished = book ? isBookFinished(book.id) : false;

  // Handle Start / Continue reading
  const handleStartOrContinueReading = () => {
    if (!book) return;
    if (!readingProgress && !isFinished) {
      startBook(book.id, book.pages || 300);
    }
    router.push(`/reader/${book.id}`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Dynamic Related Books sharing same mood or genre
  const relatedBooks = useMemo(() => {
    if (!book) return [];
    const sameMoodOrGenre = books.filter((b) => {
      if (b.id === book.id) return false;
      const sharesMood = b.moods?.some((m) => book.moods?.includes(m));
      const sharesGenre = b.genre?.toLowerCase() === book.genre?.toLowerCase();
      return sharesMood || sharesGenre;
    });
    return (sameMoodOrGenre.length > 0 ? sameMoodOrGenre : books.filter((b) => b.id !== book.id)).slice(0, 3);
  }, [book, books]);

  if (!book) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
          Loading book details...
        </h4>
      </div>
    );
  }

  const reviews = [
    {
      id: 1,
      author: 'Emily Chen',
      rating: 4.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
      comment:
        'A beautiful, thought-provoking read. It gently reminds you to be kinder to yourself and to see the possibilities in everyday moments.',
    },
    {
      id: 2,
      author: 'Daniel Park',
      rating: 4.5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      comment:
        'Imaginative and deeply human. This book stayed with me long after I finished it, and gave me a fresher perspective on my own choices.',
    },
  ];

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-secondary text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/search" className="text-secondary text-decoration-none">
              Discover
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted text-truncate" style={{ maxWidth: '240px' }} aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

      {/* Share Toast Feedback */}
      {copiedLink && (
        <div
          className="alert alert-success border-0 rounded-4 px-3 py-2 small shadow-sm d-flex align-items-center gap-2 mb-3"
          style={{ backgroundColor: '#EBF5EE', color: '#315438' }}
        >
          <AiOutlineCheck size={16} /> Link copied to clipboard! Share it with your fellow readers.
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="row g-4 mb-5">
        {/* ================= LEFT COLUMN: COVER & ACTIONS ================= */}
        <div className="col-lg-3 text-center text-lg-start">
          <div className="position-sticky" style={{ top: '90px' }}>
            <div className="mb-3 text-center">
              <img
                src={book.coverUrl || '/assets/books/midnight-library.jpg'}
                alt={book.title}
                className="rounded-3 shadow-lg img-fluid"
                style={{
                  maxHeight: '380px',
                  objectFit: 'cover',
                  boxShadow: '0 14px 28px rgba(43, 19, 44, 0.14)',
                }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/books/midnight-library.jpg';
                }}
              />
            </div>

            {/* Read Preview & Share Row */}
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Link
                href={`/reader/${book.id}`}
                className="btn btn-sm btn-white border rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm flex-grow-1 justify-content-center"
                style={{ color: 'var(--rv-ink-plum)', backgroundColor: '#FFFFFF' }}
              >
                <AiOutlineBook size={16} /> Read a preview
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-circle p-2 text-muted shadow-sm"
                onClick={handleShare}
                title={copiedLink ? 'Link copied!' : 'Share book'}
              >
                <AiOutlineShareAlt size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN: DETAILS, SYNOPSIS & REVIEWS ================= */}
        <div className="col-lg-6">
          {/* Category Tag */}
          <span
            className="small fw-bold d-block text-uppercase mb-1"
            style={{ color: '#D96B50', letterSpacing: '0.1em', fontSize: '12px' }}
          >
            {book.genre || 'CONTEMPORARY FICTION'}
          </span>

          {/* Book Title & Author */}
          <h1
            className="display-6 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
          >
            {book.title}
          </h1>
          <p className="text-muted small mb-3" style={{ fontSize: '1rem' }}>
            by <span className="text-dark fw-semibold">{book.author}</span>
          </p>

          {/* Rating & Review Count */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="d-flex text-warning gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <AiFillStar
                  key={star}
                  size={16}
                  style={{ color: star <= Math.round(book.rating || 4.5) ? '#E27D60' : '#E8DED8' }}
                />
              ))}
            </div>
            <span className="small fw-bold text-dark">{Number(book.rating || 4.5).toFixed(1)}</span>
            <span className="text-muted small">·</span>
            <span className="text-muted small">{book.reviewsCount || 1248} reader reviews</span>
          </div>

          {/* Mood Pills */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {(book.moods || ['Cozy', 'Reflective']).map((m) => (
              <span
                key={m}
                className="badge rounded-pill px-3 py-1.5 fw-normal"
                style={{
                  backgroundColor: '#F4EFF7',
                  color: 'var(--rv-ink-plum)',
                  fontSize: '12px',
                  border: '1px solid #E6DCED',
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Description Paragraphs */}
          <div className="text-secondary small mb-4" style={{ fontSize: '14px', lineHeight: 1.7 }}>
            <p className="mb-2">
              {book.synopsis ||
                'A moving and imaginative story about regret, possibility, and the quiet power of second chances.'}
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="d-flex flex-wrap align-items-center gap-2.5 mb-4">
            {isFinished ? (
              <Link
                href={`/finished-reads/edit-review?bookId=${book.id}`}
                className="btn btn-sm rounded-3 px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: '#E0EAE1', color: '#2B5E3B' }}
              >
                <AiOutlineCheck size={18} /> Finished · Edit review
              </Link>
            ) : readingProgress ? (
              <button
                type="button"
                onClick={handleStartOrContinueReading}
                className="btn btn-rv-plum rounded-3 px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              >
                <AiOutlineBook size={18} /> Continue reading (p. {readingProgress.currentPage || 1})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartOrContinueReading}
                className="btn btn-rv-plum rounded-3 px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              >
                <AiOutlineBook size={18} /> Start reading
              </button>
            )}

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => {
                if (inWishlist) {
                  removeWishlist(book.id);
                } else {
                  setIsWishlistModalOpen(true);
                }
              }}
              className="btn rounded-3 px-4 py-2.5 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm transition-all"
              style={
                inWishlist
                  ? { backgroundColor: '#D96B50', borderColor: '#D96B50', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)', borderColor: '#E0D8CE' }
              }
            >
              {inWishlist ? (
                <>
                  <BsBookmarkFill size={16} style={{ color: '#FFFFFF' }} /> In wishlist
                </>
              ) : (
                <>
                  <BsBookmark size={16} /> Add to wishlist
                </>
              )}
            </button>

            {/* Vibe Card Shortcut */}
            <Link
              href={`/vibe-card?bookId=${book.id}`}
              className="btn btn-white border rounded-3 px-3 py-2.5 text-muted shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0D8CE', color: 'var(--rv-ink-plum)' }}
              title="Generate Vibe Card"
            >
              <BsStars size={16} style={{ color: '#D96B50' }} /> Vibe Card
            </Link>
          </div>

          {/* Quick Meta Inline */}
          <div
            className="d-flex flex-wrap align-items-center gap-3 text-muted small py-2.5 border-top border-bottom mb-4"
            style={{ fontSize: '13px' }}
          >
            <div className="d-flex align-items-center gap-1.5">
              <span>📄</span>
              <span>{book.pages || 304} pages</span>
            </div>
            <span>&bull;</span>
            <div className="d-flex align-items-center gap-1.5">
              <span>🌐</span>
              <span>{book.language || 'English'}</span>
            </div>
            <span>&bull;</span>
            <div className="d-flex align-items-center gap-1.5">
              <span>📅</span>
              <span>{book.year || 2021}</span>
            </div>
            <span>&bull;</span>
            <div className="d-flex align-items-center gap-1.5">
              <span>🏷️</span>
              <span>{book.genre || 'Fiction'}</span>
            </div>
          </div>

          {/* Editorial Banner */}
          {book.editorialNote && (
            <div
              className="p-3 rounded-4 mb-4 d-flex align-items-center gap-2.5"
              style={{ backgroundColor: '#EBF4ED', color: '#2B5E3B' }}
            >
              <span style={{ fontSize: '18px' }}>🌱</span>
              <span className="small fw-semibold">{book.editorialNote}</span>
            </div>
          )}

          {/* Overview / Reader Reviews Tabs */}
          <div className="d-flex align-items-center gap-4 border-bottom pb-2 mb-4">
            <button
              type="button"
              className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                activeTab === 'overview' ? 'fw-bold' : 'text-muted'
              }`}
              style={{
                color: activeTab === 'overview' ? 'var(--rv-ink-plum)' : '#6C757D',
                borderBottom: activeTab === 'overview' ? '2.5px solid #D96B50' : 'none',
              }}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                activeTab === 'reviews' ? 'fw-bold' : 'text-muted'
              }`}
              style={{
                color: activeTab === 'reviews' ? 'var(--rv-ink-plum)' : '#6C757D',
                borderBottom: activeTab === 'reviews' ? '2.5px solid #D96B50' : 'none',
              }}
              onClick={() => setActiveTab('reviews')}
            >
              Reader reviews ({reviews.length})
            </button>
          </div>

          {/* About this book section */}
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              About this book
            </h5>
            <p className="text-secondary small mb-2" style={{ lineHeight: 1.65 }}>
              {book.synopsis ||
                `${book.title} is a heartwarming and immersive story written by ${book.author}.`}
            </p>
            {showFullDesc && book.quote && (
              <blockquote
                className="blockquote border-start border-3 ps-3 my-3 fst-italic small text-muted"
                style={{ borderColor: '#D96B50' }}
              >
                &ldquo;{book.quote}&rdquo;
              </blockquote>
            )}
            {book.quote && (
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small fw-semibold text-start"
                style={{ color: '#D96B50', fontSize: '13px' }}
                onClick={() => setShowFullDesc(!showFullDesc)}
              >
                {showFullDesc ? 'Show less ∧' : 'Read memorable quote ∨'}
              </button>
            )}
          </div>

          {/* What readers are saying section */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                What readers are saying
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ color: 'var(--rv-ink-plum)', backgroundColor: '#FFFFFF' }}
                onClick={() => setIsReviewModalOpen(true)}
              >
                <AiOutlineEdit size={14} /> Write a review
              </button>
            </div>

            {/* Review Cards Grid */}
            <div className="row g-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="col-md-6">
                  <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white h-100">
                    <div className="d-flex align-items-center gap-2.5 mb-2">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="rounded-circle"
                        style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
                          {rev.author}
                        </div>
                        <div className="d-flex text-warning" style={{ fontSize: '12px' }}>
                          <AiFillStar />
                          <AiFillStar />
                          <AiFillStar />
                          <AiFillStar />
                          <AiFillStar />
                          <span className="ms-1 text-muted" style={{ fontSize: '11px' }}>
                            {rev.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary small mb-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DETAILS WIDGET & VIBE PICKS ================= */}
        <div className="col-lg-3">
          {/* Top Widget: Book Details */}
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
            <h6
              className="fw-bold mb-3"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              Book details
            </h6>
            <div className="d-flex flex-column gap-2.5 small text-secondary">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Genre</span>
                <span className="fw-semibold text-dark">{book.genre || 'Fiction'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Published</span>
                <span className="fw-semibold text-dark">{book.year || '2021'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Format</span>
                <span className="fw-semibold text-dark">{book.format || 'Paperback & Digital'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Language</span>
                <span className="fw-semibold text-dark">{book.language || 'English'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Pages</span>
                <span className="fw-semibold text-dark">{book.pages || 304}</span>
              </div>
            </div>
          </div>

          {/* Middle Widget: Find a book for your mood */}
          <div
            className="card border-0 rounded-4 shadow-sm p-4 mb-4 position-relative overflow-hidden"
            style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
          >
            <div className="position-absolute top-0 end-0 p-3 opacity-25" style={{ fontSize: '3rem' }}>
              🌿
            </div>
            <h6
              className="fw-bold mb-1"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              Find a book for your mood
            </h6>
            <p className="text-muted small mb-3" style={{ fontSize: '13px' }}>
              Not sure what to read next? Let us match a book to your current vibe.
            </p>
            <Link
              href="/vibe-matcher"
              className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
              style={{ color: '#D96B50' }}
            >
              Try Vibe Matcher →
            </Link>
          </div>

          {/* Bottom Widget: More books with this vibe */}
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
            <h6
              className="fw-bold mb-3"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              More books with this vibe
            </h6>

            <div className="d-flex flex-column gap-3">
              {relatedBooks.map((rel) => (
                <div key={rel.id} className="d-flex align-items-center gap-3">
                  <Link href={`/books/${rel.id}`} className="flex-shrink-0">
                    <img
                      src={rel.coverUrl}
                      alt={rel.title}
                      className="rounded shadow-sm"
                      style={{ width: '44px', height: '62px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/books/midnight-library.jpg';
                      }}
                    />
                  </Link>
                  <div className="flex-grow-1 min-w-0">
                    <Link href={`/books/${rel.id}`} className="text-decoration-none d-block">
                      <div
                        className="fw-bold small text-truncate"
                        style={{ color: 'var(--rv-ink-plum)' }}
                      >
                        {rel.title}
                      </div>
                    </Link>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      {rel.author}
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {(rel.moods || []).slice(0, 2).map((m) => (
                        <span
                          key={m}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: '#F3EEF7',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '9px',
                            padding: '2px 6px',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddToWishlistModal
        book={book}
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSaved={() => {}}
      />

      <WriteReviewModal
        book={book}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewAdded={() => {}}
      />

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}
