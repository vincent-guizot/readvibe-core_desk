'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiOutlineBook,
  AiOutlineEdit,
  AiOutlineCheck,
  AiOutlineFileText,
  AiOutlineSearch,
  AiOutlineLock,
} from 'react-icons/ai';
import { BsBookmarks } from 'react-icons/bs';
import { useReading, useBooks, useAuth, useWishlist } from '@/hooks';
import UpdateProgressModal from '@/components/UpdateProgressModal';
import FinishBookModal from '@/components/FinishBookModal';

export default function MyReadingPage() {
  const router = useRouter();
  const { currentReading, finishedReads } = useReading();
  const { books: allBooks } = useBooks();
  const { user } = useAuth();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently');

  const [selectedBookForProgress, setSelectedBookForProgress] = useState(null);
  const [selectedProgressItem, setSelectedProgressItem] = useState(null);
  const [selectedBookForFinish, setSelectedBookForFinish] = useState(null);

  const handleOpenProgress = (book, readingItem) => {
    setSelectedBookForProgress(book);
    setSelectedProgressItem(readingItem);
  };

  const handleOpenFinish = (book) => {
    setSelectedBookForFinish(book);
  };

  // Filter and sort active reading list
  const filteredList = useMemo(() => {
    let list = (currentReading || []).filter((item) => {
      const book = allBooks.find((b) => b.id === item.bookId || b.slug === item.bookId);
      if (!book) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
    });

    if (sortBy === 'title') {
      list.sort((a, b) => {
        const bookA = allBooks.find((x) => x.id === a.bookId) || {};
        const bookB = allBooks.find((x) => x.id === b.bookId) || {};
        return (bookA.title || '').localeCompare(bookB.title || '');
      });
    } else if (sortBy === 'progress') {
      list.sort((a, b) => {
        const bookA = allBooks.find((x) => x.id === a.bookId) || {};
        const bookB = allBooks.find((x) => x.id === b.bookId) || {};
        const pA = (a.currentPage || 0) / (bookA.pages || 300);
        const pB = (b.currentPage || 0) / (bookB.pages || 300);
        return pB - pA;
      });
    }
    return list;
  }, [currentReading, allBooks, searchQuery, sortBy]);

  // Derived reading moods from current shelf
  const currentShelfMoods = useMemo(() => {
    const set = new Set();
    currentReading.forEach((item) => {
      const b = allBooks.find((x) => x.id === item.bookId);
      if (b?.moods) {
        b.moods.forEach((m) => set.add(m));
      }
    });
    return Array.from(set).slice(0, 4);
  }, [currentReading, allBooks]);

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
            My Reading
          </li>
        </ol>
      </nav>

      {/* Header with Hero Illustration */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-4">
        <div>
          <h1
            className="display-6 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            Every page is a little progress.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
            Your current reads, all in one cozy corner.
          </p>
        </div>

        <div className="d-none d-lg-block flex-shrink-0">
          <img
            src="/assets/illustrations/book-stack-with-flower-vase.png"
            alt="Reading illustration"
            style={{ maxHeight: '110px', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#FFEBE6', color: '#D96B50' }}
            >
              <AiOutlineBook size={24} />
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {currentReading.length}
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>
                Currently reading
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#EAF3EC', color: '#4A7C59' }}
            >
              <span style={{ fontSize: '20px' }}>🌿</span>
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {finishedReads.length}
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>
                Finished this year
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }}
            >
              <BsBookmarks size={20} />
            </div>
            <div>
              <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                {wishlist.length}
              </div>
              <small className="text-muted" style={{ fontSize: '13px' }}>
                On your wishlist
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        {/* Tabs */}
        <div className="d-flex align-items-center gap-4">
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none fw-bold"
            style={{
              color: 'var(--rv-ink-plum)',
              borderBottom: '2.5px solid #D96B50',
              paddingBottom: '8px',
            }}
          >
            Currently reading ({currentReading.length})
          </button>
          <Link
            href="/finished-reads"
            className="text-decoration-none text-muted fw-semibold"
            style={{ paddingBottom: '8px' }}
          >
            Finished ({finishedReads.length})
          </Link>
        </div>

        {/* Right Search & Sort */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="input-group input-group-sm rounded-pill bg-white border px-2 py-1"
            style={{ maxWidth: '240px' }}
          >
            <span className="input-group-text bg-transparent border-0 text-muted p-0 me-1">
              <AiOutlineSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 shadow-none p-0 small"
              placeholder="Search your shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '12px' }}>
            <span>Sort by</span>
            <select
              className="form-select form-select-sm border bg-white rounded-pill py-1 px-2"
              style={{ fontSize: '12px', width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recently">Recently updated</option>
              <option value="title">Title</option>
              <option value="progress">Progress %</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="row g-4 align-items-start">
        {/* Left Column: Currently reading book rows */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            {filteredList.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="fs-1 mb-2">📖</div>
                <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
                  No active reads on your shelf
                </h5>
                <p className="text-muted mb-3 small">
                  Ready to pick up a new story? Explore our curated books or your wishlist.
                </p>
                <div>
                  <Link href="/search" className="btn btn-rv-plum rounded-pill px-4 py-2 fw-semibold">
                    Explore books
                  </Link>
                </div>
              </div>
            ) : (
              filteredList.map((item) => {
                const book = allBooks.find((b) => b.id === item.bookId || b.slug === item.bookId) || {
                  title: 'The Midnight Library',
                  author: 'Matt Haig',
                  coverUrl: '/assets/books/midnight-library.jpg',
                  pages: 304,
                  moods: ['Reflective', 'Hopeful'],
                };
                const totalPages = book.pages || item.totalPages || 300;
                const percent = Math.min(100, Math.round(((item.currentPage || 0) / totalPages) * 100));

                return (
                  <div key={item.bookId} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <div className="row g-3 align-items-center">
                      {/* Book Cover */}
                      <div className="col-3 col-sm-2 text-center">
                        <Link href={`/reader/${book.id}`}>
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="rounded-2 shadow-sm img-fluid"
                            style={{ maxHeight: '115px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = '/assets/books/midnight-library.jpg';
                            }}
                          />
                        </Link>
                      </div>

                      {/* Details & Progress */}
                      <div className="col-9 col-sm-7">
                        <Link href={`/books/${book.id}`} className="text-decoration-none">
                          <h5
                            className="fw-bold mb-1"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            {book.title}
                          </h5>
                        </Link>
                        <p className="text-muted small mb-2">{book.author}</p>

                        {/* Progress bar */}
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '11px' }}>
                            <span>
                              Page {item.currentPage || 0} of {totalPages}
                            </span>
                            <span className="fw-semibold">{percent}%</span>
                          </div>
                          <div className="progress rounded-pill" style={{ height: '6px', backgroundColor: '#F0ECE6' }}>
                            <div
                              className="progress-bar rounded-pill"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: '#E27D60',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>

                        {item.notes && (
                          <div
                            className="p-2 rounded-3 small text-muted mb-1 fst-italic"
                            style={{ backgroundColor: '#FAF7F2', fontSize: '11px' }}
                          >
                            &ldquo;{item.notes}&rdquo;
                          </div>
                        )}

                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          Last read: {item.lastRead || 'Recently'}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="col-12 col-sm-3 d-flex flex-sm-column gap-2 justify-content-end">
                        <Link
                          href={`/reader/${book.id}`}
                          className="btn btn-sm btn-rv-plum rounded-pill py-1.5 px-3 fw-semibold text-center text-white"
                          style={{ fontSize: '12px' }}
                        >
                          Read now
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenProgress(book, item)}
                          className="btn btn-sm btn-outline-secondary rounded-pill py-1.5 px-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
                          style={{
                            borderColor: '#EADFD5',
                            color: 'var(--rv-ink-plum)',
                            fontSize: '12px',
                            background: '#FFFFFF',
                          }}
                        >
                          <AiOutlineEdit size={14} /> Update page
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFinish(book)}
                          className="btn btn-sm btn-outline-success rounded-pill py-1.5 px-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
                          style={{ borderColor: '#D9ECE0', color: '#3A6349', fontSize: '12px', background: '#F4FAF6' }}
                        >
                          <AiOutlineCheck size={14} /> Finish
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Sage green card */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.3) 0%, transparent 65%)',
              }}
            >
              <h4
                className="fw-bold mb-2"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                At your own pace
              </h4>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
                A few pages today can be enough. Pick up wherever you left off.
              </p>
            </div>

            {/* Widget 2: Your reading mood */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your reading mood
              </h5>
              <small className="text-muted d-block mb-3">Based on your current shelf.</small>

              <div className="d-flex flex-wrap gap-2">
                {(currentShelfMoods.length > 0 ? currentShelfMoods : ['Cozy', 'Reflective', 'Mindful']).map(
                  (m) => (
                    <span
                      key={m}
                      className="badge rounded-pill px-3 py-2 fw-normal"
                      style={{ backgroundColor: '#FFEBE6', color: '#D96B50', fontSize: '12px' }}
                    >
                      {m}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Widget 3: Lilac tinted card */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage:
                  'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)',
              }}
            >
              <div
                className="rounded-circle p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#E4DAEC', color: 'var(--rv-ink-plum)', width: '36px', height: '36px' }}
              >
                <BsBookmarks size={16} />
              </div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Ready for your next chapter?
              </h5>
              <p className="text-muted small mb-3">Keep your next read close.</p>
              <Link
                href="/wishlist"
                className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                View wishlist →
              </Link>
            </div>

            {/* Privacy note */}
            <div
              className="d-flex align-items-center justify-content-center gap-1.5 text-muted small"
              style={{ fontSize: '12px' }}
            >
              <AiOutlineLock size={14} /> Your progress and personal notes are private.
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedBookForProgress && (
        <UpdateProgressModal
          key={selectedBookForProgress.id}
          book={selectedBookForProgress}
          currentReading={selectedProgressItem}
          isOpen={!!selectedBookForProgress}
          onClose={() => {
            setSelectedBookForProgress(null);
            setSelectedProgressItem(null);
          }}
          onUpdated={() => {}}
        />
      )}

      {selectedBookForFinish && (
        <FinishBookModal
          key={selectedBookForFinish.id}
          book={selectedBookForFinish}
          isOpen={!!selectedBookForFinish}
          onClose={() => setSelectedBookForFinish(null)}
          onFinished={() => {}}
        />
      )}
    </div>
  );
}
