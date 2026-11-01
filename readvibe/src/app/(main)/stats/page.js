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
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const availableYears = ['2026', '2025', 'All Time'];

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

  // Filter finished reads according to active year selector
  const activeYearReads = useMemo(() => {
    if (year === 'All Time') return enrichedFinishedReads;
    return enrichedFinishedReads.filter((item) => {
      if (!item.finishedAt) return true;
      const d = new Date(item.finishedAt);
      if (!isNaN(d.getTime())) {
        return d.getFullYear().toString() === year;
      }
      return item.finishedAt.includes(year);
    });
  }, [enrichedFinishedReads, year]);

  // Derived Core Metrics for the selected year
  const totalBooksFinished = activeYearReads.length;
  const totalPages = useMemo(() => {
    return activeYearReads.reduce((sum, item) => sum + (item.pages || 0), 0);
  }, [activeYearReads]);

  const avgRating = useMemo(() => {
    if (activeYearReads.length === 0) return '0.0';
    const sum = activeYearReads.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / activeYearReads.length).toFixed(1);
  }, [activeYearReads]);

  // Dynamic Moods Distribution for the selected year
  const moodsOnShelf = useMemo(() => {
    const counts = {};
    activeYearReads.forEach((item) => {
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
    return list;
  }, [activeYearReads]);

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

  // Dynamic Genres Explored for the selected year
  const genresExplored = useMemo(() => {
    const counts = {};
    activeYearReads.forEach((item) => {
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
    return list;
  }, [activeYearReads]);

  // Highest Rated Reads for the selected year
  const highestRatedReads = useMemo(() => {
    const sorted = [...activeYearReads].sort(
      (a, b) => b.rating - a.rating || (b.pages || 0) - (a.pages || 0)
    );
    const top3 = sorted.slice(0, 3);
    return top3.map((item) => ({
      id: item.bookId || item.id,
      title: item.title,
      author: item.author,
      rating: Number(item.rating).toFixed(1),
      coverUrl: item.coverUrl,
    }));
  }, [activeYearReads]);

  // Dynamic Monthly Reading Timeline
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyData = useMemo(() => {
    const counts = {};
    monthLabels.forEach((m) => {
      counts[m] = 0;
    });

    activeYearReads.forEach((item) => {
      if (!item.finishedAt) return;
      const d = new Date(item.finishedAt);
      let monthStr = '';
      if (!isNaN(d.getTime())) {
        monthStr = monthLabels[d.getMonth()];
      } else {
        const match = item.finishedAt.match(/[A-Za-z]{3}/);
        if (match) monthStr = match[0];
      }
      if (monthStr && counts[monthStr] !== undefined) {
        counts[monthStr] += 1;
      }
    });

    // In 2026, show Jan-Oct matching design, or all 12 months for All Time
    const monthsToShow = year === '2026' ? monthLabels.slice(0, 10) : monthLabels;
    return monthsToShow.map((m) => ({
      month: m,
      count: counts[m] || 0,
    }));
  }, [activeYearReads, year]);

  const maxMonthCount = useMemo(() => {
    const max = Math.max(...monthlyData.map((d) => d.count), 1);
    return max;
  }, [monthlyData]);

  const peakMonth = useMemo(() => {
    if (!monthlyData.length) return null;
    return monthlyData.reduce(
      (prev, curr) => (curr.count > prev.count ? curr : prev),
      monthlyData[0]
    );
  }, [monthlyData]);

  // Reading Goal Calculation
  const readingGoal = user?.readingGoal || { target: 20, completed: 12 };
  const goalCompleted = totalBooksFinished;
  const goalTarget = readingGoal.target || 20;
  const goalPercent = Math.min(Math.round((goalCompleted / goalTarget) * 100), 100);

  const handleDownloadRecap = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // 1. Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, '#FAF7F2');
      grad.addColorStop(0.5, '#F7F2F9');
      grad.addColorStop(1, '#EFE9F4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Decorative outer border
      ctx.strokeStyle = '#D96B50';
      ctx.lineWidth = 6;
      ctx.strokeRect(60, 60, 960, 1800);

      // Inner subtle frame
      ctx.strokeStyle = 'rgba(217, 107, 80, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(76, 76, 928, 1768);

      // Helper function to draw rounded rect
      const drawRoundRect = (x, y, w, h, radius, fill, stroke) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      };

      // 2. Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#775282';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('READVIBE · EMOTIONAL READING COMPANION', 540, 170);

      ctx.fillStyle = '#D96B50';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`✨ ${year} ANNUAL READING RECAP ✨`, 540, 220);

      ctx.fillStyle = '#2B132C';
      ctx.font = 'bold 64px serif';
      const userName = user?.name ? `${user.name}’s Reading Journey` : 'Your Reading Journey';
      ctx.fillText(userName, 540, 310);

      ctx.fillStyle = '#6C757D';
      ctx.font = 'italic 38px serif';
      const secondMood = moodsOnShelf[1]?.label ? moodsOnShelf[1].label : 'Curious';
      const vibeTagline = `“${topMood} & ${secondMood}”`;
      ctx.fillText(vibeTagline, 540, 370);

      // Header divider
      ctx.strokeStyle = '#EADCEE';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(180, 420);
      ctx.lineTo(900, 420);
      ctx.stroke();

      // 3. Stats 2x2 Grid Cards
      // Card 1: Books Finished (Left, Top)
      drawRoundRect(120, 470, 390, 200, 24, '#FFFFFF', '#F0E6D8');
      ctx.fillStyle = '#D96B50';
      ctx.font = 'bold 84px sans-serif';
      ctx.fillText(String(totalBooksFinished), 315, 570);
      ctx.fillStyle = '#554359';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Books Finished', 315, 625);

      // Card 2: Pages Read (Right, Top)
      drawRoundRect(570, 470, 390, 200, 24, '#FFFFFF', '#E6EFE8');
      ctx.fillStyle = '#5C826A';
      ctx.font = 'bold 84px sans-serif';
      ctx.fillText(totalPages.toLocaleString(), 765, 570);
      ctx.fillStyle = '#554359';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Pages Read', 765, 625);

      // Card 3: Average Rating (Left, Bottom)
      drawRoundRect(120, 700, 390, 190, 24, '#FFFFFF', '#FDEEE4');
      ctx.fillStyle = '#E27D60';
      ctx.font = 'bold 74px sans-serif';
      ctx.fillText(`${avgRating} ★`, 315, 790);
      ctx.fillStyle = '#554359';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Average Rating', 315, 845);

      // Card 4: Top Mood (Right, Bottom)
      drawRoundRect(570, 700, 390, 190, 24, '#FFFFFF', '#F3EDF6');
      ctx.fillStyle = '#775282';
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText(`${topMoodEmoji} ${topMood}`, 765, 785);
      ctx.fillStyle = '#554359';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Most-Read Mood', 765, 845);

      // 4. Reading Goal & Genre Highlights
      drawRoundRect(120, 920, 840, 120, 20, '#FFFFFF', 'rgba(119, 82, 130, 0.15)');
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2B132C';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`🎯 ${year} Goal: ${goalCompleted} of ${goalTarget} books read (${goalPercent}%)`, 160, 970);
      ctx.fillStyle = '#6C757D';
      ctx.font = '24px sans-serif';
      const topGenre = genresExplored[0]?.label || 'Fiction';
      ctx.fillText(`📚 Top Genre: ${topGenre} · Peak Reading Month: ${peakMonth?.month || 'October'}`, 160, 1010);

      // 5. Highest-Rated Hall of Fame Reads
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2B132C';
      ctx.font = 'bold 36px serif';
      ctx.fillText('HALL OF FAME READS', 540, 1100);

      drawRoundRect(120, 1130, 840, 350, 24, '#FFFFFF', '#E6DCED');
      ctx.textAlign = 'left';
      highestRatedReads.slice(0, 3).forEach((book, idx) => {
        const rowY = 1200 + idx * 95;
        // Star badge
        ctx.fillStyle = '#D96B50';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(`★ ${book.rating}`, 160, rowY);

        // Title
        ctx.fillStyle = '#2B132C';
        ctx.font = 'bold 30px sans-serif';
        const displayTitle = book.title.length > 28 ? book.title.substring(0, 26) + '...' : book.title;
        ctx.fillText(displayTitle, 280, rowY);

        // Author
        ctx.fillStyle = '#777777';
        ctx.font = '24px sans-serif';
        ctx.fillText(`by ${book.author}`, 280, rowY + 32);

        // Subtle divider between items
        if (idx < 2) {
          ctx.strokeStyle = 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(160, rowY + 50);
          ctx.lineTo(920, rowY + 50);
          ctx.stroke();
        }
      });

      // 6. Favorite Quote of the Year
      const topQuoteItem = activeYearReads.find((r) => r.favoriteQuote);
      const quoteText = topQuoteItem?.favoriteQuote
        ? `“${topQuoteItem.favoriteQuote}”`
        : '“Books don’t give you the answer. They give you the space to find it yourself.”';

      drawRoundRect(120, 1515, 840, 180, 20, '#FAF6FA', '#E2D5E8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#5C4066';
      ctx.font = 'italic 28px serif';

      const words = quoteText.split(' ');
      let line1 = '';
      let line2 = '';
      words.forEach((w) => {
        if ((line1 + w).length < 46) {
          line1 += (line1 ? ' ' : '') + w;
        } else {
          line2 += (line2 ? ' ' : '') + w;
        }
      });
      ctx.fillText(line1, 540, 1590);
      if (line2) {
        ctx.fillText(line2, 540, 1635);
      }

      // 7. Footer Watermark
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#775282';
      ctx.fillText('readvibe.app · Emotional Reading Companion', 540, 1750);
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText(`Curated for @${user?.username || 'reader'} · Keep turning pages.`, 540, 1785);

      const link = document.createElement('a');
      link.download = `readvibe-${year}-recap.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Error generating recap canvas:', err);
    } finally {
      setDownloading(false);
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

      {/* Download Recap Feedback Alert */}
      {downloadSuccess && (
        <div
          className="alert alert-success border-0 shadow-sm rounded-4 px-4 py-2.5 small d-flex align-items-center justify-content-between mb-3"
          style={{ backgroundColor: '#EBF4ED', color: '#3A6349' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span>🎉</span>
            <span>
              <strong>Recap exported!</strong> Your {year} reading recap (1080×1920) was saved to your device.
            </span>
          </div>
          <button
            type="button"
            className="btn-close small"
            onClick={() => setDownloadSuccess(false)}
            aria-label="Close"
          />
        </div>
      )}

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
            <div className="position-relative">
              <button
                type="button"
                onClick={() => setShowYearMenu((prev) => !prev)}
                className="btn btn-sm btn-white border rounded-3 px-3 py-2 fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-1.5"
                style={{ backgroundColor: '#FFFFFF' }}
                aria-expanded={showYearMenu}
              >
                <span>{year}</span>
                <span className="small text-muted" style={{ fontSize: '10px' }}>▾</span>
              </button>
              {showYearMenu && (
                <div
                  className="position-absolute end-0 mt-1 py-1 bg-white rounded-3 shadow-lg border"
                  style={{ zIndex: 1050, minWidth: '120px' }}
                >
                  {availableYears.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setYear(y);
                        setShowYearMenu(false);
                      }}
                      className={`dropdown-item px-3 py-1.5 small text-start w-100 d-flex align-items-center justify-content-between ${
                        year === y ? 'fw-bold' : 'text-dark'
                      }`}
                      style={{
                        color: year === y ? '#D96B50' : 'inherit',
                        backgroundColor: year === y ? '#FFF5EB' : 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{y}</span>
                      {year === y && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  <div>
                    <h6
                      className="fw-bold mb-0"
                      style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                    >
                      Books finished by month
                    </h6>
                    <span className="text-muted small" style={{ fontSize: '11px' }}>
                      {year === 'All Time' ? 'All recorded reads' : `Jan – Oct ${year}`}
                    </span>
                  </div>
                  {peakMonth && peakMonth.count > 0 && (
                    <span
                      className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                      style={{ backgroundColor: '#FDF0ED', color: '#D96B50', fontSize: '11px' }}
                    >
                      Peak: {peakMonth.month} ({peakMonth.count})
                    </span>
                  )}
                </div>

                {/* Bar Chart Container */}
                <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '170px' }}>
                  {monthlyData.map((d) => {
                    const heightPercent = d.count === 0 ? 4 : (d.count / maxMonthCount) * 100;
                    const isPeak = peakMonth && d.month === peakMonth.month && d.count > 0;
                    return (
                      <div
                        key={d.month}
                        className="d-flex flex-column align-items-center flex-grow-1"
                        style={{ height: '100%', justifyContent: 'flex-end' }}
                      >
                        <span
                          className={`small mb-1 ${isPeak ? 'fw-bold' : 'text-muted'}`}
                          style={{ fontSize: '11px', color: isPeak ? '#D96B50' : undefined }}
                        >
                          {d.count}
                        </span>
                        <div
                          className="w-75 rounded-2 transition-all"
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: isPeak ? '#D96B50' : d.count > 0 ? '#E87A65' : '#EAE6E1',
                            boxShadow: isPeak ? '0 2px 6px rgba(217, 107, 80, 0.35)' : 'none',
                            minHeight: '4px'
                          }}
                        />
                        <span
                          className={`small mt-2 ${isPeak ? 'fw-bold' : 'text-muted'}`}
                          style={{ fontSize: '11px', color: isPeak ? 'var(--rv-ink-plum)' : undefined }}
                        >
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
