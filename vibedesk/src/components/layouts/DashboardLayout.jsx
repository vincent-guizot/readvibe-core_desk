import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AiFillDashboard,
  AiOutlineBarChart,
  AiOutlineBell,
  AiOutlineBook,
  AiOutlineDown,
  AiOutlineHeart,
  AiOutlineSafety,
  AiOutlineSearch,
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
      { path: '/categories', label: 'Categories & Genres', icon: AiOutlineTags },
      { path: '/moods', label: 'Mood Tags', icon: AiOutlineHeart },
    ],
  },
  {
    label: 'Kurasi & Analitik',
    items: [
      { path: '/editorial-picks', label: 'Editorial Picks', icon: AiOutlineHeart },
      { path: '/wishlist-intel', label: 'Wishlist Intelligence', icon: AiOutlineBarChart },
      { path: '/reading-analytics', label: 'Reading Analytics', icon: AiOutlineBarChart },
      { path: '/recommendation-settings', label: 'Recommendation Settings', icon: AiOutlineSliders },
    ],
  },
  {
    label: 'Komunitas',
    items: [
      { path: '/moderation', label: 'Content Moderation', icon: AiOutlineSafety },
      { path: '/members', label: 'Members', icon: AiOutlineTeam },
      { path: '/staff', label: 'Staff & Permissions', icon: AiOutlineTeam },
    ],
  },
  { label: 'Sistem', items: [{ path: '/settings', label: 'Settings', icon: AiOutlineSetting }] },
];

export default function DashboardLayout({ user, toast, children }) {
  const location = useLocation();
  const displayName = user?.profile?.fullname || user?.username || 'VibeDesk Admin';

  return (
    <div className="d-flex min-vh-100">
      {toast && <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 2000 }}><div className="alert alert-dark shadow-lg py-2 px-4 rounded-pill small fw-semibold">{toast}</div></div>}

      <aside className="vd-sidebar d-flex flex-column p-3">
        <div className="vd-sidebar-brand mb-4 px-2">
          <img src="/assets/logos/vibedesk-horizontal-color.png" alt="VibeDesk — CMS & Backoffice" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        </div>
        <nav className="nav flex-column flex-grow-1 overflow-auto">
          {navGroups.map((group, index) => (
            <div key={group.label || index}>
              {group.label && <div className="vd-nav-section">{group.label}</div>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} className={`vd-sidebar-link ${isActive ? 'active' : ''}`}><Icon size={19} /><span className="ms-3">{item.label}</span>{item.path === '/moderation' && <span className="badge text-bg-danger ms-auto">5</span>}</Link>;
              })}
            </div>
          ))}
        </nav>
        <div className="pt-3 border-top mt-auto px-2">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ background: 'var(--vd-curator-teal)', height: 36, width: 36 }}>{displayName.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0"><p className="fw-bold mb-0 small text-truncate">{displayName}</p><span className="vd-pill">{user?.role || 'Offline'}</span></div>
          </div>
        </div>
      </aside>

      <div className="flex-grow-1 min-vw-0">
        <header className="vd-topbar d-flex align-items-center px-4">
          <div className="container-fluid p-0 d-flex align-items-center justify-content-between gap-3">
            <label className="vd-global-search" aria-label="Pencarian global"><AiOutlineSearch size={20} /><input className="form-control" placeholder="Search books, authors, genres, or members..." /><span className="vd-shortcut">Ctrl + K</span></label>
            <div className="d-flex align-items-center gap-3 ms-auto"><button type="button" className="vd-icon-button border-0 bg-transparent position-relative" aria-label="Notifikasi"><AiOutlineBell size={22} /><span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"> </span></button><span className="vr" /><div className="d-flex align-items-center gap-2"><span className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ background: 'var(--vd-desk-navy)', height: 36, width: 36 }}>{displayName.slice(0, 1).toUpperCase()}</span><div className="d-none d-sm-block"><strong className="small d-block">{displayName}</strong><span className="vd-pill">{user?.role || 'Offline'}</span></div><AiOutlineDown /></div></div>
          </div>
        </header>
        <main className="vd-main-content"><div className="vd-content-wrap">{children}</div></main>
      </div>
    </div>
  );
}
