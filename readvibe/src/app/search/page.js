'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineUnorderedList,
  AiOutlineAppstore
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || 'comfort';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedMoods, setSelectedMoods] = useState(['Cozy', 'Hopeful']);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLength, setSelectedLength] = useState('any');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState(['comfort-book', 'midnight-library']);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Exact 8 books matching search result.png
  const searchBooks = [
    {
      id: 'the-comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      rating: 4.4,
      mood: 'Cozy',
      coverUrl: '/assets/books/comfort-book.jpg'
    },
    {
      id: 'midnight-library',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      rating: 4.3,
      mood: 'Hopeful',
      coverUrl: '/assets/books/midnight-library.jpg'
    },
    {
      id: 'before-the-coffee-gets-cold',
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      rating: 4.3,
      mood: 'Reflective',
      coverUrl: '/assets/books/coffee-cold.jpg'
    },
    {
      id: 'psalm-wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      rating: 4.5,
      mood: 'Hopeful',
      coverUrl: '/assets/books/wild-built.jpg'
    },
    {
      id: 'the-little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupery',
      rating: 4.6,
      mood: 'Mindful',
      coverUrl: '/assets/books/little-prince.jpg'
    },
    {
      id: 'morisaki-bookshop',
      title: 'Days at the Morisaki Bookshop',
      author: 'Satoshi Yagisawa',
      rating: 4.4,
      mood: 'Cozy',
      coverUrl: '/assets/books/morisaki.jpg'
    },
    {
      id: 'cerulean-sea',
      title: 'The House in the Cerulean Sea',
      author: 'TJ Klune',
      rating: 4.5,
      mood: 'Hopeful',
      coverUrl: '/assets/books/cerulean-sea.jpg'
    },
    {
      id: 'looking-for-library',
      title: 'What You Are Looking For Is in the Library',
      author: 'Michiko Aoyama',
      rating: 4.3,
      mood: 'Cozy',
      coverUrl: '/assets/books/looking-for-library.jpg'
    }
  ];

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const clearAllFilters = () => {
    setSelectedMoods([]);
    setSelectedGenres([]);
  };

  const toggleBookmark = (id) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
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
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Search
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="mb-4">
        <h1
          className="display-5 fw-bold mb-1"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
        >
          A little comfort, a new chapter.
        </h1>
        <p className="text-muted small mb-0" style={{ fontSize: '1.05rem' }}>
          Search results for &ldquo;{searchQuery || 'comfort'}&rdquo; &bull; 24 books found
        </p>
      </div>

      {/* Main Grid: Left Filters (col-lg-3) & Right Grid (col-lg-9) */}
      <div className="row g-4">
        {/* ================= LEFT COLUMN: FILTERS ================= */}
        <div className="col-lg-3">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white sticky-top" style={{ top: '90px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h6
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Filters
              </h6>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn btn-link p-0 text-decoration-none small fw-semibold"
                style={{ color: '#D96B50', fontSize: '13px' }}
              >
                Reset all
              </button>
            </div>

            {/* Mood Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark">Mood</span>
                <span className="text-muted small">∧</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {['Cozy', 'Hopeful', 'Reflective', 'Mindful', 'Adventurous'].map((m) => {
                  const isChecked = selectedMoods.includes(m);
                  return (
                    <label key={m} className="form-check d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer' }}>
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMood(m)}
                        style={{ accentColor: '#D96B50', cursor: 'pointer' }}
                      />
                      <span className="small text-secondary">{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Genre Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark">Genre</span>
                <span className="text-muted small">∧</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {['Contemporary Fiction', 'Fantasy', 'Self-development'].map((g) => {
                  const isChecked = selectedGenres.includes(g);
                  return (
                    <label key={g} className="form-check d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer' }}>
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGenre(g)}
                        style={{ accentColor: '#D96B50', cursor: 'pointer' }}
                      />
                      <span className="small text-secondary">{g}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Language Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark">Language</span>
                <span className="text-muted small">∧</span>
              </div>
              <select
                className="form-select form-select-sm rounded-3 bg-light border"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>

            {/* Reading Length Section */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark">Reading length</span>
                <span className="text-muted small">∧</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { key: 'any', label: 'Any length' },
                  { key: 'under200', label: 'Under 200 pages' },
                  { key: '200-400', label: '200 – 400 pages' }
                ].map((l) => (
                  <label key={l.key} className="form-check d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer' }}>
                    <input
                      className="form-check-input mt-0"
                      type="radio"
                      name="readingLength"
                      checked={selectedLength === l.key}
                      onChange={() => setSelectedLength(l.key)}
                      style={{ accentColor: '#D96B50', cursor: 'pointer' }}
                    />
                    <span className="small text-secondary">{l.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: BOOK RESULTS ================= */}
        <div className="col-lg-9">
          {/* Active Chips & Sort Row */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
            {/* Filter Chips */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              {selectedMoods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMood(m)}
                  className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: '12px' }}
                >
                  <span>{m}</span>
                  <span className="text-muted">✕</span>
                </button>
              ))}

              {selectedMoods.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-link p-0 text-decoration-none small fw-semibold ms-1"
                  style={{ color: '#D96B50', fontSize: '13px' }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort & View Mode */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Sort by</span>
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-3 py-1 text-muted fw-semibold shadow-sm"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <span>Most relevant ▾</span>
              </button>

              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-rv-plum text-white' : 'btn-white border text-muted'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <AiOutlineAppstore size={16} />
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-rv-plum text-white' : 'btn-white border text-muted'}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <AiOutlineUnorderedList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 8 Books Grid (4 Columns) */}
          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 mb-4">
            {searchBooks.map((b) => {
              const isBookmarked = bookmarkedIds.includes(b.id);
              return (
                <div className="col" key={b.id}>
                  <div
                    className="card h-100 border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-column justify-content-between position-relative"
                    style={{ border: '1px solid #ECE4DA' }}
                  >
                    <div>
                      {/* Bookmark button */}
                      <button
                        type="button"
                        className="btn btn-link p-0 position-absolute top-0 end-0 m-3 text-decoration-none"
                        style={{ color: isBookmarked ? '#D96B50' : '#ADB5BD' }}
                        onClick={() => toggleBookmark(b.id)}
                        title="Bookmark"
                      >
                        {isBookmarked ? <BsBookmarkFill size={18} /> : <BsBookmark size={18} />}
                      </button>

                      {/* Cover */}
                      <Link href={`/books/${b.id}`} className="d-block text-center mb-3">
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="rounded-3 shadow-sm img-fluid"
                          style={{ height: '160px', width: 'auto', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/books/midnight-library.jpg';
                          }}
                        />
                      </Link>

                      {/* Title and Author */}
                      <Link href={`/books/${b.id}`} className="text-decoration-none d-block mb-1">
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
                      <div className="text-muted small text-truncate mb-2" style={{ fontSize: '12px' }}>
                        {b.author}
                      </div>

                      {/* Rating */}
                      <div className="d-flex align-items-center gap-1 mb-3">
                        <div className="d-flex text-warning" style={{ fontSize: '12px' }}>
                          <AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar />
                        </div>
                        <span className="small fw-semibold text-muted ms-1" style={{ fontSize: '12px' }}>
                          {b.rating}
                        </span>
                      </div>
                    </div>

                    {/* Mood badge */}
                    <div>
                      <span
                        className="badge rounded-pill px-2.5 py-1"
                        style={{
                          backgroundColor: '#F3EEF7',
                          color: 'var(--rv-ink-plum)',
                          fontSize: '11px',
                          border: '1px solid #E5DCE9'
                        }}
                      >
                        {b.mood}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 pt-3 border-top">
            <span className="text-muted small" style={{ fontSize: '13px' }}>
              Showing 1–8 of 24 books
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-3 py-1 text-muted"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-3 px-3 py-1 ${
                  currentPage === 1 ? 'btn-rv-plum text-white fw-bold' : 'btn-white border text-dark'
                }`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-3 px-3 py-1 ${
                  currentPage === 2 ? 'btn-rv-plum text-white fw-bold' : 'btn-white border text-dark'
                }`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-3 px-3 py-1 ${
                  currentPage === 3 ? 'btn-rv-plum text-white fw-bold' : 'btn-white border text-dark'
                }`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
              <button
                type="button"
                className="btn btn-sm btn-white border rounded-3 px-3 py-1 text-dark"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
