'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineBook,
  AiOutlineCalendar,
  AiOutlineEdit,
  AiOutlineAppstore,
  AiOutlineBars,
} from 'react-icons/ai';
import { BsStars } from 'react-icons/bs';
import { useReading, useBooks, useAuth } from '@/hooks';

export default function FinishedReadsPage() {
  const router = useRouter();
  const { finishedReads, currentReading } = useReading();
  const { books } = useBooks();
  const { user } = useAuth();

  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recently');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);

  // Combine Redux finished reads with full book metadata
  const enrichedFinishedList = useMemo(() => {
    return (finishedReads || []).map((read) => {
      const book = books.find((b) => b.id === read.bookId || b.slug === read.bookId);
      const moods = read.moods && read.moods.length > 0 ? read.moods : book?.moods || ['Cozy'];
      const primaryMood = moods[0] || 'Cozy';

      const moodColorMap = {
        Cozy: { bg: '#FFEBE6', color: '#D96B50' },
        Reflective: { bg: '#EFE9F4', color: 'var(--rv-ink-plum)' },
        Mindful: { bg: '#EAF3EC', color: '#4A7C59' },
        Hopeful: { bg: '#EAF3EC', color: '#4A7C59' },
        'Warm & Healing': { bg: '#FFEBE6', color: '#D96B50' },
        Thoughtful: { bg: '#EFE9F4', color: 'var(--rv-ink-plum)' },
        Melancholy: { bg: '#EFE9F4', color: 'var(--rv-ink-plum)' },
        Bittersweet: { bg: '#FFEBE6', color: '#D96B50' },
        Gentle: { bg: '#EAF3EC', color: '#4A7C59' },
        Calm: { bg: '#EAEFE9', color: '#4B634E' },
      };

      const moodStyle = moodColorMap[primaryMood] || { bg: '#EFE9F4', color: 'var(--rv-ink-plum)' };

      return {
        ...read,
        id: read.bookId || book?.id,
        title: book?.title || read.title || 'Untitled Book',
        author: book?.author || read.author || 'Unknown Author',
        coverUrl: book?.coverUrl || read.coverUrl || '/assets/books/midnight-library.jpg',
        rating: Number(read.rating || book?.rating || 5),
        primaryMood,
        moodBg: moodStyle.bg,
        moodColor: moodStyle.color,
        finishedAt: read.finishedAt || 'Oct 2026',
        favoriteQuote: read.favoriteQuote || book?.quote || '',
      };
    });
  }, [finishedReads, books]);

  // Derived Stats
  const totalBooksFinished = enrichedFinishedList.length;

  const finishedThisMonth = useMemo(() => {
    const currentMonthPrefix = new Date().toLocaleDateString('en-US', { month: 'short' });
    const count = enrichedFinishedList.filter(
      (b) => b.finishedAt?.includes('Oct') || b.finishedAt?.includes(currentMonthPrefix)
    ).length;
    return count > 0 ? count : 3;
  }, [enrichedFinishedList]);

  const avgRating = useMemo(() => {
    if (enrichedFinishedList.length === 0) return user?.stats?.avgRating || '4.5';
    const sum = enrichedFinishedList.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / enrichedFinishedList.length).toFixed(1);
  }, [enrichedFinishedList, user]);

  // Dynamic available moods from actual shelf data
  const availableMoods = useMemo(() => {
    const set = new Set();
    enrichedFinishedList.forEach((b) => {
      if (b.primaryMood) set.add(b.primaryMood);
    });
    return ['All', ...Array.from(set)];
  }, [enrichedFinishedList]);

  // Filter and Sort
  const filteredAndSortedBooks = useMemo(() => {
    let result = enrichedFinishedList.filter((b) => {
      if (selectedMoodFilter === 'All') return true;
      return b.primaryMood.toLowerCase() === selectedMoodFilter.toLowerCase();
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    // 'recently' keeps original descending order from Redux
    return result;
  }, [enrichedFinishedList, selectedMoodFilter, sortBy]);

  // Pagination (6 books per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBooks.slice(start, start + itemsPerPage);
  }, [filteredAndSortedBooks, currentPage]);

  const latestRead = enrichedFinishedList[0] || {
    title: 'The Comfort Book',
    author: 'Matt Haig',
    rating: 5,
    coverUrl: '/assets/books/comfort-book.jpg',
    favoriteQuote: 'Nothing is stronger than a small hope that doesn’t give up.',
    primaryMood: 'Cozy',
  };

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
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3 shadow-xs"
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
                {totalBooksFinished}
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>Books finished</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3 shadow-xs"
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
                {finishedThisMonth}
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>Finished recently</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3 shadow-xs"
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
                {avgRating}
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
            Currently reading ({currentReading.length})
          </Link>
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none fw-bold"
            style={{
              color: 'var(--rv-ink-plum)',
              borderBottom: '2.5px solid var(--rv-ink-plum)',
              paddingBottom: '8px',
            }}
          >
            Finished ({totalBooksFinished})
          </button>
        </div>

        {/* Right dropdowns & View Toggles */}
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm border bg-white rounded-pill py-1 px-3 shadow-xs"
            style={{ fontSize: '12px', width: 'auto' }}
            value={selectedMoodFilter}
            onChange={(e) => {
              setSelectedMoodFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {availableMoods.map((m) => (
              <option key={m} value={m}>
                {m === 'All' ? 'All moods' : m}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm border bg-white rounded-pill py-1 px-3 shadow-xs"
            style={{ fontSize: '12px', width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently">Recently finished</option>
            <option value="rating">Highest rated</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <div className="btn-group shadow-xs" role="group">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`btn btn-sm border p-1 px-2 ${
                layoutMode === 'grid' ? 'text-white' : 'btn-light text-muted'
              }`}
              style={{
                backgroundColor: layoutMode === 'grid' ? 'var(--rv-ink-plum)' : '#FFFFFF',
              }}
              title="Grid View"
            >
              <AiOutlineAppstore size={16} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`btn btn-sm border p-1 px-2 ${
                layoutMode === 'list' ? 'text-white' : 'btn-light text-muted'
              }`}
              style={{
                backgroundColor: layoutMode === 'list' ? 'var(--rv-ink-plum)' : '#FFFFFF',
              }}
              title="List View"
            >
              <AiOutlineBars size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="row g-4 align-items-start">
        {/* Left Column: Books List / Grid */}
        <div className="col-lg-8">
          {paginatedBooks.length === 0 ? (
            <div className="card border-0 rounded-4 shadow-sm p-5 text-center bg-white">
              <div className="fs-1 mb-2">📚</div>
              <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
                No finished books found
              </h5>
              <p className="text-muted small mb-3">
                No books match the selected mood filter. Try selecting &quot;All moods&quot;.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedMoodFilter('All')}
                  className="btn btn-sm btn-rv-plum rounded-pill px-4 py-2 fw-semibold"
                >
                  Reset Mood Filter
                </button>
              </div>
            </div>
          ) : layoutMode === 'grid' ? (
            <div className="row g-3">
              {paginatedBooks.map((book) => (
                <div key={book.id} className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between transition-all">
                    <div className="d-flex gap-3 mb-3">
                      <Link href={`/books/${book.id}`}>
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="rounded-2 shadow-sm flex-shrink-0"
                          style={{ width: '80px', height: '115px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/books/midnight-library.jpg';
                          }}
                        />
                      </Link>
                      <div className="flex-grow-1 overflow-hidden">
                        <Link
                          href={`/books/${book.id}`}
                          className="text-decoration-none"
                        >
                          <h6
                            className="fw-bold mb-0 text-truncate"
                            style={{
                              fontFamily: 'var(--font-editorial)',
                              color: 'var(--rv-ink-plum)',
                              maxWidth: '170px',
                            }}
                          >
                            {book.title}
                          </h6>
                        </Link>
                        <small className="text-muted d-block mb-2 text-truncate">{book.author}</small>

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
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                              Your rating
                            </small>
                            <div className="d-flex align-items-center gap-0.5 text-coral" style={{ color: '#E27D60' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <AiFillStar
                                  key={star}
                                  size={12}
                                  style={{ color: star <= Math.round(book.rating) ? '#E27D60' : '#E8DED8' }}
                                />
                              ))}
                            </div>
                          </div>

                          <span
                            className="badge rounded-pill fw-normal"
                            style={{
                              backgroundColor: book.moodBg,
                              color: book.moodColor,
                              fontSize: '11px',
                              padding: '3px 8px',
                            }}
                          >
                            {book.primaryMood}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <small className="text-muted d-block mb-3" style={{ fontSize: '11px' }}>
                        Finished on {book.finishedAt}
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
                          style={{
                            borderColor: '#EADFD5',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '11px',
                            background: '#FFFFFF',
                          }}
                        >
                          <AiOutlineEdit size={12} /> Edit review
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="d-flex flex-column gap-3">
              {paginatedBooks.map((book) => (
                <div key={book.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <Link href={`/books/${book.id}`}>
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="rounded-2 shadow-sm flex-shrink-0"
                          style={{ width: '56px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/books/midnight-library.jpg';
                          }}
                        />
                      </Link>
                      <div>
                        <Link href={`/books/${book.id}`} className="text-decoration-none">
                          <h6
                            className="fw-bold mb-0"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            {book.title}
                          </h6>
                        </Link>
                        <small className="text-muted d-block">{book.author}</small>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <div className="d-flex align-items-center gap-0.5" style={{ color: '#E27D60' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <AiFillStar
                                key={star}
                                size={12}
                                style={{ color: star <= Math.round(book.rating) ? '#E27D60' : '#E8DED8' }}
                              />
                            ))}
                          </div>
                          <span
                            className="badge rounded-pill fw-normal"
                            style={{
                              backgroundColor: book.moodBg,
                              color: book.moodColor,
                              fontSize: '11px',
                              padding: '2px 8px',
                            }}
                          >
                            {book.primaryMood}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '11px' }}>
                            Finished: {book.finishedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/vibe-card?bookId=${book.id}`}
                        className="btn btn-sm rounded-pill py-1.5 px-3 fw-semibold text-white d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: 'var(--rv-ink-plum)', fontSize: '12px' }}
                      >
                        <BsStars size={13} /> Vibe Card
                      </Link>

                      <Link
                        href={`/finished-reads/edit-review?bookId=${book.id}`}
                        className="btn btn-sm btn-outline-secondary rounded-pill py-1.5 px-3 fw-semibold d-inline-flex align-items-center gap-1"
                        style={{
                          borderColor: '#EADFD5',
                          color: 'var(--rv-ink-plum)',
                          fontSize: '12px',
                          background: '#FFFFFF',
                        }}
                      >
                        <AiOutlineEdit size={13} /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {filteredAndSortedBooks.length > itemsPerPage && (
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-2">
              <small className="text-muted">
                Showing {paginatedBooks.length} of {filteredAndSortedBooks.length} books
              </small>
              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                  style={{ fontSize: '12px' }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`btn btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center ${
                      currentPage === num ? 'text-white' : 'btn-light text-muted'
                    }`}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: currentPage === num ? 'var(--rv-ink-plum)' : undefined,
                      fontSize: '12px',
                    }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                  style={{ fontSize: '12px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Keepsake Card with Dynamic Latest Read */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden shadow-xs"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage:
                  'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)',
              }}
            >
              <h4
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.2 }}
              >
                Turn a finished read into a keepsake.
              </h4>

              {/* Keepsake Dynamic Card */}
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
                <div className="d-flex gap-2.5 align-items-center mb-2">
                  <img
                    src={latestRead.coverUrl}
                    alt={latestRead.title}
                    className="rounded-1 shadow-xs flex-shrink-0"
                    style={{ width: '42px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/books/midnight-library.jpg';
                    }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                      {latestRead.title}
                    </h6>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      {latestRead.author}
                    </small>
                    <div className="text-coral d-flex gap-0.5 mt-1" style={{ color: '#E27D60' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <AiFillStar
                          key={star}
                          size={10}
                          style={{
                            color: star <= Math.round(latestRead.rating || 5) ? '#E27D60' : '#E8DED8',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <small className="fst-italic text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                  &ldquo;{latestRead.favoriteQuote || `A ${latestRead.primaryMood.toLowerCase()} read.`}&rdquo;
                </small>
                <div className="text-end" style={{ fontSize: '10px', color: 'var(--rv-ink-plum)', fontWeight: 'bold' }}>
                  📖 ReadVibe
                </div>
              </div>

              <p className="text-muted small mb-3">
                Your book, your rating, your vibe. Ready to share.
              </p>

              <Link
                href={`/vibe-card?bookId=${latestRead.id || 'comfort-book'}`}
                className="btn btn-outline-secondary rounded-pill w-100 py-2 fw-semibold"
                style={{ borderColor: 'var(--rv-ink-plum)', color: 'var(--rv-ink-plum)', background: '#FFFFFF' }}
              >
                Create Vibe Card for this book →
              </Link>
            </div>

            {/* Widget 2: Reading Stats */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden shadow-xs"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage:
                  'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.3) 0%, transparent 65%)',
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
