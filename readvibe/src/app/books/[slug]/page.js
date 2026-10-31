'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineBook,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineArrowRight,
  AiOutlineCheck
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '../../../lib/store';
import AddToWishlistModal from '../../../components/AddToWishlistModal';
import WriteReviewModal from '../../../components/WriteReviewModal';
import ReportModal from '../../../components/ReportModal';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookIdentifier = params?.slug || params?.id || 'midnight-library';

  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [inWishlist, setInWishlist] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let foundBook = readVibeStore.getBookById(bookIdentifier);
    if (!foundBook) {
      // Default fallback to Midnight Library for rich demo experience
      foundBook = {
        id: 'midnight-library',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        category: 'CONTEMPORARY FICTION',
        rating: 4.3,
        reviewCount: '1,248',
        moods: ['Reflective', 'Hopeful', 'Philosophical'],
        pages: 304,
        language: 'English',
        year: 2020,
        format: 'Paperback',
        publisher: 'Canongate Books',
        coverUrl: '/assets/books/midnight-library.jpg',
        description:
          'Nora Seed finds herself in a mysterious library between life and death, where every book contains a version of the life she could have lived. As she steps into different realities, she explores the choices, chances and what truly gives life meaning.\n\nA moving and imaginative story about regret, possibility and the quiet power of second chances, reminding us that it’s never too late to find a life worth living.',
        editorialTip: 'A thoughtful read for a fresh perspective.'
      };
    }
    setBook(foundBook);
    setInWishlist(readVibeStore.isInWishlist(foundBook.id));
  }, [bookIdentifier]);

  if (!book) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>Loading book...</h4>
      </div>
    );
  }

  const handleStartReading = () => {
    readVibeStore.startReadingBook(book.id);
    router.push(`/reader/${book.id}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Recommended related books matching book detail.png
  const relatedBooks = [
    {
      id: 'the-comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      coverUrl: '/assets/books/comfort-book.jpg',
      moods: ['Uplifting', 'Comforting', 'Reflective']
    },
    {
      id: 'before-the-coffee-gets-cold',
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      coverUrl: '/assets/books/coffee-cold.jpg',
      moods: ['Bittersweet', 'Thoughtful', 'Hopeful']
    },
    {
      id: 'psalm-wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      coverUrl: '/assets/books/wild-built.jpg',
      moods: ['Mindful', 'Hopeful', 'Life & Meaning']
    }
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
            <Link href="/discover" className="text-secondary text-decoration-none">
              Discover
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

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
                  boxShadow: '0 14px 28px rgba(43, 19, 44, 0.14)'
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
            {book.category || 'CONTEMPORARY FICTION'}
          </span>

          {/* Book Title */}
          <h1
            className="display-5 fw-bold mb-1"
            style={{
              fontFamily: 'var(--font-editorial)',
              color: 'var(--rv-ink-plum)',
              letterSpacing: '-0.02em'
            }}
          >
            {book.title}
          </h1>

          {/* Author */}
          <div className="mb-3">
            <span className="text-muted">by </span>
            <span className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              {book.author}
            </span>
          </div>

          {/* Rating */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="d-flex gap-0.5 text-warning" style={{ fontSize: '15px' }}>
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
            </div>
            <span className="fw-bold small ms-1" style={{ color: 'var(--rv-ink-plum)' }}>
              {book.rating || 4.3}
            </span>
            <span className="text-muted small">
              ({book.reviewCount || '1,248'} reviews)
            </span>
          </div>

          {/* Mood Pills */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {(book.moods || ['Reflective', 'Hopeful', 'Philosophical']).map((m) => (
              <span
                key={m}
                className="badge rounded-pill px-3 py-1.5 fw-semibold"
                style={{
                  backgroundColor: m === 'Reflective' ? '#EFE9F4' : m === 'Hopeful' ? '#E7F2EB' : '#F6EDF3',
                  color: 'var(--rv-ink-plum)',
                  fontSize: '12px'
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Description Paragraphs */}
          <div className="text-secondary small mb-4" style={{ fontSize: '14px', lineHeight: 1.7 }}>
            <p className="mb-3">
              Nora Seed finds herself in a mysterious library between life and death, where every book contains a version of the life she could have lived. As she steps into different realities, she explores the choices, chances and what truly gives life meaning.
            </p>
            <p className="mb-0">
              A moving and imaginative story about regret, possibility and the quiet power of second chances, reminding us that it’s never too late to find a life worth living.
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="d-flex flex-wrap align-items-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={handleStartReading}
              className="btn btn-rv-plum rounded-3 px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            >
              <AiOutlineBook size={18} /> Start reading
            </button>

            <button
              type="button"
              onClick={() => {
                if (inWishlist) {
                  readVibeStore.removeFromWishlist(book.id);
                  setInWishlist(false);
                } else {
                  setIsWishlistModalOpen(true);
                }
              }}
              className={`btn rounded-3 px-4 py-2.5 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm transition-all`}
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

            <button
              type="button"
              onClick={handleShare}
              className="btn btn-white border rounded-3 p-2.5 text-muted shadow-sm"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0D8CE' }}
              title="Share"
            >
              <AiOutlineShareAlt size={18} />
            </button>
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
              <span>{book.year || 2020}</span>
            </div>
            <span>&bull;</span>
            <div className="d-flex align-items-center gap-1.5">
              <span>🏷️</span>
              <span>Fiction</span>
            </div>
          </div>

          {/* Editorial Green Alert Banner */}
          <div
            className="p-3 rounded-4 mb-4 d-flex align-items-center gap-2.5"
            style={{ backgroundColor: '#EBF4ED', color: '#2B5E3B' }}
          >
            <span style={{ fontSize: '18px' }}>🌱</span>
            <span className="small fw-semibold">
              {book.editorialTip || 'A thoughtful read for a fresh perspective.'}
            </span>
          </div>

          {/* Overview / Reader Reviews Tabs (Matching Wishlist Tab Design) */}
          <div className="d-flex align-items-center gap-4 border-bottom pb-2 mb-4">
            <button
              type="button"
              className={`btn btn-link text-decoration-none p-0 pb-2 fw-semibold position-relative ${
                activeTab === 'overview' ? 'fw-bold' : 'text-muted'
              }`}
              style={{
                color: activeTab === 'overview' ? 'var(--rv-ink-plum)' : '#6C757D',
                borderBottom: activeTab === 'overview' ? '2.5px solid #D96B50' : 'none'
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
                borderBottom: activeTab === 'reviews' ? '2.5px solid #D96B50' : 'none'
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
              The Midnight Library is a warm, thought-provoking novel about the infinite paths a single life can take. Through Nora’s journey, Matt Haig explores the weight of the choices we make, the lives we imagine, and the surprising ways hope can be found, even in our darkest moments.
            </p>
            {showFullDesc && (
              <p className="text-secondary small mb-2 animate__animated animate__fadeIn" style={{ lineHeight: 1.65 }}>
                Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?
              </p>
            )}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none small fw-semibold text-start"
              style={{ color: '#D96B50', fontSize: '13px' }}
              onClick={() => setShowFullDesc(!showFullDesc)}
            >
              {showFullDesc ? 'Show less ∧' : 'Read more ∨'}
            </button>
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

            {/* Review Cards Grid (Emily Chen & Daniel Park) */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white h-100">
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                      alt="Emily Chen"
                      className="rounded-circle"
                      style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
                        Emily Chen
                      </div>
                      <div className="d-flex text-warning" style={{ fontSize: '12px' }}>
                        <AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar /><AiOutlineStar />
                        <span className="ms-1 text-muted" style={{ fontSize: '11px' }}>4.0</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary small mb-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    A beautiful, thought-provoking read. It gently reminds you to be kinder to yourself and to see the possibilities in everyday moments.
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 rounded-4 shadow-sm p-3.5 bg-white h-100">
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                      alt="Daniel Park"
                      className="rounded-circle"
                      style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold small" style={{ color: 'var(--rv-ink-plum)' }}>
                        Daniel Park
                      </div>
                      <div className="d-flex text-warning" style={{ fontSize: '12px' }}>
                        <AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar />
                        <span className="ms-1 text-muted" style={{ fontSize: '11px' }}>4.5</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary small mb-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    Imaginative and deeply human. This book stayed with me long after I finished it, and gave me a fresher perspective on my own choices.
                  </p>
                </div>
              </div>
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
                <span className="text-muted">Publisher</span>
                <span className="fw-semibold text-dark">{book.publisher || 'Canongate Books'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Published</span>
                <span className="fw-semibold text-dark">{book.year || '2020'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Format</span>
                <span className="fw-semibold text-dark">{book.format || 'Paperback'}</span>
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
                      {rel.moods.map((m) => (
                        <span
                          key={m}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: '#F3EEF7',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '9px',
                            padding: '2px 6px'
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
        onSaved={() => setInWishlist(true)}
      />

      <WriteReviewModal
        book={book}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitted={() => {}}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
