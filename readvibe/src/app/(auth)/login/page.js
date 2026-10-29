'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('readvibe_token', data.data.token);
        localStorage.setItem('readvibe_user', JSON.stringify(data.data.user));
        router.push('/discover');
      } else {
        setError(data.message || 'Login gagal.');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghubungi server VibeCore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto bg-white p-4 p-md-5 rounded-4 shadow-sm border" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
            Selamat Datang di ReadVibe
          </h3>
          <p className="text-muted small">Masuk untuk mengelola rak dan kurasi pribadimu</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@readvibe.app"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-rv-plum w-100 py-2 fw-semibold rounded-pill" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="small text-muted mb-0">
            Belum punya akun?{' '}
            <Link href="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--rv-vibe-coral)' }}>
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
