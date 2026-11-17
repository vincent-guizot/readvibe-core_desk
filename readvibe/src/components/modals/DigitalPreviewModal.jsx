'use client';

import React from 'react';
import { AiOutlineClose, AiOutlineBook, AiOutlineExport, AiOutlineInfoCircle } from 'react-icons/ai';

export default function DigitalPreviewModal({ isOpen, onClose, book }) {
  if (!isOpen || !book) return null;

  const isEmbeddable = book.embeddable;
  const googleBooksId = book.googleBooksId;
  const previewLink = book.previewLink;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--rv-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4 text-primary">📖</span>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>
                  Digital Preview: {book.title}
                </h5>
                <small className="text-muted">Google Books Embedded Viewer Integration</small>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <div className="modal-body p-4">
            {isEmbeddable && googleBooksId ? (
              <div>
                <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <AiOutlineInfoCircle size={18} />
                  <span>
                    Pratinjau interaktif Google Books. Kamu dapat membaca sampel bab langsung di jendela ini.
                  </span>
                </div>

                <div className="rv-preview-container ratio ratio-16x9 shadow-sm" style={{ minHeight: '480px' }}>
                  <iframe
                    src={`https://books.google.com/books?id=${googleBooksId}&lpg=PP1&pg=PP1&output=embed`}
                    title={`Google Books Preview - ${book.title}`}
                    className="w-100 h-100 border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : previewLink ? (
              <div className="text-center py-5">
                <div className="fs-1 text-warning mb-3">📖</div>
                <h5 className="fw-bold mb-2">Pratinjau Tertanam Terbatas</h5>
                <p className="text-muted mx-auto" style={{ maxWidth: '480px' }}>
                  Penerbit membatasi pratinjau tertanam di situs pihak ketiga. Namun, sampel bab tetap tersedia langsung di portal Google Books.
                </p>
                <a
                  href={previewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-rv-coral px-4 py-2 mt-2 d-inline-flex align-items-center gap-2"
                >
                  <AiOutlineExport size={18} />
                  <span>Buka Pratinjau di Google Books</span>
                </a>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="fs-1 text-muted mb-3">📭</div>
                <h5 className="fw-bold mb-2">Pratinjau Digital Belum Tersedia</h5>
                <p className="text-muted mx-auto" style={{ maxWidth: '480px' }}>
                  Buku ini belum memiliki cuplikan digital publik dari Google Books. Kamu dapat meminjam atau membaca eksemplar fisik di perpustakaan.
                </p>
                <button className="btn btn-outline-secondary mt-2 px-4" onClick={onClose}>
                  Kembali ke Katalog
                </button>
              </div>
            )}
          </div>

          <div className="modal-footer border-top py-2">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
