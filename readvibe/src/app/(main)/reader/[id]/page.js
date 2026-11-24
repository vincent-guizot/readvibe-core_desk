'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooks, useReading, useAuth } from '@/hooks';
import UpdateProgressModal from '@/components/UpdateProgressModal';
import FinishBookModal from '@/components/FinishBookModal';

const THEMES = {
  paper: {
    id: 'paper',
    name: 'Warm Paper',
    bg: '#FAF7F2',
    cardBg: '#FFFFFF',
    text: '#2B132C',
    subtext: '#6C757D',
    border: '#EADFD5',
    plum: '#2B132C',
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia Classic',
    bg: '#F4ECD8',
    cardBg: '#FAF4E8',
    text: '#433022',
    subtext: '#766153',
    border: '#DFD1B8',
    plum: '#523B2A',
  },
  plum: {
    id: 'plum',
    name: 'Night Plum',
    bg: '#1E1420',
    cardBg: '#2A1D2D',
    text: '#FAF7F2',
    subtext: '#BCA8CB',
    border: '#3D2B42',
    plum: '#E27D60',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal Dark',
    bg: '#121212',
    cardBg: '#1E1E1E',
    text: '#E0E0E0',
    subtext: '#9E9E9E',
    border: '#2C2C2C',
    plum: '#D96B50',
  },
};

