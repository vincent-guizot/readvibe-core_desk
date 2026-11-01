'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineBook,
  AiOutlineCalendar,
  AiOutlineEdit,
  AiOutlineAppstore,
  AiOutlineBars
} from 'react-icons/ai';
import { BsStars } from 'react-icons/bs';
import { readVibeStore } from '@/lib/store';

export default function FinishedReadsPage() {
  const router = useRouter();
  const [finishedList, setFinishedList] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recently');

  useEffect(() => {
    setAllBooks(readVibeStore.getBooks());
    setFinishedList(readVibeStore.getFinishedReads());
  }, []);

  const finishedBooksData = [
    {
      id: 'midnight-library',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      coverUrl: '/assets/books/midnight-library.jpg',
      rating: 4.5,
      mood: 'Reflective',
      moodBg: '#EFE9F4',
      moodColor: 'var(--rv-ink-plum)',
      date: 'Oct 26, 2026'
    },
    {
      id: 'comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      coverUrl: '/assets/books/comfort-book.jpg',
      rating: 4.5,
      mood: 'Cozy',
      moodBg: '#FFEBE6',
      moodColor: '#D96B50',
      date: 'Oct 18, 2026'
    },
    {
      id: 'before-the-coffee-gets-cold',
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      coverUrl: '/assets/books/coffee-cold.jpg',
      rating: 4.5,
      mood: 'Hopeful',
      moodBg: '#EAF3EC',
      moodColor: '#4A7C59',
      date: 'Oct 10, 2026'
    },
    {
      id: 'little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: '/assets/books/little-prince.jpg',
      rating: 5.0,
      mood: 'Mindful',
      moodBg: '#EAF3EC',
      moodColor: '#4A7C59',
      date: 'Sep 28, 2026'
    },
    {
      id: 'morisaki-bookshop',
      title: 'Days at the Morisaki Bookshop',
      author: 'Satoshi Yagisawa',
      coverUrl: '/assets/books/morisaki.jpg',
      rating: 4.5,
      mood: 'Cozy',
      moodBg: '#FFEBE6',
      moodColor: '#D96B50',
      date: 'Sep 15, 2026'
    },
    {
      id: 'psalm-for-wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      coverUrl: '/assets/books/wild-built.jpg',
      rating: 4.5,
      mood: 'Mindful',
      moodBg: '#EAF3EC',
      moodColor: '#4A7C59',
      date: 'Aug 30, 2026'
    }
  ];

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-secondary text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/my-reading" className="text-secondary text-decoration-none">
              My Reading
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Finished Reads
          </li>
        </ol>
      </nav>

      {/* Header with illustration */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        <div>
          <h1
            className="display-6 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            The last page. A lasting feeling.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
            A shelf of stories you have finished, and the feelings they left behind.
          </p>
        </div>

        <div className="d-none d-lg-block flex-shrink-0">
          <img
            src="/assets/illustrations/book-stacks-text.png"
            alt="Finished reads artwork"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3"
            style={{ backgroundColor: '#F5EFFB' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#E8DDF4', color: 'var(--rv-ink-plum)' }}
            >
              <AiOutlineBook size={22} />
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                12
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>Books finished</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3"
            style={{ backgroundColor: '#EBF5EE' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#D9ECE0', color: '#4A7C59' }}
            >
              <AiOutlineCalendar size={22} />
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                3
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>Finished this month</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3"
            style={{ backgroundColor: '#FFF3EE' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#FFE4DA', color: '#D96B50' }}
            >
              <AiFillStar size={22} />
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                4.5
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>Your average rating</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        {/* Tabs */}
        <div className="d-flex align-items-center gap-4">
          <Link
            href="/my-reading"
            className="text-decoration-none text-muted fw-semibold"
            style={{ paddingBottom: '8px' }}
          >
            Currently reading (3)
          </Link>
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none fw-bold"
            style={{
              color: 'var(--rv-ink-plum)',
              borderBottom: '2.5px solid var(--rv-ink-plum)',
              paddingBottom: '8px'
            }}
          >
            Finished (12)
          </button>
        </div>

        {/* Right dropdowns */}
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm border bg-white rounded-pill py-1 px-3"
            style={{ fontSize: '12px', width: 'auto' }}
            value={selectedMoodFilter}
            onChange={(e) => setSelectedMoodFilter(e.target.value)}
          >
            <option value="All">All moods</option>
            <option value="Reflective">Reflective</option>
            <option value="Cozy">Cozy</option>
            <option value="Hopeful">Hopeful</option>
            <option value="Mindful">Mindful</option>
          </select>

          <select
            className="form-select form-select-sm border bg-white rounded-pill py-1 px-3"
            style={{ fontSize: '12px', width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently">Recently finished</option>
            <option value="rating">Highest rated</option>
            <option value="title">Title</option>
          </select>

          <div className="btn-group" role="group">
            <button type="button" className="btn btn-sm btn-light border p-1 px-2" style={{ backgroundColor: 'var(--rv-ink-plum)', color: '#FFFFFF' }}>
              <AiOutlineAppstore size={16} />
            </button>
            <button type="button" className="btn btn-sm btn-light border p-1 px-2 text-muted">
              <AiOutlineBars size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="row g-4 align-items-start">
        {/* Left: 6 Finished Books Grid */}
        <div className="col-lg-8">
          <div className="row g-3">
            {finishedBooksData.map((book) => (
              <div key={book.id} className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex gap-3 mb-3">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="rounded-2 shadow-sm flex-shrink-0"
                      style={{ width: '80px', height: '115px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6
                        className="fw-bold mb-0 text-truncate"
                        style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', maxWidth: '170px' }}
                      >
                        {book.title}
                      </h6>
                      <small className="text-muted d-block mb-2">{book.author}</small>

                      {/* Finished badge */}
                      <span
                        className="badge rounded-pill fw-normal px-2 py-1 mb-2 d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: '#E0EAE1', color: '#315438', fontSize: '11px' }}
                      >
                        ✓ Finished
                      </span>

                      {/* Rating & Mood */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '10px' }}>Your rating</small>
                          <div className="d-flex align-items-center gap-0.5 text-coral" style={{ color: '#E27D60' }}>
                            <AiFillStar size={12} />
                            <AiFillStar size={12} />
                            <AiFillStar size={12} />
                            <AiFillStar size={12} />
                            <AiFillStar size={12} />
                          </div>
                        </div>

                        <span
                          className="badge rounded-pill fw-normal"
                          style={{
                            backgroundColor: book.moodBg,
                            color: book.moodColor,
                            fontSize: '11px',
                            padding: '3px 8px'
                          }}
                        >
                          {book.mood}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <small className="text-muted d-block mb-3" style={{ fontSize: '11px' }}>
                      Finished on {book.date}
                    </small>

                    <div className="d-flex gap-2">
                      <Link
                        href={`/vibe-card?bookId=${book.id}`}
                        className="btn btn-sm rounded-pill py-1.5 px-2 flex-grow-1 fw-semibold text-white d-inline-flex align-items-center justify-content-center gap-1"
                        style={{ backgroundColor: 'var(--rv-ink-plum)', fontSize: '11px' }}
                      >
                        <BsStars size={12} /> Create Vibe Card
                      </Link>

                      <Link
                        href={`/finished-reads/edit-review?bookId=${book.id}`}
                        className="btn btn-sm btn-outline-secondary rounded-pill py-1.5 px-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
                        style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', fontSize: '11px', background: '#FFFFFF' }}
                      >
                        <AiOutlineEdit size={12} /> Edit review
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pagination */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-2">
            <small className="text-muted">Showing 6 of 12 books</small>
            <div className="d-flex align-items-center gap-1">
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1" style={{ fontSize: '12px' }}>
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center text-white"
                style={{ width: '28px', height: '28px', backgroundColor: 'var(--rv-ink-plum)', fontSize: '12px' }}
              >
                1
              </button>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center text-muted"
                style={{ width: '28px', height: '28px', fontSize: '12px' }}
              >
                2
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1" style={{ fontSize: '12px' }}>
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Keepsake Card */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)'
              }}
            >
              <h4
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.2 }}
              >
                Turn a finished read into a keepsake.
              </h4>

              {/* Keepsake Mini Card */}
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
                <div className="d-flex gap-2.5 align-items-center mb-2">
                  <img
                    src="/assets/books/midnight-library.jpg"
                    alt="The Midnight Library"
                    className="rounded-1 shadow-xs flex-shrink-0"
                    style={{ width: '42px', height: '60px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                      The Midnight Library
                    </h6>
                    <small className="text-muted" style={{ fontSize: '10px' }}>Matt Haig</small>
                    <div className="text-coral d-flex gap-0.5 mt-1" style={{ color: '#E27D60' }}>
                      <AiFillStar size={10} />
                      <AiFillStar size={10} />
                      <AiFillStar size={10} />
                      <AiFillStar size={10} />
                      <AiFillStar size={10} />
                    </div>
                  </div>
                </div>
                <small className="fst-italic text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                  &ldquo;A reflective read.&rdquo;
                </small>
                <div className="text-end" style={{ fontSize: '10px', color: 'var(--rv-ink-plum)', fontWeight: 'bold' }}>
                  📖 ReadVibe
                </div>
              </div>

              <p className="text-muted small mb-3">
                Your book, your rating, your vibe. Ready to share.
              </p>

              <Link
                href="/vibe-card"
                className="btn btn-outline-secondary rounded-pill w-100 py-2 fw-semibold"
                style={{ borderColor: 'var(--rv-ink-plum)', color: 'var(--rv-ink-plum)', background: '#FFFFFF' }}
              >
                Explore Vibe Cards
              </Link>
            </div>

            {/* Widget 2: Reading Stats */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.3) 0%, transparent 65%)'
              }}
            >
              <div
                className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#D8E2D5', color: '#4B634E', width: '36px', height: '36px' }}
              >
                <span style={{ fontSize: '18px' }}>📊</span>
              </div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your reading story
              </h5>
              <p className="text-muted small mb-3">
                See the moods and moments behind your bookshelf.
              </p>
              <Link
                href="/stats"
                className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                View reading stats →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}