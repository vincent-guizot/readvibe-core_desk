'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '../AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('readvibe_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('readvibe_token');
    localStorage.removeItem('readvibe_user');
    setUser(null);
    window.location.reload();
  };

  const links = [
    { href: '/discover', label: 'Jelajah Buku' },
    { href: '/vibe-matcher', label: 'AI Vibe Matcher', highlight: true },
    { href: '/my-reading', label: 'Sedang Dibaca' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/finished-reads', label: 'Buku Selesai' },
    { href: '/stats', label: 'Statistik' },
  ];

  return (
    <>
      <header className="rv-nav-header py-3 px-4 bg-white shadow-sm sticky-top">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          {/* Brand */}
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <img
              src="/assets/logos/readvibe-horizontal-color.png"
              alt="ReadVibe"
              style={{ height: '36px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h4 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                ReadVibe
              </h4>
              <small className="text-muted d-block" style={{ fontSize: '11px', marginTop: '-4px' }}>
                Temukan Bacaan Sesuai Suasana Hatimu
              </small>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="d-none d-lg-flex align-items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                    isActive
                      ? 'btn-rv-plum text-white'
                      : link.highlight
                      ? 'btn-outline-danger'
                      : 'text-dark'
                  }`}
                  style={!isActive && !link.highlight ? { color: 'var(--rv-ink-plum)' } : {}}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Status */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Link href="/profile" className="d-flex align-items-center gap-2 text-decoration-none">
                  <img
                    src={user.profile?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt=""
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <span className="fw-bold small d-none d-md-inline" style={{ color: 'var(--rv-ink-plum)' }}>
                    @{user.username}
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1"
                  style={{ fontSize: '11px' }}
                  onClick={handleLogout}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link href="/login" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-rv-plum btn-sm rounded-pill px-3 fw-semibold">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(tok, usr) => {
          localStorage.setItem('readvibe_token', tok);
          localStorage.setItem('readvibe_user', JSON.stringify(usr));
          setUser(usr);
          setIsAuthModalOpen(false);
        }}
      />
    </>
  );
}
