'use client';

import React, { useState } from 'react';
import { AiOutlineLock, AiOutlineMail, AiOutlineUser } from 'react-icons/ai';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, apiUrl }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? `${apiUrl}/api/auth/register` : `${apiUrl}/api/auth/login`;
      const body = isRegister
        ? { username, fullname: fullname || username, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Autentikasi gagal.');
      }

      // Store token and user
      localStorage.setItem('readvibe_token', data.token);
      localStorage.setItem('readvibe_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleDemoLogin = async () => {
    setEmail('member@readvibe.app');
    setPassword('password123');
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--rv-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold" style={{ fontFamily: 'var(--font-editorial)' }}>
              {isRegister ? 'Daftar Akun ReadVibe' : 'Masuk ke ReadVibe'}
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              {isRegister && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nama Lengkap</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <AiOutlineUser />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Vincent Reader"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">@</span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="vinc"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">Alamat Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <AiOutlineMail />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Kata Sandi</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <AiOutlineLock />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!isRegister && (
                <div className="p-2 mb-3 bg-light rounded text-center">
                  <small className="text-muted d-block mb-1">Ingin coba langsung dengan akun demo?</small>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary py-0"
                    onClick={handleDemoLogin}
                  >
                    Gunakan Akun Member Demo (member@readvibe.app)
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-rv-plum w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
              </button>

              <div className="text-center mt-3 small">
                {isRegister ? (
                  <span>
                    Sudah punya akun?{' '}
                    <a
                      href="#"
                      className="text-primary fw-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegister(false);
                      }}
                    >
                      Masuk
                    </a>
                  </span>
                ) : (
                  <span>
                    Belum punya akun?{' '}
                    <a
                      href="#"
                      className="text-primary fw-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegister(true);
                      }}
                    >
                      Daftar Akun Baru
                    </a>
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
