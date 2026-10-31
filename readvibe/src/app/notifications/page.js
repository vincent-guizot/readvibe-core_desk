'use client';

import React, { useState } from 'react';
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
import { readVibeStore } from '../../lib/store';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'book',
      title: 'A wishlist book just joined the catalog',
      description: 'Before the Coffee Gets Cold is now available to explore.',
      time: '12 min ago',
      thumbnail: '/assets/books/coffee-gets-cold.jpg',
      section: 'today',
      unread: true,
      iconBg: '#7A9A8B',
      iconColor: '#FFFFFF',
      link: '/books/before-the-coffee-gets-cold'
    },
    {
      id: 2,
      type: 'sparkle',
      title: 'Fresh picks for your Reflective mood',
      description: 'Your new curated collection is ready to discover.',
      time: '1 hour ago',
      thumbnail: '/assets/illustrations/themes.png',
      thumbCrop: 'center 50%',
      section: 'today',
      unread: true,
      iconBg: '#9B8CB4',
      iconColor: '#FFFFFF',
      link: '/search?mood=Reflective'
    },
    {
      id: 3,
      type: 'recap',
      title: 'Your October reading recap is ready',
      description: 'Take a look at the stories and moods you explored.',
      time: '3 hours ago',
      thumbnail: '/assets/illustrations/themes.png',
      thumbCrop: 'center 0%',
      section: 'today',
      unread: true,
      iconBg: '#E27D60',
      iconColor: '#FFFFFF',
      link: '/stats'
    },
    {
      id: 4,
      type: 'bookmark',
      title: 'Your next read is waiting',
      description: 'Revisit the books you saved for later.',
      time: 'Yesterday',
      section: 'earlier',
      unread: false,
      iconBg: '#EAF3EC',
      iconColor: '#4A7C59',
      link: '/wishlist'
    },
    {
      id: 5,
      type: 'shield',
      title: 'Your report has been reviewed',
      description: 'Our moderation team has reviewed your content report.',
      time: 'Yesterday',
      section: 'earlier',
      unread: false,
      iconBg: '#EFE9F4',
      iconColor: '#6B4C82',
      link: '#'
    },
    {
      id: 6,
      type: 'welcome',
      title: 'Welcome to ReadVibe',
      description: 'Find your next book, follow your mood, and make yourself at home.',
      time: '27 Oct',
      section: 'earlier',
      unread: false,
      iconBg: '#FFEBE6',
      iconColor: '#D96B50',
      link: '/discover'
    }
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const allCount = notifications.length;

  const handleMarkAllRead = () => {
    readVibeStore.markAllNotificationsRead();
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    readVibeStore.deleteNotification(id);
  };

  const filteredNotifications =
    activeTab === 'unread' ? notifications.filter((n) => n.unread) : notifications;

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