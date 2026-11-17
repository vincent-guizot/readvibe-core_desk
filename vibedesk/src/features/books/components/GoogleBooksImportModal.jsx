import React, { useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineCloudDownload, AiOutlineSearch } from 'react-icons/ai';
import { booksApi, getApiErrorMessage, googleBooksApi } from '../../../services/catalog-api';

const findMatchingId = (items, names, nameSelector) => {
  const normalizedNames = names.map((name) => name.toLowerCase().trim());
  const match = items.find((item) => normalizedNames.includes(nameSelector(item).toLowerCase().trim()));
  return match ? String(match.id) : '';
};

export default function GoogleBooksImportModal({ isOpen, onClose, onImportSuccess, authors, categories, moods }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [authorId, setAuthorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [stock, setStock] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setMessage({ type: 'error', text: 'Masukkan setidaknya dua karakter untuk pencarian.' });
      return;
    }

    setIsSearching(true);
    setMessage(null);
    try {
      const response = await googleBooksApi.search(normalizedQuery);
      const items = response.data || [];
      setResults(items);
      if (items.length === 0) {
        setMessage({ type: 'info', text: 'Tidak ada hasil. Coba judul, nama penulis, atau ISBN lain.' });
      }
    } catch (error) {
      setResults([]);
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Pencarian Google Books gagal.') });
    } finally {
      setIsSearching(false);
    }
  };

  const selectForReview = (book) => {
    setSelectedBook(book);
    setAuthorId(findMatchingId(authors, book.authors || [], (author) => author.name || author.pen_name || ''));
    setGenreId(findMatchingId(categories, book.categories || [], (category) => category.name || ''));
    setStock(1);
    setSelectedMoods([]);
    setMessage(null);
  };

  const toggleMood = (id) => {
    setSelectedMoods((current) => (
      current.includes(id) ? current.filter((moodId) => moodId !== id) : [...current, id]
    ));
  };

  const handleImport = async (event) => {
    event.preventDefault();
    if (!selectedBook || !authorId || !genreId) {
      setMessage({ type: 'error', text: 'Pilih penulis dan kategori sebelum mengimpor buku.' });
      return;
    }

    setIsImporting(true);
    setMessage(null);
    try {
      await booksApi.create({
        title: selectedBook.title,
        description: selectedBook.description,
        year: selectedBook.publishedYear,
        page: selectedBook.pageCount,
        stock: Number(stock),
        image: selectedBook.image || undefined,
        isbn: selectedBook.isbn || undefined,
        googleBooksId: selectedBook.googleBooksId,
        embeddable: selectedBook.embeddable,
        previewLink: selectedBook.previewLink || undefined,
        authorId: Number(authorId),
        genreId: Number(genreId),
        moodIds: selectedMoods,
      });
      onImportSuccess();
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Buku gagal diimpor ke katalog.') });
    } finally {
      setIsImporting(false);
    }
  };

  const displayMessage = message && (
    <div className={`alert alert-${message.type === 'error' ? 'danger' : 'info'} py-2 small`} role="alert">
      {message.text}
    </div>
  );

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} role="dialog" aria-modal="true" aria-labelledby="google-books-import-title">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--vd-radius-md)' }}>
          <div className="modal-header border-bottom py-3">
            <h5 id="google-books-import-title" className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--vd-desk-navy)' }}>
              <AiOutlineCloudDownload size={22} className="text-primary" />
              <span>{selectedBook ? 'Review Import Google Books' : 'Import dari Google Books'}</span>
            </h5>
            <button className="btn-close" onClick={onClose} aria-label="Tutup" disabled={isSearching || isImporting}></button>
          </div>

          <div className="modal-body p-4">
            {displayMessage}
            {!selectedBook ? (
              <>
                <p className="text-muted small">Cari berdasarkan judul, penulis, atau ISBN. Data belum masuk katalog sampai Anda meninjau dan mengonfirmasinya.</p>
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Contoh: Atomic Habits atau 9780735211292" value={query} onChange={(event) => setQuery(event.target.value)} required disabled={isSearching} />
                    <button type="submit" className="btn btn-vd-primary px-4 fw-semibold" disabled={isSearching}>
                      <AiOutlineSearch className="me-1" /> {isSearching ? 'Mencari...' : 'Cari'}
                    </button>
                  </div>
                </form>

                {results.length > 0 && (
                  <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '420px' }}>
                    {results.map((item) => (
                      <article key={item.googleBooksId} className="p-3 border rounded d-flex justify-content-between align-items-center gap-3 bg-light">
                        <div className="d-flex gap-3 align-items-center min-w-0">
                          <img src={item.image || 'https://via.placeholder.com/60x90'} alt="" className="rounded" style={{ width: '45px', height: '65px', objectFit: 'cover' }} />
                          <div>
                            <h6 className="fw-bold mb-0">{item.title}</h6>
                            <small className="text-muted d-block">{item.authors?.join(', ') || 'Penulis tidak tersedia'} · {item.pageCount || 0} halaman</small>
                            <span className="badge bg-white text-dark border me-1" style={{ fontSize: '10px' }}>ISBN: {item.isbn || 'N/A'}</span>
                            {item.embeddable && <span className="badge bg-success" style={{ fontSize: '10px' }}>Preview tersedia</span>}
                          </div>
                        </div>
                        <button type="button" className="btn btn-sm btn-vd-primary flex-shrink-0" onClick={() => selectForReview(item)}>Review</button>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleImport}>
                <button type="button" className="btn btn-link btn-sm p-0 mb-3 text-decoration-none" onClick={() => { setSelectedBook(null); setMessage(null); }} disabled={isImporting}>
                  <AiOutlineArrowLeft className="me-1" /> Kembali ke hasil pencarian
                </button>
                <div className="row g-3">
                  <div className="col-md-3">
                    <img src={selectedBook.image || 'https://via.placeholder.com/160x240'} alt={`Cover ${selectedBook.title}`} className="rounded border w-100" style={{ aspectRatio: '2 / 3', objectFit: 'cover' }} />
                  </div>
                  <div className="col-md-9">
                    <h6 className="fw-bold mb-1">{selectedBook.title}</h6>
                    <p className="small text-muted mb-2">{selectedBook.authors?.join(', ') || 'Penulis tidak tersedia'} · {selectedBook.publishedYear || 'Tahun tidak tersedia'} · {selectedBook.pageCount || 0} halaman</p>
                    <div className="small text-muted">ISBN: {selectedBook.isbn || 'Tidak tersedia'}</div>
                    {selectedBook.description && <p className="small mb-0 mt-2">{selectedBook.description}</p>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="import-author">Penulis di Katalog</label>
                    <select id="import-author" className="form-select" value={authorId} onChange={(event) => setAuthorId(event.target.value)} required disabled={isImporting}>
                      <option value="">-- Pilih Penulis --</option>
                      {authors.map((author) => <option key={author.id} value={author.id}>{author.name || author.pen_name}</option>)}
                    </select>
                    {authors.length === 0 && <div className="form-text text-danger">Buat penulis terlebih dahulu di menu Penulis.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="import-category">Kategori di Katalog</label>
                    <select id="import-category" className="form-select" value={genreId} onChange={(event) => setGenreId(event.target.value)} required disabled={isImporting}>
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    {categories.length === 0 && <div className="form-text text-danger">Buat kategori terlebih dahulu di menu Kategori.</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold" htmlFor="import-stock">Stok Fisik</label>
                    <input id="import-stock" type="number" min="0" className="form-control" value={stock} onChange={(event) => setStock(event.target.value)} required disabled={isImporting} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Mood Tags (opsional)</label>
                    <div className="d-flex flex-wrap gap-2">
                      {moods.map((mood) => <button key={mood.id} type="button" className={`btn btn-sm rounded-pill ${selectedMoods.includes(mood.id) ? 'btn-vd-primary' : 'btn-outline-secondary'}`} onClick={() => toggleMood(mood.id)} disabled={isImporting}>{mood.name}</button>)}
                    </div>
                  </div>
                </div>
                <div className="alert alert-light border mt-4 mb-0 small">Dengan mengonfirmasi, metadata Google Books akan disimpan ke katalog dan dilindungi dari duplikasi berdasarkan ISBN maupun Google Books ID.</div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setSelectedBook(null); setMessage(null); }} disabled={isImporting}>Batal</button>
                  <button type="submit" className="btn btn-vd-primary btn-sm" disabled={isImporting || !authorId || !genreId}>{isImporting ? 'Mengimpor...' : 'Konfirmasi Import'}</button>
                </div>
              </form>
            )}
          </div>

          {!selectedBook && <div className="modal-footer border-top py-2"><button className="btn btn-secondary btn-sm" onClick={onClose} disabled={isSearching}>Tutup</button></div>}
        </div>
      </div>
    </div>
  );
}
