import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { booksApi, googleBooksApi } from '../services/catalog-api';
import PageHeader from '../components/shared/PageHeader';
import BookCover from '../features/books/components/BookCover';
import EmptyState from '../components/shared/EmptyState';
import { findImportDuplicate, getImportMapping, toImportedBookPayload } from '../features/books/google-books-import';

export default function GoogleBooksImportPage({
  authors = [],
  categories = [],
  moods = [],
  onRefresh,
}) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mapping, setMapping] = useState(() => getImportMapping());
  const [confirmed, setConfirmed] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function search(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setResults(null);
    try {
      setResults((await googleBooksApi.search(query.trim())).data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function select(book) {
    if (busy) return;
    setBusy(true);
    setError('');
    setDuplicate(null);
    try {
      const checks = await Promise.all([
        booksApi.list({ googleBooksId: book.googleBooksId, limit: 1 }),
        ...(book.isbn
          ? [booksApi.list({ search: book.isbn, limit: 100 })]
          : []),
      ]);
      setDuplicate(findImportDuplicate(book, checks));
      setSelected(book);
      setConfirmed(false);
      setMapping(getImportMapping(book, authors, categories));
      setStep(2);
    } catch (err) {
      setError(`Pemeriksaan duplikat gagal: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }
  async function importBook() {
    if (busy || !confirmed || duplicate) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await booksApi.create(toImportedBookPayload(selected, mapping));
      onRefresh?.();
      navigate(`/books/${data.id}`, {
        state: { message: 'Buku berhasil diimpor dari Google Books.' },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  const toggleMood = (id) =>
    setMapping((current) => ({
      ...current,
      moodIds: current.moodIds.includes(id)
        ? current.moodIds.filter((value) => value !== id)
        : [...current.moodIds, id],
    }));
  return (
    <>
      <PageHeader
        title="Google Books Import"
        description="Cari, tinjau, petakan relasi, dan konfirmasi sebelum menyimpan ke katalog."
        actions={
          <Link
            className={`btn btn-outline-secondary ${busy ? 'disabled' : ''}`}
            to="/books"
          >
            Kembali ke katalog
          </Link>
        }
      />
      <ol className="vd-import-steps mb-4" aria-label="Tahap import">
        {['Cari buku', 'Tinjau metadata', 'Relasi katalog', 'Konfirmasi'].map(
          (name, index) => (
            <li
              key={name}
              className={step === index + 1 ? 'is-active' : ''}
              aria-current={step === index + 1 ? 'step' : undefined}
            >
              <span>{index + 1}</span>
              <strong>{name}</strong>
            </li>
          ),
        )}
      </ol>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {busy && <p role="status">Memproses permintaan...</p>}
      <section className="card vd-card p-4">
        {step === 1 && (
          <>
            <form onSubmit={search} className="mb-4">
              <label htmlFor="import-search" className="form-label">
                Judul, penulis, atau ISBN
              </label>
              <div className="input-group">
                <input
                  id="import-search"
                  type="search"
                  required
                  minLength={2}
                  maxLength={300}
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={busy}
                />
                <button className="btn btn-vd-primary" disabled={busy}>
                  Cari Google Books
                </button>
              </div>
            </form>
            {results?.length === 0 && (
              <EmptyState
                title="Buku tidak ditemukan"
                description="Coba judul, penulis, atau ISBN lain."
              />
            )}
            {results?.map((book) => (
              <article
                key={book.googleBooksId}
                className="border rounded p-3 mb-3 d-flex flex-wrap align-items-center gap-3"
              >
                <BookCover
                  src={book.image}
                  title={book.title}
                  className="vd-catalog-cover"
                />
                <div className="flex-grow-1">
                  <h2 className="h6">{book.title}</h2>
                  <p className="small mb-1">{book.authors?.join(', ')}</p>
                  <span className="small text-secondary">
                    ISBN {book.isbn || '—'} · {book.publishedYear || '—'} ·{' '}
                    {book.pageCount || '—'} halaman
                  </span>
                </div>
                <button
                  className="btn btn-outline-secondary"
                  disabled={busy}
                  onClick={() => select(book)}
                >
                  Tinjau buku
                </button>
              </article>
            ))}
          </>
        )}
        {step === 2 && selected && (
          <>
            <div className="d-flex flex-column flex-md-row gap-4">
              <BookCover src={selected.image} title={selected.title} />
              <div>
                <h2 className="h4">{selected.title}</h2>
                <p>{selected.authors?.join(', ')}</p>
                <p>
                  ISBN: {selected.isbn || 'Tidak tersedia'} · Terbit:{' '}
                  {selected.publishedYear || '—'} · {selected.pageCount || '—'}{' '}
                  halaman
                </p>
                <p className="text-break">
                  {selected.description || 'Sinopsis tidak tersedia.'}
                </p>
              </div>
            </div>
            {duplicate && (
              <div role="alert" className="alert alert-warning mt-3">
                Duplikat ditemukan:{' '}
                <Link to={`/books/${duplicate.id}`}>{duplicate.title}</Link>.
                Buku ini tidak dapat diimpor lagi.
              </div>
            )}
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-outline-secondary"
                disabled={busy}
                onClick={() => setStep(1)}
              >
                Kembali
              </button>
              <button
                className="btn btn-vd-primary"
                disabled={busy || !!duplicate}
                onClick={() => setStep(3)}
              >
                Petakan relasi
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              setConfirmed(false);
              setStep(4);
            }}
          >
            <fieldset disabled={busy}>
              <label htmlFor="import-author" className="form-label">
                Penulis lokal *
              </label>
              <select
                id="import-author"
                required
                className="form-select mb-3"
                value={mapping.authorId}
                onChange={(e) =>
                  setMapping({ ...mapping, authorId: e.target.value })
                }
              >
                <option value="">Pilih penulis</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.pen_name || author.name}
                  </option>
                ))}
              </select>
              <label htmlFor="import-category" className="form-label">
                Kategori lokal *
              </label>
              <select
                id="import-category"
                required
                className="form-select mb-3"
                value={mapping.genreId}
                onChange={(e) =>
                  setMapping({ ...mapping, genreId: e.target.value })
                }
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="small text-secondary">
                Belum ada relasi yang cocok? Buat melalui halaman Authors atau
                Categories, lalu kembali ke import.
              </p>
              <label htmlFor="import-stock" className="form-label">
                Stok internal *
              </label>
              <input
                id="import-stock"
                type="number"
                required
                min={0}
                max={2147483647}
                step={1}
                className="form-control mb-3"
                value={mapping.stock}
                onChange={(e) =>
                  setMapping({ ...mapping, stock: e.target.value })
                }
              />
              <legend className="h6">Mood (opsional)</legend>
              <div className="d-flex flex-wrap gap-3 mb-4">
                {moods.map((mood) => (
                  <label className="form-check" key={mood.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={mapping.moodIds.includes(mood.id)}
                      onChange={() => toggleMood(mood.id)}
                    />
                    <span>{mood.name}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => setStep(2)}
              >
                Kembali
              </button>
              <button className="btn btn-vd-primary">Tinjau final</button>
            </fieldset>
          </form>
        )}
        {step === 4 && (
          <>
            <h2 className="h4">Review akhir</h2>
            <dl>
              <dt>Buku</dt>
              <dd>
                {selected.title} · ISBN {selected.isbn || '—'}
              </dd>
              <dt>Penulis lokal</dt>
              <dd>
                {authors.find((a) => String(a.id) === String(mapping.authorId))
                  ?.pen_name ||
                  authors.find((a) => String(a.id) === String(mapping.authorId))
                    ?.name}
              </dd>
              <dt>Kategori</dt>
              <dd>
                {
                  categories.find(
                    (c) => String(c.id) === String(mapping.genreId),
                  )?.name
                }
              </dd>
              <dt>Stok</dt>
              <dd>{mapping.stock}</dd>
              <dt>Mood</dt>
              <dd>
                {moods
                  .filter((m) => mapping.moodIds.includes(m.id))
                  .map((m) => m.name)
                  .join(', ') || 'Tanpa mood'}
              </dd>
            </dl>
            <label className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={busy}
              />
              <span>
                Saya telah memeriksa metadata dan menyetujui import ke katalog.
              </span>
            </label>
            <button
              className="btn btn-outline-secondary me-2"
              disabled={busy}
              onClick={() => setStep(3)}
            >
              Kembali
            </button>
            <button
              className="btn btn-vd-primary"
              disabled={busy || !confirmed}
              onClick={importBook}
            >
              {busy ? 'Mengimpor...' : 'Konfirmasi Import'}
            </button>
          </>
        )}
      </section>
    </>
  );
}
