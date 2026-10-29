'use client';

import React, { useState } from 'react';
import { AiFillStar, AiOutlineCheckCircle } from 'react-icons/ai';

export default function FinishBookModal({ isOpen, onClose, book, onSave }) {
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [publicReview, setPublicReview] = useState('');
  const [moodTag, setMoodTag] = useState('🧘 Calm & Mindful');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !book) return null;

  const moods = [
    '🌧️ Melancholy',
    '⚡ High Energy',
    '🧘 Calm & Mindful',
    '🍂 Cozy Autumn',
    '🖤 Dark Academia',
    '💡 Mind-Expanding',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      bookId: book.id,
      rating,
      quote,
      privateNote,
      publicReview,
      moodTag,
      isSpoiler,
    });
    setLoading(false);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--rv-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-editorial)' }}>
              <AiOutlineCheckCircle className="text-success" />
              <span>Tandai Selesai Dibaca & Buat Vibe Card</span>
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-4 text-center">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="rounded-3 shadow mb-2"
                    style={{ width: '130px', height: '190px', objectFit: 'cover' }}
                  />
                  <h6 className="fw-bold mb-0 text-truncate">{book.title}</h6>
                  <small className="text-muted">{book.author?.pen_name}</small>

                  {/* Rating Selector */}
                  <div className="mt-3">
                    <label className="form-label fw-bold small d-block mb-1">Rating Pribadi</label>
                    <div className="d-flex justify-content-center text-warning gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn p-0 border-0 bg-transparent text-warning"
                          onClick={() => setRating(star)}
                        >
                          <AiFillStar size={24} color={star <= rating ? '#ffc107' : '#e4e5e9'} />
                        </button>
                      ))}
                    </div>
                    <span className="small text-muted">{rating}.0 / 5.0</span>
                  </div>
                </div>

                <div className="col-md-8">
                  {/* Mood Tag */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Suasana Hati yang Paling Mewakili Buku Ini</label>
                    <div className="d-flex flex-wrap gap-2">
                      {moods.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMoodTag(m)}
                          className={`btn btn-sm rounded-pill ${
                            moodTag === m ? 'btn-rv-plum' : 'btn-outline-secondary'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Quote (For 9:16 Vibe Card) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Kutipan Favorit (Akan Tampil di Kartu Visual 9:16)
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Tulis kalimat paling berkesan dari buku ini..."
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      required
                    />
                  </div>

                  {/* Private Note (Protected, only visible to user) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-primary d-flex align-items-center gap-1">
                      <span>🔒 Catatan Pribadi (Hanya Terlihat Oleh Anda)</span>
                    </label>
                    <textarea
                      className="form-control bg-light"
                      rows="2"
                      placeholder="Refleksi jujur, hal yang ingin kamu terapkan dalam hidup..."
                      value={privateNote}
                      onChange={(e) => setPrivateNote(e.target.value)}
                    />
                  </div>

                  {/* Public Review (Subject to moderation) */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold small text-success d-flex align-items-center gap-1">
                      <span>🌐 Ulasan Publik Komunitas (Akan Ditampilkan di Detail Buku)</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Pendapatmu yang bermanfaat bagi pembaca lain di komunitas..."
                      value={publicReview}
                      onChange={(e) => setPublicReview(e.target.value)}
                    />
                  </div>

                  <div className="form-check small text-muted">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="spoilerCheck"
                      checked={isSpoiler}
                      onChange={(e) => setIsSpoiler(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="spoilerCheck">
                      Tandai ulasan ini mengandung spoiler (bocoran alur cerita)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-rv-coral btn-sm px-4" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Selesai & Buka Vibe Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
