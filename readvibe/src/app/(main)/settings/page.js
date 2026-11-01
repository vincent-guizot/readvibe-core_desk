'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AiOutlineLock,
  AiOutlineSafety,
  AiOutlineBell,
  AiOutlineLogout,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineDelete,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineExport
} from 'react-icons/ai';
import { readVibeStore } from '@/lib/store';
import { useAuth } from '@/hooks';
import EditProfileModal from '@/components/EditProfileModal';

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(authUser);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('••••••••••••••••');
  const [newPassword, setNewPassword] = useState('••••••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••••••');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email change state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setEmailInput(authUser.email || 'admin@example.com');
    } else {
      const u = readVibeStore.getUser();
      setUser(u);
      if (u) {
        setEmailInput(u.email || 'admin@example.com');
      }
    }
  }, [authUser]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    localStorage.removeItem('readvibe_token');
    localStorage.removeItem('readvibe_user');
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to permanently delete your account and reading data? This action cannot be undone.')) {
      logout();
      localStorage.clear();
      router.push('/register');
    }
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
            Settings
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
            Your space, your preferences.
          </h1>
          <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
            Manage your account and make ReadVibe feel right for you.
          </p>
        </div>

        <Link
          href="/profile"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
          style={{ borderColor: '#EADFD5', color: 'var(--rv-ink-plum)', background: '#FFFFFF' }}
        >
          <AiOutlineArrowLeft size={14} /> Back to profile
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Sidebar Menu (NO Appearance, NO Active Sessions) */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-2 bg-white">
            <div className="list-group list-group-flush gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 fw-semibold d-flex align-items-center gap-2.5 text-start ${
                  activeTab === 'account' ? 'active-settings-tab' : 'text-dark bg-transparent'
                }`}
                style={
                  activeTab === 'account'
                    ? { backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }
                    : { color: 'var(--rv-ink-plum)' }
                }
              >
                <AiOutlineLock size={18} /> Account & security
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 fw-semibold d-flex align-items-center gap-2.5 text-start ${
                  activeTab === 'privacy' ? 'active-settings-tab' : 'text-dark bg-transparent'
                }`}
                style={
                  activeTab === 'privacy'
                    ? { backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }
                    : { color: 'var(--rv-ink-plum)' }
                }
              >
                <AiOutlineSafety size={18} /> Privacy
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 fw-semibold d-flex align-items-center gap-2.5 text-start ${
                  activeTab === 'notifications' ? 'active-settings-tab' : 'text-dark bg-transparent'
                }`}
                style={
                  activeTab === 'notifications'
                    ? { backgroundColor: '#EFE9F4', color: 'var(--rv-ink-plum)' }
                    : { color: 'var(--rv-ink-plum)' }
                }
              >
                <AiOutlineBell size={18} /> Notifications
              </button>

              <hr className="my-1 border-secondary opacity-15" />

              <button
                type="button"
                onClick={handleSignOut}
                className="list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 fw-semibold d-flex align-items-center gap-2.5 text-start bg-transparent"
                style={{ color: '#D96B50' }}
              >
                <AiOutlineLogout size={18} /> Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Center Main Content */}
        <div className="col-lg-6">
          {activeTab === 'account' && (
            <div className="d-flex flex-column gap-4">
              {/* Account information Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h4
                  className="fw-bold mb-4"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', fontSize: '1.25rem' }}
                >
                  Account information
                </h4>

                <div className="d-flex flex-column gap-3">
                  {/* Display name */}
                  <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Display name</span>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-semibold text-dark small">{user?.name || 'Vincent Reader'}</span>
                      <button
                        type="button"
                        onClick={() => setIsEditProfileModalOpen(true)}
                        className="btn btn-sm btn-link p-0 small text-decoration-none fw-semibold"
                        style={{ color: '#D96B50', fontSize: '13px' }}
                      >
                        Edit profile
                      </button>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Username</span>
                    <span className="fw-semibold text-dark small">@{user?.username || 'adminreadvibe'}</span>
                  </div>

                  {/* Email address */}
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between py-2 gap-2">
                    <span className="text-muted small">Email address</span>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-semibold text-dark small">{user?.email || 'admin@example.com'}</span>
                      <span
                        className="badge rounded-pill fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: '#E2F0D9', color: '#385723', fontSize: '11px' }}
                      >
                        ✓ Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                        style={{ fontSize: '12px', borderColor: '#D9CFCA', color: 'var(--rv-ink-plum)' }}
                      >
                        Change email
                      </button>
                    </div>
                  </div>

                  {isEditingEmail && (
                    <div className="p-3 rounded-3 bg-light mt-2 border">
                      <label className="form-label small fw-bold text-muted mb-1">New Email Address</label>
                      <div className="input-group mb-2">
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-rv-plum"
                          onClick={() => {
                            updateProfile({ email: emailInput });
                            readVibeStore.updateUser({ email: emailInput });
                            setUser((prev) => ({ ...prev, email: emailInput }));
                            setIsEditingEmail(false);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Change password Card - STRICT: INLINE on page, NO MODAL, with show/hide password toggle */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h4
                  className="fw-bold mb-1"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)', fontSize: '1.25rem' }}
                >
                  Change password
                </h4>
                <p className="text-muted small mb-4">
                  Use a unique password to protect your reading space.
                </p>

                {passwordSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-3 py-2 small">
                    <AiOutlineCheckCircle size={16} /> Password successfully updated!
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  {/* Current password */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Current password</label>
                    <div className="input-group rounded-3 overflow-hidden border">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        className="form-control border-0 bg-white shadow-none"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-light border-0 text-muted px-3"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPass ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div className="mb-1">
                    <label className="form-label small fw-semibold text-muted mb-1">New password</label>
                    <div className="input-group rounded-3 overflow-hidden border">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="form-control border-0 bg-white shadow-none"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-light border-0 text-muted px-3"
                        onClick={() => setShowNewPass(!showNewPass)}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPass ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>
                  <small className="text-muted d-block mb-3" style={{ fontSize: '12px' }}>
                    Use at least 12 characters.
                  </small>

                  {/* Confirm new password */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Confirm new password</label>
                    <div className="input-group rounded-3 overflow-hidden border">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="form-control border-0 bg-white shadow-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-light border-0 text-muted px-3"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPass ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn rounded-pill px-4 py-2 fw-semibold text-white shadow-sm"
                      style={{ backgroundColor: 'var(--rv-ink-plum)' }}
                    >
                      Update password
                    </button>
                  </div>
                </form>
              </div>

              {/* Delete account Card */}
              <div
                className="card rounded-4 p-4"
                style={{
                  backgroundColor: '#FFF9F8',
                  border: '1px solid #F6D7CF'
                }}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
                      Delete account
                    </h5>
                    <p className="text-muted small mb-0">
                      Permanently delete your account and reading data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5 flex-shrink-0"
                    style={{
                      border: '1px solid #D96B50',
                      color: '#D96B50',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <AiOutlineDelete size={16} /> Delete account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                Privacy settings
              </h4>
              <p className="text-muted small mb-4">
                Choose who can view your reading shelf, wishlist, and public activity.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pb-3 border-bottom">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="publicShelfSwitch">
                      Public Profile & Reading Shelf
                    </label>
                    <small className="text-muted">Allow other readers to see your finished reads and vibe cards</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="publicShelfSwitch" defaultChecked />
                </div>

                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pb-3 border-bottom">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="publicWishlistSwitch">
                      Wishlist Visibility
                    </label>
                    <small className="text-muted">Let friends and fellow readers view your reading wishlist</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="publicWishlistSwitch" />
                </div>

                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="readingNotesSwitch">
                      Keep Private Notes Hidden
                    </label>
                    <small className="text-muted">Your private notes and reflections are always private to you only</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="readingNotesSwitch" defaultChecked disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                Notification settings
              </h4>
              <p className="text-muted small mb-4">
                Control email updates and community interactions.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pb-3 border-bottom">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="emailRecSwitch">
                      Curated Vibe Recommendations
                    </label>
                    <small className="text-muted">Get weekly book selections tailored to your recent reading mood</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="emailRecSwitch" defaultChecked />
                </div>

                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 pb-3 border-bottom">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="monthlyRecapSwitch">
                      Monthly Reading Recaps
                    </label>
                    <small className="text-muted">Receive aesthetic summaries of your reading stats and vibe progression</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="monthlyRecapSwitch" defaultChecked />
                </div>

                <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                  <div>
                    <label className="form-check-label fw-semibold small d-block" htmlFor="catalogUpdatesSwitch">
                      Wishlist Catalog Alerts
                    </label>
                    <small className="text-muted">Get notified when a book in your wishlist becomes available</small>
                  </div>
                  <input className="form-check-input ms-3" type="checkbox" id="catalogUpdatesSwitch" defaultChecked />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Widgets */}
        <div className="col-lg-3">
          <div className="d-flex flex-column gap-4">
            {/* Widget 1: Sage green tinted card */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#EAEFE9',
                backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(141, 170, 145, 0.25) 0%, transparent 60%)'
              }}
            >
              <div
                className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#D8E2D5', color: '#4B634E', width: '36px', height: '36px' }}
              >
                <AiOutlineLock size={18} />
              </div>
              <h5 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
                Your account stays yours
              </h5>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
                Keep your email up to date so you can recover access when needed.
              </p>
            </div>

            {/* Widget 2: Quick settings card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
                Quick settings
              </h5>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#FAF7F2', color: 'var(--rv-ink-plum)' }}
                    >
                      <AiOutlineEye size={16} />
                    </div>
                    <div>
                      <p className="fw-semibold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                        Wishlist visibility
                      </p>
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        Private
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('privacy')}
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                    style={{ color: '#D96B50', fontSize: '12px' }}
                  >
                    Manage →
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#FAF7F2', color: 'var(--rv-ink-plum)' }}
                    >
                      <AiOutlineMail size={16} />
                    </div>
                    <div>
                      <p className="fw-semibold mb-0 small" style={{ color: 'var(--rv-ink-plum)' }}>
                        Email notifications
                      </p>
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        On
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                    style={{ color: '#D96B50', fontSize: '12px' }}
                  >
                    Manage →
                  </button>
                </div>
              </div>
            </div>

            {/* Widget 3: Lilac tinted card */}
            <div
              className="card border-0 rounded-4 p-4 position-relative overflow-hidden"
              style={{
                backgroundColor: '#F3EEF7',
                backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(188, 168, 203, 0.25) 0%, transparent 60%)'
              }}
            >
              <div
                className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ backgroundColor: '#E4DAEC', color: 'var(--rv-ink-plum)', width: '36px', height: '36px' }}
              >
                <AiOutlineUser size={18} />
              </div>
              <h5 className="fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)', fontFamily: 'var(--font-editorial)' }}>
                Need to update your profile?
              </h5>
              <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>
                Change your photo, bio, and reading preferences.
              </p>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="btn btn-link p-0 fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1 border-0"
                style={{ color: '#D96B50' }}
              >
                Edit profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onUpdated={(u) => setUser(u)}
      />
    </div>
  );
}