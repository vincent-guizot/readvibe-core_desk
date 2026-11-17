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
  AiOutlineCheck,
  AiOutlineCopy,
} from 'react-icons/ai';
import { useReading, useBooks, useAuth } from '@/hooks';
import { readVibeStore } from '@/lib/store';
import VibeCardPreview from '@/components/books/VibeCardPreview';

function VibeCardContent() {
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get('bookId');

  const { finishedReads } = useReading();
  const { books: allBooks } = useBooks();
  const { user } = useAuth();

  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [theme, setTheme] = useState('Paper'); // 'Paper' | 'Twilight' | 'Botanical' | 'Sunset'
  const [rating, setRating] = useState(5);
  const [selectedMoods, setSelectedMoods] = useState(['Reflective', 'Hopeful']);
  const [caption, setCaption] = useState('A gentle reminder that every life holds a little possibility.');
  const [showMyName, setShowMyName] = useState(true);
  const [showFinishedDate, setShowFinishedDate] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef(null);

  // Sync finished reads
  const activeFinishedList = finishedReads && finishedReads.length > 0
    ? finishedReads
    : readVibeStore.getFinishedReads();

  useEffect(() => {
    if (bookIdParam && activeFinishedList.length > 0) {
      const idx = activeFinishedList.findIndex((f) => f.bookId === bookIdParam);
      if (idx !== -1) {
        setSelectedBookIndex(idx);
        if (activeFinishedList[idx].rating) setRating(activeFinishedList[idx].rating);
        if (activeFinishedList[idx].moods) setSelectedMoods(activeFinishedList[idx].moods);
        if (activeFinishedList[idx].favoriteQuote) setCaption(activeFinishedList[idx].favoriteQuote);
        if (activeFinishedList[idx].vibeCardTheme) setTheme(activeFinishedList[idx].vibeCardTheme);
      }
    }
  }, [bookIdParam, activeFinishedList]);

  const currentFinished = activeFinishedList[selectedBookIndex] || {
    bookId: 'midnight-library',
    rating: 5,
    finishedAt: 'Recently',
  };

  const currentBook = allBooks.find((b) => b.id === currentFinished.bookId || b.slug === currentFinished.bookId) || {
    id: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverUrl: '/assets/books/midnight-library.jpg',
    rating: 4.5,
    quote: 'Between life and death there is a library, and within that library, the shelves go on forever.',
    moods: ['Reflective', 'Hopeful', 'Cozy'],
  };

  const handleCycleBook = () => {
    if (activeFinishedList.length > 0) {
      const nextIdx = (selectedBookIndex + 1) % activeFinishedList.length;
      setSelectedBookIndex(nextIdx);
      const nextItem = activeFinishedList[nextIdx];
      if (nextItem.rating) setRating(nextItem.rating);
      if (nextItem.moods) setSelectedMoods(nextItem.moods);
      if (nextItem.favoriteQuote) setCaption(nextItem.favoriteQuote);
      if (nextItem.vibeCardTheme) setTheme(nextItem.vibeCardTheme);
    }
  };

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/vibe-card?bookId=${currentBook.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  // High-res Canvas export (1080x1920 Instagram Story format)
  const handleDownload = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Theme color palette
    const themePalettes = {
      Paper: {
        gradient: ['#FFFDF9', '#F4EDE4'],
        text: '#35233F',
        sub: '#756F78',
        star: '#EF786B',
        pillBg: '#EFE8DE',
      },
      Twilight: {
        gradient: ['#2E1B38', '#140A18'],
        text: '#FFFFFF',
        sub: '#CCCCCC',
        star: '#FFB26B',
        pillBg: '#3E274A',
      },
      Botanical: {
        gradient: ['#2C3E33', '#16231B'],
        text: '#FFFFFF',
        sub: '#B5C7BC',
        star: '#FFD3B6',
        pillBg: '#3C5245',
      },
      Sunset: {
        gradient: ['#F97769', '#782645'],
        text: '#FFFFFF',
        sub: '#FCE7DF',
        star: '#FFE082',
        pillBg: '#9A3A5A',
      },
    };

    const palette = themePalettes[theme] || themePalettes.Paper;

    // Draw background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, palette.gradient[0]);
    bgGrad.addColorStop(1, palette.gradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative radial glow
    const radial = ctx.createRadialGradient(900, 150, 20, 900, 150, 450);
    radial.addColorStop(0, 'rgba(239, 120, 107, 0.35)');
    radial.addColorStop(1, 'rgba(239, 120, 107, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(900, 150, 450, 0, Math.PI * 2);
    ctx.fill();

    // Brand Header
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.text;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('📖  READVIBE WRAPPED', 540, 160);

    ctx.font = 'bold 52px serif';
    ctx.fillText('A chapter closed.', 540, 250);
    ctx.fillText('A feeling kept.', 540, 315);

    // Load Book Cover
    const coverImg = new Image();
    coverImg.crossOrigin = 'anonymous';
    coverImg.src = currentBook.coverUrl;

    const renderRemainingContent = () => {
      // Title & Author
      ctx.fillStyle = palette.text;
      ctx.font = 'bold 56px serif';
      ctx.fillText(currentBook.title, 540, 1040);

      ctx.font = '34px sans-serif';
      ctx.fillStyle = palette.sub;
      ctx.fillText(currentBook.author, 540, 1100);

      // Stars
      ctx.fillStyle = palette.star;
      ctx.font = '40px sans-serif';
      const starString = '★ '.repeat(rating) + '☆ '.repeat(Math.max(0, 5 - rating));
      ctx.fillText(starString.trim(), 540, 1170);

      // Mood Pills
      if (selectedMoods.length > 0) {
        ctx.fillStyle = palette.pillBg;
        ctx.font = 'bold 28px sans-serif';
        const moodsStr = selectedMoods.map((m) => `✦ ${m}`).join('    ');
        ctx.fillText(moodsStr, 540, 1250);
      }

      // Caption
      if (caption) {
        ctx.fillStyle = palette.text;
        ctx.font = 'italic 38px serif';
        ctx.fillText(`“${caption}”`, 540, 1420);
      }

      // Footer
      if (showMyName || showFinishedDate) {
        ctx.font = '30px sans-serif';
        ctx.fillStyle = palette.sub;
        const displayName = user?.name || 'Reader';
        const displayHandle = user?.username ? `@${user.username}` : '';
        const userMeta = `${showMyName ? `${displayName} (${displayHandle})` : ''} ${
          showMyName && showFinishedDate ? '· ' : ''
        }${showFinishedDate ? `Finished ${currentFinished.finishedAt || 'Recently'}` : ''}`;
        ctx.fillText(userMeta, 540, 1750);

        ctx.font = '24px sans-serif';
        ctx.fillText('readvibe.app', 540, 1800);
      }

      // Download
      const link = document.createElement('a');
      link.download = `readvibe-story-${currentBook.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };

    coverImg.onload = () => {
      const coverW = 360;
      const coverH = 530;
      const coverX = 540 - coverW / 2;
      const coverY = 410;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 15;
      ctx.drawImage(coverImg, coverX, coverY, coverW, coverH);
      ctx.restore();

      renderRemainingContent();
    };

    coverImg.onerror = () => {
      renderRemainingContent();
    };
  };

  const sampleThemes = [
    { id: 'Paper', name: 'Warm Paper', bg: 'linear-gradient(135deg, #FFF9F2 0%, #F5EDE4 100%)', text: '#35233F' },
    { id: 'Twilight', name: 'Twilight Plum', bg: 'linear-gradient(165deg, #2D1B36 0%, #150C1B 100%)', text: '#FFFFFF' },
    { id: 'Botanical', name: 'Botanical Sage', bg: 'linear-gradient(150deg, #2C3D32 0%, #17241C 100%)', text: '#FFFFFF' },
    { id: 'Sunset', name: 'Sunset Glow', bg: 'linear-gradient(150deg, #F97769 0%, #7E294A 100%)', text: '#FFFFFF' },
  ];

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
          Turn your finished books into an aesthetic 9:16 social story card (#ReadVibeWrapped).
        </p>
      </div>

      <div className="row g-5 align-items-start">
        {/* Left Column: Form Controls */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            {/* Step 1: Your finished read */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="fw-bold mb-0 rv-editorial" style={{ color: 'var(--rv-ink-plum)' }}>
                  1. Finished Book
                </h5>
                <button
                  type="button"
                  onClick={handleCycleBook}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
                  style={{ fontSize: '12px' }}
                >
                  Switch Book ({selectedBookIndex + 1}/{Math.max(1, activeFinishedList.length)})
                </button>
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="rounded-2 shadow-sm"
                    style={{ width: '56px', height: '80px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1 rv-editorial" style={{ color: 'var(--rv-ink-plum)' }}>
                      {currentBook.title}
                    </h6>
                    <small className="text-muted d-block mb-1">{currentBook.author}</small>
                    <div className="d-flex gap-1" style={{ color: '#EF786B' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} style={{ cursor: 'pointer' }} onClick={() => setRating(s)}>
                          {s <= rating ? <AiFillStar size={14} /> : <AiOutlineStar size={14} />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Make it yours */}
            <div>
              <h5 className="fw-bold mb-3 rv-editorial" style={{ color: 'var(--rv-ink-plum)' }}>
                2. Customize Visuals
              </h5>

              {/* Theme Selector */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">Color Atmosphere</label>
                <div className="row g-2">
                  {sampleThemes.map((t) => (
                    <div className="col-3" key={t.id}>
                      <div
                        onClick={() => setTheme(t.id)}
                        className="rounded-3 p-2 text-center position-relative transition-all"
                        style={{
                          height: '70px',
                          background: t.bg,
                          color: t.text,
                          border: theme === t.id ? '2.5px solid #EF786B' : '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: theme === t.id ? '0 4px 12px rgba(239, 120, 107, 0.3)' : 'none',
                        }}
                      >
                        <span className="fw-bold small" style={{ fontSize: '11px' }}>
                          {t.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Selector */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">Vibe Tags</label>
                <div className="d-flex flex-wrap gap-2">
                  {['Reflective', 'Hopeful', 'Cozy', 'Mindful', 'Bittersweet', 'Thoughtful', 'Warm & Healing'].map((m) => {
                    const isSelected = selectedMoods.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMood(m)}
                        className={`btn btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 ${
                          isSelected ? 'btn-rv-coral' : 'btn-outline-secondary'
                        }`}
                        style={{ fontSize: '12px' }}
                      >
                        {isSelected && <AiOutlineCheck size={12} />}
                        <span>✦ {m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption & Quote Picker */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-dark mb-0">Reflection / Favorite Quote</label>
                  {currentBook.quote && (
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small text-coral"
                      style={{ fontSize: '11px', color: '#EF786B' }}
                      onClick={() => setCaption(currentBook.quote)}
                    >
                      Use book quote ↗
                    </button>
                  )}
                </div>
                <textarea
                  className="form-control rounded-3"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="A reflection on your journey through this book..."
                  style={{ resize: 'none' }}
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
                  />
                  <label className="form-check-label small fw-semibold text-dark" htmlFor="showNameSwitch">
                    Show reader identity
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showDateSwitch"
                    checked={showFinishedDate}
                    onChange={(e) => setShowFinishedDate(e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold text-dark" htmlFor="showDateSwitch">
                    Show completed date
                  </label>
                </div>
              </div>

              {/* Privacy notice */}
              <div
                className="p-3 rounded-4 d-flex align-items-center gap-2 small"
                style={{ backgroundColor: '#F3EEF7', color: 'var(--rv-ink-plum)' }}
              >
                <AiOutlineLock size={16} /> Private notes remain private. Only your chosen quote and vibes appear on the card.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live 9:16 Preview */}
        <div className="col-lg-6 d-flex flex-column align-items-center">
          <div className="w-100" style={{ maxWidth: '360px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <span className="small text-uppercase fw-bold text-muted" style={{ letterSpacing: '0.08em', fontSize: '11px' }}>
                LIVE PREVIEW
              </span>
              <span className="small text-muted" style={{ fontSize: '12px' }}>
                Story 9:16
              </span>
            </div>

            {/* Reusable VibeCardPreview component */}
            <VibeCardPreview
              book={currentBook}
              theme={theme}
              rating={rating}
              moods={selectedMoods}
              caption={caption}
              userName={user?.name || 'Reader'}
              userHandle={user?.username || 'reader'}
              finishedDate={currentFinished.finishedAt || 'Recently'}
              showName={showMyName}
              showDate={showFinishedDate}
              interactive={true}
              onRatingChange={(newRating) => setRating(newRating)}
              cardRef={cardRef}
            />

            {/* Export & Sharing CTAs */}
            <div className="d-flex gap-2 mt-4 w-100">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-rv-plum flex-grow-1 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              >
                <AiOutlineDownload size={18} />
                <span>{downloading ? 'Rendering Image...' : 'Save 9:16 Story'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-outline-secondary py-2 px-3 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                title="Copy share link"
              >
                {copied ? <AiOutlineCheck className="text-success" size={16} /> : <AiOutlineCopy size={16} />}
                <span className="small">{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VibeCardPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading Vibe Card...</div>}>
      <VibeCardContent />
    </Suspense>
  );
}
