import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AiFillDashboard,
  AiOutlineBook,
  AiOutlineUser,
  AiOutlineTags,
  AiOutlineHeart,
  AiOutlineTeam,
  AiOutlineSafety,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineSliders,
} from 'react-icons/ai';

export default function DashboardLayout({ user, onQuickLogin, toast, children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Control Center', icon: <AiFillDashboard size={18} /> },
    { path: '/books', label: 'Katalog Buku', icon: <AiOutlineBook size={18} /> },
    { path: '/authors', label: 'Penulis', icon: <AiOutlineUser size={18} /> },
    { path: '/categories', label: 'Kategori / Genre', icon: <AiOutlineTags size={18} /> },
    { path: '/moods', label: 'Mood Tags', icon: <AiOutlineHeart size={18} /> },
    { path: '/editorial-picks', label: 'Pilihan Editor', icon: <AiOutlineHeart size={18} /> },
    { path: '/wishlist-intel', label: 'Wishlist Intel', icon: <AiOutlineBarChart size={18} /> },
    { path: '/reading-analytics', label: 'Tren Membaca', icon: <AiOutlineBarChart size={18} /> },
    { path: '/moderation', label: 'Moderasi Konten', icon: <AiOutlineSafety size={18} /> },
    { path: '/members', label: 'Member Komunitas', icon: <AiOutlineTeam size={18} /> },
    { path: '/staff', label: 'Staf & Hak Akses', icon: <AiOutlineTeam size={18} /> },
    { path: '/recommendation-settings', label: 'Bobot Rekomendasi', icon: <AiOutlineSliders size={18} /> },
    { path: '/settings', label: 'Pengaturan Sistem', icon: <AiOutlineSetting size={18} /> },
  ];

  return (
    <div className="d-flex vh-100 position-relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 2000 }}
        >
          <div className="alert alert-dark shadow-lg py-2 px-4 rounded-pill small fw-semibold">
            {toast}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="vd-sidebar d-flex flex-column p-3" style={{ width: '270px' }}>
        {/* Brand Header */}
        <div className="mb-4 px-2 d-flex align-items-center gap-2">
          <img
            src="/assets/logos/vibedesk-horizontal-color.png"
            alt="VibeDesk"
            style={{ height: '36px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--vd-desk-navy)' }}>
              VibeDesk
            </h5>
            <small className="text-muted" style={{ fontSize: '11px' }}>
              CMS & Backoffice
            </small>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`vd-sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span className="ms-2">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="pt-3 border-top mt-auto">
          <div className="d-flex align-items-center justify-content-between px-2">
            <div>
              <p className="fw-bold mb-0 small" style={{ color: 'var(--vd-desk-navy)' }}>
                {user ? user.username : 'Guest'}
              </p>
              <span className="badge bg-secondary-subtle text-dark" style={{ fontSize: '10px' }}>
                {user ? user.role : 'Offline'}
              </span>
            </div>
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-secondary py-0 px-2" data-bs-toggle="dropdown">
                Switch
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 small">
                <li>
                  <button className="dropdown-item" onClick={() => onQuickLogin('admin@vibedesk.app')}>
                    Login Admin
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => onQuickLogin('librarian@vibedesk.app')}>
                    Login Librarian
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 vd-main-content overflow-auto p-4">
        {children}
      </main>
    </div>
  );
}
