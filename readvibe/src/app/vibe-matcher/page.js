'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineReload,
  AiOutlineLock,
  AiOutlineInfoCircle,
  AiOutlineCheck
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '../../lib/store';
import AddToWishlistModal from '../../components/AddToWishlistModal';

export default function VibeMatcherPage() {
  const router = useRouter();
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Any genre');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLength, setSelectedLength] = useState('Under 300 pages');
  const [hideFinished, setHideFinished] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [wishlistModalBook, setWishlistModalBook] = useState(null);
  const [savedWishlistIds, setSavedWishlistIds] = useState([]);

  // Exact 3 matched books from ai vibe matcher.png
  const [matches, setMatches] = useState([
    {
      id: 'the-comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      rating: '4.3',
      reviews: '42,129',
      category: 'Nonfiction',
      tag: 'Comforting',
      matchScore: '92% match',
      isTopPick: true,
      coverUrl: '/assets/books/comfort-book.jpg',
      whyFits:
        'A collection of short, thoughtful reflections that offer warmth, perspective and quiet reassurance, perfect for a gentle and hopeful read.'
    },
    {
      id: 'psalm-wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      rating: '4.3',
      reviews: '86,614',
      category: 'Science Fiction',
      tag: 'Hopeful',
      matchScore: '89% match',
      isTopPick: false,
      coverUrl: '/assets/books/wild-built.jpg',
      whyFits:
        'A quiet, uplifting story about a person seeking a slower, more meaningful life, with a gentle, reflective tone throughout.'
    },
    {
      id: 'before-the-coffee-gets-cold',
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      rating: '4.4',
      reviews: '72,936',
      category: 'Fiction',
      tag: 'Contemplative',
      matchScore: '85% match',
      isTopPick: false,
      coverUrl: '/assets/books/coffee-cold.jpg',
      whyFits:
        'A tender, character-driven novel with a calm, reflective mood that lingers long after the last page.'
    }
  ]);

  const moodList = [
    { key: 'Cozy', label: 'Cozy', icon: '🪑' },
    { key: 'Reflective', label: 'Reflective', icon: '🍃' },
    { key: 'Hopeful', label: 'Hopeful', icon: '☀️' },
    { key: 'Mindful', label: 'Mindful', icon: '🪷' },
    { key: 'Adventurous', label: 'Adventurous', icon: '⛰️' },
    { key: 'Need a laugh', label: 'Need a laugh', icon: '😊' }
  ];

  const toggleMood = (key) => {
    if (selectedMoods.includes(key)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== key));
    } else {
      setSelectedMoods([...selectedMoods, key]);
    }
  };

  const handleReset = () => {
    setSelectedMoods([]);
    setPromptText('');
    setSelectedGenre('Any genre');
    setSelectedLanguage('English');
    setSelectedLength('Under 300 pages');
  };

  const handleFindNextRead = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await fetch('http://localhost:3360/api/recommendations/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodTags: selectedMoods,
          queryText: promptText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.matches && data.data.matches.length > 0) {
        const mapped = data.data.matches.map((m, idx) => ({
          id: m.book.slug || m.book.id,
          title: m.book.title,
          author: m.book.author?.name || m.book.author?.pen_name || 'Penulis',
          rating: '4.5',
          reviews: '1,200',
          category: m.book.genre?.name || 'Literature',
          tag: m.book.moods?.[0]?.name || selectedMoods[0] || 'Curated',
          matchScore: `${m.matchScore}% match`,
          isTopPick: idx === 0,
          coverUrl: m.book.image || '/assets/books/comfort-book.jpg',
          whyFits: m.reason,
        }));
        setMatches(mapped);
      }
    } catch (err) {
      console.warn('Vibe Matcher fallback:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSaveWishlist = (book) => {
    if (savedWishlistIds.includes(book.id)) {
      setSavedWishlistIds(savedWishlistIds.filter((bId) => bId !== book.id));
    } else {
      setWishlistModalBook(book);
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
            AI Vibe Matcher
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <span
            className="small fw-bold d-block text-uppercase mb-1"
            style={{ color: '#D96B50', letterSpacing: '0.12em', fontSize: '12px' }}
          >
            ✦ AI VIBE MATCHER
          </span>
          <h1
            className="display-5 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            A book for the way you feel.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '1.05rem' }}>
            Tell us what is on your mind. Discover a story that meets you there.
          </p>
        </div>

        {/* Right Header Artwork */}
        <div className="d-none d-lg-block flex-shrink-0">
          <span style={{ fontSize: '3rem', userSelect: 'none' }}>
            🌿🌸
          </span>
        </div>
      </div>

      {/* Main Grid: Form on Left (col-lg-5), Results on Right (col-lg-7) */}
      <div className="row g-4">
        {/* ================= LEFT COLUMN: VIBE INPUT FORM ================= */}
        <div className="col-lg-5">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white" style={{ border: '1px solid #ECE4DA' }}>
            <form onSubmit={handleFindNextRead}>
              {/* What is your vibe today? */}
              <div className="mb-4">
                <h5
                  className="fw-bold mb-3"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  What is your vibe today?
                </h5>
                <div className="row g-2">
                  {moodList.map((m) => {
                    const isSelected = selectedMoods.includes(m.key);
                    return (
                      <div className="col-6" key={m.key}>
                        <button
                          type="button"
                          onClick={() => toggleMood(m.key)}
                          className="btn w-100 rounded-3 py-2 px-2.5 text-start border transition-all d-flex align-items-center gap-1.5"
                          style={{
                            backgroundColor: isSelected ? 'var(--rv-ink-plum)' : '#F8F5FA',
                            borderColor: isSelected ? 'var(--rv-ink-plum)' : '#ECE4DA',
                            color: isSelected ? '#FFFFFF' : 'var(--rv-ink-plum)',
                            fontSize: '13px',
                            fontWeight: isSelected ? 600 : 500
                          }}
                        >
                          {isSelected ? <span>✓</span> : <span>{m.icon}</span>}
                          <span>{m.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Or tell us in your own words */}
              <div className="mb-4">
                <h5
                  className="fw-bold mb-2"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Or tell us in your own words
                </h5>
                <textarea
                  className="form-control rounded-3"
                  rows={3}
                  maxLength={500}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="It has been a long week. I would love something warm, gentle, and a little hopeful."
                  style={{ fontSize: '13px', borderColor: '#EAE2D8' }}
                />
                <div className="text-end text-muted small mt-1" style={{ fontSize: '11px' }}>
                  {promptText.length} / 500
                </div>
              </div>

              {/* Optional preferences */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark small mb-2">Optional preferences</h6>
                <div className="row g-2 mb-2">
                  <div className="col-sm-4">
                    <label className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Genre</label>
                    <select
                      className="form-select form-select-sm rounded-3 bg-light border"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                      <option>Any genre</option>
                      <option>Fiction</option>
                      <option>Nonfiction</option>
                      <option>Fantasy</option>
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Language</label>
                    <select
                      className="form-select form-select-sm rounded-3 bg-light border"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option>English</option>
                      <option>Indonesian</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Reading length</label>
                    <select
                      className="form-select form-select-sm rounded-3 bg-light border"
                      value={selectedLength}
                      onChange={(e) => setSelectedLength(e.target.value)}
                    >
                      <option>Under 300 pages</option>
                      <option>300 - 500 pages</option>
                      <option>Any length</option>
                    </select>
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hideFinishedCheck"
                    checked={hideFinished}
                    onChange={(e) => setHideFinished(e.target.checked)}
                    style={{ accentColor: 'var(--rv-ink-plum)', cursor: 'pointer' }}
                  />
                  <label
                    className="form-check-label small text-dark fw-semibold"
                    htmlFor="hideFinishedCheck"
                    style={{ cursor: 'pointer' }}
                  >
                    Hide books I have finished
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-rv-plum w-100 rounded-3 py-2.5 fw-bold shadow-sm mb-3 d-inline-flex align-items-center justify-content-center gap-2"
              >
                <span>✨</span>
                <span>{isSearching ? 'Finding your stories...' : 'Find my next read'}</span>
              </button>

              <div className="d-flex align-items-center justify-content-center gap-1.5 text-muted small mb-4" style={{ fontSize: '12px' }}>
                <AiOutlineLock size={13} />
                <span>Your words are used to personalize this recommendation.</span>
              </div>

              {/* Tip Callout Box */}
              <div
                className="p-3 rounded-3 d-flex align-items-start gap-2.5 border"
                style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
              >
                <span style={{ fontSize: '18px' }}>💡</span>
                <div>
                  <div className="small fw-bold text-dark">
                    A little detail goes a long way.
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    Try sharing your mood or the kind of story you need.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MATCHED RESULTS ================= */}
        <div className="col-lg-7">
          {/* Results Header */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
            <div>
              <h4
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your next chapter awaits
              </h4>
              <p className="text-muted small mb-2">
                3 books matched to your vibe
              </p>

              <div className="d-flex flex-wrap gap-1.5">
                <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: '#FEECE8', color: '#D96B50', fontSize: '11px' }}>
                  🪑 Cozy
                </span>
                <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: '#FFF5EB', color: '#E27D60', fontSize: '11px' }}>
                  ☀️ Hopeful
                </span>
                <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: '#EBF4ED', color: '#5C826A', fontSize: '11px' }}>
                  🍃 Gentle pace
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 text-muted fw-semibold d-inline-flex align-items-center gap-1 shadow-sm align-self-start"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <AiOutlineReload size={14} /> Reset
            </button>
          </div>

          {/* Cards List */}
          <div className="d-flex flex-column gap-3 mb-4">
            {matches.map((b) => {
              const isSaved = savedWishlistIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className="card border-0 rounded-4 shadow-sm p-4 bg-white position-relative"
                  style={{
                    border: b.isTopPick ? '2px solid #E87A65' : '1px solid #ECE4DA'
                  }}
                >
                  {/* Top Badges */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      {b.isTopPick && (
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-bold text-white"
                          style={{ backgroundColor: '#D96B50', fontSize: '10px', letterSpacing: '0.05em' }}
                        >
                          TOP PICK
                        </span>
                      )}
                    </div>
                    <div>
                      <span
                        className="badge rounded-pill px-2.5 py-1 fw-bold"
                        style={{ backgroundColor: '#E2F0E5', color: '#2B5E3B', fontSize: '12px' }}
                      >
                        {b.matchScore}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3">
                    {/* Cover */}
                    <div className="col-auto">
                      <Link href={`/books/${b.id}`}>
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="rounded-3 shadow-sm"
                          style={{ width: '84px', height: '122px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/books/midnight-library.jpg';
                          }}
                        />
                      </Link>
                    </div>

                    {/* Metadata & Why this fits */}
                    <div className="col">
                      <Link href={`/books/${b.id}`} className="text-decoration-none">
                        <h5
                          className="fw-bold mb-0"
                          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                        >
                          {b.title}
                        </h5>
                      </Link>
                      <div className="text-muted small mb-1">{b.author}</div>

                      {/* Rating and category */}
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2 text-muted small" style={{ fontSize: '12px' }}>
                        <div className="d-flex align-items-center text-warning" style={{ fontSize: '11px' }}>
                          <AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar />
                          <span className="ms-1 text-dark fw-semibold">{b.rating}</span>
                          <span className="ms-0.5 text-muted">({b.reviews})</span>
                        </div>
                        <span>|</span>
                        <span className="badge rounded-pill px-2 py-0.5" style={{ backgroundColor: '#F3EEF7', color: 'var(--rv-ink-plum)', fontSize: '10px' }}>
                          {b.category}
                        </span>
                        <span className="badge rounded-pill px-2 py-0.5" style={{ backgroundColor: '#FEECE8', color: '#D96B50', fontSize: '10px' }}>
                          {b.tag}
                        </span>
                      </div>

                      {/* Why this fits your vibe */}
                      <div className="mb-2">
                        <span className="small fw-bold d-block text-dark" style={{ fontSize: '12px' }}>
                          Why this fits your vibe
                        </span>
                        <p className="text-secondary small mb-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          {b.whyFits}
                        </p>
                      </div>
                    </div>

                    {/* Wishlist and View Buttons */}
                    <div className="col-12 col-md-auto d-flex flex-column align-items-md-end justify-content-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSaveWishlist(b)}
                        className="btn btn-sm btn-white border rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)', fontSize: '13px' }}
                      >
                        {isSaved ? <BsBookmarkFill size={13} style={{ color: '#D96B50' }} /> : <BsBookmark size={13} />}
                        <span>Wishlist</span>
                      </button>

                      <Link
                        href={`/books/${b.id}`}
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

          <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '12px' }}>
            <AiOutlineInfoCircle size={14} />
            <span>Match scores reflect reading preferences and mood tags.</span>
          </div>
        </div>
      </div>

      {/* Add To Wishlist Modal */}
      {wishlistModalBook && (
        <AddToWishlistModal
          book={wishlistModalBook}
          isOpen={true}
          onClose={() => setWishlistModalBook(null)}
          onSaved={() => {
            setSavedWishlistIds([...savedWishlistIds, wishlistModalBook.id]);
            setWishlistModalBook(null);
          }}
        />
      )}
    </div>
  );
}
