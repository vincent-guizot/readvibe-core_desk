'use client';

import React, { useState } from 'react';
import { AiOutlineHeart, AiOutlineClose } from 'react-icons/ai';

export default function AddToWishlistModal({ isOpen, onClose, book, onSave }) {
  const [priority, setPriority] = useState('High');
  const [reason, setReason] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      bookId: book.id,
      priority,
      reason,
      visibility,
    });
    setLoading(false);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--rv-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-editorial)' }}>
              <AiOutlineHeart className="text-danger" />
              <span>Tambah ke Smart Wishlist</span>
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="d-flex gap-3 align-items-center mb-3 p-2 bg-light rounded-3">
                <img
                  src={book.image}
                  alt={book.title}
                  className="rounded"
                  style={{ width: '48px', height: '68px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '320px' }}>
                    {book.title}
                  </h6>
                  <small className="text-muted">{book.author?.pen_name}</small>
                </div>
              </div>

              {/* Priority */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Tingkat Prioritas Membaca</label>
                <div className="d-flex gap-2">
                  {['High', 'Medium', 'Low'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`btn btn-sm flex-grow-1 ${
                        priority === p ? (p === 'High' ? 'btn-danger' : p === 'Medium' ? 'btn-warning' : 'btn-info') : 'btn-outline-secondary'
                      }`}
                    >
                      {p === 'High' ? '🔥 Tinggi (Bulan Ini)' : p === 'Medium' ? '⚡ Sedang (Tahun Ini)' : '☕ Santai'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Alasan Ingin Membaca (Personal Note)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Misal: Direkomendasikan teman klub buku untuk belajar stoikisme..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Visibility */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Visibilitas Wishlist</label>
                <select
                  className="form-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="Public">🌐 Publik (Bisa dilihat di tautan profil publik)</option>
                  <option value="Private">🔒 Privat (Hanya terlihat oleh Anda)</option>
                </select>
              </div>
            </div>

            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-rv-coral btn-sm px-4" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan ke Wishlist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
