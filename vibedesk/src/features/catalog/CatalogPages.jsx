import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import http from '../../services/http';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import PageHeader from '../../components/shared/PageHeader';
import AsyncStatus from '../../components/ui/AsyncStatus';
import EmptyState from '../../components/shared/EmptyState';
import { visualAssets } from '../../constants/visual-assets';
import { catalogConfig } from './catalog-config';

const nameOf = (item) => item.pen_name || item.name;

export function CatalogList({ resource }) {
  const config = catalogConfig[resource];
  const query = useApiQuery(config.endpoint);
  const location = useLocation();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const [sort, setSort] = useState('asc');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rows = (query.data || [])
    .filter((item) =>
      `${nameOf(item)} ${item.bio || item.description || ''}`
        .toLowerCase()
        .includes(debounced.toLowerCase()),
    )
    .sort(
      (a, b) => nameOf(a).localeCompare(nameOf(b)) * (sort === 'asc' ? 1 : -1),
    );
  async function remove(item) {
    if (
      busy ||
      !window.confirm(
        `Hapus ${nameOf(item)}? Relasi buku yang masih digunakan akan mencegah penghapusan.`,
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await http.delete(`${config.endpoint}/${item.id}`);
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
        title={config.title}
        description={config.description}
        actions={
          <Link to={`/${resource}/new`} className="btn btn-vd-primary">
            Add {config.singular}
          </Link>
        }
      />
      {location.state?.message && (
        <div role="status" className="alert alert-success">
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
            Cari {config.singular}
            <input
              className="form-control"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Urutkan
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="asc">Nama A–Z</option>
              <option value="desc">Nama Z–A</option>
            </select>
          </label>
          <button
            className="btn btn-outline-secondary align-self-end"
            onClick={() => {
              setSearch('');
              setSort('asc');
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
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Buku</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {resource === 'authors' ? (
                          <Link to={`/authors/${item.id}`}>{nameOf(item)}</Link>
                        ) : (
                          <strong>{nameOf(item)}</strong>
                        )}
                        {item.color && (
                          <span className="d-block small mt-1">
                            <span
                              className="d-inline-block border rounded me-2"
                              style={{
                                width: 20,
                                height: 20,
                                backgroundColor: /^#[\da-f]{6}$/i.test(
                                  item.color,
                                )
                                  ? item.color
                                  : 'transparent',
                              }}
                            />
                            {item.color}
                          </span>
                        )}
                      </td>
                      <td className="text-break">
                        {item.bio || item.description || '—'}
                      </td>
                      <td>{item.bookCount ?? item.books?.length ?? 0}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            className="btn btn-sm btn-outline-secondary"
                            to={`/${resource}/${item.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={busy}
                            onClick={() => remove(item)}
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
            <EmptyState
              illustration={visualAssets.leafBranch}
              title="Belum ada hasil"
              description="Tambahkan data atau ubah pencarian."
            />
          ))}
      </section>
    </>
  );
}

export function CatalogEditor({ resource, onRefresh }) {
  const { id } = useParams();
  const config = catalogConfig[resource];
  const query = useApiQuery(id ? `${config.endpoint}/${id}` : config.endpoint);
  return (
    <>
      <PageHeader
        title={`${id ? 'Edit' : 'Add New'} ${config.singular}`}
        description={config.description}
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {!query.loading && !query.error && (
        <CatalogForm
          key={`${resource}-${id || 'new'}`}
          config={config}
          resource={resource}
          id={id}
          initial={id ? query.data : {}}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

function CatalogForm({ config, resource, id, initial, onRefresh }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(
      config.fields.map(({ key }) => [
        key,
        initial[key] ||
          (key === 'pen_name' ? initial.name : '') ||
          (key === 'color' ? '#3C8C84' : ''),
      ]),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    if (resource === 'moods' && !/^#[\da-f]{6}$/i.test(form.color)) {
      setError('Warna harus HEX enam digit, misalnya #3C8C84.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()]),
      );
      if (id) await http.put(`${config.endpoint}/${id}`, payload);
      else await http.post(config.endpoint, payload);
      onRefresh?.();
      navigate(`/${resource}`, {
        state: { message: `${config.singular} berhasil disimpan.` },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <form className="card vd-card p-4" onSubmit={save}>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {config.fields.map((field) => (
        <div className="mb-4" key={field.key}>
          <label
            className="form-label fw-semibold"
            htmlFor={`catalog-${field.key}`}
          >
            {field.label}
            {field.required && ' *'}
          </label>
          {field.multiline ? (
            <textarea
              id={`catalog-${field.key}`}
              rows={6}
              className="form-control"
              disabled={busy}
              maxLength={10000}
              value={form[field.key]}
              onChange={(e) =>
                setForm({ ...form, [field.key]: e.target.value })
              }
            />
          ) : (
            <input
              id={`catalog-${field.key}`}
              className="form-control"
              disabled={busy}
              required={field.required}
              maxLength={255}
              pattern={field.key === 'color' ? '#[a-fA-F0-9]{6}' : undefined}
              value={form[field.key]}
              onChange={(e) =>
                setForm({ ...form, [field.key]: e.target.value })
              }
            />
          )}
          {field.key === 'color' && (
            <input
              className="form-control form-control-color mt-2"
              aria-label="Preview dan pilih warna"
              type="color"
              value={/^#[\da-f]{6}$/i.test(form.color) ? form.color : '#3C8C84'}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              disabled={busy}
            />
          )}
        </div>
      ))}
      {id && (
        <p className="small text-secondary">
          Data yang terhubung ke buku dapat diperbarui. Penghapusan ditolak
          selama relasinya masih digunakan.
        </p>
      )}
      <div className="d-flex gap-2">
        <button className="btn btn-vd-primary" disabled={busy}>
          {busy ? 'Menyimpan...' : 'Simpan'}
        </button>
        <Link
          className={`btn btn-outline-secondary ${busy ? 'disabled' : ''}`}
          to={`/${resource}`}
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

export function AuthorDetail() {
  const { id } = useParams();
  const query = useApiQuery(`/api/authors/${id}`);
  const author = query.data;
  return (
    <>
      <PageHeader
        title="Author Detail"
        description="Profil penulis dan koleksi terkait."
        actions={
          <Link className="btn btn-vd-primary" to={`/authors/${id}/edit`}>
            Edit Author
          </Link>
        }
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {author && (
        <section className="card vd-card p-4">
          <h2>{nameOf(author)}</h2>
          <p className="text-break" style={{ whiteSpace: 'pre-wrap' }}>
            {author.bio || 'Belum ada biografi.'}
          </p>
          <h3 className="h5 mt-4">Koleksi ({author.books?.length || 0})</h3>
          <ul className="list-group list-group-flush">
            {author.books?.map((book) => (
              <li className="list-group-item" key={book.id}>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </li>
            ))}
          </ul>
          {!author.books?.length && <p>Belum ada buku terkait.</p>}
        </section>
      )}
    </>
  );
}
