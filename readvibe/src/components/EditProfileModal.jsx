'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { readVibeStore } from '../lib/store';

export default function EditProfileModal({ isOpen, onClose, onUpdated }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const u = readVibeStore.getUser();
      setName(u.name || '');
      setUsername(u.username || '');
      setBio(u.bio || '');
      setLocation(u.location || 'Jakarta, Indonesia');
      setAvatar(u.avatar || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = readVibeStore.updateUser({
        name,
        username,
        bio,
        location,
        avatar
      });
      if (onUpdated) onUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://api.dicebear.com/7.x/bottts/svg?seed=vincent',
    'https://api.dicebear.com/7.x/bottts/svg?seed=reader',
    'https://api.dicebear.com/7.x/bottts/svg?seed=sarah'
  ];

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: 'rgba(30, 20, 32, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 animate__animated animate__fadeInUp"
        style={{ maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom bg-light">
          <div>
            <h5 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
              Edit Profile
            </h5>
            <small className="text-muted">Update your public details and reading bio</small>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle p-2 text-muted"
            onClick={onClose}
          >
            <AiOutlineClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
          {/* Avatar Selection */}
          <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ backgroundColor: '#FAF7F2' }}>
            <img
              src={avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent'}
              alt={name}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: '64px', height: '64px' }}
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vincent';
              }}
            />
            <div>
              <label className="form-label small fw-bold mb-1" style={{ color: 'var(--rv-ink-plum)' }}>
                Avatar Preset
              </label>
              <div className="d-flex gap-2">
                {sampleAvatars.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn btn-sm p-0 rounded-circle border ${avatar === av ? 'border-danger border-2' : ''}`}
                    onClick={() => setAvatar(av)}
                  >
                    <img src={av} alt="preset" className="rounded-circle" style={{ width: '28px', height: '28px' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              Username
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">@</span>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              Location
            </label>
            <input
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jakarta, Indonesia"
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold" style={{ color: 'var(--rv-ink-plum)' }}>
              Bio / Reading Tagline
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other readers about your favorite moods or what you are currently reading..."
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-light rounded-pill px-4 fw-semibold" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-rv-plum rounded-pill px-4 fw-bold shadow-sm"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
