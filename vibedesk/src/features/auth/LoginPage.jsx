import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess, apiUrl }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        onLoginSuccess(data.data.token, data.data.user);
        navigate('/');
      } else {
        setError(data.message || 'Login gagal.');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--vd-soft-sand)' }}>
      <div className="vd-card p-4 p-md-5" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <img
            src="/assets/logos/vibedesk-horizontal-color.png"
            alt="VibeDesk"
            style={{ height: '40px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h4 className="fw-bold mt-2" style={{ color: 'var(--vd-desk-navy)' }}>
            VibeDesk Backoffice
          </h4>
          <p className="text-muted small">Masuk untuk mengelola katalog dan kurasi</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Staf</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vibedesk.app"
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
          <button type="submit" className="btn btn-vd-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk ke Control Center'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center">
          <small className="text-muted d-block mb-2">Login Demo Cepat:</small>
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleQuick('admin@vibedesk.app')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleQuick('librarian@vibedesk.app')}
            >
              Librarian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
