'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineShareAlt,
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineBook,
  AiOutlineCheck,
  AiOutlineHeart,
  AiOutlineEdit,
  AiOutlineExport,
  AiOutlineLock,
  AiOutlineGlobal,
  AiFillStar
} from 'react-icons/ai';
import { BsBookmarks } from 'react-icons/bs';
import { readVibeStore } from '../../lib/store';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentReading, setCurrentReading] = useState([]);
  const [finishedReads, setFinishedReads] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    setUser(readVibeStore.getUser());
    setCurrentReading(readVibeStore.getCurrentReading());
    setFinishedReads(readVibeStore.getFinishedReads());
    setWishlist(readVibeStore.getWishlist());
    setAllBooks(readVibeStore.getBooks());
  }, []);

  if (!user) return null;

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
            My Profile
          </li>
        </ol>
      </nav>

      {/* Profile Header Banner Card with botanical corners */}
      <div
        className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4 position-relative overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 50%, rgba(188, 168, 203, 0.18) 0%, transparent 40%), radial-gradient(circle at 100% 50%, rgba(141, 170, 145, 0.18) 0%, transparent 40%)'
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          {/* User Avatar & Info */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt={user.name || 'Admin ReadVibe'}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: '100px', height: '100px' }}
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent';
              }}
            />
            <div>
              <h2
                className="fw-bold mb-0"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                {user.name || 'Admin ReadVibe'}
              </h2>
              <p className="text-muted small mb-2">@{user.username || 'adminreadvibe'}</p>
              <p className="text-dark mb-2 small" style={{ maxWidth: '520px' }}>
                Finding good stories between coffee breaks and lines of code.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small" style={{ fontSize: '12px' }}>
                <span className="d-flex align-items-center gap-1">
                  <span style={{ color: '#D96B50' }}>📍</span> Jakarta, Indonesia
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span style={{ color: '#D96B50' }}>📅</span> Joined October 2026
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <Link
              href="/settings"
              className="btn btn-sm rounded-pill px-3 py-2 fw-semibold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: 'var(--rv-ink-plum)', fontSize: '12px' }}
            >
              <AiOutlineEdit size={14} /> Edit profile
            </Link>

            <Link
              href={`/u/${user.username || 'adminreadvibe'}`}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
              style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', fontSize: '12px', background: '#FFFFFF' }}
            >
              <AiOutlineExport size={14} /> View public profile
            </Link>

            <Link
              href="/settings"
              className="btn btn-sm btn-outline-secondary rounded-3 p-2 d-inline-flex align-items-center justify-content-center"
              style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', background: '#FFFFFF', width: '36px', height: '36px' }}
              aria-label="Settings"
            >
              <AiOutlineSetting size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Top 3 Stat Cards with arrows */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link href="/my-reading" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#FFEBE6', color: '#D96B50' }}
                >
                  <AiOutlineBook size={24} />
                </div>
                <div>
                  <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                    3
                  </div>
                  <small className="text-muted" style={{ fontSize: '13px' }}>Currently reading</small>
                </div>
              </div>
              <span className="text-muted fs-5">›</span>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link href="/finished-reads" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#EAF3EC', color: '#4A7C59' }}
                >
                  <AiOutlineCheck size={22} />
                </div>
                <div>
                  <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                    12
                  </div>
                  <small className="text-muted" style={{ fontSize: '13px' }}>Finished reads</small>
                </div>
              </div>
              <span className="text-muted fs-5">›</span>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link href="/wishlist" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }}
                >
                  <AiOutlineHeart size={22} />
                </div>
                <div>
                  <div className="fs-3 fw-bold lh-1" style={{ color: 'var(--rv-ink-plum)' }}>
                    18
                  </div>
                  <small className="text-muted" style={{ fontSize: '13px' }}>Wishlist books</small>
                </div>
              </div>
              <span className="text-muted fs-5">›</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex align-items-center gap-4 border-bottom mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="btn btn-link p-0 text-decoration-none fw-bold small pb-2"
          style={{
            color: activeTab === 'overview' ? 'var(--rv-ink-plum)' : '#8C827A',
            borderBottom: activeTab === 'overview' ? '2.5px solid #D96B50' : 'none',
            fontSize: '14px'
          }}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className="btn btn-link p-0 text-decoration-none fw-bold small pb-2"
          style={{
            color: activeTab === 'reviews' ? 'var(--rv-ink-plum)' : '#8C827A',
            borderBottom: activeTab === 'reviews' ? '2.5px solid #D96B50' : 'none',
            fontSize: '14px'
          }}
        >
          Reviews
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vibecards')}
          className="btn btn-link p-0 text-decoration-none fw-bold small pb-2"
          style={{
            color: activeTab === 'vibecards' ? 'var(--rv-ink-plum)' : '#8C827A',
            borderBottom: activeTab === 'vibecards' ? '2.5px solid #D96B50' : 'none',
            fontSize: '14px'
          }}
        >
          Vibe Cards
        </button>
      </div>

      {/* Main Grid */}
      <div className="row g-4 align-items-start">
        {/* Left Column: Currently on my shelf & Recent reading moments */}
        <div className="col-lg-8">
          {activeTab === 'overview' && (
            <div className="d-flex flex-column gap-4">
              {/* Section 1: Currently on my shelf */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4
                    className="fw-bold mb-0"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                  >
                    Currently on my shelf
                  </h4>
                  <Link
                    href="/my-reading"
                    className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                    style={{ color: '#D96B50' }}
                  >
                    View all →
                  </Link>
                </div>

                <div className="row g-3">
                  {/* Book 1 */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                      <div className="d-flex gap-3 mb-2">
                        <img
                          src="/assets/books/midnight-library.jpg"
                          alt="The Midnight Library"
                          className="rounded-2 shadow-sm flex-shrink-0"
                          style={{ width: '75px', height: '110px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6
                            className="fw-bold mb-0"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            The Midnight Library
                          </h6>
                          <small className="text-muted d-block mb-1.5">Matt Haig</small>
                          <span
                            className="badge rounded-pill fw-normal px-2 py-0.5 mb-2 d-inline-flex align-items-center gap-1"
                            style={{ backgroundColor: '#FFEBE6', color: '#D96B50', fontSize: '11px' }}
                          >
                            📖 Reading
                          </span>
                          <p className="small text-muted mb-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                            A comforting, thought-provoking novel about second chances and the many lives we could have lived.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-top">
                        <Link
                          href="/books/midnight-library"
                          className="fw-semibold text-decoration-none small"
                          style={{ color: '#D96B50', fontSize: '12px' }}
                        >
                          View book →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Book 2 */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                      <div className="d-flex gap-3 mb-2">
                        <img
                          src="/assets/books/coffee-gets-cold.jpg"
                          alt="Before the Coffee Gets Cold"
                          className="rounded-2 shadow-sm flex-shrink-0"
                          style={{ width: '75px', height: '110px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6
                            className="fw-bold mb-0"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            Before the Coffee Gets Cold
                          </h6>
                          <small className="text-muted d-block mb-1.5">Toshikazu Kawaguchi</small>
                          <span
                            className="badge rounded-pill fw-normal px-2 py-0.5 mb-2 d-inline-flex align-items-center gap-1"
                            style={{ backgroundColor: '#FFEBE6', color: '#D96B50', fontSize: '11px' }}
                          >
                            📖 Reading
                          </span>
                          <p className="small text-muted mb-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                            A gentle and moving story about time, connection, and the things we leave unsaid.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-top">
                        <Link
                          href="/books/before-the-coffee-gets-cold"
                          className="fw-semibold text-decoration-none small"
                          style={{ color: '#D96B50', fontSize: '12px' }}
                        >
                          View book →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Recent reading moments */}
              <div>
                <h4
                  className="fw-bold mb-3"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Recent reading moments
                </h4>

                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column gap-3">
                  {/* Moment 1 */}
                  <div className="d-flex align-items-start justify-content-between pb-3 border-bottom">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{ width: '32px', height: '32px', backgroundColor: '#EAF3EC', color: '#4A7C59' }}
                      >
                        <AiOutlineCheck size={16} />
                      </div>
                      <img
                        src="/assets/books/comfort-book.jpg"
                        alt="The Comfort Book"
                        className="rounded-1 flex-shrink-0"
                        style={{ width: '38px', height: '54px', objectFit: 'cover' }}
                      />
                      <div>
                        <p className="fw-semibold mb-0 small text-dark">
                          Finished <strong style={{ color: 'var(--rv-ink-plum)' }}>The Comfort Book</strong>
                        </p>
                        <small className="text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                          Rated 4.5 out of 5.
                        </small>
                        <p className="small text-muted mb-0" style={{ fontSize: '12px' }}>
                          A gentle reminder to be kind to myself, even on the difficult days.
                        </p>
                      </div>
                    </div>
                    <span className="text-muted small flex-shrink-0" style={{ fontSize: '11px' }}>
                      Oct 26, 2026
                    </span>
                  </div>

                  {/* Moment 2 */}
                  <div className="d-flex align-items-start justify-content-between pb-3 border-bottom">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{ width: '32px', height: '32px', backgroundColor: '#FFEBE6', color: '#D96B50' }}
                      >
                        <AiOutlineBook size={16} />
                      </div>
                      <img
                        src="/assets/books/midnight-library.jpg"
                        alt="The Midnight Library"
                        className="rounded-1 flex-shrink-0"
                        style={{ width: '38px', height: '54px', objectFit: 'cover' }}
                      />
                      <div>
                        <p className="fw-semibold mb-0 small text-dark">
                          Started <strong style={{ color: 'var(--rv-ink-plum)' }}>The Midnight Library</strong>
                        </p>
                        <small className="text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                          A new chapter begins.
                        </small>
                        <p className="small text-muted mb-0" style={{ fontSize: '12px' }}>
                          Excited to see where this journey takes me.
                        </p>
                      </div>
                    </div>
                    <span className="text-muted small flex-shrink-0" style={{ fontSize: '11px' }}>
                      Oct 20, 2026
                    </span>
                  </div>

                  {/* Moment 3 */}
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{ width: '32px', height: '32px', backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }}
                      >
                        <AiOutlineHeart size={16} />
                      </div>
                      <img
                        src="/assets/books/morisaki-bookshop.jpg"
                        alt="Days at the Morisaki Bookshop"
                        className="rounded-1 flex-shrink-0"
                        style={{ width: '38px', height: '54px', objectFit: 'cover' }}
                      />
                      <div>
                        <p className="fw-semibold mb-0 small text-dark">
                          Added <strong style={{ color: 'var(--rv-ink-plum)' }}>Days at the Morisaki Bookshop</strong> to wishlist
                        </p>
                        <small className="text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                          Saved for a cozy weekend.
                        </small>
                        <p className="small text-muted mb-0" style={{ fontSize: '12px' }}>
                          This looks like the perfect read for a slow, rainy day.
                        </p>
                      </div>
                    </div>
                    <span className="text-muted small flex-shrink-0" style={{ fontSize: '11px' }}>
                      Oct 18, 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)' }}>
                Your Reviews ({finishedReads.length})
              </h5>
              <div className="d-flex flex-column gap-3">
                {finishedReads.map((f) => (
                  <div key={f.bookId} className="p-3 rounded-3 border bg-light">
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                      The Midnight Library
                    </h6>
                    <div className="d-flex gap-1 text-coral mb-2" style={{ color: '#E27D60' }}>
                      <AiFillStar size={14} /><AiFillStar size={14} /><AiFillStar size={14} /><AiFillStar size={14} /><AiFillStar size={14} />
                    </div>
                    <p className="small text-muted mb-2">
                      {f.privateNotes || 'A wonderful read with memorable characters.'}
                    </p>
                    <small className="text-secondary">{f.finishedAt || 'Oct 2026'}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vibecards' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
              <h5 className="fw-bold mb-2" style={{ color: 'var(--rv-ink-plum)' }}>
                Vibe Cards
              </h5>
              <p className="text-muted small mb-4">
                Shareable 9:16 reading keepsakes generated from your shelf.
              </p>
              <Link href="/vibe-card" className="btn btn-rv-plum rounded-pill px-4 py-2 fw-semibold">
                Generate new Vibe Card
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Sage green My reading vibes */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.3) 0%, transparent 65%)'
              }}
            >
              <h4
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                My reading vibes
              </h4>
              <div className="d-flex flex-wrap gap-2">
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-normal"
                  style={{ backgroundColor: '#FFEBE6', color: '#D96B50', fontSize: '12px' }}
                >
                  Cozy
                </span>
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-normal"
                  style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                >
                  Reflective
                </span>
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-normal"
                  style={{ backgroundColor: '#FFFFFF', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                >
                  Mindful
                </span>
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-normal"
                  style={{ backgroundColor: '#FFE4DA', color: '#D96B50', fontSize: '12px' }}
                >
                  Hopeful
                </span>
              </div>
            </div>

            {/* Widget 2: A little about my reading */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4
                className="fw-bold mb-3"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                A little about my reading
              </h4>

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Favorite genres</small>
                <div className="d-flex flex-wrap gap-2">
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-normal"
                    style={{ backgroundColor: '#F0ECE6', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                  >
                    Fiction
                  </span>
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-normal"
                    style={{ backgroundColor: '#F0ECE6', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                  >
                    Fantasy
                  </span>
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-normal"
                    style={{ backgroundColor: '#F0ECE6', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                  >
                    Nonfiction
                  </span>
                </div>
              </div>

              <div>
                <small className="text-muted d-block mb-1">Preferred language</small>
                <div className="d-flex align-items-center gap-2 small text-dark fw-medium">
                  <AiOutlineGlobal size={16} /> English & Indonesian
                </div>
              </div>
            </div>

            {/* Widget 3: Lilac tinted Your reading story */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)'
              }}
            >
              <div
                className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#E4DAEC', color: 'var(--rv-ink-plum)', width: '36px', height: '36px' }}
              >
                <AiOutlineBook size={18} />
              </div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your reading story
              </h5>
              <p className="text-muted small mb-3">
                See the moods and moments behind your bookshelf.
              </p>
              <Link
                href="/stats"
                className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                View reading stats →
              </Link>
            </div>

            {/* Widget 4: Soft cream Your private space */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#FAF7F2',
                border: '1px solid #EADFD5'
              }}
            >
              <div
                className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#EFE9E4', color: 'var(--rv-ink-plum)', width: '36px', height: '36px' }}
              >
                <AiOutlineLock size={18} />
              </div>
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Your private space
              </h5>
              <p className="text-muted small mb-3">
                Personal notes and reading progress are visible only to you.
              </p>
              <Link
                href="/settings"
                className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                style={{ color: '#D96B50' }}
              >
                Manage privacy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}