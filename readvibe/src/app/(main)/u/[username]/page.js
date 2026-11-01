'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AiFillStar,
  AiOutlineBook,
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineShareAlt,
  AiOutlineGlobal,
  AiOutlineCheck
} from 'react-icons/ai';
import { BsBookmarks } from 'react-icons/bs';
import { readVibeStore } from '@/lib/store';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username || 'adminreadvibe';

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const storiesFromShelf = [
    {
      id: 'comfort-book',
      title: 'The Comfort Book',
      author: 'Matt Haig',
      coverUrl: '/assets/books/comfort-book.jpg',
      rating: 4.5,
      moods: ['Cozy', 'Hopeful', 'Reflective']
    },
    {
      id: 'little-prince',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: '/assets/books/little-prince.jpg',
      rating: 5.0,
      moods: ['Reflective', 'Mindful', 'Hopeful']
    },
    {
      id: 'psalm-for-wild-built',
      title: 'A Psalm for the Wild-Built',
      author: 'Becky Chambers',
      coverUrl: '/assets/books/wild-built.jpg',
      rating: 4.0,
      moods: ['Mindful', 'Cozy', 'Hopeful']
    }
  ];

  const readerReflections = [
    {
      id: 'comfort-book',
      title: 'The Comfort Book',
      coverUrl: '/assets/books/comfort-book.jpg',
      rating: 4.5,
      date: 'May 14, 2026',
      content: "A gentle reminder that it's okay to be a work in progress, and that small joys can carry us through harder days."
    },
    {
      id: 'little-prince',
      title: 'The Little Prince',
      coverUrl: '/assets/books/little-prince.jpg',
      rating: 5.0,
      date: 'Mar 2, 2026',
      content: 'A simple yet profound story that always finds a new meaning, no matter how many times I return to it.'
    }
  ];

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
            <span className="text-secondary">Readers</span>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Admin ReadVibe
          </li>
        </ol>
      </nav>

      {/* Header Banner Card */}
      <div
        className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4 position-relative overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 50%, rgba(188, 168, 203, 0.25) 0%, transparent 50%), radial-gradient(circle at 0% 50%, rgba(141, 170, 145, 0.2) 0%, transparent 40%)'
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          {/* Avatar and info */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt="Admin ReadVibe"
              className="rounded-4 object-fit-cover shadow-sm"
              style={{ width: '105px', height: '105px' }}
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent';
              }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2
                  className="fw-bold mb-0"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Admin ReadVibe
                </h2>
              </div>
              <p className="text-muted small mb-2">@adminreadvibe</p>
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

          {/* Right actions */}
          <div className="d-flex flex-column align-items-md-end gap-3 flex-shrink-0">
            <span
              className="badge rounded-pill fw-normal px-2.5 py-1 d-inline-flex align-items-center gap-1"
              style={{ backgroundColor: '#FAF7F2', color: 'var(--rv-ink-plum)', border: '1px solid #EADFD5', fontSize: '11px' }}
            >
              <AiOutlineGlobal size={12} /> Public profile
            </span>

            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
                style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', background: '#FFFFFF', fontSize: '12px' }}
              >
                <AiOutlineShareAlt size={14} />
                {copied ? 'Link Copied!' : 'Share profile'}
              </button>

              <Link
                href={`/u/${username}/wishlist`}
                className="btn btn-sm rounded-pill px-3 py-2 fw-semibold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: 'var(--rv-ink-plum)', fontSize: '12px' }}
              >
                <BsBookmarks size={12} /> View wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric counters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="fs-3 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
              12
            </div>
            <small className="text-muted" style={{ fontSize: '13px' }}>Shared finished reads</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="fs-3 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
              8
            </div>
            <small className="text-muted" style={{ fontSize: '13px' }}>Public reviews</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="fs-3 fw-bold lh-1 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
              18
            </div>
            <small className="text-muted" style={{ fontSize: '13px' }}>Wishlist books</small>
          </div>
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
        {/* Left Column: Stories from this shelf & Reader reflections */}
        <div className="col-lg-8">
          {activeTab === 'overview' && (
            <div className="d-flex flex-column gap-4">
              {/* Stories from this shelf */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4
                    className="fw-bold mb-0"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                  >
                    Stories from this shelf
                  </h4>
                  <Link
                    href={`/u/${username}/wishlist`}
                    className="fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1"
                    style={{ color: '#D96B50' }}
                  >
                    View all →
                  </Link>
                </div>

                <div className="row g-3">
                  {storiesFromShelf.map((b) => (
                    <div key={b.id} className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="rounded-2 shadow-sm mb-2 w-100 object-fit-cover"
                            style={{ height: '170px' }}
                          />
                          <h6
                            className="fw-bold mb-0 text-truncate"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            {b.title}
                          </h6>
                          <small className="text-muted d-block mb-1 text-truncate">{b.author}</small>

                          {/* Stars */}
                          <div className="d-flex align-items-center gap-1 mb-2 text-coral" style={{ color: '#E27D60' }}>
                            <AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} />
                            <small className="text-muted ms-1" style={{ fontSize: '11px' }}>{b.rating}</small>
                          </div>

                          {/* Mood Pills */}
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {b.moods.map((m) => (
                              <span
                                key={m}
                                className="badge rounded-pill fw-normal"
                                style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '10px' }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span
                            className="badge rounded-pill fw-normal px-2 py-0.5 d-inline-flex align-items-center gap-1"
                            style={{ backgroundColor: '#E0EAE1', color: '#315438', fontSize: '11px' }}
                          >
                            ✓ Finished
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reader reflections */}
              <div>
                <h4
                  className="fw-bold mb-3"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                >
                  Reader reflections
                </h4>

                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column gap-3">
                  {readerReflections.map((r, i) => (
                    <div
                      key={r.id}
                      className={`d-flex align-items-start justify-content-between gap-3 ${
                        i !== readerReflections.length - 1 ? 'pb-3 border-bottom' : ''
                      }`}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <img
                          src={r.coverUrl}
                          alt={r.title}
                          className="rounded-1 flex-shrink-0"
                          style={{ width: '42px', height: '60px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6
                            className="fw-bold mb-0"
                            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                          >
                            {r.title}
                          </h6>
                          <div className="d-flex align-items-center gap-1 mb-1 text-coral" style={{ color: '#E27D60' }}>
                            <AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} /><AiFillStar size={12} />
                            <small className="text-muted ms-1" style={{ fontSize: '11px' }}>{r.rating}</small>
                          </div>
                          <p className="small text-muted mb-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                            {r.content}
                          </p>
                        </div>
                      </div>
                      <span className="text-muted small flex-shrink-0" style={{ fontSize: '11px' }}>
                        {r.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)' }}>
                Public Reviews
              </h5>
              <p className="text-muted small">8 public reflections shared by this reader.</p>
            </div>
          )}

          {activeTab === 'vibecards' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
              <h5 className="fw-bold mb-2" style={{ color: 'var(--rv-ink-plum)' }}>
                Shared Vibe Cards
              </h5>
              <p className="text-muted small">Keepsakes and story cards from finished readings.</p>
            </div>
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Reading vibes */}
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
                Reading vibes
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

            {/* Widget 2: Favorite genres & Reading languages */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: '16px' }}>📚</span>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--rv-ink-plum)' }}>
                    Favorite genres
                  </h6>
                </div>
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
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: '16px' }}>💬</span>
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--rv-ink-plum)' }}>
                    Reading languages
                  </h6>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-normal"
                    style={{ backgroundColor: '#F0ECE6', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                  >
                    English
                  </span>
                  <span
                    className="badge rounded-pill px-3 py-1.5 fw-normal"
                    style={{ backgroundColor: '#F0ECE6', color: 'var(--rv-ink-plum)', fontSize: '12px' }}
                  >
                    Indonesian
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 3: A wishlist worth exploring */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)'
              }}
            >
              <h5
                className="fw-bold mb-1"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                A wishlist worth exploring
              </h5>
              <p className="text-muted small mb-3">
                Discover the books on this reader&apos;s next-chapter list.
              </p>
              <Link
                href={`/u/${username}/wishlist`}
                className="btn btn-sm rounded-pill w-100 py-2.5 fw-semibold text-white d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
                style={{ backgroundColor: 'var(--rv-ink-plum)' }}
              >
                Explore public wishlist →
              </Link>
            </div>

            {/* Widget 4: Shared with intention */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#FAF7F2',
                border: '1px solid #EADFD5'
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle p-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#EFE9E4', color: 'var(--rv-ink-plum)', width: '36px', height: '36px' }}
                >
                  <AiOutlineGlobal size={18} />
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
                  >
                    Shared with intention
                  </h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                    This profile shows only the books and reflections this reader chose to share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}