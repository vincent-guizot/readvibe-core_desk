import React, { useState } from 'react';
import { AiOutlineCloudDownload } from 'react-icons/ai';

export default function GoogleBooksImportModal({ isOpen, onClose, token, onImportSuccess, apiUrl }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [importingId, setImportingId] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/integrations/google-books/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data) {
        setResults(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (item) => {
    setImportingId(item.googleBooksId);
    try {
      const res = await fetch(`${apiUrl}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          page: item.pageCount,
          year: item.publishedYear,
          image: item.image,
          isbn: item.isbn,
          googleBooksId: item.googleBooksId,
          embeddable: item.embeddable,
          previewLink: item.previewLink,
        }),
      });

      if (res.ok) {
        onImportSuccess();
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mengimpor.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--vd-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--vd-desk-navy)' }}>
              <AiOutlineCloudDownload size={22} className="text-primary" />
              <span>1-Click Import dari Google Books API</span>
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup"></button>
          </div>

          <div className="modal-body p-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari berdasarkan Judul Buku atau ISBN (misal: '9780735211292' atau 'Atomic Habits')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-vd-primary px-4 fw-semibold" disabled={loading}>
                  {loading ? 'Mencari...' : 'Cari di Google Books'}
                </button>
              </div>
            </form>

            {results.length > 0 && (
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '420px' }}>
                {results.map((item) => (
                  <div key={item.googleBooksId} className="p-3 border rounded d-flex justify-content-between align-items-center bg-light">
                    <div className="d-flex gap-3 align-items-center">
                      <img
                        src={item.image || 'https://via.placeholder.com/60x90'}
                        alt={item.title}
                        className="rounded"
                        style={{ width: '45px', height: '65px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '420px' }}>
                          {item.title}
                        </h6>
                        <small className="text-muted d-block">
                          {item.authors?.join(', ')} &bull; {item.pageCount} halaman
                        </small>
                        <span className="badge bg-light text-dark border me-1" style={{ fontSize: '10px' }}>
                          ISBN: {item.isbn || 'N/A'}
                        </span>
                        {item.embeddable && (
                          <span className="badge bg-success" style={{ fontSize: '10px' }}>
                            ✓ Digital Preview Didukung
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn btn-sm btn-vd-primary"
                        onClick={() => handleImport(item)}
                        disabled={importingId === item.googleBooksId}
                      >
                        {importingId === item.googleBooksId ? 'Mengimpor...' : '1-Click Import'}
                      </button>
                    </div>
                  </div>
                ))}
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
