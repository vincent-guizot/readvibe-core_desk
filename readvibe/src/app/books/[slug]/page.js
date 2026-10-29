'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AiFillStar, AiOutlineHeart, AiOutlineEye, AiOutlineBook } from 'react-icons/ai';
import DigitalPreviewModal from '../../../components/DigitalPreviewModal';
import AddToWishlistModal from '../../../components/AddToWishlistModal';

export default function BookDetailPage() {
  const { slug } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState(null);
  const [selectedBookForWishlist, setSelectedBookForWishlist] = useState(null);
  const [token, setToken] = useState(null);

  // Review submission
  const [publicReview, setPublicReview] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadBook = () => {
    fetch(`${API_URL}/api/books/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setBook(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (savedToken) setToken(savedToken);
    loadBook();
  }, [slug, API_URL]);

  const handleStartReading = async () => {
    if (!token) {
      alert('Silakan login untuk menambahkan buku ke rak membaca.');
      return;
    }
    try {
      await fetch(`${API_URL}/api/reading/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: book.id }),
      });
      alert('Buku berhasil ditambahkan ke rak sedang dibaca!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Silakan login untuk mengirim ulasan.');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          rating,
          publicReview,
          moodTag: book.moods?.[0]?.name || 'Thoughtful',
        }),
      });
      if (res.ok) {
        setPublicReview('');
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
        loadBook();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-5 text-center">
        <h4>Buku tidak ditemukan</h4>
        <Link href="/discover" className="btn btn-rv-plum rounded-pill px-4 mt-3">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link href="/discover" className="text-decoration-none small text-muted">
          &larr; Kembali ke Katalog
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-5">
        <div className="row g-4">
          <div className="col-md-4 col-lg-3 text-center">
            <img
              src={book.image || 'https://via.placeholder.com/300x450'}
              alt={book.title}
              className="img-fluid rounded-4 shadow-sm"
              style={{ maxHeight: '380px', objectFit: 'cover' }}
            />
          </div>

          <div className="col-md-8 col-lg-9 d-flex flex-column">
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-secondary-subtle text-dark rounded-pill">
                {book.genre?.name || 'Umum'}
              </span>
              {(book.moods || []).map((m) => (
                <span key={m.id} className="badge bg-light text-dark border rounded-pill">
                  {m.name}
                </span>
              ))}
            </div>

            <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
              {book.title}
            </h2>
            <h5 className="text-muted mb-3">{book.author?.name || 'Penulis Tidak Diketahui'}</h5>

            <p className="text-muted small mb-4" style={{ lineHeight: '1.7' }}>
              {book.description || 'Tidak ada deskripsi tersedia untuk buku ini.'}
            </p>

            <div className="row g-2 mb-4 text-muted small">
              <div className="col-6 col-sm-4">
                <strong>ISBN:</strong> {book.isbn || '-'}
              </div>
              <div className="col-6 col-sm-4">
                <strong>Tahun:</strong> {book.year || '-'}
              </div>
              <div className="col-6 col-sm-4">
                <strong>Halaman:</strong> {book.page || '-'} hal
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-auto">
              <button
                type="button"
                className="btn btn-rv-plum rounded-pill px-4 fw-semibold"
                onClick={handleStartReading}
              >
                Mulai Membaca Buku Ini
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={() => setSelectedBookForWishlist(book)}
              >
                <AiOutlineHeart size={18} className="me-1 text-danger" /> Tambah Wishlist
              </button>
              <button
                type="button"
                className="btn btn-light border rounded-pill px-3"
                onClick={() => setSelectedBookForPreview(book)}
              >
                <AiOutlineEye size={18} className="me-1" /> Pratinjau Buku
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <h4 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          💬 Ulasan & Resonansi Pembaca
        </h4>

        {/* Submit Review */}
        <div className="p-3 bg-light rounded-3 mb-4">
          <h6 className="fw-bold mb-2">Tulis Ulasan Publikmu</h6>
          {reviewSuccess && <div className="alert alert-success py-2 small">Ulasan berhasil dikirim!</div>}
          <form onSubmit={handleReviewSubmit}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="small text-muted">Rating:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: '100px' }}
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
            <textarea
              className="form-control mb-2"
              rows="2"
              placeholder="Bagikan kesan membacamu..."
              value={publicReview}
              onChange={(e) => setPublicReview(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-sm btn-rv-coral text-white rounded-pill px-4 fw-semibold"
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        </div>

        {/* Existing Reviews */}
        {(book.reviews || []).length === 0 ? (
          <p className="text-muted small mb-0">Belum ada ulasan untuk buku ini. Jadilah yang pertama mengulas!</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {book.reviews.map((rev) => (
              <div key={rev.id} className="p-3 border rounded-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold small">@{rev.user?.username || 'Pembaca'}</span>
                  <div className="text-warning">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <AiFillStar key={i} size={12} />
                    ))}
                  </div>
                </div>
                <p className="small text-muted mb-0">"{rev.publicReview}"</p>
              </div>
            ))}
          </div>
        )}
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
        onSuccess={() => setSelectedBookForWishlist(null)}
      />
    </div>
  );
}
