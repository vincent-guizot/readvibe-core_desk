'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AiOutlineEllipsis
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { readVibeStore } from '../../../lib/store';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id || 'lantern-bookshop';

  // Book info defaulting to Elena Rowan's The Lantern Bookshop
  const defaultBook = {
    title: 'The Lantern Bookshop',
    author: 'Elena Rowan',
    totalPages: 64
  };

  const [book, setBook] = useState(defaultBook);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Appearance settings matching reading page.png
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
  const [theme, setTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark'
  const [lineSpacing, setLineSpacing] = useState('medium'); // 'tight' | 'medium' | 'relaxed'

  // Chapters matching reading page.png
  const chapters = [
    {
      num: 1,
      title: 'The Letter',
      page: 1,
      content: [
        'The rain had barely begun when the envelope slipped through the mail slot, landing with a soft thud on the hardwood floor.',
        'Mira didn’t recognize the handwriting. It was penned in faded walnut ink, slanted with deliberate grace, addressed simply to: The resident of 44 Elm Street who remembers the smell of old paper.',
        'Inside was not a letter, but a slip of parchment bearing an address three streets over that had remained empty for as long as she could recall.',
        'Curiosity is a patient hunter. Within an hour, Mira had pulled on her woolen coat and stepped into the mist.'
      ]
    },
    {
      num: 2,
      title: 'A Door Left Open',
      page: 9,
      content: [
        'The cobblestones were slick underfoot, reflecting the amber streetlamps like dark glass.',
        'At the end of the alleyway stood a brick façade tucked between a tailor shop and an apothecary. A weathered oak door stood ajar by an inch, allowing a sliver of warm, buttery candlelight to slice across the pavement.',
        'She paused with one hand resting against the chilled stone. Music was playing somewhere inside — a gramophone record turning through a waltz that sounded both ancient and immediate.',
        'Without knocking, she pushed gently, and the door swung inward without a creak.'
      ]
    },
    {
      num: 3,
      title: 'The Lantern Bookshop',
      page: 18,
      content: [
        'By the time Mira reached the corner, the rain had softened to a whisper. A lantern glowed above a narrow doorway, its amber light spilling across the wet pavement.',
        'She had passed this street a hundred times, but she could not remember seeing the shop before.',
        'Inside, the air smelled of paper, cedar, and the last cup of tea. Books leaned against one another as though they had been interrupted in conversation.',
        'A small brass bell announced her arrival. Somewhere beyond the shelves, a chair scraped gently across the floor.',
        'Mira paused just inside the doorway, letting her eyes adjust to the warm, expectant light. The shop was smaller than she had imagined, yet it felt like a room that had always existed, waiting for her to find it.',
        'Rows of books rose around her, their spines faded and bright, maps and stories and forgotten worlds. A wooden ladder rested against one shelf, and a handwritten note peeked from between two books.',
        'At the far end, a figure looked up from a table, a smile forming as if she had been expecting company. “You found us,” the woman said, her voice as gentle as the rain.',
        'Mira stepped further inside, the bell’s soft chime still trembling in the air, and for the first time that day, she felt exactly where she was meant to be.'
      ]
    },
    {
      num: 4,
      title: 'Between the Shelves',
      page: 32,
      content: [
        'The aisles seemed deeper than the exterior of the building should have allowed.',
        'Every shelf was labeled not by genre or author, but by moments: "Books for rainy afternoons when nothing else will do," "Words to read before making a decision you cannot take back," and "Stories that feel like coming home after a long journey."',
        'Mira reached out, her fingertips grazing the embossed leather spines. Each book seemed quietly warm, like tea cooling on a saucer.'
      ]
    },
    {
      num: 5,
      title: 'A Familiar Voice',
      page: 48,
      content: [
        'The woman at the desk poured a steaming mug of jasmine tea and pushed it across the counter.',
        '“We have been keeping your volume safe, Mira,” she said with a gentle nod. “Some stories need time before their readers are ready to open them.”',
        'Mira sat down, her heart quiet in a way it hadn’t been in years.'
      ]
    },
    {
      num: 6,
      title: 'The Last Train',
      page: 58,
      content: [
        'Outside, the distant whistle of the evening commuter train echoed through the valley.',
        'Mira closed the book, running her hand across its linen cover. The rain had ceased, and stars were emerging between breaks in the purple twilight.',
        'She stepped out into the night, knowing that whatever came tomorrow, she would always know the way back to the lantern.'
      ]
    }
  ];

  // Default to Chapter 3 (index 2) matching reading page.png
  const [activeChapterIndex, setActiveChapterIndex] = useState(2);
  const currentChapter = chapters[activeChapterIndex] || chapters[2];

  const settingsRef = useRef(null);

  useEffect(() => {
    const storeBook = readVibeStore.getBookById(bookId);
    if (storeBook) {
      setBook({
        title: storeBook.title || defaultBook.title,
        author: storeBook.author || defaultBook.author,
        totalPages: storeBook.pages || 64
      });
    }
  }, [bookId]);

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
      trackBg: '#E9E3DC'
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
      trackBg: '#E2D8CC'
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
      trackBg: '#2E2435'
    }
  };

  const activeTheme = themeStyles[theme];

  const getLineHeight = () => {
    if (lineSpacing === 'tight') return 1.6;
    if (lineSpacing === 'medium') return 1.85;
    return 2.1;
  };

  // Calculate progress percent
  const currentPage = currentChapter.page;
  const progressPercent = Math.round((currentPage / (book.totalPages || 64)) * 100);

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.text,
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header
        className="py-2 px-3 px-md-4 border-bottom sticky-top d-flex align-items-center justify-content-between"
        style={{
          backgroundColor: activeTheme.navBg,
          borderColor: activeTheme.border,
          zIndex: 1030
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

          <Link href="/discover" className="d-none d-md-flex align-items-center gap-2 text-decoration-none">
            <span style={{ fontSize: '20px' }}>📖</span>
            <span
              className="fw-bold"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', fontSize: '18px' }}
            >
              ReadVibe
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

        {/* Right Action Icons: Bookmark, Aa, Search, Fullscreen, More */}
        <div className="d-flex align-items-center gap-1.5 position-relative" ref={settingsRef}>
          {/* Bookmark */}
          <button
            type="button"
            className="btn btn-sm border-0 p-2 rounded-circle"
            style={{ color: bookmarked ? '#D96B50' : activeTheme.text }}
            onClick={() => setBookmarked(!bookmarked)}
            title={bookmarked ? 'Bookmarked' : 'Add bookmark'}
          >
            {bookmarked ? <BsBookmarkFill size={16} /> : <BsBookmark size={16} />}
          </button>

          {/* Aa Reading Settings Toggle */}
          <button
            type="button"
            className={`btn btn-sm rounded-3 px-2.5 py-1 fw-bold ${isSettingsOpen ? 'btn-light border' : 'border-0'}`}
            style={{
              color: activeTheme.text,
              backgroundColor: isSettingsOpen ? (theme === 'dark' ? '#2B132C' : '#EFE9F4') : 'transparent',
              borderColor: isSettingsOpen ? '#D1B4DD' : 'transparent',
              fontSize: '14px'
            }}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Reading Settings"
          >
            Aa
          </button>

          {/* Search */}
          <button
            type="button"
            className="btn btn-sm border-0 p-2 rounded-circle d-none d-sm-inline-flex"
            style={{ color: activeTheme.text }}
            onClick={() => alert('Search within book coming soon!')}
            title="Search text"
          >
            <AiOutlineSearch size={18} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            className="btn btn-sm border-0 p-2 rounded-circle d-none d-sm-inline-flex"
            style={{ color: activeTheme.text }}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <AiOutlineCompress size={18} /> : <AiOutlineExpand size={18} />}
          </button>

          {/* More options */}
          <button
            type="button"
            className="btn btn-sm border-0 p-2 rounded-circle"
            style={{ color: activeTheme.text }}
            title="More Options"
          >
            <AiOutlineEllipsis size={18} />
          </button>

          {/* ================= FLOATING READING SETTINGS POPOVER ================= */}
          {isSettingsOpen && (
            <div
              className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg border"
              style={{
                top: '100%',
                width: '270px',
                backgroundColor: activeTheme.cardBg,
                color: activeTheme.text,
                borderColor: activeTheme.border,
                zIndex: 1050
              }}
            >
              <h6 className="fw-bold mb-3 small" style={{ color: activeTheme.text }}>
                Reading settings
              </h6>

              {/* Font Size Row */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted">Font size</span>
                <div className="d-flex align-items-center border rounded-3 overflow-hidden bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border-0 px-2 py-1"
                    onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    title="Decrease font size"
                  >
                    <AiOutlineMinus size={12} />
                  </button>
                  <span className="px-3 fw-bold small" style={{ minWidth: '32px', textAlign: 'center' }}>
                    {fontSize}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-light border-0 px-2 py-1"
                    onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                    title="Increase font size"
                  >
                    <AiOutlinePlus size={12} />
                  </button>
                </div>
              </div>

              {/* Font Family Row */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted">Font</span>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn px-3 py-1 fw-semibold ${fontFamily === 'serif' ? 'border' : 'border-0'}`}
                    style={{
                      backgroundColor: fontFamily === 'serif' ? '#FAF6FC' : 'transparent',
                      borderColor: fontFamily === 'serif' ? '#D1B4DD' : 'transparent',
                      color: fontFamily === 'serif' ? 'var(--rv-ink-plum)' : activeTheme.text,
                      borderRadius: '8px 0 0 8px'
                    }}
                    onClick={() => setFontFamily('serif')}
                  >
                    Serif
                  </button>
                  <button
                    type="button"
                    className={`btn px-3 py-1 fw-semibold ${fontFamily === 'sans' ? 'border' : 'border-0'}`}
                    style={{
                      backgroundColor: fontFamily === 'sans' ? '#FAF6FC' : 'transparent',
                      borderColor: fontFamily === 'sans' ? '#D1B4DD' : 'transparent',
                      color: fontFamily === 'sans' ? 'var(--rv-ink-plum)' : activeTheme.text,
                      borderRadius: '0 8px 8px 0'
                    }}
                    onClick={() => setFontFamily('sans')}
                  >
                    Sans
                  </button>
                </div>
              </div>

              {/* Theme Row */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted">Theme</span>
                <div className="d-flex align-items-center gap-2">
                  {/* Light */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="rounded-circle border"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#FFFFFF',
                        borderColor: theme === 'light' ? 'var(--rv-ink-plum)' : '#E0DAD2',
                        boxShadow: theme === 'light' ? '0 0 0 2px var(--rv-ink-plum)' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setTheme('light')}
                      title="Light Theme"
                    />
                    <div style={{ fontSize: '10px' }} className="text-muted mt-1">Light</div>
                  </div>

                  {/* Sepia */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="rounded-circle border"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#F5E8D8',
                        borderColor: theme === 'sepia' ? 'var(--rv-ink-plum)' : '#DCCAB5',
                        boxShadow: theme === 'sepia' ? '0 0 0 2px var(--rv-ink-plum)' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setTheme('sepia')}
                      title="Sepia Theme"
                    />
                    <div style={{ fontSize: '10px' }} className="text-muted mt-1">Sepia</div>
                  </div>

                  {/* Dark */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="rounded-circle border"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#242028',
                        borderColor: theme === 'dark' ? '#EFE9F4' : '#444',
                        boxShadow: theme === 'dark' ? '0 0 0 2px #EFE9F4' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setTheme('dark')}
                      title="Dark Theme"
                    />
                    <div style={{ fontSize: '10px' }} className="text-muted mt-1">Dark</div>
                  </div>
                </div>
              </div>

              {/* Line Spacing Row */}
              <div className="d-flex align-items-center justify-content-between">
                <span className="small text-muted">Line spacing</span>
                <div className="btn-group btn-group-sm">
                  {/* Tight */}
                  <button
                    type="button"
                    className={`btn px-2.5 py-1 ${lineSpacing === 'tight' ? 'border' : 'border-0'}`}
                    style={{
                      backgroundColor: lineSpacing === 'tight' ? '#FAF6FC' : 'transparent',
                      borderColor: lineSpacing === 'tight' ? '#D1B4DD' : 'transparent',
                      borderRadius: '8px 0 0 8px'
                    }}
                    onClick={() => setLineSpacing('tight')}
                    title="Tight Line Spacing"
                  >
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
                      <rect y="1" width="18" height="1.8" rx="0.9" />
                      <rect y="6" width="18" height="1.8" rx="0.9" />
                      <rect y="11" width="18" height="1.8" rx="0.9" />
                    </svg>
                  </button>

                  {/* Medium (Default in screenshot) */}
                  <button
                    type="button"
                    className={`btn px-2.5 py-1 ${lineSpacing === 'medium' ? 'border' : 'border-0'}`}
                    style={{
                      backgroundColor: lineSpacing === 'medium' ? '#FAF6FC' : 'transparent',
                      borderColor: lineSpacing === 'medium' ? '#D1B4DD' : 'transparent'
                    }}
                    onClick={() => setLineSpacing('medium')}
                    title="Medium Line Spacing"
                  >
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
                      <rect y="0" width="18" height="1.8" rx="0.9" />
                      <rect y="6" width="18" height="1.8" rx="0.9" />
                      <rect y="12" width="18" height="1.8" rx="0.9" />
                    </svg>
                  </button>

                  {/* Relaxed */}
                  <button
                    type="button"
                    className={`btn px-2.5 py-1 ${lineSpacing === 'relaxed' ? 'border' : 'border-0'}`}
                    style={{
                      backgroundColor: lineSpacing === 'relaxed' ? '#FAF6FC' : 'transparent',
                      borderColor: lineSpacing === 'relaxed' ? '#D1B4DD' : 'transparent',
                      borderRadius: '0 8px 8px 0'
                    }}
                    onClick={() => setLineSpacing('relaxed')}
                    title="Relaxed Line Spacing"
                  >
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
                      <rect y="0" width="18" height="1.5" rx="0.75" />
                      <rect y="7" width="18" height="1.5" rx="0.75" />
                      <rect y="13" width="18" height="1.5" rx="0.75" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ================= MAIN SPLIT: CONTENTS & TEXT ================= */}
      <div className="flex-grow-1 d-flex">
        {/* Left Sidebar: Contents (matching reading page.png) */}
        {isSidebarOpen && (
          <aside
            className="d-none d-lg-flex flex-column justify-content-between p-4 border-end"
            style={{
              width: '260px',
              backgroundColor: activeTheme.sidebarBg,
              borderColor: activeTheme.border,
              flexShrink: 0
            }}
          >
            <div>
              <h5 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: activeTheme.text }}>
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
                      onClick={() => setActiveChapterIndex(idx)}
                      className="btn text-start p-2.5 rounded-3 border-0 d-flex align-items-center gap-2"
                      style={{
                        backgroundColor: isActive ? activeTheme.highlightBg : 'transparent',
                        color: isActive ? 'var(--rv-ink-plum)' : activeTheme.text,
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '14px',
                        borderLeft: isActive ? '3px solid var(--rv-ink-plum)' : '3px solid transparent'
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
              <div className="text-muted small" style={{ fontSize: '12px' }}>Sample edition</div>
              <div className="text-muted small" style={{ fontSize: '11px', opacity: 0.8 }}>Original demo story</div>
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
                  letterSpacing: '-0.02em'
                }}
              >
                {currentChapter.title}
              </h1>
            </div>

            {/* Reading Content */}
            <article
              style={{
                fontFamily: fontFamily === 'serif' ? 'var(--font-editorial), Georgia, serif' : 'var(--font-ui), sans-serif',
                fontSize: `${fontSize}px`,
                lineHeight: getLineHeight(),
                color: activeTheme.text
              }}
            >
              {currentChapter.content.map((paragraph, idx) => (
                <p key={idx} className="mb-4" style={{ textAlign: 'justify' }}>
                  {idx === 0 ? (
                    <>
                      {/* Drop Cap for first letter */}
                      <span
                        style={{
                          float: 'left',
                          fontSize: `${fontSize * 3.2}px`,
                          lineHeight: 0.8,
                          paddingRight: '12px',
                          paddingTop: '6px',
                          fontFamily: 'var(--font-editorial)',
                          fontWeight: 'bold',
                          color: activeTheme.dropCapColor
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
          </div>
        </main>
      </div>

      {/* ================= BOTTOM PROGRESS FOOTER ================= */}
      <footer
        className="py-3 px-4 border-top sticky-bottom"
        style={{
          backgroundColor: activeTheme.navBg,
          borderColor: activeTheme.border,
          zIndex: 1020
        }}
      >
        <div className="d-flex align-items-center justify-content-between gap-3 mx-auto" style={{ maxWidth: '900px' }}>
          {/* Previous Chapter */}
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1.5 p-0"
            style={{
              color: activeChapterIndex > 0 ? activeTheme.text : 'rgba(0,0,0,0.3)',
              cursor: activeChapterIndex > 0 ? 'pointer' : 'default',
              pointerEvents: activeChapterIndex > 0 ? 'auto' : 'none',
              fontWeight: 500
            }}
            onClick={() => {
              if (activeChapterIndex > 0) setActiveChapterIndex(activeChapterIndex - 1);
            }}
          >
            <AiOutlineArrowLeft size={14} /> Previous
          </button>

          {/* Progress Bar & Page Status */}
          <div className="d-flex flex-column align-items-center" style={{ width: '280px', maxWidth: '50%' }}>
            <span className="small text-muted mb-1" style={{ fontSize: '12px' }}>
              Page {currentChapter.page} of {book.totalPages || 64}
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
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span className="text-muted mt-1" style={{ fontSize: '11px' }}>
              {progressPercent}% of sample
            </span>
          </div>

          {/* Next Chapter */}
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1.5 p-0"
            style={{
              color: activeChapterIndex < chapters.length - 1 ? activeTheme.text : 'rgba(0,0,0,0.3)',
              cursor: activeChapterIndex < chapters.length - 1 ? 'pointer' : 'default',
              pointerEvents: activeChapterIndex < chapters.length - 1 ? 'auto' : 'none',
              fontWeight: 500
            }}
            onClick={() => {
              if (activeChapterIndex < chapters.length - 1) setActiveChapterIndex(activeChapterIndex + 1);
            }}
          >
            Next <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>←</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
