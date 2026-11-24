'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AiOutlineExport } from 'react-icons/ai';

export default function DigitalPreviewModal({ isOpen, onClose, book }) {
  if (!isOpen || !book) return null;
  return <PreviewDialog key={`${book.id}:${book.googleBooksId}`} book={book} onClose={onClose} />;
}

function PreviewDialog({ book, onClose }) {
  const titleId = useId();
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const [frameState, setFrameState] = useState('loading');

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.current.querySelectorAll('button:not([disabled]), a[href], iframe')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose]);

  const googleBooksId = typeof book.googleBooksId === 'string' ? book.googleBooksId.trim() : '';
  const googleUrl = new URL('https://books.google.com/books');
  googleUrl.searchParams.set('id', googleBooksId);
  let previewLink = '';
  try {
    const url = new URL(book.previewLink);
    if (['http:', 'https:'].includes(url.protocol)) previewLink = url.href;
  } catch { /* Books without a provider URL use the unavailable state. */ }
  const canEmbed = book.embeddable === true && !!googleBooksId;
  if (!previewLink && canEmbed) previewLink = googleUrl.href;
  googleUrl.searchParams.set('pg', 'PP1');
  googleUrl.searchParams.set('output', 'embed');

  return (
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} className="modal show d-block" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--rv-radius-md)', maxHeight: '90vh' }}>
          <div className="modal-header border-bottom py-3">
            <div>
              <h2 id={titleId} className="modal-title h5 fw-bold mb-0" style={{ fontFamily: 'var(--font-editorial)' }}>Digital Preview: {book.title}</h2>
              <small className="text-muted">Sampel buku dari Google Books</small>
            </div>
            <button ref={closeButton} type="button" className="btn-close" onClick={onClose} aria-label="Tutup pratinjau" />
          </div>
          <div className="modal-body p-4 overflow-auto">
            {canEmbed && (
              <div className="mb-3" aria-busy={frameState === 'loading'}>
                {frameState === 'loading' && <p role="status">Memuat pratinjau Google Books…</p>}
                {frameState === 'failed' ? (
                  <div role="alert" className="alert alert-warning">
                    <p>Pratinjau tidak dapat dimuat. Coba lagi atau buka di Google Books.</p>
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setFrameState('loading')}>Coba lagi</button>
                  </div>
                ) : (
                  <iframe src={googleUrl.href} title={`Google Books Preview - ${book.title}`} className="w-100 border-0" style={{ height: 'min(60vh, 600px)', minHeight: '280px' }} referrerPolicy="no-referrer" onLoad={() => setFrameState('loaded')} onError={() => setFrameState('failed')} allowFullScreen />
                )}
              </div>
            )}
            {previewLink ? (
              <div className={canEmbed ? 'border-top pt-3' : 'text-center py-4'}>
                {!canEmbed && <h3 className="h5 fw-bold">Buka pratinjau di Google Books</h3>}
                <p className="text-muted small">Ketersediaan sampel ditentukan penerbit. Jika pratinjau tidak tampil di sini, buka langsung di Google Books.</p>
                <a href={previewLink} target="_blank" rel="noopener noreferrer" className="btn btn-rv-coral d-inline-flex align-items-center gap-2"><AiOutlineExport aria-hidden="true" /> Buka Pratinjau di Google Books</a>
              </div>
            ) : (
              <div className="text-center py-4">
                <h3 className="h5 fw-bold">Pratinjau Digital Belum Tersedia</h3>
                <p className="text-muted">Buku ini belum memiliki tautan pratinjau digital. Kamu tetap dapat mencatat progres membaca dari eksemplarmu sendiri.</p>
              </div>
            )}
          </div>
          <div className="modal-footer border-top py-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
