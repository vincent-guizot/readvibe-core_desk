'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicWishlistPage() {
  const { username } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/members?search=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then(async (res) => {
        const found = res.data?.members?.find((m) => m.username.toLowerCase() === username.toLowerCase());
        if (found) {
          setUser(found);
          const wishRes = await fetch(`${API_URL}/api/wishlists/user/${found.id}`);
          const wishData = await wishRes.json();
          if (wishData.data?.items) {
            setWishlist(wishData.data.items);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username, API_URL]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link href={`/u/${username}`} className="text-decoration-none small text-muted">
          &larr; Kembali ke Profil @{username}
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 text-center mx-auto" style={{ maxWidth: '720px' }}>
        <h3 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          💖 Wishlist Publik @{username}
        </h3>
        <p className="text-muted small mb-0">Daftar buku impian yang ingin dibaca oleh {user?.profile?.fullname || username}.</p>
      </div>

      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        {wishlist.length === 0 ? (
          <div className="p-4 bg-white rounded-4 border text-center text-muted small">
            Belum ada buku dalam wishlist publik pengguna ini.
          </div>
        ) : (
          <div className="row g-3">
            {wishlist.map((item) => (
              <div key={item.id} className="col-md-6">
                <div className="p-3 bg-white rounded-3 border d-flex gap-3 align-items-center h-100">
                  <img
                    src={item.book?.image || 'https://via.placeholder.com/60x90'}
                    alt=""
                    className="rounded"
                    style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1">{item.book?.title}</h6>
                    <small className="text-muted d-block mb-1">{item.book?.author?.name || 'Penulis'}</small>
                    <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '10px' }}>
                      Prioritas: {item.priority || 'Medium'}
                    </span>
                    {item.reason && <p className="small text-muted mt-1 mb-0 fst-italic">"{item.reason}"</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
