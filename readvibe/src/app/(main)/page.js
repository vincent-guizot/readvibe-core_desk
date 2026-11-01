'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineArrowRight,
  AiOutlineBook
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { useBooks, useWishlist } from '@/hooks';
import { readVibeStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { books: reduxBooks } = useBooks();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeMood, setActiveMood] = useState('Cozy');

  const moodPills = [
    { key: 'Cozy', label: 'Cozy', icon: '🏠' },
    { key: 'Reflective', label: 'Reflective', icon: '🍃' },
    { key: 'Adventurous', label: 'Adventurous', icon: '⛰️' },
    { key: 'Hopeful', label: 'Hopeful', icon: '☀️' },
    { key: 'Mindful', label: 'Mindful', icon: '🪷' },
    { key: 'Need a laugh', label: 'Need a laugh', icon: '😊' }
  ];

  const allAvailableBooks = reduxBooks && reduxBooks.length > 0 ? reduxBooks : [
    {
      id: 'midnight-library',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      rating: 4.3,
      mood: 'Reflective',
      moods: ['Reflective', 'Thoughtful', 'Cozy'],
      coverUrl: '/assets/books/midnight-library.jpg'
    },
    {
      id: 'comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      rating: 4.4,
      mood: 'Cozy',
      moods: ['Cozy', 'Warm & Healing', 'Hopeful'],
      coverUrl: '/assets/books/comfort-book.jpg'
    },
    {
      id: 'coffee-cold',
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      rating: 4.3,
      mood: 'Hopeful',
      moods: ['Hopeful', 'Reflective', 'Cozy'],
      coverUrl: '/assets/books/coffee-cold.jpg'
    },
    {
      id: 'wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      rating: 4.4,
      mood: 'Mindful',
      moods: ['Mindful', 'Gentle', 'Hopeful'],
      coverUrl: '/assets/books/wild-built.jpg'
    },
    {
      id: 'little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      rating: 4.6,
      mood: 'Need a laugh',
      moods: ['Need a laugh', 'Mindful', 'Nostalgic'],
      coverUrl: '/assets/books/little-prince.jpg'
    }
  ];

  // Dynamically filter books based on active mood tab
  const displayedPickedBooks = allAvailableBooks.filter((b) => {
    if (!activeMood) return true;
    const moodTarget = activeMood.toLowerCase();
    const hasInMoods = b.moods?.some((m) => m.toLowerCase().includes(moodTarget));
    const hasInMood = b.mood?.toLowerCase().includes(moodTarget);
    return hasInMoods || hasInMood;
  });

  const booksToDisplay = displayedPickedBooks.length > 0 ? displayedPickedBooks.slice(0, 5) : allAvailableBooks.slice(0, 5);

  const toggleBookmark = (b) => {
    const bookId = b.id || b.slug;
    toggleWishlist(bookId, 'High', `Discovered under ${activeMood} vibe on home page`);
    if (readVibeStore.isInWishlist(bookId)) {
      readVibeStore.removeFromWishlist(bookId);
    } else {
      readVibeStore.addToWishlist({
        bookId: bookId,
        priority: 'High',
        reason: `Discovered under ${activeMood} vibe on home page`,
        isPublic: true
      });
    }
  };

  return (
    <div className="pb-5" style={{ backgroundColor: '#FAF7F2', minHeight: '100vh' }}>
      {/* ================= HERO SECTION ================= */}
      <section className="py-4 py-lg-5 overflow-hidden">
        <div className="container">
          <div className="row align-items-center g-4">
            {/* Left Column: Heading and CTAs */}
            <div className="col-lg-6">
              <span
                className="fw-bold small d-inline-block mb-3"
                style={{ color: '#D96B50', letterSpacing: '0.12em', fontSize: '13px' }}
              >
                A LITTLE MOOD. A GREAT BOOK.
              </span>

              <h1
                className="display-4 fw-bold mb-3"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  color: 'var(--rv-ink-plum)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em'
                }}
              >
                Find your next read.
                <br />
                Feel your next vibe.
              </h1>

              <p className="text-muted mb-4" style={{ fontSize: '1.15rem', maxWidth: '480px' }}>
                Discover stories that meet you where you are.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link
                  href="/vibe-matcher"
                  className="btn btn-rv-plum px-4 py-2.5 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <span>✨</span> Find my vibe
                </Link>

                <Link
                  href="/search"
                  className="btn btn-link text-decoration-none fw-semibold p-0 d-inline-flex align-items-center gap-1.5"
                  style={{ color: 'var(--rv-ink-plum)' }}
                >
                  Explore books <span style={{ transform: 'translateX(2px)' }}>→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Artwork with 3 Books & Mug */}
            <div className="col-lg-6 position-relative text-center">
              {/* Sticker Pill */}
              <div
                className="position-absolute end-0 top-0 mt-2 me-4 px-3 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5 z-2"
                style={{
                  backgroundColor: '#FDEEE9',
                  color: 'var(--rv-ink-plum)',
                  fontSize: '13px',
                  fontWeight: 600,
                  transform: 'rotate(2deg)'
                }}
              >
                <span>Picked for your mood</span>
                <span>🪄</span>
              </div>

              {/* Books Stack / Display illustration */}
              <div className="position-relative d-inline-block">
                <img
                  src="/assets/illustrations/book-stacks-text.png"
                  alt="ReadVibe Curations"
                  className="img-fluid"
                  style={{
                    maxHeight: '340px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 24px rgba(43, 19, 44, 0.08))'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/illustrations/books.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION: HOW ARE YOU FEELING TODAY? ================= */}
      <section className="py-4">
        <div className="container">
          <div className="mb-3">
            <h2
              className="h3 fw-bold mb-1"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              How are you feeling today?
            </h2>
            <p className="text-muted small mb-0">
              Choose a mood and discover your next chapter.
            </p>
          </div>

          {/* Horizontal Mood Selector Pills */}
          <div className="d-flex flex-wrap gap-2.5 mb-5">
            {moodPills.map((m) => {
              const isActive = activeMood === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setActiveMood(m.key)}
                  className="btn d-inline-flex align-items-center gap-2 rounded-4 px-3.5 py-2.5 border transition-all"
                  style={{
                    backgroundColor: isActive ? '#EFE9F4' : '#FFFFFF',
                    borderColor: isActive ? '#BC9FC9' : '#EAE2D8',
                    color: isActive ? 'var(--rv-ink-plum)' : '#495057',
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? '0 2px 6px rgba(188, 159, 201, 0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{m.icon}</span>
                  <span style={{ fontSize: '14px' }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* ================= SECTION: PICKED FOR YOUR VIBE ================= */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <span
                  className="small fw-bold d-block text-uppercase"
                  style={{ color: '#D96B50', letterSpacing: '0.1em', fontSize: '11px' }}
                >
                  PERSONALIZED FOR YOU
                </span>
                <h3
                  className="h4 fw-bold mb-0"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Picked for your vibe
                </h3>
              </div>
              <Link
                href="/search"
                className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                See all →
              </Link>
            </div>

            {/* 5 Book Cards in a row (Scrollable / Grid) */}
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
              {booksToDisplay.map((b) => {
                const bookId = b.id || b.slug;
                const isBookmarked = isWishlisted(bookId) || readVibeStore.isInWishlist(bookId);
                return (
                  <div className="col" key={bookId}>
                    <div
                      className="card h-100 border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-column justify-content-between position-relative transition-all"
                      style={{
                        borderColor: '#EAE2D8',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {/* Top section: Cover & Details */}
                      <div>
                        {/* Bookmark Button */}
                        <button
                          type="button"
                          className="btn btn-link p-0 position-absolute top-0 end-0 m-3 text-decoration-none shadow-none"
                          style={{
                            color: isBookmarked ? '#D96B50' : '#ADB5BD',
                            fontSize: '20px',
                            transition: 'color 0.2s ease, transform 0.2s ease'
                          }}
                          onClick={() => toggleBookmark(b)}
                          title={isBookmarked ? 'In your wishlist' : 'Add to wishlist'}
                        >
                          {isBookmarked ? <BsBookmarkFill style={{ color: '#D96B50' }} /> : <BsBookmark />}
                        </button>

                        {/* Cover Image */}
                        <Link href={`/books/${bookId}`} className="d-block text-center mb-3">
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="rounded-3 shadow-sm img-fluid"
                            style={{ height: '145px', width: 'auto', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = '/assets/books/midnight-library.jpg';
                            }}
                          />
                        </Link>

                        {/* Title and Author */}
                        <Link
                          href={`/books/${b.id}`}
                          className="text-decoration-none d-block mb-1"
                        >
                          <h6
                            className="fw-bold mb-0 text-truncate"
                            style={{
                              fontFamily: 'var(--font-editorial)',
                              color: 'var(--rv-ink-plum)',
                              fontSize: '15px'
                            }}
                            title={b.title}
                          >
                            {b.title}
                          </h6>
                        </Link>
                        <div
                          className="text-muted small text-truncate mb-2"
                          style={{ fontSize: '12px' }}
                          title={b.author}
                        >
                          {b.author}
                        </div>

                        {/* Rating */}
                        <div className="d-flex align-items-center gap-1 mb-3">
                          <div className="d-flex gap-0.5 text-warning" style={{ fontSize: '13px' }}>
                            <AiFillStar />
                            <AiFillStar />
                            <AiFillStar />
                            <AiFillStar />
                            <AiFillStar />
                          </div>
                          <span className="small fw-semibold text-muted ms-1" style={{ fontSize: '12px' }}>
                            {b.rating}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Mood Pill */}
                      <div>
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: '#F3EEF7',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '11px',
                            border: '1px solid #E5DCE9'
                          }}
                        >
                          <span>{b.moodIcon}</span>
                          <span>{b.mood}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION: BOTTOM 2 CARDS ================= */}
          <div className="row g-4 mt-2">
            {/* Left Wide Card: Cat with Book Stack */}
            <div className="col-lg-8">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 h-100 position-relative overflow-hidden"
                style={{
                  backgroundColor: '#F9F4EE',
                  borderColor: '#EFE7DC',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <div className="row align-items-center g-3">
                  <div className="col-sm-4 text-center">
                    <img
                      src="/assets/illustrations/book-stack-with-flower-vase.png"
                      alt="Cat and Books"
                      className="img-fluid"
                      style={{ maxHeight: '130px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/illustrations/books.png';
                      }}
                    />
                  </div>
                  <div className="col-sm-8 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                      <h4
                        className="fw-bold mb-1"
                        style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                      >
                        Your next favorite might be one mood away.
                      </h4>
                      <p className="text-muted small mb-0">
                        Answer a few quick questions and get personalized book picks.
                      </p>
                    </div>

                    <Link
                      href="/vibe-matcher"
                      className="btn btn-rv-plum rounded-pill px-4 py-2 fw-bold flex-shrink-0 text-nowrap shadow-sm"
                      style={{ fontSize: '14px' }}
                    >
                      Try Vibe Matcher →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Reading Journey */}
            <div className="col-lg-4">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 h-100 position-relative"
                style={{
                  backgroundColor: '#EEF4EF',
                  borderColor: '#DFE8E0',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '20px' }}>🌱</span>
                    <div>
                      <h6
                        className="fw-bold mb-0"
                        style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                      >
                        Your reading journey
                      </h6>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        3 books finished this month
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/my-reading"
                    className="btn btn-sm btn-light rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', color: 'var(--rv-ink-plum)' }}
                    title="View My Reading"
                  >
                    →
                  </Link>
                </div>

                {/* Book Icons Row */}
                <div className="d-flex align-items-center gap-2 mt-3">
                  <span style={{ color: 'var(--rv-ink-plum)', fontSize: '24px' }}>
                    <AiOutlineBook />
                  </span>
                  <span style={{ color: 'var(--rv-ink-plum)', fontSize: '24px' }}>
                    <AiOutlineBook />
                  </span>
                  <span style={{ color: '#ADB5BD', fontSize: '24px' }}>
                    <AiOutlineBook />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
