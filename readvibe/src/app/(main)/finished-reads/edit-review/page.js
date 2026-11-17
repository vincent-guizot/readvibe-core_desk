'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineArrowLeft,
  AiOutlineCheck,
  AiOutlineDelete,
} from 'react-icons/ai';
import { BsStars, BsChatQuote } from 'react-icons/bs';
import { useReading, useBooks } from '@/hooks';

function EditReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookIdParam = searchParams?.get('bookId') || 'comfort-book';

  const { books } = useBooks();
  const { getFinishedDetail, updateFinishedRead, removeFinishedRead } = useReading();

  // Find book and existing review from Redux
  const book = books.find((b) => b.id === bookIdParam || b.slug === bookIdParam) || books[0];
  const finishedRecord = getFinishedDetail(book?.id || bookIdParam);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("A gentle reminder of life's possibilities");
  const [content, setContent] = useState(
    "I loved how this story turns regret into a chance to see life differently. The quiet moments stayed with me long after the final page.\n\nThoughtful, hopeful, and easy to get lost in — a lovely read for a reflective weekend."
  );
  const [favoriteQuote, setFavoriteQuote] = useState(
    'Nothing is stronger than a small hope that doesn’t give up.'
  );
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState(['Cozy', 'Hopeful']);
  const [visibility, setVisibility] = useState('public');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Sync state when book or finished record is loaded
  useEffect(() => {
    if (finishedRecord) {
      if (finishedRecord.rating) setRating(Number(finishedRecord.rating));
      if (finishedRecord.reviewTitle) setTitle(finishedRecord.reviewTitle);
      if (finishedRecord.reviewContent) setContent(finishedRecord.reviewContent);
      else if (finishedRecord.privateNotes) setContent(finishedRecord.privateNotes);
      if (finishedRecord.favoriteQuote) setFavoriteQuote(finishedRecord.favoriteQuote);
      else if (book?.quote) setFavoriteQuote(book.quote);
      if (finishedRecord.moods && finishedRecord.moods.length > 0) {
        setSelectedMoods(finishedRecord.moods);
      }
      if (finishedRecord.containsSpoilers !== undefined) {
        setContainsSpoilers(finishedRecord.containsSpoilers);
      }
      if (finishedRecord.visibility) setVisibility(finishedRecord.visibility);
    } else if (book) {
      if (book.rating) setRating(Math.round(book.rating));
      if (book.quote) setFavoriteQuote(book.quote);
      if (book.moods) setSelectedMoods(book.moods.slice(0, 2));
    }
  }, [finishedRecord, book]);

  const moodsList = [
    { name: 'Cozy', icon: '☕' },
    { name: 'Reflective', icon: '🌙' },
    { name: 'Hopeful', icon: '✨' },
    { name: 'Mindful', icon: '🌿' },
    { name: 'Warm & Healing', icon: '💛' },
    { name: 'Thoughtful', icon: '💭' },
    { name: 'Bittersweet', icon: '🍂' },
  ];

  const toggleMood = (moodName) => {
    if (selectedMoods.includes(moodName)) {
      if (selectedMoods.length > 1) {
        setSelectedMoods(selectedMoods.filter((m) => m !== moodName));
      }
    } else {
      setSelectedMoods([...selectedMoods, moodName]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const bookId = book?.id || bookIdParam;
    updateFinishedRead({
      bookId,
      rating,
      reviewTitle: title,
      reviewContent: content,
      favoriteQuote,
      moods: selectedMoods,
      privateNotes: content,
      containsSpoilers,
      visibility,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      router.push('/finished-reads');
    }, 1000);
  };

  const handleDelete = () => {
    const bookId = book?.id || bookIdParam;
    removeFinishedRead(bookId);
    router.push('/finished-reads');
  };

  const currentBook = book || {
    id: 'comfort-book',
    title: 'The Comfort Book',
    author: 'Matt Haig',
    coverUrl: '/assets/books/comfort-book.jpg',
    genre: 'Self-Development',
    moods: ['Cozy', 'Hopeful'],
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
            Edit Review
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1
            className="display-6 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            Some stories stay with you.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
            Share what this book left behind.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link
            href={`/vibe-card?bookId=${currentBook.id}`}
            className="btn btn-rv-plum btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
          >
            <BsStars size={14} /> Create Vibe Card
          </Link>
          <Link
            href={`/books/${currentBook.id}`}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{ borderColor: '#EADFD5', color: '#D96B50', background: '#FFFFFF' }}
          >
            <AiOutlineArrowLeft size={14} /> Back to book
          </Link>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        {/* Left Column: Book summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="text-center mb-3">
              <img
                src={currentBook.coverUrl}
                alt={currentBook.title}
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: '280px', width: 'auto', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/books/midnight-library.jpg';
                }}
              />
            </div>

            <h4
              className="fw-bold mb-1"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              {currentBook.title}
            </h4>
            <p className="text-muted small mb-3">{currentBook.author}</p>

            <div className="d-flex flex-wrap gap-1.5 mb-3">
              <span
                className="badge rounded-pill px-2.5 py-1 fw-normal"
                style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px' }}
              >
                {currentBook.genre || 'Fiction'}
              </span>
              {selectedMoods.map((m) => (
                <span
                  key={m}
                  className="badge rounded-pill px-2.5 py-1 fw-normal"
                  style={{ backgroundColor: '#FFEBE6', color: '#D96B50', fontSize: '11px' }}
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Finished reading pill */}
            <div
              className="d-flex align-items-center justify-content-between p-2 px-3 rounded-pill mb-4"
              style={{ backgroundColor: '#E0EAE1', color: '#315438', fontSize: '12px' }}
            >
              <span className="fw-semibold d-inline-flex align-items-center gap-1.5">
                <span
                  className="rounded-circle bg-white p-0.5 d-inline-flex align-items-center justify-content-center"
                  style={{ width: '16px', height: '16px', color: '#315438' }}
                >
                  ✓
                </span>
                Finished reading
              </span>
              <span className="text-muted" style={{ fontSize: '11px' }}>
                {finishedRecord?.finishedAt || 'Recently'}
              </span>
            </div>

            {/* Quote Card */}
            <div
              className="rounded-4 p-3 d-flex align-items-center gap-3"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage:
                  'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.25) 0%, transparent 60%)',
              }}
            >
              <span style={{ fontSize: '24px' }}>🌿</span>
              <p
                className="fst-italic small mb-0"
                style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)', lineHeight: 1.4 }}
              >
                Your perspective could be someone else&apos;s next great read.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Edit form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3
                  className="fw-bold mb-0"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Edit your review
                </h3>
                <small className="text-muted">Changes sync with your reading shelf &amp; stats</small>
              </div>
            </div>

            {savedSuccess && (
              <div
                className="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-4 py-2 small"
                style={{ backgroundColor: '#EBF5EE', color: '#315438' }}
              >
                <AiOutlineCheck size={16} /> Changes saved successfully to Redux shelf!
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Rating */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-1">Your rating</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="btn btn-link p-0 text-decoration-none border-0"
                        style={{ color: star <= rating ? '#E27D60' : '#D9CFCA' }}
                      >
                        {star <= rating ? <AiFillStar size={26} /> : <AiOutlineStar size={26} />}
                      </button>
                    ))}
                  </div>
                  <span className="small text-muted">
                    {rating} out of 5 · {rating >= 4 ? 'A memorable read' : 'An interesting read'}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-1">Review title</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your thoughts..."
                  required
                />
              </div>

              {/* Favorite Quote */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <BsChatQuote size={15} style={{ color: '#D96B50' }} />
                  Favorite quote from this book
                </label>
                <input
                  type="text"
                  className="form-control rounded-3 fst-italic"
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  placeholder="A memorable line from the book..."
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  This quote will be used when generating your shareable Vibe Cards.
                </small>
              </div>

              {/* Your review */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Your review &amp; reflections</label>
                <textarea
                  className="form-control rounded-3"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What resonated with you? How did the writing feel?"
                  maxLength={2000}
                  required
                />
                <div className="text-end text-muted small mt-1" style={{ fontSize: '11px' }}>
                  {content.length} / 2000 characters
                </div>
              </div>

              {/* Contains spoilers */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="spoilerCheck"
                  checked={containsSpoilers}
                  onChange={(e) => setContainsSpoilers(e.target.checked)}
                  style={{ accentColor: '#D96B50' }}
                />
                <label className="form-check-label small fw-bold text-dark" htmlFor="spoilerCheck">
                  Contains spoilers
                </label>
                <small className="d-block text-muted" style={{ fontSize: '11px' }}>
                  Readers will see a spoiler warning before opening your review.
                </small>
              </div>

              {/* How did it make you feel? */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">How did it make you feel?</label>
                <div className="d-flex flex-wrap gap-2">
                  {moodsList.map((m) => {
                    const isSelected = selectedMoods.includes(m.name);
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => toggleMood(m.name)}
                        className="btn btn-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 transition-all"
                        style={{
                          backgroundColor: isSelected ? '#FFEBE6' : '#FFFFFF',
                          borderColor: isSelected ? '#D96B50' : '#EADFD5',
                          color: isSelected ? '#D96B50' : 'var(--rv-ink-plum)',
                          fontWeight: isSelected ? '600' : '400',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                        }}
                      >
                        <span>{m.icon}</span>
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review visibility */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark mb-2">Review visibility</label>
                <div className="d-flex align-items-center gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="visibilityOptions"
                      id="visPublic"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                      style={{ accentColor: '#D96B50' }}
                    />
                    <label className="form-check-label small" htmlFor="visPublic">
                      Public review
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="visibilityOptions"
                      id="visPrivate"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                      style={{ accentColor: '#D96B50' }}
                    />
                    <label className="form-check-label small" htmlFor="visPrivate">
                      Only me
                    </label>
                  </div>
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Public reviews appear on this book and your public profile.
                </small>
              </div>

              <hr className="my-4 border-secondary opacity-15" />

              {/* Actions */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                {deleteConfirm ? (
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-danger fw-semibold">Remove from finished reads?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="btn btn-sm btn-danger rounded-pill px-3 py-1"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="btn btn-sm btn-light border rounded-pill px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="btn btn-link p-0 text-decoration-none small d-inline-flex align-items-center gap-1"
                    style={{ color: '#D96B50', fontSize: '13px' }}
                  >
                    <AiOutlineDelete size={14} /> Delete review
                  </button>
                )}

                <div className="d-flex align-items-center gap-3">
                  <Link
                    href="/finished-reads"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-semibold"
                    style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)' }}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-sm rounded-pill px-4 py-2 fw-semibold text-white shadow-sm"
                    style={{ backgroundColor: '#D96B50' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditReviewPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading review editor...</div>}>
      <EditReviewContent />
    </Suspense>
  );
}
