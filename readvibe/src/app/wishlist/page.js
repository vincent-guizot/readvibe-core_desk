'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineDelete, AiOutlineShareAlt, AiOutlineBook } from 'react-icons/ai';

export default function WishlistPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadWishlist = () => {
    const savedToken = localStorage.getItem('readvibe_token');
    const savedUser = localStorage.getItem('readvibe_user');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch(`${API_URL}/api/wishlists`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setItems(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlist();
  }, [API_URL]);

  const handleRemove = async (id) => {
    if (!confirm('Hapus buku ini dari wishlist?')) return;
    try {
      await fetch(`${API_URL}/api/wishlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadWishlist();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartReading = async (bookId) => {
    try {
      await fetch(`${API_URL}/api/reading/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      loadWishlist();
      alert('Buku berhasil dipindahkan ke rak sedang dibaca!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (!user) return;
    const url = `${window.location.origin}/u/${user.username}/wishlist`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
            💖 Smart Wishlist
          </h2>
          <p className="text-muted small mb-0">Daftar buku incaran dengan tingkat prioritas dan catatan personal.</p>
        </div>

        {user && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-2"
            onClick={handleShare}
          >
            <AiOutlineShareAlt size={16} />
            {copied ? 'Tautan Tersalin!' : 'Bagikan Wishlist Publik'}
          </button>
        )}
      </div>

      {!token ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <p className="text-muted mb-3">Silakan login untuk mengakses Smart Wishlist.</p>
          <Link href="/login" className="btn btn-rv-plum rounded-pill px-4">
            Masuk ke ReadVibe
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <AiOutlineBook size={48} className="text-muted mb-3" />
          <h5>Wishlist masih kosong</h5>
          <p className="text-muted small mb-3">Tambahkan buku impianmu dari katalog atau AI Vibe Matcher.</p>
          <Link href="/discover" className="btn btn-rv-plum rounded-pill px-4">
            Jelajah Buku
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 d-flex flex-row gap-3">
                <img
                  src={item.book?.image || 'https://via.placeholder.com/90x135'}
                  alt={item.book?.title}
                  className="rounded-3 shadow-sm"
                  style={{ width: '85px', height: '125px', objectFit: 'cover' }}
                />
                <div className="d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className={`badge rounded-pill ${
                        item.priority === 'High'
                          ? 'bg-danger-subtle text-danger'
                          : item.priority === 'Medium'
                          ? 'bg-warning-subtle text-warning'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      Prioritas {item.priority || 'Medium'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => handleRemove(item.id)}
                      title="Hapus dari Wishlist"
                    >
                      <AiOutlineDelete size={16} />
                    </button>
                  </div>

                  <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--rv-ink-plum)' }}>
                    {item.book?.title}
                  </h6>
                  <small className="text-muted mb-2">{item.book?.author?.name || 'Penulis'}</small>

                  {item.reason && (
                    <small className="text-muted fst-italic mb-2 text-truncate" style={{ fontSize: '11px' }}>
                      "{item.reason}"
                    </small>
                  )}

                  <div className="mt-auto pt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-semibold"
                      style={{ fontSize: '12px' }}
                      onClick={() => handleStartReading(item.bookId)}
                    >
                      Mulai Baca Buku Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
