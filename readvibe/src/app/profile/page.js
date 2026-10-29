'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState('');
  const [image, setImage] = useState('');
  const [saved, setSaved] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('readvibe_token');
    if (!savedToken) return;
    setToken(savedToken);

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          setFullname(res.data.user.profile?.fullname || '');
          setImage(res.data.user.profile?.image || '');
        }
      })
      .catch(console.error);
  }, [API_URL]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullname, image }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          👤 Profil Pembaca
        </h2>
        <p className="text-muted small">Kelola identitas dan preferensi akun ReadVibe.</p>
      </div>

      {!token ? (
        <div className="text-center py-5 bg-white rounded-4 border p-4">
          <p className="text-muted mb-3">Silakan login untuk mengakses profil.</p>
          <Link href="/login" className="btn btn-rv-plum rounded-pill px-4">
            Masuk ke ReadVibe
          </Link>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mx-auto" style={{ maxWidth: '640px' }}>
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <img
              src={image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
              alt=""
              className="rounded-circle shadow-sm"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="fw-bold mb-0" style={{ color: 'var(--rv-ink-plum)' }}>
                {user?.profile?.fullname || user?.username}
              </h5>
              <small className="text-muted">@{user?.username} &bull; {user?.email}</small>
            </div>
          </div>

          {saved && <div className="alert alert-success py-2 small mb-3">Profil berhasil diperbarui!</div>}

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nama Lengkap</label>
              <input
                type="text"
                className="form-control"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">URL Foto Avatar</label>
              <input
                type="url"
                className="form-control"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="btn btn-rv-plum rounded-pill px-4 fw-semibold">
              Simpan Perubahan Profil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