const FONT_SIZES = {
  sm: { label: 'A-', size: '15px', lineHeight: '1.6' },
  md: { label: 'A', size: '17px', lineHeight: '1.75' },
  lg: { label: 'A+', size: '20px', lineHeight: '1.85' },
  xl: { label: 'A++', size: '23px', lineHeight: '1.95' },
};

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { getBookById, status: catalogStatus } = useBooks();
  const { getBookProgress, isBookFinished, status, startBook, updateBookProgress } = useReading();
  const { isAuthenticated } = useAuth();
  const [editingProgress, setEditingProgress] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Reader preferences
  const [themeKey, setThemeKey] = useState('paper');
  const [fontSizeKey, setFontSizeKey] = useState('md');
  const [maxWidth, setMaxWidth] = useState(800);
  const [selectedQuote, setSelectedQuote] = useState('');
  const [quickUpdating, setQuickUpdating] = useState(false);

  const book = getBookById(params?.id);
  const progress = book && getBookProgress(book.id);
  const finished = book && isBookFinished(book.id);

  const currentTheme = THEMES[themeKey] || THEMES.paper;
  const currentFont = FONT_SIZES[fontSizeKey] || FONT_SIZES.md;

  if (!book && ['idle', 'loading'].includes(catalogStatus)) return <p role="status" className="p-4">Loading book…</p>;
  if (!book) return <div className="container py-5"><h1>Book not found</h1><Link href="/discover">Discover books</Link></div>;

  let previewUrl = '';
  try {
    const url = new URL(book.previewLink);
    if (['https:', 'http:'].includes(url.protocol)) previewUrl = url.href;
  } catch { /* A book without a provider preview remains a reading tracker. */ }

  const totalPages = book.pages || progress?.totalPages || 0;
  const currentPage = progress?.currentPage || 0;
  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  const handleQuickPageAdd = async (increment) => {
    if (!progress || quickUpdating) return;
    const newPage = Math.min(totalPages || 9999, currentPage + increment);
    setQuickUpdating(true);
    try {
      await updateBookProgress(book.id, newPage, progress.notes);
    } finally {
      setQuickUpdating(false);
    }
  };

  const handleCreateVibeCardWithQuote = () => {
    if (!isAuthenticated || (!progress && !finished)) return;
    const query = new URLSearchParams({ bookId: String(book.id) });
    if (selectedQuote) query.set('quote', selectedQuote);
    router.push(`/vibe-card?${query.toString()}`);
  };

  return (
    <div
      className="min-vh-100 py-4 transition-all"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <div className="container" style={{ maxWidth: `${maxWidth}px` }}>
        {/* Top Navigation & Reader Customizer Toolbar */}
        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4 mb-4 shadow-sm"
          style={{
            backgroundColor: currentTheme.cardBg,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/my-reading"
              className="text-decoration-none fw-semibold small"
              style={{ color: currentTheme.plum }}
            >
              ← My Reading
            </Link>
            <span style={{ color: currentTheme.subtext }}>•</span>
            <Link
              href={`/books/${book.id}`}
              className="text-decoration-none small"
              style={{ color: currentTheme.subtext }}
            >
              Book Details
            </Link>
          </div>

          {/* Preferences: Themes, Font Size, Width */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Theme Selector */}
            <div className="btn-group btn-group-sm" role="group" aria-label="Reading theme">
              {Object.values(THEMES).map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  className={`btn btn-sm ${themeKey === thm.id ? 'fw-bold' : ''}`}
                  style={{
                    backgroundColor: thm.bg,
                    color: thm.text,
                    borderColor: themeKey === thm.id ? currentTheme.plum : thm.border,
                    borderWidth: themeKey === thm.id ? '2px' : '1px',
                    fontSize: '12px',
                    padding: '4px 10px',
                  }}
                  onClick={() => setThemeKey(thm.id)}
                  title={thm.name}
                >
                  {thm.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Font Size Selector */}
            <div className="btn-group btn-group-sm" role="group" aria-label="Text size">
              {Object.entries(FONT_SIZES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: fontSizeKey === key ? currentTheme.plum : currentTheme.cardBg,
                    color: fontSizeKey === key ? '#FFFFFF' : currentTheme.text,
                    borderColor: currentTheme.border,
                    fontSize: '12px',
                  }}
                  onClick={() => setFontSizeKey(key)}
                  title={item.label}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Reading Width Toggle */}
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: currentTheme.cardBg,
                color: currentTheme.text,
                borderColor: currentTheme.border,
                fontSize: '12px',
              }}
              onClick={() => setMaxWidth((prev) => (prev === 800 ? 1000 : 800))}
              title="Toggle Reading Width"
            >
              {maxWidth === 800 ? '↔ Wide' : '↔ Standard'}
            </button>
          </div>
        </div>

        {/* Book Header */}
        <div className="mb-4">
          <h1 className="mt-2 fw-bold" style={{ fontFamily: 'var(--font-editorial)' }}>
            {book.title}
          </h1>
          <p style={{ color: currentTheme.subtext }}>{book.author}</p>
        </div>

        {/* Book Preview Section */}
        <div
          className="card p-4 mb-4 rounded-4 shadow-sm"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.border,
            color: currentTheme.text,
          }}
        >
          <h2 className="h5 fw-bold mb-3">Book preview</h2>
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm d-inline-block align-self-start text-white mb-2"
              style={{ backgroundColor: currentTheme.plum }}
            >
              Open publisher preview
            </a>
          ) : (
            <p className="mb-0">
              A digital preview is not available for this book. Track your reading from your own copy below.
            </p>
          )}
        </div>

        {/* Book Synopsis & Immersive Content */}
        {book.synopsis && (
          <div
            className="card p-4 mb-4 rounded-4 shadow-sm"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.border,
              color: currentTheme.text,
            }}
          >
            <h2 className="h5 fw-bold mb-3">Synopsis & Overview</h2>
            <div
              style={{
                fontSize: currentFont.size,
                lineHeight: currentFont.lineHeight,
                textAlign: 'justify',
              }}
            >
              <p className="mt-3 mb-0">{book.synopsis}</p>
            </div>
          </div>
        )}

        {/* Quote to Vibe Card Tool */}
        <div
          className="card p-4 mb-4 rounded-4 shadow-sm"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.border,
            color: currentTheme.text,
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <h2 className="h5 fw-bold mb-0">Memorable Quote</h2>
            <button
              type="button"
              className="btn btn-sm text-white rounded-pill px-3"
              style={{ backgroundColor: '#D96B50' }}
              onClick={handleCreateVibeCardWithQuote}
              disabled={!isAuthenticated || (!progress && !finished)}
            >
              ✨ Make Vibe Card (9:16)
            </button>
          </div>
          <p className="small mb-3" style={{ color: currentTheme.subtext }}>
            Highlight a passage that touched your heart and turn it into a sharable visual story card.
          </p>
          {(!isAuthenticated || (!progress && !finished)) && (
            <p className="small" style={{ color: currentTheme.subtext }}>Sign in and start reading this book to create a Vibe Card.</p>
          )}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Paste or type a quote from your reading…"
              value={selectedQuote}
              onChange={(e) => setSelectedQuote(e.target.value)}
              style={{
                backgroundColor: currentTheme.bg,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
            />
            {selectedQuote && (
              <button
                className="btn text-white"
                style={{ backgroundColor: currentTheme.plum }}
                onClick={handleCreateVibeCardWithQuote}
                disabled={!isAuthenticated || (!progress && !finished)}
              >
                Use in Story Card
              </button>
            )}
          </div>
        </div>

        {/* Reading Activity Section */}
        <section
          className="card p-4 mt-4 rounded-4 shadow-sm"
          aria-label="Reading activity"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.border,
            color: currentTheme.text,
          }}
        >
          <h2 className="h5 fw-bold mb-3">Your reading progress</h2>
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="fw-semibold text-decoration-none"
              style={{ color: currentTheme.plum }}
            >
              Sign in to save your reading progress.
            </Link>
          ) : (
            <>
              {progress ? (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <p className="mb-0 fw-semibold">
                      Page {progress.currentPage} of {book.pages || 'unknown'}
                    </p>
                    <span className="badge rounded-pill bg-light text-dark border">
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    className="progress mb-3"
                    style={{ height: '8px', backgroundColor: currentTheme.border }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: currentTheme.plum,
                      }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  {/* Quick Pace Buttons */}
                  {totalPages > 0 && currentPage < totalPages && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="small" style={{ color: currentTheme.subtext }}>
                        Quick pace:
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        style={{ fontSize: '12px' }}
                        disabled={quickUpdating}
                        onClick={() => handleQuickPageAdd(5)}
                      >
                        +5 pages
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        style={{ fontSize: '12px' }}
                        disabled={quickUpdating}
                        onClick={() => handleQuickPageAdd(10)}
                      >
                        +10 pages
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        style={{ fontSize: '12px' }}
                        disabled={quickUpdating}
                        onClick={() => handleQuickPageAdd(25)}
                      >
                        +25 pages
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p>
                  {finished
                    ? 'You have finished this book.'
                    : 'You have not started this book yet.'}
                </p>
              )}

              {progress?.notes && (
                <p className="p-3 rounded-3" style={{ backgroundColor: currentTheme.bg }}>
                  <strong>Private notes:</strong> {progress.notes}
                </p>
              )}

              <div className="d-flex flex-wrap gap-2 mt-2">
                {progress ? (
                  <>
                    <button
                      className="btn text-white fw-semibold px-4"
                      style={{ backgroundColor: currentTheme.plum }}
                      onClick={() => setEditingProgress(true)}
                    >
                      Update progress
                    </button>
                    <button
                      className="btn btn-outline-secondary fw-semibold px-4"
                      onClick={() => setFinishing(true)}
                    >
                      Finish book
                    </button>
                  </>
                ) : !finished ? (
                  <button
                    className="btn text-white fw-semibold px-4"
                    style={{ backgroundColor: currentTheme.plum }}
                    disabled={status === 'loading'}
                    onClick={() => startBook(book.id)}
                  >
                    Start reading
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <Link
                      href="/finished-reads"
                      className="btn btn-outline-secondary"
                    >
                      View finished reads
                    </Link>
                    <Link
                      href={`/vibe-card?bookId=${book.id}`}
                      className="btn text-white"
                      style={{ backgroundColor: '#D96B50' }}
                    >
                      Create Vibe Card
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <Link
          className="d-inline-block mt-4 text-decoration-none fw-semibold"
          style={{ color: currentTheme.plum }}
          href={`/books/${book.id}`}
        >
          Back to book details
        </Link>

        {editingProgress && (
          <UpdateProgressModal
            book={book}
            currentReading={progress}
            isOpen
            onClose={() => setEditingProgress(false)}
          />
        )}
        {finishing && (
          <FinishBookModal
            book={book}
            isOpen
            onClose={() => setFinishing(false)}
          />
        )}
      </div>
    </div>
  );
}
