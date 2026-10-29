'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineHeart, AiOutlineSearch, AiOutlineEye } from 'react-icons/ai';
import DigitalPreviewModal from '../../components/DigitalPreviewModal';
import AddToWishlistModal from '../../components/AddToWishlistModal';

export default function DiscoverPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [books, setBooks] = useState([]);
  const [moodTags, setMoodTags] = useState([]);
  const [editorialPicks, setEditorialPicks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedBookForPreview, setSelectedBookForPreview] = useState(null);
  const [selectedBookForWishlist, setSelectedBookForWishlist] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (savedToken) setToken(savedToken);

    fetch(`${API_URL}/api/books?limit=40`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setBooks(res.data);
      })
      .catch(console.error);

    fetch(`${API_URL}/api/moods`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setMoodTags(res.data);
      })
      .catch(console.error);

    fetch(`${API_URL}/api/editorial?active=true`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setEditorialPicks(res.data);
      })
      .catch(console.error);
  }, [API_URL]);

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = b.title.toLowerCase().includes(q) || (b.author?.name || '').toLowerCase().includes(q);
    const matchMood = !selectedMood || (b.moods || []).some((m) => m.name.toLowerCase().includes(selectedMood.toLowerCase()));
    return matchSearch && matchMood;
  });

  return (
    <div className="container py-4">
      {/* Editorial Picks Header */}
      {editorialPicks.length > 0 && (
        <div className="mb-5 p-4 rounded-4 shadow-sm" style={{ backgroundColor: 'var(--rv-soft-lilac)' }}>
          <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
            ✨ Pilihan Editor Bulan Ini (Editorial Picks)
          </h5>
          <div className="row g-3">
            {editorialPicks.slice(0, 3).map((pick) => (
              <div key={pick.id} className="col-md-4">
                <div className="bg-white p-3 rounded-3 h-100 border d-flex gap-3 align-items-center">
                  <img
                    src={pick.book?.image || 'https://via.placeholder.com/60x90'}
                    alt={pick.book?.title}
                    className="rounded"
                    style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1 small text-truncate" style={{ maxWidth: '180px' }}>
                      {pick.book?.title}
                    </h6>
                    <small className="text-muted d-block mb-1">{pick.book?.author?.name || 'Penulis'}</small>
                    <p className="small mb-0 fst-italic text-truncate" style={{ maxWidth: '180px', fontSize: '11px' }}>
                      "{pick.note}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
            Katalog & Kurasi Bacaan
          </h2>
          <p className="text-muted small mb-0">Eksplorasi buku berdasarkan suasana hati dan preferensimu.</p>
        </div>

        <div className="d-flex gap-2" style={{ maxWidth: '360px', width: '100%' }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <AiOutlineSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Cari judul atau penulis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mood Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSelectedMood('')}
          className={`btn btn-sm rounded-pill px-3 ${!selectedMood ? 'btn-rv-plum text-white' : 'btn-outline-secondary'}`}
        >
          Semua Mood
        </button>
        {moodTags.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMood(selectedMood === m.name ? '' : m.name)}
            className={`btn btn-sm rounded-pill px-3 ${
              selectedMood === m.name ? 'btn-rv-plum text-white' : 'btn-outline-secondary'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="row g-4">
        {filteredBooks.map((b) => (
          <div key={b.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden rv-book-card">
              <div className="position-relative">
                <img
                  src={b.image || 'https://via.placeholder.com/300x450'}
                  alt={b.title}
                  className="card-img-top"
                  style={{ height: '260px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                  onClick={() => setSelectedBookForWishlist(b)}
                  title="Tambah ke Wishlist"
                >
                  <AiOutlineHeart size={18} style={{ color: 'var(--rv-vibe-coral)' }} />
                </button>
              </div>

              <div className="card-body p-3 d-flex flex-column">
                <h6 className="fw-bold mb-1 text-truncate" title={b.title} style={{ color: 'var(--rv-ink-plum)' }}>
                  {b.title}
                </h6>
                <small className="text-muted mb-2">{b.author?.name || 'Penulis'}</small>

                <div className="d-flex flex-wrap gap-1 mb-3">
                  {(b.moods || []).slice(0, 2).map((m) => (
                    <span key={m.id} className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>
                      {m.name}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-2 border-top d-flex gap-2">
                  <Link
                    href={`/books/${b.id}`}
                    className="btn btn-sm btn-outline-secondary rounded-pill flex-grow-1"
                    style={{ fontSize: '12px' }}
                  >
                    Detail
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-rv-plum rounded-pill px-3"
                    onClick={() => setSelectedBookForPreview(b)}
                    title="Pratinjau Buku"
                  >
                    <AiOutlineEye size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <DigitalPreviewModal
        isOpen={!!selectedBookForPreview}
        onClose={() => setSelectedBookForPreview(null)}
        book={selectedBookForPreview}
      />

      <AddToWishlistModal
        isOpen={!!selectedBookForWishlist}
        onClose={() => setSelectedBookForWishlist(null)}
        book={selectedBookForWishlist}
        token={token}
        onSuccess={() => {
          setSelectedBookForWishlist(null);
        }}
      />
    </div>
  );
}
