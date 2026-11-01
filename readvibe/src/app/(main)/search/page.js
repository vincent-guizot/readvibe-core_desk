'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineUnorderedList,
  AiOutlineAppstore,
  AiOutlineSearch,
  AiOutlineCloseCircle
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '@/lib/store';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [allBooks, setAllBooks] = useState([]);
  const [wishlistVersion, setWishlistVersion] = useState(0);

  useEffect(() => {
    setAllBooks(readVibeStore.getBooks());
  }, []);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

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
    setSearchQuery('');
  };

  const toggleBookmark = (book) => {
    if (readVibeStore.isInWishlist(book.id)) {
      readVibeStore.removeFromWishlist(book.id);
    } else {
      readVibeStore.addToWishlist({
        bookId: book.id,
        priority: 'Medium',
        reason: 'Saved from search results',
        isPublic: true
      });
    }
    setWishlistVersion((v) => v + 1);
  };

  // Dynamic book filtering
  const filteredBooks = allBooks.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchGenre = book.genre?.toLowerCase().includes(q);
      const matchMoods = book.moods?.some((m) => m.toLowerCase().includes(q));
      const matchSynopsis = book.synopsis?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchGenre && !matchMoods && !matchSynopsis) {
        return false;
      }
    }

    if (selectedMoods.length > 0) {
      const hasMood = book.moods?.some((m) =>
        selectedMoods.some((sm) => m.toLowerCase().includes(sm.toLowerCase()))
      );
      if (!hasMood) return false;
    }

    if (selectedGenres.length > 0) {
      const matchGenre = selectedGenres.some((sg) =>
        book.genre?.toLowerCase().includes(sg.toLowerCase())
      );
      if (!matchGenre) return false;
    }

    return true;
  });

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

      {/* Header Banner & Live Search Input */}
      <div className="mb-4">
        <h1
          className="display-5 fw-bold mb-2"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
        >
          {searchQuery ? `Explore stories for “${searchQuery}”` : 'Find your next chapter.'}
        </h1>
        <p className="text-muted small mb-3" style={{ fontSize: '1rem' }}>
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found based on your vibe & keywords.
        </p>

        {/* Search input in page */}
        <div className="input-group rounded-pill bg-white border shadow-sm px-3 py-2" style={{ maxWidth: '640px' }}>
          <span className="input-group-text bg-transparent border-0 text-muted p-0 me-2">
            <AiOutlineSearch size={20} />
          </span>
          <input
            type="text"
            className="form-control bg-transparent border-0 shadow-none p-0"
            placeholder="Search by title, author, genre, or mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.95rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-link p-0 text-muted border-0"
              onClick={() => setSearchQuery('')}
            >
              <AiOutlineCloseCircle size={18} />
            </button>
          )}
        </div>
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
              {(selectedMoods.length > 0 || selectedGenres.length > 0 || searchQuery) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-link p-0 text-decoration-none small fw-semibold"
                  style={{ color: '#D96B50', fontSize: '13px' }}
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Mood Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark">Mood</span>
                <span className="text-muted small">∧</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {['Cozy', 'Hopeful', 'Reflective', 'Mindful', 'Adventurous', 'Thoughtful'].map((m) => {
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
                      <span className={`small ${isChecked ? 'fw-bold text-dark' : 'text-secondary'}`}>{m}</span>
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
                {['Fiction', 'Self-Development', 'Philosophy', 'Science Fiction'].map((g) => {
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
                      <span className={`small ${isChecked ? 'fw-bold text-dark' : 'text-secondary'}`}>{g}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: BOOK RESULTS ================= */}
        <div className="col-lg-9">
          {/* Active Filter Chips & View Mode */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
            <div className="d-flex flex-wrap align-items-center gap-1.5">
              {selectedMoods.map((m) => (
                <span
                  key={m}
                  className="badge rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{
                    backgroundColor: '#F3EEF7',
                    color: 'var(--rv-ink-plum)',
                    fontSize: '12px',
                    border: '1px solid #E5DCE9'
                  }}
                >
                  {m}
                  <button
                    type="button"
                    className="btn-close p-0 ms-1"
                    style={{ fontSize: '8px' }}
                    onClick={() => toggleMood(m)}
                    aria-label={`Remove ${m}`}
                  />
                </span>
              ))}

              {selectedGenres.map((g) => (
                <span
                  key={g}
                  className="badge rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{
                    backgroundColor: '#F3EEF7',
                    color: 'var(--rv-ink-plum)',
                    fontSize: '12px',
                    border: '1px solid #E5DCE9'
                  }}
                >
                  {g}
                  <button
                    type="button"
                    className="btn-close p-0 ms-1"
                    style={{ fontSize: '8px' }}
                    onClick={() => toggleGenre(g)}
                    aria-label={`Remove ${g}`}
                  />
                </span>
              ))}
            </div>

            {/* View Mode */}
            <div className="d-flex align-items-center gap-2">
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

          {/* Book Cards */}
          {filteredBooks.length === 0 ? (
            <div className="card border-0 rounded-4 shadow-sm bg-white p-5 text-center my-4">
              <div className="display-5 mb-2">🔍</div>
              <h5 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                No books matched your search
              </h5>
              <p className="text-muted small mb-4">
                Try searching with different keywords, moods, or clearing your active filters.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-rv-plum rounded-pill px-4 py-2 fw-semibold"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 mb-4">
              {filteredBooks.map((b) => {
                const isBookmarked = readVibeStore.isInWishlist(b.id);
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
                          className="btn btn-link p-0 position-absolute top-0 end-0 m-3 text-decoration-none shadow-none"
                          style={{
                            color: isBookmarked ? '#D96B50' : '#ADB5BD',
                            fontSize: '20px',
                            transition: 'color 0.2s ease, transform 0.2s ease'
                          }}
                          onClick={() => toggleBookmark(b)}
                          title={isBookmarked ? 'Remove from wishlist' : 'Bookmark to wishlist'}
                        >
                          {isBookmarked ? (
                            <BsBookmarkFill style={{ color: '#D96B50' }} />
                          ) : (
                            <BsBookmark />
                          )}
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
                      <div className="d-flex flex-wrap gap-1">
                        {b.moods?.slice(0, 2).map((m) => (
                          <span
                            key={m}
                            className="badge rounded-pill px-2 py-0.5"
                            style={{
                              backgroundColor: '#F3EEF7',
                              color: 'var(--rv-ink-plum)',
                              fontSize: '11px',
                              border: '1px solid #E5DCE9'
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3 mb-4">
              {filteredBooks.map((b) => {
                const isBookmarked = readVibeStore.isInWishlist(b.id);
                return (
                  <div
                    key={b.id}
                    className="card border-0 rounded-4 shadow-sm bg-white p-3 position-relative"
                    style={{ border: '1px solid #ECE4DA' }}
                  >
                    <div className="row g-3 align-items-center">
                      <div className="col-auto">
                        <Link href={`/books/${b.id}`}>
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="rounded-3 shadow-sm"
                            style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = '/assets/books/midnight-library.jpg';
                            }}
                          />
                        </Link>
                      </div>
                      <div className="col">
                        <Link href={`/books/${b.id}`} className="text-decoration-none">
                          <h6
                            className="fw-bold mb-1"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            {b.title}
                          </h6>
                        </Link>
                        <div className="text-muted small mb-2">{b.author} • {b.genre}</div>
                        <div className="d-flex flex-wrap gap-1">
                          {b.moods?.map((m) => (
                            <span
                              key={m}
                              className="badge rounded-pill px-2 py-0.5"
                              style={{ backgroundColor: '#F3EEF7', color: 'var(--rv-ink-plum)', fontSize: '11px' }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-white border rounded-circle p-2 shadow-sm"
                          style={{ color: isBookmarked ? '#D96B50' : '#ADB5BD' }}
                          onClick={() => toggleBookmark(b)}
                          title={isBookmarked ? 'Remove from wishlist' : 'Bookmark to wishlist'}
                        >
                          {isBookmarked ? <BsBookmarkFill size={16} /> : <BsBookmark size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-danger" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
