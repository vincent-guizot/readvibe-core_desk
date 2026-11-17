'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AiOutlineBook,
  AiOutlineSetting,
  AiOutlineCheck,
  AiOutlineFileText,
  AiOutlineSafety,
  AiOutlineLock
} from 'react-icons/ai';
import { BsBookmarks, BsStars } from 'react-icons/bs';
import { useNotifications } from '@/hooks';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const { notifications: reduxNotifications, markAsRead, clearAll } = useNotifications();

  const normalizedNotifications = useMemo(() => {
    return (reduxNotifications || []).map((notif, idx) => {
      const isRead = notif.read === true;
      const desc = notif.description || notif.message || '';
      let type = notif.type;
      let iconBg = notif.iconBg;
      let iconColor = notif.iconColor || '#FFFFFF';

      if (!type) {
        const lowerTitle = (notif.title || '').toLowerCase();
        if (lowerTitle.includes('milestone') || lowerTitle.includes('recap')) {
          type = 'recap';
          iconBg = '#E27D60';
        } else if (lowerTitle.includes('vibe') || lowerTitle.includes('pick')) {
          type = 'sparkle';
          iconBg = '#9B8CB4';
        } else if (lowerTitle.includes('wishlist') || lowerTitle.includes('catalog')) {
          type = 'book';
          iconBg = '#7A9A8B';
        } else if (lowerTitle.includes('saved') || lowerTitle.includes('read') || lowerTitle.includes('collection')) {
          type = 'bookmark';
          iconBg = '#EAF3EC';
          iconColor = '#4A7C59';
        } else {
          type = 'book';
          iconBg = '#7A9A8B';
        }
      }

      return {
        ...notif,
        id: notif.id,
        type,
        title: notif.title,
        description: desc,
        time: notif.time || 'Recently',
        unread: !isRead,
        section: idx < 3 ? 'today' : 'earlier',
        iconBg: iconBg || '#7A9A8B',
        iconColor,
        link: notif.link || '/my-reading'
      };
    });
  }, [reduxNotifications]);

  const unreadCount = normalizedNotifications.filter((n) => n.unread).length;
  const allCount = normalizedNotifications.length;

  const handleMarkAllRead = () => {
    normalizedNotifications.filter((n) => n.unread).forEach((n) => markAsRead(n.id));
  };

  const filteredNotifications =
    activeTab === 'unread' ? normalizedNotifications.filter((n) => n.unread) : normalizedNotifications;

  const todayList = filteredNotifications.filter((n) => n.section === 'today');
  const earlierList = filteredNotifications.filter((n) => n.section === 'earlier');

  const renderIcon = (notif) => {
    if (notif.type === 'book') return <AiOutlineBook size={18} />;
    if (notif.type === 'sparkle') return <BsStars size={18} />;
    if (notif.type === 'recap') return <AiOutlineFileText size={18} />;
    if (notif.type === 'bookmark') return <BsBookmarks size={18} />;
    if (notif.type === 'shield') return <AiOutlineSafety size={18} />;
    return <AiOutlineBook size={18} />;
  };

  return (
    <div className="container py-4 pb-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-secondary text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Notifications
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1
            className="display-6 fw-bold mb-1"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', letterSpacing: '-0.02em' }}
          >
            Your reading world, in the loop.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
            Little updates for your next chapter.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
            style={{
              border: '1px solid #D96B50',
              color: '#D96B50',
              backgroundColor: '#FFFFFF'
            }}
          >
            <AiOutlineCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Notifications List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            {/* Tabs */}
            <div className="d-flex align-items-center gap-4 border-bottom pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="btn btn-link p-0 text-decoration-none position-relative fw-bold small d-inline-flex align-items-center gap-2"
                style={{
                  color: activeTab === 'all' ? 'var(--rv-ink-plum)' : '#8C827A',
                  borderBottom: activeTab === 'all' ? '2px solid #D96B50' : 'none',
                  paddingBottom: activeTab === 'all' ? '12px' : '0',
                  marginBottom: activeTab === 'all' ? '-14px' : '0'
                }}
              >
                <span>All</span>
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: '#D96B50', color: '#FFFFFF', fontSize: '11px', padding: '3px 7px' }}
                >
                  {allCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className="btn btn-link p-0 text-decoration-none position-relative fw-bold small d-inline-flex align-items-center gap-2"
                style={{
                  color: activeTab === 'unread' ? 'var(--rv-ink-plum)' : '#8C827A',
                  borderBottom: activeTab === 'unread' ? '2px solid #D96B50' : 'none',
                  paddingBottom: activeTab === 'unread' ? '12px' : '0',
                  marginBottom: activeTab === 'unread' ? '-14px' : '0'
                }}
              >
                <span>Unread</span>
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)', fontSize: '11px', padding: '3px 7px' }}
                >
                  {unreadCount}
                </span>
              </button>
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
              <div className="py-5 text-center text-muted">
                <span style={{ fontSize: '2.5rem' }}>🍃</span>
                <h6 className="fw-bold mt-3 mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h6>
                <p className="small text-muted mb-0">
                  {activeTab === 'unread'
                    ? "You're completely caught up with all reading updates."
                    : 'Updates and milestone notices will appear here.'}
                </p>
              </div>
            )}

            {/* Section: Today */}
            {todayList.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.9rem' }}>
                  Today
                </h6>
                <div className="d-flex flex-column gap-2">
                  {todayList.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => markAsRead(notif.id)}
                      className="d-flex align-items-center justify-content-between p-3 rounded-4 text-decoration-none transition-all"
                      style={{
                        backgroundColor: notif.unread ? '#F7F3FA' : '#FAF7F2'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: notif.iconBg,
                            color: notif.iconColor
                          }}
                        >
                          {renderIcon(notif)}
                        </div>

                        <div>
                          <p className="fw-bold mb-0 text-dark small">{notif.title}</p>
                          <small className="text-muted" style={{ fontSize: '12px' }}>
                            {notif.description}
                          </small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 ms-3 flex-shrink-0">
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                          {notif.time}
                        </span>

                        {notif.thumbnail && (
                          <div
                            className="rounded-2 overflow-hidden border"
                            style={{
                              width: '38px',
                              height: '52px',
                              backgroundImage: `url(${notif.thumbnail})`,
                              backgroundSize: notif.thumbCrop ? '300% 300%' : 'cover',
                              backgroundPosition: notif.thumbCrop || 'center'
                            }}
                          />
                        )}

                        {notif.unread && (
                          <span
                            className="rounded-circle"
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#D96B50'
                            }}
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Earlier */}
            {earlierList.length > 0 && (
              <div>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.9rem' }}>
                  Earlier
                </h6>
                <div className="d-flex flex-column gap-2">
                  {earlierList.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => markAsRead(notif.id)}
                      className="d-flex align-items-center justify-content-between p-3 rounded-4 text-decoration-none border-bottom"
                      style={{ backgroundColor: '#FFFFFF' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: notif.iconBg,
                            color: notif.iconColor
                          }}
                        >
                          {renderIcon(notif)}
                        </div>

                        <div>
                          <p className="fw-bold mb-0 text-dark small">{notif.title}</p>
                          <small className="text-muted" style={{ fontSize: '12px' }}>
                            {notif.description}
                          </small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 ms-3 flex-shrink-0">
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                          {notif.time}
                        </span>

                        {notif.unread && (
                          <span
                            className="rounded-circle"
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#D96B50'
                            }}
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Divider */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-5 pt-3">
              <span style={{ height: '1px', width: '80px', backgroundColor: '#EADFD5' }} />
              <span className="small text-muted d-inline-flex align-items-center gap-1.5" style={{ fontSize: '12px' }}>
                <span>🌿</span> You&apos;re all caught up.
              </span>
              <span style={{ height: '1px', width: '80px', backgroundColor: '#EADFD5' }} />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Notification Settings Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
            <h3
              className="fw-bold mb-2"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', lineHeight: 1.2 }}
            >
              Make room for quiet.
            </h3>
            <p className="text-muted small mb-4">
              Choose which updates reach you.
            </p>

            <div className="my-3 text-center">
              <img
                src="/assets/illustrations/books-notifications.png"
                alt="Make room for quiet"
                className="img-fluid"
                style={{ maxHeight: '220px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/illustrations/book-stack-with-flower-vase.png';
                }}
              />
            </div>

            <Link
              href="/settings"
              className="btn btn-outline-secondary rounded-pill w-100 py-2.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 mb-3 mt-2"
              style={{
                borderColor: '#EADFD5',
                color: 'var(--rv-ink-plum)'
              }}
            >
              <AiOutlineSetting size={16} /> Notification Settings
            </Link>

            <div className="d-flex align-items-center justify-content-center gap-1.5 text-muted small" style={{ fontSize: '12px' }}>
              <AiOutlineLock size={14} /> Updates are just for you.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
