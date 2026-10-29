'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AiOutlineHeart,
  AiOutlineBook,
  AiOutlineFire,
  AiOutlineShareAlt,
  AiOutlineCheckCircle,
  AiOutlineEye,
} from 'react-icons/ai';
import DigitalPreviewModal from '../components/DigitalPreviewModal';
import AddToWishlistModal from '../components/AddToWishlistModal';

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [moodTags, setMoodTags] = useState([]);
  const [editorialPicks, setEditorialPicks] = useState([]);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState(null);
  const [selectedBookForWishlist, setSelectedBookForWishlist] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (savedToken) setToken(savedToken);

    fetch(`${API_URL}/api/books?limit=8`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setFeaturedBooks(res.data);
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

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 text-center text-md-start" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, var(--rv-cream-paper) 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: 'var(--rv-soft-lilac)', color: 'var(--rv-ink-plum)' }}>
                ✨ Kurasi AI & Estetika Membaca
              </span>
              <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.2 }}>
                Temukan Buku yang Selaras dengan Suasana Hatimu
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '1.15rem', lineHeight: 1.7 }}>
                ReadVibe memadukan kurasi pustakawan dengan kecerdasan emosional Google Gemini. Temukan buku sesuai vibe, simpan di smart wishlist, dan buat kartu visual estetik 9:16 untuk dibagikan.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                <Link href="/vibe-matcher" className="btn btn-rv-plum px-4 py-3 rounded-pill fw-bold shadow-sm">
                  ✨ Coba AI Vibe Matcher
                </Link>
                <Link href="/discover" className="btn btn-outline-secondary px-4 py-3 rounded-pill fw-semibold">
                  Jelajah Katalog Buku
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-relative mx-auto" style={{ maxWidth: '340px' }}>
                <div
                  className="rounded-4 shadow-lg p-3 text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #35233F 0%, #201426 100%)',
                    aspectRatio: '9/16',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="p-3 d-flex flex-column h-100">
                    <span className="badge bg-danger rounded-pill align-self-start mb-2" style={{ fontSize: '10px' }}>
                      ✨ VIBE CARD 9:16
                    </span>
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"
                      alt=""
                      className="rounded-3 shadow mb-3 mx-auto"
                      style={{ width: '130px', height: '190px', objectFit: 'cover' }}
                    />
                    <h6 className="fw-bold mb-1 text-center" style={{ fontFamily: 'var(--font-editorial)' }}>
                      Filosofi Teras
                    </h6>
                    <small className="text-white-50 text-center d-block mb-2">Henry Manampiring</small>
                    <div className="text-center text-warning mb-2" style={{ fontSize: '12px' }}>
                      ★★★★★
                    </div>
                    <p className="small text-white-50 fst-italic text-center my-auto" style={{ fontSize: '11px' }}>
                      "Ketenangan sejati datang dari menerima apa yang berada di luar kendali kita."
                    </p>
                    <div className="mt-auto pt-2 border-top border-secondary text-center">
                      <span className="badge bg-light text-dark rounded-pill" style={{ fontSize: '10px' }}>
                        🧘 Calm & Mindful
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Tags Showcase */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
              Pilih Vibe Hari Ini
            </h3>
            <p className="text-muted small">Suasana hati apa yang ingin kamu jelajahi dalam membaca?</p>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {moodTags.map((m) => (
              <Link
                key={m.id}
                href={`/discover?mood=${encodeURIComponent(m.name)}`}
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
                style={{ borderColor: 'var(--rv-border)' }}
              >
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                Koleksi Rekomendasi Terhangat
              </h3>
              <p className="text-muted small mb-0">Pilihan kurasi pustakawan dan trending di komunitas ReadVibe.</p>
            </div>
            <Link href="/discover" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="row g-4">
            {featuredBooks.map((b) => (
              <div key={b.id} className="col-6 col-md-4 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden rv-book-card bg-white">
                  <div className="position-relative">
                    <img
                      src={b.image || 'https://via.placeholder.com/300x450'}
                      alt={b.title}
                      className="card-img-top"
                      style={{ height: '240px', objectFit: 'cover' }}
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
                    <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--rv-ink-plum)' }}>
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
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="display-6 mb-2">✨</div>
                <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>AI Vibe Matcher</h5>
                <p className="text-muted small">Padukan frekuensi emosi dan mood membaca dengan model Gemini 2.5.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="display-6 mb-2">📱</div>
                <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>Vibe Card 9:16</h5>
                <p className="text-muted small">Ekspor kartu estetik rasio 9:16 beresolusi tinggi untuk Instagram Story.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="display-6 mb-2">💖</div>
                <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>Smart Wishlist</h5>
                <p className="text-muted small">Atur prioritas buku incaran dan bagikan tautan wishlist publik.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="display-6 mb-2">📖</div>
                <h5 className="fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>Digital Preview</h5>
                <p className="text-muted small">Baca pratinjau buku langsung melalui Google Books Embedded Viewer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        onSuccess={() => setSelectedBookForWishlist(null)}
      />
    </div>
  );
}
