'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiOutlineMail,
  AiOutlineKey,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineArrowLeft,
  AiOutlineCheckCircle
} from 'react-icons/ai';

export default function ForgotResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = Forgot Password, 2 = Reset Password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendResetLink = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage(`A reset link has been dispatched to ${email || 'your email'}. You can now set your new password.`);
      setStep(2);
    }, 600);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please verify both fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Password has been successfully reset! Redirecting to sign in.');
      router.push('/login');
    }, 600);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between position-relative overflow-hidden"
      style={{
        backgroundColor: '#FAF7F2',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(243, 238, 247, 0.8) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(238, 244, 239, 0.7) 0%, transparent 50%)'
      }}
    >
      {/* Top Header Bar */}
      <header className="p-4 p-md-5 d-flex align-items-center justify-content-between z-2 position-relative">
        <Link href="/discover" className="d-inline-flex align-items-center gap-2 text-decoration-none">
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
        </Link>

        {/* Step indicator switcher (Allows toggling between 01 and 02 as in reference mockup) */}
        <div className="d-none d-md-flex align-items-center bg-white rounded-pill px-3 py-1 shadow-sm border border-light-subtle">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-semibold ${step === 1 ? 'btn-rv-plum text-white' : 'text-muted'}`}
            onClick={() => setStep(1)}
          >
            01 — Forgot Password
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-semibold ${step === 2 ? 'btn-rv-plum text-white' : 'text-muted'}`}
            onClick={() => setStep(2)}
          >
            02 — Reset Password
          </button>
        </div>

        <Link
          href="/login"
          className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1.5"
          style={{ color: '#D96B50' }}
        >
          <AiOutlineArrowLeft size={14} /> Back to sign in
        </Link>
      </header>

      {/* Decorative Botanical Elements */}
      {/* Top Right Floral Branch */}
      <div
        className="position-absolute top-0 end-0 p-4 opacity-50 pointer-events-none d-none d-lg-block"
        style={{
          fontSize: '4.5rem',
          userSelect: 'none',
          transform: 'rotate(25deg)',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.04))'
        }}
      >
        🌸🌿
      </div>

      {/* Bottom Left Book Stack & Tea Mug */}
      <div
        className="position-absolute bottom-0 start-0 p-4 opacity-75 pointer-events-none d-none d-md-block"
        style={{ maxWidth: '300px', userSelect: 'none' }}
      >
        <img
          src="/assets/illustrations/book-stack-with-flower-vase.png"
          alt="Books and flowers"
          className="img-fluid"
          style={{ maxHeight: '240px', objectFit: 'contain' }}
          onError={(e) => {
            e.currentTarget.src = '/assets/illustrations/books-login.png';
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="container d-flex flex-column align-items-center justify-content-center py-4 z-2 position-relative">
        {/* Mobile Step Toggle */}
        <div className="d-flex d-md-none mb-3 bg-white rounded-pill p-1 shadow-sm border">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 border-0 ${step === 1 ? 'btn-rv-plum text-white' : 'text-muted'}`}
            onClick={() => setStep(1)}
          >
            01 Forgot
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 border-0 ${step === 2 ? 'btn-rv-plum text-white' : 'text-muted'}`}
            onClick={() => setStep(2)}
          >
            02 Reset
          </button>
        </div>

        {message && (
          <div
            className="alert alert-success py-2 px-3 rounded-4 small mb-4 shadow-sm border-0 d-flex align-items-center gap-2"
            style={{ maxWidth: '440px', width: '100%' }}
          >
            <AiOutlineCheckCircle size={18} className="text-success flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="w-100" style={{ maxWidth: '420px' }}>
          {step === 1 ? (
            /* ================= STEP 01: FORGOT PASSWORD ================= */
            <div className="text-center">
              {/* Circular Badge: Mail & Key */}
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#EDE5F5',
                  color: 'var(--rv-ink-plum)'
                }}
              >
                <div className="position-relative d-inline-flex align-items-center justify-content-center">
                  <AiOutlineMail size={36} />
                  <span
                    className="position-absolute"
                    style={{ bottom: '-4px', right: '-8px', transform: 'rotate(-25deg)' }}
                  >
                    <AiOutlineKey size={20} style={{ color: '#D96B50' }} />
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1
                className="display-6 fw-bold mb-2"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Forgot your password?
              </h1>
              <p className="text-muted small mb-4">
                A fresh start is just an email away.
              </p>

              {/* Form */}
              <form onSubmit={handleSendResetLink} className="text-start">
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark mb-1">Email address</label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-white"
                    style={{ borderColor: '#E5DFD7', padding: '11px 14px' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 rounded-3 py-2.5 fw-semibold text-white shadow-sm mb-3"
                  style={{ backgroundColor: 'var(--rv-ink-plum)' }}
                >
                  {loading ? 'Sending link...' : 'Send reset link →'}
                </button>

                <p className="text-center text-muted small mb-4" style={{ fontSize: '13px' }}>
                  We will email you a link to reset your password.
                </p>

                <hr style={{ borderColor: '#E8E1D9', margin: '24px 0' }} />

                <div className="text-center">
                  <span className="text-muted small">Remember your password? </span>
                  <Link
                    href="/login"
                    className="small fw-semibold text-decoration-none"
                    style={{ color: '#D96B50' }}
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            /* ================= STEP 02: RESET PASSWORD ================= */
            <div className="text-center">
              {/* Circular Badge: Lock with sparkles */}
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#E3EFE4',
                  color: '#2C5E3B'
                }}
              >
                <div className="position-relative d-inline-flex align-items-center justify-content-center">
                  <AiOutlineLock size={36} />
                  <span
                    className="position-absolute"
                    style={{ top: '-4px', right: '-6px', fontSize: '14px' }}
                  >
                    ✨
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1
                className="display-6 fw-bold mb-2"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}
              >
                Set a new password.
              </h1>
              <p className="text-muted small mb-4">
                Make it something secure and just for you.
              </p>

              {/* Form */}
              <form onSubmit={handleResetPassword} className="text-start">
                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark mb-1">New password</label>
                  <div className="input-group rounded-3 overflow-hidden border bg-white" style={{ borderColor: '#E5DFD7' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control border-0 bg-transparent shadow-none"
                      style={{ padding: '11px 14px' }}
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-transparent border-0 text-muted px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                    </button>
                  </div>
                </div>
                <small className="text-muted d-block mb-3" style={{ fontSize: '12px' }}>
                  Use at least 12 characters.
                </small>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark mb-1">Confirm new password</label>
                  <div className="input-group rounded-3 overflow-hidden border bg-white" style={{ borderColor: '#E5DFD7' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control border-0 bg-transparent shadow-none"
                      style={{ padding: '11px 14px' }}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-transparent border-0 text-muted px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 rounded-3 py-2.5 fw-semibold text-white shadow-sm mb-3"
                  style={{ backgroundColor: 'var(--rv-ink-plum)' }}
                >
                  {loading ? 'Updating password...' : 'Reset password →'}
                </button>

                <div className="d-flex align-items-center justify-content-center gap-1.5 text-muted small mb-4" style={{ fontSize: '12px' }}>
                  <AiOutlineLock size={14} /> Your reading space, safely yours.
                </div>

                <hr style={{ borderColor: '#E8E1D9', margin: '24px 0' }} />

                <div className="text-center">
                  <Link
                    href="/login"
                    className="small fw-semibold text-decoration-none"
                    style={{ color: '#D96B50' }}
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="p-4 text-center text-muted small z-2 position-relative" style={{ fontSize: '12px' }}>
        ReadVibe &bull; Thoughtful reading companions &bull; 2026
      </footer>
    </div>
  );
}
