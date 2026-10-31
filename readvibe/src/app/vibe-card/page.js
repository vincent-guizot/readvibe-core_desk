'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineLock,
  AiOutlineCheck
} from 'react-icons/ai';
import { readVibeStore } from '../../lib/store';

function VibeCardContent() {
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get('bookId');

  const [finishedBooks, setFinishedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);

  const [theme, setTheme] = useState('Paper'); // 'Paper' | 'Twilight' | 'Botanical'
  const [selectedMoods, setSelectedMoods] = useState(['Reflective', 'Hopeful']);
  const [caption, setCaption] = useState('A gentle reminder that every life holds a little possibility.');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [showMyName, setShowMyName] = useState(true);
  const [showFinishedDate, setShowFinishedDate] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const books = readVibeStore.getBooks();
    const finished = readVibeStore.getFinishedReads();
    setAllBooks(books);
    setFinishedBooks(finished);

    if (bookIdParam) {
      const idx = finished.findIndex((f) => f.bookId === bookIdParam);
      if (idx !== -1) {
        setSelectedBookIndex(idx);
      }
    }
  }, [bookIdParam]);

  const currentFinished = finishedBooks[selectedBookIndex] || {
    bookId: 'midnight-library',
    rating: 4,
    finishedAt: '29 Oct 2026'
  };

  const currentBook = allBooks.find((b) => b.id === currentFinished.bookId) || {
    id: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverUrl: '/assets/books/midnight-library.jpg',
    rating: 4.5
  };

  const handleCycleBook = () => {
    if (finishedBooks.length > 0) {
      setSelectedBookIndex((prev) => (prev + 1) % finishedBooks.length);
    }
  };

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const themeConfig = {
    Paper: {
      bgPosition: '0% center',
      textColor: 'var(--rv-ink-plum)',
      subTextColor: '#756F78',
      pillBg: '#EFE9F4',
      pillText: 'var(--rv-ink-plum)',
      starColor: '#D96B50',
      ornamentColor: '#4A7C59'
    },
    Twilight: {
      bgPosition: '50% center',
      textColor: '#FFFFFF',
      subTextColor: 'rgba(255, 255, 255, 0.85)',
      pillBg: 'rgba(255, 255, 255, 0.2)',
      pillText: '#FFFFFF',
      starColor: '#FFB26B',
      ornamentColor: '#FFD3B6'
    },
    Botanical: {
      bgPosition: '100% center',
      textColor: '#1E2D24',
      subTextColor: '#3E5345',
      pillBg: '#DCE8DF',
      pillText: '#1E2D24',
      starColor: '#D96B50',
      ornamentColor: '#2B4A34'
    }
  };

  const activeThemeProps = themeConfig[theme] || themeConfig.Paper;

  // High-res Canvas export
  const handleDownload = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = '/assets/illustrations/background card themes.png';

    bgImg.onload = () => {
      // Draw 1/3 section corresponding to theme
      const sliceWidth = bgImg.naturalWidth / 3;
      let sx = 0;
      if (theme === 'Twilight') sx = sliceWidth;
      if (theme === 'Botanical') sx = sliceWidth * 2;

      ctx.drawImage(bgImg, sx, 0, sliceWidth, bgImg.naturalHeight, 0, 0, 1080, 1920);

      // Logo
      ctx.textAlign = 'center';
      ctx.fillStyle = activeThemeProps.textColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('📖 ReadVibe', 540, 150);

      // Chapter text
      ctx.font = 'bold 44px serif';
      ctx.fillText('A chapter closed.', 540, 230);
      ctx.fillText('A feeling kept.', 540, 280);

      // Book cover
      const coverImg = new Image();
      coverImg.crossOrigin = 'anonymous';
      coverImg.src = currentBook.coverUrl;
      coverImg.onload = () => {
        const coverW = 340;
        const coverH = 500;
        const coverX = 540 - coverW / 2;
        const coverY = 340;
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 25;
        ctx.drawImage(coverImg, coverX, coverY, coverW, coverH);
        ctx.shadowBlur = 0;

        // Title & Author
        ctx.fillStyle = activeThemeProps.textColor;
        ctx.font = 'bold 54px serif';
        ctx.fillText(currentBook.title, 540, 930);

        ctx.font = '32px sans-serif';
        ctx.fillStyle = activeThemeProps.subTextColor;
        ctx.fillText(currentBook.author, 540, 980);

        // Rating
        ctx.fillStyle = activeThemeProps.starColor;
        ctx.font = '36px sans-serif';
        ctx.fillText('★ ★ ★ ★ ☆', 540, 1040);

        // Mood pills
        ctx.fillStyle = activeThemeProps.pillBg;
        ctx.font = 'bold 28px sans-serif';
        const moodsStr = selectedMoods.join('   •   ');
        ctx.fillText(moodsStr, 540, 1110);

        // Caption
        ctx.fillStyle = activeThemeProps.textColor;
        ctx.font = 'italic 36px serif';
        ctx.fillText(`“${caption}”`, 540, 1260);

        // Footer
        if (showMyName || showFinishedDate) {
          ctx.font = '28px sans-serif';
          ctx.fillStyle = activeThemeProps.subTextColor;
          const userMeta = `${showMyName ? 'Admin ReadVibe' : ''} ${showMyName && showFinishedDate ? '· ' : ''}${showFinishedDate ? '29 Oct 2026' : ''}`;
          ctx.fillText(userMeta, 540, 1750);
          ctx.font = 'italic 24px sans-serif';
          ctx.fillText('Finished reading', 540, 1790);
        }

        // Export PNG
        const link = document.createElement('a');
        link.download = `readvibe-story-${currentBook.title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setDownloading(false);
      };

      coverImg.onerror = () => {
        setDownloading(false);
      };
    };

    bgImg.onerror = () => {
      setDownloading(false);
    };
  };

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/my-reading" className="text-secondary text-decoration-none">
              My Reading
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/finished-reads" className="text-secondary text-decoration-none">
              Finished Reads
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Vibe Card
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h1
          className="display-6 fw-bold mb-1"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
        >
          Your read. Your vibe.
        </h1>
        <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
          Turn a finished book into something worth sharing.
        </p>
      </div>

      <div className="row g-5 align-items-start">
        {/* Left Column: Form Controls */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            {/* Step 1: Your finished read */}
            <div>
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                1. Your finished read
              </h5>
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="rounded-2 shadow-sm"
                    style={{ width: '56px', height: '80px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6
                      className="fw-bold mb-1"
                      style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                    >
                      {currentBook.title}
                    </h6>
                    <small className="text-muted d-block mb-1">{currentBook.author}</small>
                    <div className="d-flex gap-1 text-coral" style={{ color: '#E27D60' }}>
                      <AiFillStar size={14} />
                      <AiFillStar size={14} />
                      <AiFillStar size={14} />
                      <AiFillStar size={14} />
                      <AiOutlineStar size={14} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCycleBook}
                  className="btn btn-link text-decoration-none small fw-semibold"
                  style={{ color: 'var(--rv-ink-plum)', fontSize: '13px' }}
                >
                  Change book
                </button>
              </div>
            </div>

            {/* Step 2: Make it yours */}
            <div>
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                2. Make it yours
              </h5>

              {/* Theme Selector */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">Theme</label>
                <div className="row g-3">
                  {/* Paper */}
                  <div className="col-4">
                    <div
                      onClick={() => setTheme('Paper')}
                      className="rounded-3 overflow-hidden cursor-pointer position-relative transition-all"
                      style={{
                        height: '75px',
                        backgroundImage: "url('/assets/illustrations/themes.png')",
                        backgroundSize: '100% 300%',
                        backgroundPosition: 'center 0%',
                        border: theme === 'Paper' ? '2px solid #D96B50' : '1px solid #EADFD5',
                        cursor: 'pointer'
                      }}
                    />
                    <small className="d-block text-center mt-1 text-muted" style={{ fontSize: '12px' }}>
                      Paper
                    </small>
                  </div>

                  {/* Twilight */}
                  <div className="col-4">
                    <div
                      onClick={() => setTheme('Twilight')}
                      className="rounded-3 overflow-hidden cursor-pointer position-relative transition-all"
                      style={{
                        height: '75px',
                        backgroundImage: "url('/assets/illustrations/themes.png')",
                        backgroundSize: '100% 300%',
                        backgroundPosition: 'center 50%',
                        border: theme === 'Twilight' ? '2px solid #D96B50' : '1px solid #EADFD5',
                        cursor: 'pointer'
                      }}
                    />
                    <small className="d-block text-center mt-1 text-muted" style={{ fontSize: '12px' }}>
                      Twilight
                    </small>
                  </div>

                  {/* Botanical */}
                  <div className="col-4">
                    <div
                      onClick={() => setTheme('Botanical')}
                      className="rounded-3 overflow-hidden cursor-pointer position-relative transition-all"
                      style={{
                        height: '75px',
                        backgroundImage: "url('/assets/illustrations/themes.png')",
                        backgroundSize: '100% 300%',
                        backgroundPosition: 'center 100%',
                        border: theme === 'Botanical' ? '2px solid #D96B50' : '1px solid #EADFD5',
                        cursor: 'pointer'
                      }}
                    />
                    <small className="d-block text-center mt-1 text-muted" style={{ fontSize: '12px' }}>
                      Botanical
                    </small>
                  </div>
                </div>
              </div>

              {/* Mood Selector */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">Mood</label>
                <div className="d-flex flex-wrap gap-2">
                  {['Reflective', 'Hopeful', 'Cozy'].map((m) => {
                    const isSelected = selectedMoods.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMood(m)}
                        className="btn btn-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 transition-all"
                        style={{
                          backgroundColor: isSelected ? '#D96B50' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--rv-ink-plum)',
                          borderColor: isSelected ? '#D96B50' : '#EADFD5',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                      >
                        {isSelected ? <AiOutlineCheck size={12} /> : <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #999' }} />}
                        <span>{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Your caption</label>
                <textarea
                  className="form-control rounded-3"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="A reflection on your journey through this book..."
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Favorite quote */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-1">Favorite quote (optional)</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  placeholder="Add a quote you love..."
                />
              </div>

              {/* Toggles */}
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showNameSwitch"
                    checked={showMyName}
                    onChange={(e) => setShowMyName(e.target.checked)}
                    style={{ accentColor: '#D96B50' }}
                  />
                  <label className="form-check-label small fw-semibold text-dark" htmlFor="showNameSwitch">
                    Show my name
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showDateSwitch"
                    checked={showFinishedDate}
                    onChange={(e) => setShowFinishedDate(e.target.checked)}
                    style={{ accentColor: '#D96B50' }}
                  />
                  <label className="form-check-label small fw-semibold text-dark" htmlFor="showDateSwitch">
                    Show finished date
                  </label>
                </div>
              </div>

              {/* Private notice */}
              <div
                className="p-3 rounded-4 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#F3EEF7', color: 'var(--rv-ink-plum)', fontSize: '13px' }}
              >
                <AiOutlineLock size={16} /> Private reading notes stay private.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live 9:16 Instagram Story Preview */}
        <div className="col-lg-6 d-flex flex-column align-items-center">
          <div className="w-100" style={{ maxWidth: '390px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <span className="small text-uppercase fw-bold text-muted" style={{ letterSpacing: '0.05em', fontSize: '11px' }}>
                LIVE PREVIEW
              </span>
              <span className="small text-muted" style={{ fontSize: '12px' }}>
                Instagram Story · 9:16
              </span>
            </div>

            {/* 9:16 Visual Card Container */}
            <div
              className="rounded-4 overflow-hidden shadow-lg position-relative d-flex flex-column justify-content-between p-4 text-center mx-auto"
              style={{
                width: '100%',
                aspectRatio: '9 / 16',
                backgroundImage: "url('/assets/illustrations/background card themes.png')",
                backgroundSize: '300% 100%',
                backgroundPosition: activeThemeProps.bgPosition,
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Top Branding & Header */}
              <div>
                <div className="d-flex align-items-center justify-content-center gap-1.5 mb-3">
                  <span style={{ fontSize: '18px' }}>📖</span>
                  <span className="fw-bold small" style={{ color: activeThemeProps.textColor, fontFamily: 'var(--font-editorial)', letterSpacing: '0.05em' }}>
                    ReadVibe
                  </span>
                </div>

                <h4
                  className="fw-bold mb-0"
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    color: activeThemeProps.textColor,
                    fontSize: '1.25rem',
                    lineHeight: 1.2
                  }}
                >
                  A chapter closed.
                  <br />
                  A feeling kept.
                </h4>
              </div>

              {/* Book Cover Centerpiece */}
              <div className="my-auto py-2">
                <div className="mb-3">
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="rounded-2 shadow-lg"
                    style={{ width: '130px', height: '185px', objectFit: 'cover' }}
                  />
                </div>

                <h5
                  className="fw-bold mb-0"
                  style={{ fontFamily: 'var(--font-editorial)', color: activeThemeProps.textColor, fontSize: '1.1rem' }}
                >
                  {currentBook.title}
                </h5>
                <small className="d-block mb-2" style={{ color: activeThemeProps.subTextColor, fontSize: '11px' }}>
                  {currentBook.author}
                </small>

                {/* Stars */}
                <div className="d-flex justify-content-center gap-1 mb-2.5" style={{ color: activeThemeProps.starColor }}>
                  <AiFillStar size={14} />
                  <AiFillStar size={14} />
                  <AiFillStar size={14} />
                  <AiFillStar size={14} />
                  <AiOutlineStar size={14} />
                </div>

                {/* Mood Pills */}
                <div className="d-flex justify-content-center flex-wrap gap-1 mb-2">
                  {selectedMoods.map((m) => (
                    <span
                      key={m}
                      className="badge rounded-pill fw-normal px-2.5 py-1"
                      style={{
                        backgroundColor: activeThemeProps.pillBg,
                        color: activeThemeProps.pillText,
                        fontSize: '10px'
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Leaf divider */}
                <div className="my-2" style={{ fontSize: '12px' }}>🌿</div>

                {/* Caption */}
                <p
                  className="fst-italic px-3 mb-1"
                  style={{
                    color: activeThemeProps.textColor,
                    fontFamily: 'var(--font-editorial)',
                    fontSize: '0.88rem',
                    lineHeight: 1.35
                  }}
                >
                  &ldquo;{caption}&rdquo;
                </p>

                {/* Leaf divider */}
                <div className="my-2" style={{ fontSize: '12px' }}>🌿</div>
              </div>

              {/* Card Footer */}
              <div>
                {showMyName && (
                  <p className="fw-semibold mb-0" style={{ color: activeThemeProps.textColor, fontSize: '11px' }}>
                    Admin ReadVibe {showFinishedDate ? '· 29 Oct 2026' : ''}
                  </p>
                )}
                <small style={{ color: activeThemeProps.subTextColor, fontSize: '10px' }}>
                  Finished reading
                </small>
              </div>
            </div>

            {/* Bottom Meta & Actions */}
            <div className="text-center mt-3">
              <small className="text-muted d-block mb-3" style={{ fontSize: '11px' }}>
                PNG · 1080 × 1920 · No private notes
              </small>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn rounded-pill py-2.5 px-4 flex-grow-1 fw-semibold text-white d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#D96B50' }}
                >
                  <AiOutlineDownload size={18} />
                  {downloading ? 'Preparing PNG...' : 'Download PNG'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `ReadVibe: ${currentBook.title}`,
                        text: caption,
                        url: window.location.href
                      });
                    } else {
                      alert('Share link copied to clipboard!');
                    }
                  }}
                  className="btn btn-outline-secondary rounded-pill py-2.5 px-4 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ borderColor: 'var(--rv-ink-plum)', color: 'var(--rv-ink-plum)', backgroundColor: '#FFFFFF' }}
                >
                  <AiOutlineShareAlt size={18} /> Share Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VibeCardPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading Vibe Card Generator...</div>}>
      <VibeCardContent />
    </Suspense>
  );
}