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
import { readVibeStore } from '../../../lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3360/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          fullname: name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('readvibe_token', data.data.token);
        localStorage.setItem('readvibe_user', JSON.stringify(data.data.user));
        readVibeStore.updateUser(data.data.user);
        router.push('/discover');
      } else {
        setError(data.message || 'Registrasi gagal.');
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
            <span style={{ fontSize: '28px' }}>📖</span>
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
        <div className="col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 bg-white">
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
              Create your account.
            </h2>
            <p className="text-muted small mb-4">
              A little about you, a world of stories ahead.
            </p>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              {/* Row: Full Name & Username */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-bold text-dark mb-1">Full name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-bold text-dark mb-1">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">@</span>
                    <input
                      type="text"
                      className="form-control border-start-0 rounded-end-3"
                      placeholder="yourusername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Email address</label>
                <input
                  type="email"
                  className="form-control rounded-3"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="form-label small fw-bold text-dark mb-1">Password</label>
                <div className="input-group rounded-3 overflow-hidden border">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-0 bg-white shadow-none"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0 text-muted px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
              </div>
              <small className="text-muted d-block mb-3" style={{ fontSize: '12px' }}>
                Use at least 12 characters.
              </small>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Confirm password</label>
                <div className="input-group rounded-3 overflow-hidden border">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control border-0 bg-white shadow-none"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0 text-muted px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="agreeCheck"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ accentColor: '#D96B50' }}
                />
                <label className="form-check-label small text-muted" htmlFor="agreeCheck">
                  I agree to the{' '}
                  <span style={{ color: '#D96B50', textDecoration: 'underline', cursor: 'pointer' }}>
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span style={{ color: '#D96B50', textDecoration: 'underline', cursor: 'pointer' }}>
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 rounded-3 py-2.5 fw-semibold text-white shadow-sm mb-4"
                style={{ backgroundColor: 'var(--rv-ink-plum)' }}
              >
                {loading ? 'Creating account...' : 'Create account →'}
              </button>

              <div className="text-center mb-4">
                <span className="text-muted small">Already have an account? </span>
                <Link
                  href="/login"
                  className="small fw-semibold text-decoration-none"
                  style={{ color: '#D96B50' }}
                >
                  Sign in
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