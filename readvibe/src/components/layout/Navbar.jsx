'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineCheckCircle
} from 'react-icons/ai';
import { readVibeStore } from '../../lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setUser(readVibeStore.getUser());
    setNotifications(readVibeStore.getNotifications());
    readVibeStore.syncWithVibeCore().then(() => {
      setUser(readVibeStore.getUser());
    });

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = readVibeStore.markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem('readvibe_token');
    localStorage.removeItem('readvibe_user');
    setUser(null);
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <header className="rv-navbar sticky-top py-2 px-3 px-md-4 border-bottom bg-white" style={{ zIndex: 1040 }}>
      <div className="container-fluid d-flex align-items-center justify-content-between gap-3">
        {/* Left: Brand Logo */}
        <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none flex-shrink-0">
          <img
            src="/assets/logos/readvibe-horizontal-color.png"
            alt="ReadVibe"
            style={{ height: '34px', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span
            className="fw-bold fs-4 mb-0 d-none d-sm-inline"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            ReadVibe
          </span>
        </Link>

        {/* Center: Search pill */}
        <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center flex-grow-1 mx-3" style={{ maxWidth: '420px' }}>
          <div className="input-group rounded-pill bg-light border px-3 py-1 w-100" style={{ background: '#FAF7F2' }}>
            <span className="input-group-text bg-transparent border-0 text-muted p-0 me-2">
              <AiOutlineSearch size={18} />
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 shadow-none p-0 small"
              placeholder="Search books, authors, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
          </div>
        </form>

        {/* Navigation links */}
        <nav className="d-none d-lg-flex align-items-center gap-1">
          <Link
            href="/discover"
            className={`rv-nav-link ${pathname === '/discover' || pathname === '/' ? 'active' : ''}`}
          >
            Discover
          </Link>
          <Link
            href="/vibe-matcher"
            className={`rv-nav-link d-flex align-items-center gap-1 ${pathname === '/vibe-matcher' ? 'active' : ''}`}
            style={pathname === '/vibe-matcher' ? {} : { color: '#D96B50', fontWeight: '700' }}
          >
            <span>✨</span> Vibe Matcher
          </Link>
          <Link
            href="/my-reading"
            className={`rv-nav-link ${pathname === '/my-reading' ? 'active' : ''}`}
          >
            My Reading
          </Link>
          <Link
            href="/wishlist"
            className={`rv-nav-link ${pathname === '/wishlist' ? 'active' : ''}`}
          >
            Wishlist
          </Link>
        </nav>

        {/* Right: Actions (Notification & User profile) */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {/* Mobile search button */}
          <Link href="/search" className="btn btn-sm btn-light rounded-circle p-2 d-md-none text-muted">
            <AiOutlineSearch size={18} />
          </Link>

          {/* Notifications Dropdown */}
          <div className="position-relative" ref={notifRef}>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-2 position-relative text-dark border-0"
              style={{ background: '#F5EFEB', width: '38px', height: '38px' }}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
            >
              <AiOutlineBell size={20} style={{ color: 'var(--rv-ink-plum)' }} />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '10px', padding: '3px 6px' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-0"
                style={{ width: '320px', zIndex: 1050, top: '100%' }}
              >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                  <h6 className="fw-bold mb-0" style={{ color: 'var(--rv-ink-plum)' }}>
                    Notifications
                  </h6>
                  <div className="d-flex align-items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-decoration-none p-0"
                        style={{ fontSize: '12px', color: '#D96B50' }}
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                    )}
                    <Link
                      href="/notifications"
                      className="small text-decoration-none fw-semibold"
                      style={{ fontSize: '12px', color: 'var(--rv-ink-plum)' }}
                      onClick={() => setIsNotifOpen(false)}
                    >
                      View all →
                    </Link>
                  </div>
                </div>

                <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">No notifications yet</div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.link || '/my-reading'}
                        className={`list-group-item list-group-item-action p-3 text-decoration-none ${
                          !notif.read ? 'bg-light' : ''
                        }`}
                        onClick={() => setIsNotifOpen(false)}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <span
                            className="p-1 rounded-circle flex-shrink-0 mt-1"
                            style={{
                              backgroundColor: notif.read ? '#EFE9F4' : '#FFEBE6',
                              color: notif.read ? 'var(--rv-ink-plum)' : '#D96B50'
                            }}
                          >
                            <AiOutlineCheckCircle size={14} />
                          </span>
                          <div>
                            <p className="fw-semibold mb-1 small" style={{ color: 'var(--rv-ink-plum)' }}>
                              {notif.title}
                            </p>
                            <p className="text-muted mb-1" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                              {notif.message}
                            </p>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          {user ? (
            <div className="position-relative" ref={profileRef}>
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border bg-light text-start"
                style={{ background: '#FAF7F2' }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle object-fit-cover"
                  style={{ width: '30px', height: '30px' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent';
                  }}
                />
                <span className="fw-semibold small d-none d-md-inline" style={{ color: 'var(--rv-ink-plum)' }}>
                  {user.name}
                </span>
              </button>

              {isProfileOpen && (
                <div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
                  style={{ width: '210px', zIndex: 1050, top: '100%' }}
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <p className="fw-bold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                      {user.name}
                    </p>
                    <small className="text-muted">@{user.username}</small>
                  </div>

                  <Link
                    href="/profile"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded small text-dark text-decoration-none"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <AiOutlineUser size={16} /> My Profile
                  </Link>

                  <Link
                    href="/stats"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded small text-dark text-decoration-none"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <AiOutlineBarChart size={16} /> Reading Stats
                  </Link>

                  <Link
                    href="/settings"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded small text-dark text-decoration-none"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <AiOutlineSetting size={16} /> Settings
                  </Link>

                  <hr className="my-1 border-secondary opacity-25" />

                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded small text-danger border-0 bg-transparent w-100 text-start"
                    onClick={handleLogout}
                  >
                    <AiOutlineLogout size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link href="/login" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-sm btn-rv-plum rounded-pill px-3 fw-semibold">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
