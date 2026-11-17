import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { visualAssets } from '../constants/visual-assets';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await http.post('/api/auth/login', {
        email: email.trim(),
        password,
      });
      if (!['Admin', 'Librarian'].includes(data.user?.role))
        throw new Error('VibeDesk hanya dapat diakses Admin dan Librarian.');
      onLoginSuccess(data.token, data.user, remember);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="vd-login-layout">
      <section className="vd-login-hero">
        <img
          className="vd-login-cover"
          src={visualAssets.loginPanel}
          alt="Ruang baca VibeDesk dengan koleksi buku dan tanaman"
        />
      </section>
      <section className="card vd-card p-4 p-md-5 w-100">
        <img
          src="/assets/logos/vibedesk-horizontal-color.png"
          alt="VibeDesk"
          className="mb-4"
          style={{ maxWidth: 200 }}
        />
        <h1 className="h3 fw-bold">Selamat datang kembali</h1>
        <p className="text-secondary">Masuk ke CMS & Backoffice ReadVibe.</p>
        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          <label htmlFor="login-email" className="form-label">
            Email staf
          </label>
          <input
            id="login-email"
            className="form-control mb-3"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <div className="input-group mb-3">
            <input
              id="login-password"
              className="form-control"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
          <div className="form-check mb-4">
            <input
              id="remember-session"
              type="checkbox"
              className="form-check-input"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember-session" className="form-check-label">
              Ingat sesi di perangkat ini
            </label>
          </div>
          <button className="btn btn-vd-primary w-100" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk ke Control Center'}
          </button>
        </form>
        <p className="small text-secondary border-top pt-3 mt-4 mb-0">
          Khusus Admin dan Librarian. Hubungi administrator untuk memperoleh
          akses staf.
        </p>
      </section>
    </div>
  );
}
