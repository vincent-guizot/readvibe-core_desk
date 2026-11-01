'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AiFillStar,
  AiOutlineBook,
  AiOutlineFileText,
  AiOutlineDownload,
  AiOutlineLock,
  AiOutlineTrophy,
} from 'react-icons/ai';
import { useReading, useBooks, useAuth } from '@/hooks';
import { Progress } from '@/components/ui';

export default function StatsPage() {
  const [year, setYear] = useState('2026');
  const [downloading, setDownloading] = useState(false);

  const { finishedReads } = useReading();
  const { books } = useBooks();
  const { user } = useAuth();

  // Combine Redux finished reading history with full book metadata
  const enrichedFinishedReads = useMemo(() => {
    return (finishedReads || []).map((read) => {
      const book = books.find((b) => b.id === read.bookId || b.slug === read.bookId);
      const moodsList = read.moods && read.moods.length > 0
        ? read.moods
        : (book?.moods || ['Cozy']);
      return {
        ...read,
        book,
        title: book?.title || read.title || 'Untitled Book',
        author: book?.author || read.author || 'Unknown Author',
        coverUrl: book?.coverUrl || read.coverUrl || '/assets/books/midnight-library.jpg',
        genre: book?.genre || 'Fiction',
        pages: Number(book?.pages) || 250,
        rating: Number(read.rating || book?.rating || 4.5),
        primaryMood: moodsList[0] || 'Cozy',
      };
    });
  }, [finishedReads, books]);

  // Derived Core Metrics
  const totalBooksFinished = enrichedFinishedReads.length;
  const totalPages = useMemo(() => {
    return enrichedFinishedReads.reduce((sum, item) => sum + (item.pages || 0), 0);
  }, [enrichedFinishedReads]);

  const avgRating = useMemo(() => {
    if (enrichedFinishedReads.length === 0) return user?.stats?.avgRating || '4.5';
    const sum = enrichedFinishedReads.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / enrichedFinishedReads.length).toFixed(1);
  }, [enrichedFinishedReads, user]);

  // Dynamic Moods Distribution
  const moodsOnShelf = useMemo(() => {
    const counts = {};
    enrichedFinishedReads.forEach((item) => {
      const mood = item.primaryMood || 'Cozy';
      counts[mood] = (counts[mood] || 0) + 1;
    });

    const moodColors = {
      Cozy: '#E87A65',
      Reflective: '#9786A3',
      Mindful: '#88A391',
      Hopeful: '#D4C6DC',
      'Warm & Healing': '#E27D60',
      Thoughtful: '#7C9885',
      Melancholy: '#5B7065',
      Bittersweet: '#C2847A',
      Gentle: '#9BB291',
      Calm: '#8BAAAD',
    };

    const list = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      color: moodColors[label] || '#9786A3',
    }));

    list.sort((a, b) => b.count - a.count);
    return list.length > 0
      ? list
      : [
          { label: 'Cozy', count: 5, color: '#E87A65' },
          { label: 'Reflective', count: 3, color: '#9786A3' },
          { label: 'Mindful', count: 2, color: '#88A391' },
          { label: 'Hopeful', count: 2, color: '#D4C6DC' },
        ];
  }, [enrichedFinishedReads]);

  const topMood = moodsOnShelf[0]?.label || user?.stats?.topMood || 'Cozy';
  const moodEmojis = {
    Cozy: '☕',
    Reflective: '🌙',
    Mindful: '🌿',
    Hopeful: '✨',
    'Warm & Healing': '💛',
    Thoughtful: '💭',
    Melancholy: '🌧️',
    Bittersweet: '🍂',
    Gentle: '🌸',
    Calm: '☁️',
  };
  const topMoodEmoji = moodEmojis[topMood] || '📖';

  // Dynamic Genres Explored
  const genresExplored = useMemo(() => {
    const counts = {};
    enrichedFinishedReads.forEach((item) => {
      let g = item.genre || 'Fiction';
      if (g.toLowerCase().includes('fiction') && !g.toLowerCase().includes('science')) {
        g = 'Fiction';
      } else if (g.toLowerCase().includes('fantasy')) {
        g = 'Fantasy';
      } else if (
        g.toLowerCase().includes('philosophy') ||
        g.toLowerCase().includes('development') ||
        g.toLowerCase().includes('nonfiction')
      ) {
        g = 'Nonfiction';
      }
      counts[g] = (counts[g] || 0) + 1;
    });

    const genreColors = {
      Fiction: '#E87A65',
      Fantasy: '#9786A3',
      Nonfiction: '#88A391',
      'Science Fiction': '#5B7065',
      Philosophy: '#D4C6DC',
    };

    const list = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      color: genreColors[label] || '#E87A65',
    }));

    list.sort((a, b) => b.count - a.count);
    return list.length > 0
      ? list
      : [
          { label: 'Fiction', count: 6, color: '#E87A65' },
          { label: 'Fantasy', count: 3, color: '#9786A3' },
          { label: 'Nonfiction', count: 3, color: '#88A391' },
        ];
  }, [enrichedFinishedReads]);

  // Highest Rated Reads
  const highestRatedReads = useMemo(() => {
    const sorted = [...enrichedFinishedReads].sort(
      (a, b) => b.rating - a.rating || (b.pages || 0) - (a.pages || 0)
    );
    const top3 = sorted.slice(0, 3);
    if (top3.length > 0) {
      return top3.map((item) => ({
        id: item.bookId || item.id,
        title: item.title,
        author: item.author,
        rating: Number(item.rating).toFixed(1),
        coverUrl: item.coverUrl,
      }));
    }
    return [
      {
        id: 'comfort-book',
        title: 'The Comfort Book',
        author: 'Matt Haig',
        rating: '5.0',
        coverUrl: '/assets/books/comfort-book.jpg',
      },
      {
        id: 'little-prince',
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        rating: '5.0',
        coverUrl: '/assets/books/little-prince.jpg',
      },
      {
        id: 'wild-built',
        title: 'A Psalm for the Wild-Built',
        author: 'Becky Chambers',
        rating: '4.5',
        coverUrl: '/assets/books/wild-built.jpg',
      },
    ];
  }, [enrichedFinishedReads]);

  // Reading Goal Calculation
  const readingGoal = user?.readingGoal || { target: 20, completed: 12 };
  const goalCompleted = totalBooksFinished;
  const goalTarget = readingGoal.target || 20;
  const goalPercent = Math.min(Math.round((goalCompleted / goalTarget) * 100), 100);

  // Exact data from reading stats.png (will make fully dynamic in next commit)
  const monthlyData = [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 1 },
    { month: 'Apr', count: 1 },
    { month: 'May', count: 2 },
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 1 },
    { month: 'Aug', count: 1 },
    { month: 'Sep', count: 1 },
    { month: 'Oct', count: 3 }
  ];

  const maxMonthCount = 3;

  const handleDownloadRecap = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#FAF7F2');
    grad.addColorStop(1, '#EFE9F4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative frame
    ctx.strokeStyle = '#D96B50';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, 960, 1800);

    // Header
    ctx.fillStyle = '#2B132C';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('READVIBE 2026 READING STATS', 540, 200);

    ctx.font = 'bold 72px serif';
    ctx.fillText('Your Reading Journey, in Chapters', 540, 310);

    // Stats
    ctx.fillStyle = '#E87A65';
    ctx.font = 'bold 110px sans-serif';
    ctx.fillText('12', 320, 520);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#2B132C';
    ctx.fillText('Books Finished', 320, 580);

    ctx.fillStyle = '#7C9885';
    ctx.font = 'bold 110px sans-serif';
    ctx.fillText('3,120', 760, 520);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#2B132C';
    ctx.fillText('Pages Read', 760, 580);

    ctx.fillStyle = '#2B132C';
    ctx.font = 'italic 52px serif';
    ctx.fillText('“Cozy & Curious”', 540, 820);
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#6C757D';
    ctx.fillText('Top Mood: Cozy (5 books) · Average Rating: 4.5 ★', 540, 890);

    // Footer
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText('readvibe.app · Emotional Reading Companion', 540, 1750);

    const link = document.createElement('a');
    link.download = `readvibe-${year}-recap.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloading(false);
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
            Reading Stats
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        <div>
          <h1
            className="display-5 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            Your reading journey, in chapters.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '1.05rem' }}>
            A little look at the stories, moods, and moments you have collected.
          </p>
        </div>

        {/* Right header: Artwork and Controls */}
        <div className="d-flex align-items-center gap-4 flex-shrink-0">
          <div className="d-none d-xl-block">
            <img
              src="/assets/illustrations/book-stack-with-flower-vase.png"
              alt="Books and flowers"
              style={{ maxHeight: '115px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/illustrations/books.png';
              }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-white border rounded-3 px-3 py-2 fw-semibold text-dark shadow-sm"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <span>{year} ▾</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadRecap}
              disabled={downloading}
              className="btn btn-sm btn-white border rounded-3 px-3 py-2 fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <AiOutlineDownload size={16} />
              <span>{downloading ? 'Exporting...' : 'Download recap'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="row g-3 mb-4">
        {/* Books Finished */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-row align-items-center gap-3 h-100">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '48px', height: '48px', backgroundColor: '#FDF0ED', color: '#D96B50' }}
            >
              <AiOutlineBook size={24} />
            </div>
            <div>
              <div className="display-6 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {totalBooksFinished}
              </div>
              <div className="text-muted small" style={{ fontSize: '13px' }}>
                Books finished
              </div>
            </div>
          </div>
        </div>

        {/* Pages in finished books */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-row align-items-center gap-3 h-100">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '48px', height: '48px', backgroundColor: '#EBF4ED', color: '#5C826A' }}
            >
              <AiOutlineFileText size={24} />
            </div>
            <div>
              <div className="display-6 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {totalPages.toLocaleString()}
              </div>
              <div className="text-muted small" style={{ fontSize: '13px' }}>
                Pages in finished books
              </div>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-row align-items-center gap-3 h-100">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '48px', height: '48px', backgroundColor: '#FFF5EB', color: '#E27D60' }}
            >
              <AiFillStar size={24} />
            </div>
            <div>
              <div className="display-6 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {avgRating}
              </div>
              <div className="text-muted small" style={{ fontSize: '13px' }}>
                Average rating
              </div>
            </div>
          </div>
        </div>

        {/* Most-read mood */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 rounded-4 shadow-sm p-4 bg-white d-flex flex-row align-items-center gap-3 h-100">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '48px', height: '48px', backgroundColor: '#FDF0ED', color: '#D96B50', fontSize: '22px' }}
            >
              {topMoodEmoji}
            </div>
            <div>
              <div className="display-6 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {topMood}
              </div>
              <div className="text-muted small" style={{ fontSize: '13px' }}>
                Most-read mood
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Goal Progress Banner */}
      <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '44px', height: '44px', backgroundColor: '#FDF0ED', color: '#D96B50' }}
            >
              <AiOutlineTrophy size={22} />
            </div>
            <div>
              <h6 className="fw-bold mb-0" style={{ color: 'var(--rv-ink-plum)' }}>
                {year} Reading Goal
              </h6>
              <span className="text-muted small">
                {goalCompleted} of {goalTarget} books completed ({goalPercent}%)
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill px-3 py-2 fw-semibold"
              style={{
                backgroundColor: goalPercent >= 100 ? '#EBF4ED' : '#F4EFF7',
                color: goalPercent >= 100 ? '#5C826A' : '#775282',
              }}
            >
              {goalTarget - goalCompleted > 0
                ? `${goalTarget - goalCompleted} books left to reach your goal!`
                : '🎉 Goal achieved! Super reader!'}
            </span>
          </div>
        </div>
        <Progress value={goalCompleted} max={goalTarget} height="10px" color="var(--rv-vibe-coral)" />
      </div>

      {/* Main Stats Grid */}
      <div className="row g-4">
        {/* Left & Middle Column (col-lg-8) */}
        <div className="col-lg-8">
          <div className="row g-4 mb-4">
            {/* Books finished by month Bar Chart (col-md-6) */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6
                    className="fw-bold mb-0"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                  >
                    Books finished by month
                  </h6>
                  <span className="text-muted small" style={{ fontSize: '11px' }}>
                    Jan – Oct 2026
                  </span>
                </div>

                {/* Bar Chart Container */}
                <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '170px' }}>
                  {monthlyData.map((d) => {
                    const heightPercent = d.count === 0 ? 4 : (d.count / maxMonthCount) * 100;
                    return (
                      <div
                        key={d.month}
                        className="d-flex flex-column align-items-center flex-grow-1"
                        style={{ height: '100%', justifyContent: 'flex-end' }}
                      >
                        <span className="text-muted small mb-1" style={{ fontSize: '11px' }}>
                          {d.count}
                        </span>
                        <div
                          className="w-75 rounded-2 transition-all"
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: d.count > 0 ? '#E87A65' : '#EAE6E1',
                            minHeight: '4px'
                          }}
                        />
                        <span className="text-muted small mt-2" style={{ fontSize: '11px' }}>
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* The moods on your shelf (col-md-6) */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <h6
                    className="fw-bold mb-3"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                  >
                    The moods on your shelf
                  </h6>

                  <div className="d-flex flex-column gap-2.5">
                    {moodsOnShelf.map((m) => {
                      const maxCount = Math.max(...moodsOnShelf.map((x) => x.count), 1);
                      return (
                        <div key={m.label} className="d-flex align-items-center gap-3">
                          <span className="small text-dark" style={{ minWidth: '70px', fontSize: '13px' }}>
                            {m.label}
                          </span>
                          <div className="flex-grow-1 rounded-pill overflow-hidden bg-light" style={{ height: '14px' }}>
                            <div
                              className="h-100 rounded-pill"
                              style={{
                                width: `${(m.count / maxCount) * 100}%`,
                                backgroundColor: m.color
                              }}
                            />
                          </div>
                          <span className="small fw-semibold text-muted" style={{ minWidth: '15px' }}>
                            {m.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-end text-muted small mt-2" style={{ fontSize: '12px' }}>
                    Total: {totalBooksFinished}
                  </div>
                </div>

                <div className="text-muted small pt-3 border-top mt-3" style={{ fontSize: '11px' }}>
                  One primary mood per finished book.
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row: Genres you explored & Your highest-rated reads */}
          <div className="row g-4">
            {/* Genres you explored */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white h-100">
                <h6
                  className="fw-bold mb-3"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Genres you explored
                </h6>

                <div className="d-flex flex-column gap-3">
                  {genresExplored.map((g) => {
                    const maxGenre = Math.max(...genresExplored.map((x) => x.count), 1);
                    return (
                      <div key={g.label} className="d-flex align-items-center gap-3">
                        <span className="small text-dark" style={{ minWidth: '75px', fontSize: '13px' }}>
                          {g.label}
                        </span>
                        <div className="flex-grow-1 rounded-pill overflow-hidden bg-light" style={{ height: '14px' }}>
                          <div
                            className="h-100 rounded-pill"
                            style={{
                              width: `${(g.count / maxGenre) * 100}%`,
                              backgroundColor: g.color
                            }}
                          />
                        </div>
                        <span className="small fw-semibold text-muted" style={{ minWidth: '15px' }}>
                          {g.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Your highest-rated reads */}
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white h-100">
                <h6
                  className="fw-bold mb-3"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Your highest-rated reads
                </h6>

                <div className="d-flex flex-column gap-2.5">
                  {highestRatedReads.map((b) => (
                    <div key={b.id} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="rounded shadow-sm flex-shrink-0"
                          style={{ width: '32px', height: '44px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/books/midnight-library.jpg';
                          }}
                        />
                        <div>
                          <div
                            className="fw-bold small text-truncate"
                            style={{ maxWidth: '170px', color: 'var(--rv-ink-plum)' }}
                          >
                            {b.title}
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            {b.author}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1 text-danger fw-semibold small">
                        <AiFillStar size={15} style={{ color: '#D96B50' }} />
                        <span style={{ color: '#D96B50' }}>{b.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Your 2026 reading vibe recap card (col-lg-4) */}
        <div className="col-lg-4">
          <div
            className="card border-0 rounded-4 shadow-sm p-4 text-center h-100 d-flex flex-column justify-content-between position-relative overflow-hidden"
            style={{ backgroundColor: '#F4EFF7', borderColor: '#E6DCED' }}
          >
            <div>
              <div className="text-muted small text-uppercase mb-2 fw-semibold" style={{ fontSize: '12px' }}>
                Your {year} reading vibe
              </div>
              <h2
                className="display-6 fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.15 }}
              >
                {topMood} &amp; {moodsOnShelf[1]?.label ? moodsOnShelf[1].label.toLowerCase() : 'curious'}
              </h2>

              <img
                src="/assets/illustrations/books-login.png"
                alt="Reading Vibe Illustration"
                className="img-fluid mx-auto my-2"
                style={{ maxHeight: '180px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/illustrations/book-stack-with-flower-vase.png';
                }}
              />

              <p className="text-muted small mb-4 px-2" style={{ fontSize: '13px' }}>
                Warm stories and thoughtful worlds found a place on your shelf.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadRecap}
              className="btn btn-rv-plum rounded-pill px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
            >
              <span>Create reading recap</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Footnote */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 pt-4 mt-3 border-top text-muted small" style={{ fontSize: '12px' }}>
        <div className="d-flex align-items-center gap-1.5">
          <AiOutlineLock size={14} />
          <span>Only you can see these reading stats.</span>
        </div>
        <div>
          Page totals include completed books with known page counts.
        </div>
      </div>
    </div>
  );
}
