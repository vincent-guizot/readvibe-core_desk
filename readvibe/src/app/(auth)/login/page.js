'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineArrowLeft,
  AiOutlineLock
} from 'react-icons/ai';
import { readVibeStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('member@readvibe.app');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3360/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('readvibe_token', data.data.token);
        localStorage.setItem('readvibe_user', JSON.stringify(data.data.user));
        readVibeStore.updateUser(data.data.user);
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
    <div className="container-fluid p-0 min-vh-100 d-flex bg-white">
      <div className="row g-0 w-100 min-vh-100">
        {/* Left Side: Artwork & Branding */}
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 position-relative"
          style={{
            backgroundColor: '#F3EEF7',
            backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(188, 168, 203, 0.4) 0%, transparent 60%)'
          }}
        >
          {/* Top Logo */}
          <div className="d-flex align-items-center gap-2">
            <img
              src="/assets/logos/readvibe-horizontal-color.png"
              alt="ReadVibe"
              style={{ height: '36px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span
              className="fw-bold fs-3"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
            >
              ReadVibe
            </span>
          </div>

          {/* Center Illustration & Catchphrase */}
          <div className="my-auto py-4 text-center">
            <h1
              className="display-5 fw-bold mb-3"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.15 }}
            >
              Your next chapter
              <br />
              starts here.
            </h1>
            <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem' }}>
              Build your shelf. Find your vibe. Share your stories.
            </p>

            <img
              src="/assets/illustrations/books-login.png"
              alt="Books and flowers"
              className="img-fluid mx-auto"
              style={{ maxHeight: '360px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/assets/illustrations/book-stack-with-flower-vase.png';
              }}
            />

            <div className="mt-4">
              <p
                className="fst-italic text-muted mb-1"
                style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.05rem' }}
              >
                Books. Better days. Brighter you.
              </p>
              <span className="text-muted small">— 🌿 —</span>
            </div>
          </div>

          <div />
        </div>

        {/* Right Side: Form */}
        <div
          className="col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 position-relative"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          {/* Decorative Corner Leaves (matching screenshot style) */}
          <div
            className="position-absolute top-0 end-0 p-3 opacity-25 d-none d-md-block pointer-events-none"
            style={{ fontSize: '2.5rem', userSelect: 'none' }}
          >
            🌿
          </div>
          <div
            className="position-absolute bottom-0 end-0 p-3 opacity-25 d-none d-md-block pointer-events-none"
            style={{ fontSize: '2.5rem', userSelect: 'none' }}
          >
            🍃
          </div>

          <div className="w-100 mx-auto" style={{ maxWidth: '440px' }}>
            {/* Back link */}
            <div className="mb-4">
              <Link
                href="/discover"
                className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1.5"
                style={{ color: '#D96B50' }}
              >
                <AiOutlineArrowLeft size={14} /> Back to discover
              </Link>
            </div>

            <h2
              className="display-6 fw-bold mb-1"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
            >
              Welcome back.
            </h2>
            <p className="text-muted small mb-4">
              Pick up where you left off, and see what&apos;s new on your shelf.
            </p>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email Address */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Email address</label>
                <input
                  type="email"
                  className="form-control rounded-3 bg-white"
                  style={{ borderColor: '#E5DFD7', padding: '10px 14px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-dark mb-0">Password</label>
                  <Link
                    href="/forgot-password"
                    className="small text-decoration-none fw-semibold"
                    style={{ color: '#D96B50', fontSize: '13px' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group rounded-3 overflow-hidden border bg-white" style={{ borderColor: '#E5DFD7' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-0 bg-transparent shadow-none"
                    style={{ padding: '10px 14px' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-transparent border-0 text-muted px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberCheck"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#D96B50' }}
                />
                <label className="form-check-label small text-muted" htmlFor="rememberCheck">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 rounded-3 py-2.5 fw-semibold text-white shadow-sm mb-4"
                style={{ backgroundColor: 'var(--rv-ink-plum)' }}
              >
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>

              <div className="text-center mb-4">
                <span className="text-muted small">Don&apos;t have an account? </span>
                <Link
                  href="/register"
                  className="small fw-semibold text-decoration-none"
                  style={{ color: '#D96B50' }}
                >
                  Create account
                </Link>
              </div>

              {/* Security note */}
              <div className="d-flex align-items-center justify-content-center gap-1.5 text-muted small" style={{ fontSize: '12px' }}>
                <AiOutlineLock size={14} /> Your reading journey, safely yours.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
