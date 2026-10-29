'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineHeart, AiOutlineSync, AiOutlineCheckCircle, AiOutlineEye } from 'react-icons/ai';
import DigitalPreviewModal from '../../components/DigitalPreviewModal';
import AddToWishlistModal from '../../components/AddToWishlistModal';

export default function VibeMatcherPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [availableMoods, setAvailableMoods] = useState([
    '🧘 Calm & Mindful',
    '🌧️ Melancholic & Deep',
    '⚡ Inspired & Driven',
    '🔮 Mysterious & Thrilling',
    '💖 Warm & Romantic',
    '🌿 Escapist & Cozy',
  ]);
  const [selectedMoods, setSelectedMoods] = useState(['🧘 Calm & Mindful']);
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedBookForPreview, setSelectedBookForPreview] = useState(null);
  const [selectedBookForWishlist, setSelectedBookForWishlist] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (savedToken) setToken(savedToken);

    fetch(`${API_URL}/api/moods`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAvailableMoods(res.data.map((m) => m.name));
        }
      })
      .catch(console.error);
  }, [API_URL]);

  const toggleMood = (mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleMatch = async (e) => {
    e.preventDefault();
    if (selectedMoods.length === 0 && !promptText.trim()) {
      alert('Pilih setidaknya satu mood tag atau tuliskan suasana hatimu.');
      return;
    }

    setLoading(true);
    setSearched(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/recommendations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodTags: selectedMoods,
          queryText: promptText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.matches) {
        setMatches(data.data.matches);
      } else {
        setErrorMsg(data.message || 'Gagal menghasilkan rekomendasi vibe.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke VibeCore AI service. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Hero Header */}
      <div className="text-center mb-5 mx-auto" style={{ maxWidth: '680px' }}>
        <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: 'var(--rv-soft-lilac)', color: 'var(--rv-ink-plum)' }}>
          ✨ Powered by Google Gemini AI & VibeCore
        </span>
        <h1 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          AI Vibe Matcher
        </h1>
        <p className="text-muted">
          Pilih suasana hati atau ceritakan harimu dengan kata-katamu sendiri. Kecerdasan buatan akan memadukan frekuensi emosimu dengan kurasi buku terbaik.
        </p>
      </div>

      {/* Form Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-5 mx-auto bg-white" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleMatch}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted text-uppercase mb-2">
              1. Pilih Vibe / Suasana Hati
            </label>
            <div className="d-flex flex-wrap gap-2">
              {availableMoods.map((m) => {
                const isSelected = selectedMoods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                      isSelected
                        ? 'btn-rv-coral text-white shadow-sm'
                        : 'btn-outline-secondary'
                    }`}
                  >
                    {m} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-muted text-uppercase mb-2">
              2. Ceritakan Suasana Hatimu (Opsional)
            </label>
            <textarea
              className="form-control rounded-3 p-3"
              rows="3"
              placeholder="Misal: 'Sedang lelah setelah kerja berat, butuh bacaan yang hangat dan tidak terlalu teknis untuk menemani malam tenang...'"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn btn-rv-plum px-5 py-3 rounded-pill fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <AiOutlineSync className="spinner-border spinner-border-sm me-2" />
                  Mencocokkan Frekuensi Buku...
                </>
              ) : (
                '🔍 Temukan Rekomendasi Bukuku'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="mx-auto" style={{ maxWidth: '960px' }}>
          <h4 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
            🎯 Hasil Kurasi Suasana Hati ({matches.length} Buku Ditemukan)
          </h4>

          {errorMsg && (
            <div className="alert alert-warning py-3 rounded-3 mb-4">
              {errorMsg}
            </div>
          )}

          {matches.length === 0 && !loading && !errorMsg && (
            <div className="text-center py-5 bg-white rounded-4 border">
              <p className="text-muted mb-0">
                Tidak ada buku yang cocok dengan kombinasi mood ini. Coba pilih mood yang lebih umum atau perluas deskripsimu.
              </p>
            </div>
          )}

          <div className="row g-4">
            {matches.map((item) => {
              const book = item.book || item;
              const matchPercent = Math.round(item.matchScore ? item.matchScore * 100 : 88);
              return (
                <div key={book.id} className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 d-flex flex-row gap-3">
                    <img
                      src={book.image || 'https://via.placeholder.com/120x180'}
                      alt={book.title}
                      className="rounded-3 shadow-sm"
                      style={{ width: '100px', height: '150px', objectFit: 'cover' }}
                    />
                    <div className="d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge rounded-pill bg-success-subtle text-success fw-bold" style={{ fontSize: '11px' }}>
                          ⚡ {matchPercent}% Match
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light p-1 rounded-circle"
                          onClick={() => setSelectedBookForWishlist(book)}
                          title="Tambah ke Wishlist"
                        >
                          <AiOutlineHeart size={18} style={{ color: 'var(--rv-vibe-coral)' }} />
                        </button>
                      </div>

                      <h6 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                        {book.title}
                      </h6>
                      <small className="text-muted mb-2">{book.author?.name || 'Penulis'}</small>

                      <div className="bg-light p-2 rounded-2 mb-2 flex-grow-1">
                        <small className="text-muted d-block fst-italic" style={{ fontSize: '11px' }}>
                          "{item.explanation || 'Resonansi mood yang selaras dengan suasana hatimu.'}"
                        </small>
                      </div>

                      <div className="d-flex gap-2 mt-auto">
                        <Link
                          href={`/books/${book.id}`}
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                          style={{ fontSize: '11px' }}
                        >
                          Lihat Detail
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-rv-plum rounded-pill px-3"
                          onClick={() => setSelectedBookForPreview(book)}
                          style={{ fontSize: '11px' }}
                        >
                          Pratinjau
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
