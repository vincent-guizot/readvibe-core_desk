import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import http from '../../services/http';
import PageHeader from '../../components/shared/PageHeader';
import AsyncStatus from '../../components/ui/AsyncStatus';
import EmptyState from '../../components/shared/EmptyState';

export function StaffList({ user }) {
  const query = useApiQuery('/api/staff');
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search).toLowerCase();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const rows = (query.data || []).filter((item) =>
    `${item.username} ${item.email} ${item.profile?.fullname}`
      .toLowerCase()
      .includes(term),
  );
  async function remove(staff) {
    if (busy || !window.confirm(`Hapus akun staf ${staff.username}?`)) return;
    setBusy(true);
    setError('');
    try {
      await http.delete(`/api/staff/${staff.id}`);
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
        title="Staff & Permissions"
        description="Kelola akun operasional dan batas akses staf."
        actions={
          <Link className="btn btn-vd-primary" to="/staff/new">
            Add Staff
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
      <section className="card vd-card p-4 mb-4">
        <label className="form-label w-100">
          Cari staf
          <input
            className="form-control mt-1"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {rows.length ? (
          <div className="table-responsive">
            <table className="table vd-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.profile?.fullname || staff.username}</td>
                    <td>{staff.email}</td>
                    <td>{staff.role}</td>
                    <td>{staff.status || 'Active'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          className="btn btn-sm btn-outline-secondary"
                          to={`/staff/${staff.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={busy || staff.id === user?.id}
                          onClick={() => remove(staff)}
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
          !query.loading &&
          !query.error && <EmptyState title="Tidak ada staf yang sesuai" />
        )}
      </section>
      <section className="card vd-card p-4">
        <h2 className="h5">Permission Matrix</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Modul</th>
                <th>Admin</th>
                <th>Librarian</th>
                <th>Member</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Catalog, Authors, Categories, Moods',
                'Editorial & Analytics',
                'Moderation',
                'Members, Staff & Configuration',
              ].map((label, index) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>Akses penuh</td>
                  <td>{index < 3 ? 'Kelola' : 'Tidak diizinkan'}</td>
                  <td>Tidak ada akses CMS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function StaffEditor() {
  const { id } = useParams();
  const query = useApiQuery(id ? `/api/staff/${id}` : '/api/staff');
  return (
    <>
      <PageHeader
        title={`${id ? 'Edit' : 'Add'} Staff`}
        description={
          id
            ? 'Perbarui peran dan status akun staf.'
            : 'Buat akun staf dengan kredensial awal yang aman.'
        }
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {!query.loading && !query.error && (
        <StaffForm key={id || 'new'} id={id} initial={id ? query.data : {}} />
      )}
    </>
  );
}

function StaffForm({ id, initial }) {
  const [form, setForm] = useState({
    fullname: initial.profile?.fullname || '',
    username: initial.username || '',
    email: initial.email || '',
    password: '',
    role: initial.role || 'Librarian',
    status: initial.status || 'Active',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function save(event) {
    event.preventDefault();
    if (busy || (id && !window.confirm('Simpan perubahan akses staf ini?')))
      return;
    setBusy(true);
    setError('');
    try {
      if (id)
        await http.put(`/api/staff/${id}`, {
          role: form.role,
          status: form.status,
        });
      else await http.post('/api/staff', form);
      navigate('/staff', {
        state: { message: 'Akun staf berhasil disimpan.' },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <form className="card vd-card p-4" onSubmit={save}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <fieldset disabled={busy}>
        {[
          { key: 'fullname', label: 'Nama lengkap' },
          { key: 'username', label: 'Username', min: 3 },
          { key: 'email', label: 'Email', type: 'email' },
          ...(!id
            ? [
                {
                  key: 'password',
                  label: 'Password awal (minimal 12 karakter)',
                  type: 'password',
                  min: 12,
                },
              ]
            : []),
        ].map((field) => (
          <div className="mb-3" key={field.key}>
            <label htmlFor={`staff-${field.key}`} className="form-label">
              {field.label}
            </label>
            <input
              id={`staff-${field.key}`}
              className="form-control"
              type={field.type || 'text'}
              required
              minLength={field.min}
              maxLength={field.key === 'password' ? 128 : 100}
              autoComplete={
                field.key === 'password' ? 'new-password' : undefined
              }
              disabled={!!id}
              value={form[field.key]}
              onChange={(e) =>
                setForm({ ...form, [field.key]: e.target.value })
              }
            />
          </div>
        ))}
        <label htmlFor="staff-role" className="form-label">
          Role
        </label>
        <select
          id="staff-role"
          className="form-select mb-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option>Admin</option>
          <option>Librarian</option>
        </select>
        <label htmlFor="staff-status" className="form-label">
          Status
        </label>
        <select
          id="staff-status"
          className="form-select mb-4"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Active</option>
          <option>Suspended</option>
        </select>
        <button className="btn btn-vd-primary" disabled={busy}>
          {busy ? 'Menyimpan...' : 'Simpan Staff'}
        </button>
        <Link
          className={`btn btn-outline-secondary ms-2 ${busy ? 'disabled' : ''}`}
          to="/staff"
        >
          Batal
        </Link>
      </fieldset>
    </form>
  );
}
