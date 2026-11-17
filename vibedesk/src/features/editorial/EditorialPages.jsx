import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import AsyncStatus from '../../components/ui/AsyncStatus';
import EmptyState from '../../components/shared/EmptyState';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import http from '../../services/http';

export function EditorialList() {
  const query = useApiQuery('/api/editorial');
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search).toLowerCase();
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('weight');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const rows = (query.data || [])
    .filter(
      (pick) =>
        `${pick.book?.title} ${pick.tagline} ${pick.curatorNotes}`
          .toLowerCase()
          .includes(term) &&
        (!status || String(pick.isActive) === status),
    )
    .sort((a, b) =>
      sort === 'weight'
        ? b.curationWeight - a.curationWeight
        : (a.book?.title || '').localeCompare(b.book?.title || ''),
    );
  async function remove(item) {
    if (busy || !window.confirm(`Hapus kurasi ${item.book?.title}?`)) return;
    setBusy(true);
    setError('');
    try {
      await http.delete(`/api/editorial/${item.id}`);
      query.retry();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Editorial Picks"
        description="Susun pilihan kurator dan prioritas rekomendasi."
        actions={
          <Link className="btn btn-vd-primary" to="/editorial-picks/new">
            Add Editorial Pick
          </Link>
        }
      />
      {location.state?.message && (
        <div className="alert alert-success" role="status">
          {location.state.message}
        </div>
      )}
      <AsyncStatus
        loading={query.loading}
        error={query.error || error}
        onRetry={query.retry}
      />
      <section className="card vd-card p-4">
        <div className="d-flex flex-wrap gap-3 mb-4">
          <label className="flex-grow-1">
            Cari kurasi
            <input
              type="search"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Status
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </label>
          <label>
            Urutkan
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="weight">Bobot tertinggi</option>
              <option value="title">Judul A–Z</option>
            </select>
          </label>
          <button
            className="btn btn-outline-secondary align-self-end"
            onClick={() => {
              setSearch('');
              setStatus('');
              setSort('weight');
            }}
          >
            Reset
          </button>
        </div>
        {!query.loading &&
          !query.error &&
          (rows.length ? (
            <div className="table-responsive">
              <table className="table vd-table">
                <thead>
                  <tr>
                    <th>Buku / Tagline</th>
                    <th>Catatan kurator</th>
                    <th>Bobot</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((pick) => (
                    <tr key={pick.id}>
                      <td>
                        <Link to={`/books/${pick.bookId}`}>
                          {pick.book?.title}
                        </Link>
                        <p className="small mb-0">{pick.tagline}</p>
                      </td>
                      <td className="text-break">{pick.curatorNotes || '—'}</td>
                      <td>{pick.curationWeight}%</td>
                      <td>{pick.isActive ? 'Aktif' : 'Nonaktif'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            className="btn btn-sm btn-outline-secondary"
                            to={`/editorial-picks/${pick.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={busy}
                            onClick={() => remove(pick)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Belum ada kurasi" />
          ))}
      </section>
    </>
  );
}

export function EditorialEditor({ onRefresh }) {
  const { id } = useParams();
  const query = useApiQuery('/api/editorial');
  const initial = id ? query.data?.find((pick) => String(pick.id) === id) : {};
  return (
    <>
      <PageHeader
        title={`${id ? 'Edit' : 'Add'} Editorial Pick`}
        description="Tentukan buku, pesan kurasi, dan bobot prioritas."
      />
      <AsyncStatus
        loading={query.loading}
        error={
          query.error ||
          (!query.loading && id && !initial ? 'Kurasi tidak ditemukan.' : null)
        }
        onRetry={query.retry}
      />
      {!query.loading && !query.error && initial && (
        <EditorialForm
          key={id || 'new'}
          initial={initial}
          id={id}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

function EditorialForm({ initial, id, onRefresh }) {
  const [form, setForm] = useState({
    bookId: initial.bookId || '',
    tagline: initial.tagline || '',
    curatorNotes: initial.curatorNotes || '',
    curationWeight: initial.curationWeight || 50,
    isActive: initial.isActive ?? true,
  });
  const [search, setSearch] = useState(initial.book?.title || '');
  const term = useDebouncedValue(search);
  const books = useApiQuery('/api/books', { search: term, limit: 100 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const options = [...(books.data || [])];
  if (initial.book && !options.some((b) => b.id === initial.bookId))
    options.unshift(initial.book);
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        bookId: Number(form.bookId),
        curationWeight: Number(form.curationWeight),
        tagline: form.tagline.trim(),
      };
      if (id) await http.put(`/api/editorial/${id}`, payload);
      else await http.post('/api/editorial', payload);
      onRefresh?.();
      navigate('/editorial-picks', {
        state: { message: 'Kurasi berhasil disimpan.' },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <form className="card vd-card p-4" onSubmit={save}>
      <AsyncStatus error={error || books.error} onRetry={books.retry} />
      <fieldset disabled={busy}>
        <label className="form-label" htmlFor="editorial-search">
          Cari buku katalog
        </label>
        <input
          id="editorial-search"
          type="search"
          className="form-control mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="form-label" htmlFor="editorial-book">
          Buku *
        </label>
        <select
          id="editorial-book"
          className="form-select mb-4"
          required
          value={form.bookId}
          onChange={(e) => setForm({ ...form, bookId: e.target.value })}
        >
          <option value="">Pilih buku</option>
          {options.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
        <label className="form-label" htmlFor="editorial-tagline">
          Tagline *
        </label>
        <input
          id="editorial-tagline"
          className="form-control mb-4"
          required
          maxLength={255}
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
        <label className="form-label" htmlFor="editorial-notes">
          Catatan kurator
        </label>
        <textarea
          id="editorial-notes"
          className="form-control mb-4"
          rows={5}
          value={form.curatorNotes}
          onChange={(e) => setForm({ ...form, curatorNotes: e.target.value })}
        />
        <label className="form-label" htmlFor="editorial-weight">
          Bobot kurasi: {form.curationWeight}%
        </label>
        <input
          id="editorial-weight"
          className="form-range"
          type="range"
          min={50}
          max={100}
          value={form.curationWeight}
          onChange={(e) => setForm({ ...form, curationWeight: e.target.value })}
        />
        <div className="form-check my-4">
          <input
            id="editorial-active"
            className="form-check-input"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="editorial-active" className="form-check-label">
            Kurasi aktif
          </label>
        </div>
        <button className="btn btn-vd-primary" disabled={busy || books.loading}>
          {busy ? 'Menyimpan...' : 'Simpan Kurasi'}
        </button>
        <Link
          className={`btn btn-outline-secondary ms-2 ${busy ? 'disabled' : ''}`}
          to="/editorial-picks"
        >
          Batal
        </Link>
      </fieldset>
    </form>
  );
}
