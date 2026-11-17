import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { visualAssets } from '../../constants/visual-assets';
import {
  AiFillDashboard,
  AiOutlineBarChart,
  AiOutlineBell,
  AiOutlineBook,
  AiOutlineDown,
  AiOutlineHeart,
  AiOutlineSafety,
  AiOutlineSetting,
  AiOutlineSliders,
  AiOutlineTags,
  AiOutlineTeam,
  AiOutlineUser,
} from 'react-icons/ai';

const navGroups = [
  { items: [{ path: '/', label: 'Control Center', icon: AiFillDashboard }] },
  {
    label: 'Katalog',
    items: [
      { path: '/books', label: 'Books Catalog', icon: AiOutlineBook },
      { path: '/authors', label: 'Authors', icon: AiOutlineUser },
      {
        path: '/categories',
        label: 'Categories & Genres',
        icon: AiOutlineTags,
      },
      { path: '/moods', label: 'Mood Tags', icon: AiOutlineHeart },
    ],
  },
  {
    label: 'Kurasi & Analitik',
    items: [
      {
        path: '/editorial-picks',
        label: 'Editorial Picks',
        icon: AiOutlineHeart,
      },
      {
        path: '/wishlist-intel',
        label: 'Wishlist Intelligence',
        icon: AiOutlineBarChart,
      },
      {
        path: '/reading-analytics',
        label: 'Reading Analytics',
        icon: AiOutlineBarChart,
      },
      {
        path: '/recommendation-settings',
        label: 'Recommendation Settings',
        icon: AiOutlineSliders,
      },
    ],
  },
  {
    label: 'Komunitas',
    items: [
      {
        path: '/moderation',
        label: 'Content Moderation',
        icon: AiOutlineSafety,
      },
      { path: '/members', label: 'Members', icon: AiOutlineTeam },
      { path: '/staff', label: 'Staff & Permissions', icon: AiOutlineTeam },
    ],
  },
  {
    label: 'Sistem',
    items: [{ path: '/settings', label: 'Settings', icon: AiOutlineSetting }],
  },
];

export default function DashboardLayout({
  user,
  toast,
  children,
  onLogout,
  pendingCount = 0,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeRef = useRef(null);
  const drawerRef = useRef(null);
  useEffect(() => {
    if (drawer) drawerRef.current?.querySelector('button')?.focus();
  }, [drawer]);
  const location = useLocation();
  const displayName =
    user?.profile?.fullname || user?.username || 'VibeDesk Admin';

  if (
    location.pathname === '/login' ||
    !['Admin', 'Librarian'].includes(user?.role)
  )
    return <main className="vd-auth-surface">{children}</main>;

  return (
    <div className="d-flex min-vh-100">
      {toast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 2000 }}
        >
          <div role="status" className="alert alert-dark shadow-lg py-2 px-4 rounded-pill small fw-semibold">
            {toast}
          </div>
        </div>
      )}

      {drawer && (
        <button
          type="button"
          className="vd-drawer-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => {
            setDrawer(false);
            closeRef.current?.focus();
          }}
        />
      )}
      <aside
        ref={drawerRef}
        id="desk-navigation"
        aria-label="Navigasi utama"
        role={drawer ? 'dialog' : undefined}
        aria-modal={drawer || undefined}
        className={`vd-sidebar d-flex flex-column p-3 ${collapsed ? 'vd-sidebar--collapsed' : ''} ${drawer ? 'vd-sidebar--open' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDrawer(false);
            closeRef.current?.focus();
          }
          if (drawer && e.key === 'Tab') {
            const items = [
              ...drawerRef.current.querySelectorAll('a, button'),
            ].filter((item) => item.getClientRects().length);
            if (e.shiftKey && document.activeElement === items[0]) {
              e.preventDefault();
              items.at(-1)?.focus();
            } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
              e.preventDefault();
              items[0]?.focus();
            }
          }
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-lg-none mb-2"
          onClick={() => {
            setDrawer(false);
            closeRef.current?.focus();
          }}
        >
          Tutup navigasi
        </button>
        <div className="vd-sidebar-brand mb-4 px-2">
          <img
            src="/assets/logos/vibedesk-horizontal-color.png"
            alt="VibeDesk — CMS & Backoffice"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <nav className="nav flex-column flex-grow-1 overflow-auto">
          {navGroups.map((group, index) => (
            <div key={group.label || index}>
              {group.label && (
                <div className="vd-nav-section">{group.label}</div>
              )}
              {group.items.map((item) => {
                if (
                  [
                    '/staff',
                    '/members',
                    '/recommendation-settings',
                    '/settings',
                  ].includes(item.path) &&
                  user?.role !== 'Admin'
                )
                  return null;
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' &&
                    location.pathname.startsWith(item.path + '/'));
                return (
                  <Link
                    key={item.path}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setDrawer(false)}
                    to={item.path}
                    className={`vd-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={19} />
                    <span className="ms-3 vd-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="pt-3 border-top mt-auto px-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                background: 'var(--vd-action-teal)',
                height: 36,
                width: 36,
              }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <p className="fw-bold mb-0 small text-truncate">{displayName}</p>
              <span className="vd-pill">{user?.role || 'Offline'}</span>
            </div>
            <img
              src={visualAssets.leafSprig}
              alt=""
              aria-hidden="true"
              className="vd-sidebar-sprig"
              loading="lazy"
            />
          </div>
        </div>
      </aside>

      <div className="vd-layout-body flex-grow-1">
        <header className="vd-topbar d-flex align-items-center px-4">
          <div className="container-fluid p-0 d-flex align-items-center justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary d-none d-lg-block"
              aria-label="Ciutkan navigasi"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              ☰
            </button>
            <button
              ref={closeRef}
              type="button"
              className="btn btn-outline-secondary d-lg-none"
              aria-label="Buka navigasi"
              aria-controls="desk-navigation"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
            >
              ☰
            </button>
            <nav aria-label="Breadcrumb" className="small">
              <Link to="/">VibeDesk</Link> /{' '}
              {location.pathname.split('/').filter(Boolean).join(' / ') ||
                'Control Center'}
            </nav>
            <div className="d-flex align-items-center gap-3 ms-auto">
              <details className="position-relative">
                <summary aria-label="Notifikasi" className="btn btn-light">
                  <AiOutlineBell size={22} />
                  <span className="ms-1">{pendingCount}</span>
                </summary>
                <div className="vd-popover card p-3">
                  <strong>Operasional</strong>
                  <Link to="/moderation">
                    {pendingCount} ulasan menunggu moderasi
                  </Link>
                </div>
              </details>
              <details className="position-relative">
                <summary className="btn btn-light">
                  {displayName} <AiOutlineDown />
                </summary>
                <div className="vd-popover card p-3">
                  <strong>{user?.role}</strong>
                  <span className="small text-break">{user?.email}</span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={onLogout}
                  >
                    Keluar
                  </button>
                </div>
              </details>
            </div>
          </div>
        </header>
        <main className="vd-main-content">
          <div className="vd-content-wrap">{children}</div>
        </main>
      </div>
    </div>
  );
}
