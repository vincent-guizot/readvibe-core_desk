'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AiOutlineArrowLeft,
  AiOutlineSearch,
  AiOutlineExpand,
  AiOutlineCompress,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineCheck,
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { useBooks, useReading } from '@/hooks';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id || 'midnight-library';

  const { books, getBookById } = useBooks();
  const { getBookProgress, updateBookProgress, finishBook } = useReading();

  // Find book from Redux catalog or default fallback
  const book = useMemo(() => {
    return (
      getBookById(bookId) ||
      books.find((b) => b.id === bookId || b.slug === bookId) || {
        id: bookId,
        title: 'The Lantern Bookshop',
        author: 'Elena Rowan',
        pages: 64,
      }
    );
  }, [bookId, books, getBookById]);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Appearance settings
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
  const [theme, setTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark'
  const [lineSpacing, setLineSpacing] = useState('medium'); // 'tight' | 'medium' | 'relaxed'

  // Load preferences from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('readvibe_reader_theme');
      if (savedTheme) setTheme(savedTheme);
      const savedFont = localStorage.getItem('readvibe_reader_font');
      if (savedFont) setFontFamily(savedFont);
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('readvibe_reader_theme', newTheme);
    }
  };

  const handleFontChange = (newFont) => {
    setFontFamily(newFont);
    if (typeof window !== 'undefined') {
      localStorage.setItem('readvibe_reader_font', newFont);
    }
  };

  // Sample reading chapters
  const chapters = [
    {
      num: 1,
      title: 'The Letter',
      page: 1,
      content: [
        'The rain had barely begun when the envelope slipped through the mail slot, landing with a soft thud on the hardwood floor.',
        'Mira didn’t recognize the handwriting. It was penned in faded walnut ink, slanted with deliberate grace, addressed simply to: The resident of 44 Elm Street who remembers the smell of old paper.',
        'Inside was not a letter, but a slip of parchment bearing an address three streets over that had remained empty for as long as she could recall.',
        'Curiosity is a patient hunter. Within an hour, Mira had pulled on her woolen coat and stepped into the mist.',
      ],
    },
    {
      num: 2,
      title: 'A Door Left Open',
      page: 9,
      content: [
        'The cobblestones were slick underfoot, reflecting the amber streetlamps like dark glass.',
        'At the end of the alleyway stood a brick façade tucked between a tailor shop and an apothecary. A weathered oak door stood ajar by an inch, allowing a sliver of warm, buttery candlelight to slice across the pavement.',
        'She paused with one hand resting against the chilled stone. Music was playing somewhere inside — a gramophone record turning through a waltz that sounded both ancient and immediate.',
        'Without knocking, she pushed gently, and the door swung inward without a creak.',
      ],
    },
    {
      num: 3,
      title: 'The Shelves of Second Chances',
      page: 18,
      content: [
        'By the time Mira reached the corner, the rain had softened to a whisper. A lantern glowed above a narrow doorway, its amber light spilling across the wet pavement.',
        'She had passed this street a hundred times, but she could not remember seeing the shop before.',
        'Inside, the air smelled of paper, cedar, and the last cup of tea. Books leaned against one another as though they had been interrupted in conversation.',
        'A small brass bell announced her arrival. Somewhere beyond the shelves, a chair scraped gently across the floor.',
        'Mira paused just inside the doorway, letting her eyes adjust to the warm, expectant light. The shop was smaller than she had imagined, yet it felt like a room that had always existed, waiting for her to find it.',
        'Rows of books rose around her, their spines faded and bright, maps and stories and forgotten worlds. A wooden ladder rested against one shelf, and a handwritten note peeked from between two books.',
        'At the far end, a figure looked up from a table, a smile forming as if she had been expecting company. “You found us,” the woman said, her voice as gentle as the rain.',
        'Mira stepped further inside, the bell’s soft chime still trembling in the air, and for the first time that day, she felt exactly where she was meant to be.',
      ],
    },
    {
      num: 4,
      title: 'Between the Shelves',
      page: 32,
      content: [
        'The aisles seemed deeper than the exterior of the building should have allowed.',
        'Every shelf was labeled not by genre or author, but by moments: "Books for rainy afternoons when nothing else will do," "Words to read before making a decision you cannot take back," and "Stories that feel like coming home after a long journey."',
        'Mira reached out, her fingertips grazing the embossed leather spines. Each book seemed quietly warm, like tea cooling on a saucer.',
      ],
    },
    {
      num: 5,
      title: 'A Familiar Voice',
      page: 48,
      content: [
        'The woman at the desk poured a steaming mug of jasmine tea and pushed it across the counter.',
        '“We have been keeping your volume safe, Mira,” she said with a gentle nod. “Some stories need time before their readers are ready to open them.”',
        'Mira sat down, her heart quiet in a way it hadn’t been in years.',
      ],
    },
    {
      num: 6,
      title: 'The Final Passage',
      page: 64,
      content: [
        'Outside, the distant whistle of the evening commuter train echoed through the valley.',
        'Mira closed the book, running her hand across its linen cover. The rain had ceased, and stars were emerging between breaks in the purple twilight.',
        'She stepped out into the night, knowing that whatever came tomorrow, she would always know the way back to the lantern.',
      ],
    },
  ];

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Restore chapter from Redux reading progress if available
  useEffect(() => {
    const progress = getBookProgress(book.id);
    if (progress && progress.currentPage > 0) {
      const foundIdx = chapters.findIndex(
        (ch, idx) =>
          ch.page <= progress.currentPage &&
          (chapters[idx + 1] ? chapters[idx + 1].page > progress.currentPage : true)
      );
      if (foundIdx !== -1) {
        setActiveChapterIndex(foundIdx);
      }
    }
  }, [book.id]);

  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const settingsRef = useRef(null);

  // Sync page change to Redux
  const handleChapterChange = (index) => {
    setActiveChapterIndex(index);
    const targetChapter = chapters[index];
    if (targetChapter) {
      updateBookProgress(book.id, targetChapter.page);
    }
  };

  // Mark book finished
  const handleFinishBook = () => {
    finishBook({
      bookId: book.id,
      rating: 5,
      favoriteQuote: book.quote || '',
      moods: book.moods || ['Cozy'],
    });
    router.push(`/finished-reads/edit-review?bookId=${book.id}`);
  };

  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
    setBookmarkToast(true);
    setTimeout(() => setBookmarkToast(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const themeStyles = {
    light: {
      bg: '#FFFFFF',
      text: '#222222',
      navBg: '#FAF7F2',
      border: '#E8E1D9',
      sidebarBg: '#FAF7F2',
      cardBg: '#FFFFFF',
      dropCapColor: '#2B132C',
      highlightBg: '#F3EEF7',
      trackBg: '#E9E3DC',
    },
    sepia: {
      bg: '#FAF7F2',
      text: '#2B132C',
      navBg: '#F4ECE1',
      border: '#E4D8C8',
      sidebarBg: '#FAF7F2',
      cardBg: '#FFFFFF',
      dropCapColor: '#2B132C',
      highlightBg: '#F3EEF7',
      trackBg: '#E2D8CC',
    },
    dark: {
      bg: '#18121E',
      text: '#EAE3EE',
      navBg: '#130E18',
      border: 'rgba(255, 255, 255, 0.1)',
      sidebarBg: '#150F1B',
      cardBg: '#231B2B',
      dropCapColor: '#E6B8C2',
      highlightBg: 'rgba(209, 180, 221, 0.2)',
      trackBg: '#2E2435',
    },
  };

  const activeTheme = themeStyles[theme];

  const getLineHeight = () => {
    if (lineSpacing === 'tight') return 1.6;
    if (lineSpacing === 'medium') return 1.85;
    return 2.1;
  };

  const currentPage = currentChapter.page;
  const progressPercent = Math.min(Math.round((currentPage / (book.pages || 64)) * 100), 100);

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.text,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header
        className="py-2 px-3 px-md-4 border-bottom sticky-top d-flex align-items-center justify-content-between"
        style={{
          backgroundColor: activeTheme.navBg,
          borderColor: activeTheme.border,
          zIndex: 1030,
        }}
      >
        {/* Left: Back Link & Logo */}
        <div className="d-flex align-items-center gap-3">
          <Link
            href="/my-reading"
            className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{ color: activeTheme.text }}
          >
            <AiOutlineArrowLeft size={16} /> My Reading
          </Link>

          <div className="vr d-none d-sm-block" style={{ height: '18px', opacity: 0.3 }} />

          <Link href={`/books/${book.id}`} className="d-none d-md-flex align-items-center gap-1.5 text-decoration-none">
            <span style={{ fontSize: '18px' }}>📖</span>
            <span
              className="fw-bold"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', fontSize: '16px' }}
            >
              ReadVibe Reader
            </span>
          </Link>

          {/* Mobile sidebar toggle button */}
          <button
            type="button"
            className="btn btn-sm btn-light border-0 d-lg-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Contents"
          >
            <AiOutlineMenu size={16} />
          </button>
        </div>

        {/* Center: Book Title & Author */}
        <div className="text-center px-2">
          <div
            className="fw-bold text-truncate"
            style={{ fontFamily: 'var(--font-editorial)', fontSize: '16px', maxWidth: '300px' }}
          >
            {book.title}
          </div>
          <div className="opacity-75 text-truncate" style={{ fontSize: '12px', maxWidth: '300px' }}>
            {book.author}
          </div>
        </div>

        {/* Right Action Icons: Bookmark, Aa, Fullscreen */}
        <div className="d-flex align-items-center gap-1.5 position-relative" ref={settingsRef}>
          {/* Bookmark */}
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 text-muted border-0 shadow-xs"
            onClick={handleToggleBookmark}
            title={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            style={{ color: bookmarked ? '#D96B50' : 'inherit' }}
          >
            {bookmarked ? <BsBookmarkFill size={16} color="#D96B50" /> : <BsBookmark size={16} />}
          </button>

          {/* Aa Reading Settings Dropdown */}
          <button
            type="button"
            className={`btn btn-sm rounded-circle p-2 border-0 shadow-xs ${
              isSettingsOpen ? 'btn-secondary text-white' : 'btn-light text-muted'
            }`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Appearance Settings"
          >
            <span className="fw-bold" style={{ fontSize: '14px' }}>
              Aa
            </span>
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 text-muted border-0 d-none d-sm-inline-flex shadow-xs"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <AiOutlineCompress size={16} /> : <AiOutlineExpand size={16} />}
          </button>

          {/* Settings Popup Menu */}
          {isSettingsOpen && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg border"
              style={{
                top: '100%',
                backgroundColor: activeTheme.cardBg,
                borderColor: activeTheme.border,
                width: '280px',
                zIndex: 1040,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small fw-bold" style={{ color: activeTheme.text }}>
                  Reader Appearance
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-muted"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <AiOutlineClose size={14} />
                </button>
              </div>

              {/* Theme Selector */}
              <div className="mb-3">
                <label className="form-label small text-muted mb-1">Theme</label>
                <div className="d-flex gap-2">
                  {[
                    { id: 'light', label: 'Light', bg: '#FFFFFF', color: '#222' },
                    { id: 'sepia', label: 'Sepia', bg: '#FAF7F2', color: '#2B132C' },
                    { id: 'dark', label: 'Dark', bg: '#18121E', color: '#EAE3EE' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id)}
                      className={`btn btn-sm flex-grow-1 border rounded-3 py-1 ${
                        theme === t.id ? 'fw-bold' : ''
                      }`}
                      style={{
                        backgroundColor: t.bg,
                        color: t.color,
                        borderColor: theme === t.id ? '#D96B50' : '#E0D8CE',
                        boxShadow: theme === t.id ? '0 0 0 2px #D96B50' : 'none',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted">Font Size</span>
                  <span className="small fw-semibold">{fontSize}px</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border rounded-circle p-1"
                    onClick={() => setFontSize((s) => Math.max(s - 2, 14))}
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="form-range flex-grow-1"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-light border rounded-circle p-1"
                    onClick={() => setFontSize((s) => Math.min(s + 2, 28))}
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="mb-2">
                <label className="form-label small text-muted mb-1">Typeface</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFontChange('serif')}
                    className={`btn btn-sm flex-grow-1 rounded-3 py-1 ${
                      fontFamily === 'serif' ? 'btn-rv-plum' : 'btn-light border'
                    }`}
                    style={{ fontFamily: 'serif' }}
                  >
                    Serif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontChange('sans')}
                    className={`btn btn-sm flex-grow-1 rounded-3 py-1 ${
                      fontFamily === 'sans' ? 'btn-rv-plum' : 'btn-light border'
                    }`}
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    Sans
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Bookmark Feedback Alert */}
      {bookmarkToast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4 py-1.5 px-3 rounded-pill shadow-sm small text-white"
          style={{ backgroundColor: '#2B132C', zIndex: 1080 }}
        >
          {bookmarked ? `✓ Bookmarked page ${currentPage}` : 'Bookmark removed'}
        </div>
      )}

      {/* ================= MAIN SPLIT: CONTENTS & TEXT ================= */}
      <div className="flex-grow-1 d-flex">
        {/* Left Sidebar: Contents */}
        {isSidebarOpen && (
          <aside
            className="d-none d-lg-flex flex-column justify-content-between p-4 border-end"
            style={{
              width: '260px',
              backgroundColor: activeTheme.sidebarBg,
              borderColor: activeTheme.border,
              flexShrink: 0,
            }}
          >
            <div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: activeTheme.text }}
              >
                Contents
              </h5>
              <p className="text-muted small mb-4" style={{ fontSize: '13px' }}>
                {book.title}
              </p>

              <nav className="d-flex flex-column gap-1">
                {chapters.map((ch, idx) => {
                  const isActive = activeChapterIndex === idx;
                  return (
                    <button
                      key={ch.num}
                      type="button"
                      onClick={() => handleChapterChange(idx)}
                      className="btn text-start p-2.5 rounded-3 border-0 d-flex align-items-center gap-2"
                      style={{
                        backgroundColor: isActive ? activeTheme.highlightBg : 'transparent',
                        color: isActive ? 'var(--rv-ink-plum)' : activeTheme.text,
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '14px',
                        borderLeft: isActive ? '3px solid #D96B50' : '3px solid transparent',
                      }}
                    >
                      <span className="opacity-75" style={{ minWidth: '16px' }}>
                        {ch.num}.
                      </span>
                      <span className="text-truncate">{ch.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom sample edition notice */}
            <div className="pt-4 border-top" style={{ borderColor: activeTheme.border }}>
              <div className="text-muted small" style={{ fontSize: '12px' }}>
                Total: {book.pages || 64} pages
              </div>
              <div className="text-muted small" style={{ fontSize: '11px', opacity: 0.8 }}>
                Connected with Redux Reading State
              </div>
            </div>
          </aside>
        )}

        {/* Center: Reading Area */}
        <main className="flex-grow-1 d-flex flex-column justify-content-between py-5 px-4 px-md-5">
          <div className="mx-auto w-100" style={{ maxWidth: '680px' }}>
            {/* Chapter Header */}
            <div className="mb-4">
              <div className="text-muted small mb-2" style={{ fontSize: '14px' }}>
                Chapter {currentChapter.num}
              </div>
              <h1
                className="display-5 fw-bold mb-4"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  color: activeTheme.text,
                  letterSpacing: '-0.02em',
                }}
              >
                {currentChapter.title}
              </h1>
            </div>

            {/* Reading Content */}
            <article
              style={{
                fontFamily:
                  fontFamily === 'serif'
                    ? 'var(--font-editorial), Georgia, serif'
                    : 'var(--font-ui), sans-serif',
                fontSize: `${fontSize}px`,
                lineHeight: getLineHeight(),
                color: activeTheme.text,
              }}
            >
              {currentChapter.content.map((paragraph, idx) => (
                <p key={idx} className="mb-4" style={{ textAlign: 'justify' }}>
                  {idx === 0 ? (
                    <>
                      {/* Drop Cap */}
                      <span
                        style={{
                          float: 'left',
                          fontSize: `${fontSize * 3.2}px`,
                          lineHeight: 0.8,
                          paddingRight: '12px',
                          paddingTop: '6px',
                          fontFamily: 'var(--font-editorial)',
                          fontWeight: 'bold',
                          color: activeTheme.dropCapColor,
                        }}
                      >
                        {paragraph.charAt(0)}
                      </span>
                      {paragraph.slice(1)}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
            </article>

            {/* Complete Book Card if at final chapter */}
            {activeChapterIndex === chapters.length - 1 && (
              <div
                className="card border-0 rounded-4 shadow-sm p-4 mt-5 text-center"
                style={{ backgroundColor: activeTheme.sidebarBg, borderColor: activeTheme.border }}
              >
                <div className="fs-1 mb-2">🎉</div>
                <h4 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                  You reached the final page!
                </h4>
                <p className="text-muted small mb-3">
                  Mark this book as finished to update your reading stats and create a personalized Vibe Card.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleFinishBook}
                    className="btn btn-rv-plum rounded-pill px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  >
                    <AiOutlineCheck size={18} /> Complete Book &amp; Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================= BOTTOM PROGRESS FOOTER ================= */}
      <footer
        className="py-3 px-4 border-top sticky-bottom"
        style={{
          backgroundColor: activeTheme.navBg,
          borderColor: activeTheme.border,
          zIndex: 1020,
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between gap-3 mx-auto"
          style={{ maxWidth: '900px' }}
        >
          {/* Previous Chapter */}
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1.5 p-0"
            style={{
              color: activeChapterIndex > 0 ? activeTheme.text : 'rgba(0,0,0,0.3)',
              cursor: activeChapterIndex > 0 ? 'pointer' : 'default',
              pointerEvents: activeChapterIndex > 0 ? 'auto' : 'none',
              fontWeight: 500,
            }}
            onClick={() => handleChapterChange(activeChapterIndex - 1)}
          >
            <AiOutlineArrowLeft size={14} /> Previous
          </button>

          {/* Progress Bar & Page Status */}
          <div className="d-flex flex-column align-items-center" style={{ width: '280px', maxWidth: '50%' }}>
            <span className="small text-muted mb-1" style={{ fontSize: '12px' }}>
              Page {currentChapter.page} of {book.pages || 64}
            </span>
            <div
              className="rounded-pill overflow-hidden w-100"
              style={{ height: '5px', backgroundColor: activeTheme.trackBg }}
            >
              <div
                className="h-100 rounded-pill transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--rv-ink-plum)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span className="text-muted mt-1" style={{ fontSize: '11px' }}>
              {progressPercent}% read
            </span>
          </div>

          {/* Next Chapter or Complete */}
          {activeChapterIndex < chapters.length - 1 ? (
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1.5 p-0"
              style={{
                color: activeTheme.text,
                cursor: 'pointer',
                fontWeight: 500,
              }}
              onClick={() => handleChapterChange(activeChapterIndex + 1)}
            >
              Next <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>←</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishBook}
              className="btn btn-sm btn-rv-coral rounded-pill px-3 py-1 fw-bold text-white shadow-xs d-inline-flex align-items-center gap-1"
            >
              <AiOutlineCheck size={14} /> Finish
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
