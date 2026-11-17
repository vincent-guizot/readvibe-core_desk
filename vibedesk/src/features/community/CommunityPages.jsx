import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import http from '../../services/http';
import PageHeader from '../../components/shared/PageHeader';
import Pagination from '../../components/shared/Pagination';
import AsyncStatus from '../../components/ui/AsyncStatus';
import EmptyState from '../../components/shared/EmptyState';

const date = (value) =>
  value ? new Date(value).toLocaleDateString('id-ID') : '—';

export function MembersList() {
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const query = useApiQuery('/api/members', {
    search: term,
    status,
    page,
    limit: 20,
  });
  const rows = query.data || [];
  return (
    <>
      <PageHeader
        title="Members Management"
        description="Kelola akun member tanpa mengakses catatan atau isi bacaan pribadi."
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      <section className="card vd-card p-4">
        <div className="d-flex flex-wrap gap-3 mb-4">
          <label className="flex-grow-1">
            Cari nama atau email
            <input
              type="search"
              className="form-control"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Status
            <select
              className="form-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </label>
          <button
            className="btn btn-outline-secondary align-self-end"
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
            }}
          >
            Reset
          </button>
        </div>
        {rows.length ? (
          <div className="table-responsive">
            <table className="table vd-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Bergabung</th>
                  <th>Aktivitas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {member.profile?.image ? (
                          <img
                            src={member.profile.image}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-circle"
                          />
                        ) : (
                          <span className="badge text-bg-secondary">
                            {member.username?.slice(0, 1)}
                          </span>
                        )}
                        {member.profile?.fullname || member.username}
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>{member.status || 'Active'}</td>
                    <td>{date(member.createdAt)}</td>
                    <td>{member.readingCount || 0} aktivitas baca</td>
                    <td>
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        to={`/members/${member.id}`}
                      >
                        Detail & aktivitas
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !query.loading &&
          !query.error && <EmptyState title="Tidak ada member yang sesuai" />
        )}
        <Pagination
          page={page}
          totalPages={query.meta?.pagination?.totalPages}
          onChange={setPage}
          disabled={query.loading}
        />
      </section>
    </>
  );
}

export function MemberDetail() {
  const { id } = useParams();
  const query = useApiQuery(`/api/members/${id}`);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const member = query.data;
  async function changeStatus() {
    const status = member.status === 'Suspended' ? 'Active' : 'Suspended';
    if (busy || !window.confirm(`Ubah status member menjadi ${status}?`))
      return;
    setBusy(true);
    setFeedback(null);
    try {
      await http.patch(`/api/members/${id}/status`, { status });
      setFeedback({ type: 'success', message: 'Status akun diperbarui.' });
      query.retry();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Member Detail"
        description="Informasi akun dan ringkasan aktivitas agregat."
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {feedback && (
        <div role="status" className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      {member && (
        <section className="card vd-card p-4">
          <h2 className="h4">{member.profile?.fullname || member.username}</h2>
          <dl>
            <dt>Email</dt>
            <dd>{member.email}</dd>
            <dt>Role / Status</dt>
            <dd>
              {member.role} / {member.status || 'Active'}
            </dd>
            <dt>Bergabung</dt>
            <dd>{date(member.createdAt)}</dd>
          </dl>
          <h3 className="h5 mt-3">Aktivitas akun</h3>
          <p>
            {member.activitySummary?.readingCount || 0} aktivitas baca ·{' '}
            {member.activitySummary?.completedCount || 0} buku selesai ·{' '}
            {member.activitySummary?.wishlistCount || 0} wishlist
          </p>
          <p className="text-secondary small">
            Ringkasan jumlah saja. Catatan, kutipan, dan daftar bacaan pribadi
            tidak ditampilkan.
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger"
              disabled={busy}
              onClick={changeStatus}
            >
              {busy
                ? 'Memperbarui...'
                : member.status === 'Suspended'
                  ? 'Aktifkan akun'
                  : 'Suspend akun'}
            </button>
            <Link className="btn btn-outline-secondary" to="/members">
              Kembali
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

export function ModerationList() {
  const [status, setStatus] = useState('Flagged');
  const query = useApiQuery('/api/moderation/reviews', { status });
  const location = useLocation();
  return (
    <>
      <PageHeader
        title="Content Moderation"
        description="Tinjau laporan ulasan publik dan simpan keputusan moderasi."
      />
      {location.state?.message && (
        <div className="alert alert-success" role="status">
          {location.state.message}
        </div>
      )}
      <label className="form-label mb-4">
        Status ulasan
        <select
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Semua ulasan publik</option>
          <option>Flagged</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </label>
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      <section className="card vd-card p-4">
        {query.data?.length ? (
          <div className="table-responsive">
            <table className="table vd-table">
              <thead>
                <tr>
                  <th>Buku / Member</th>
                  <th>Ulasan</th>
                  <th>Alasan laporan</th>
                  <th>Tanggal / Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <Link to={`/books/${review.bookId}`}>
                        {review.book?.title}
                      </Link>
                      <p className="small">{review.user?.username}</p>
                    </td>
                    <td className="text-break">
                      {review.publicReview?.slice(0, 180)}
                    </td>
                    <td>{review.flagReason || 'Tidak ada alasan laporan'}</td>
                    <td>
                      {date(review.updatedAt)}
                      <span className="d-block">{review.moderationStatus}</span>
                    </td>
                    <td>
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        to={`/moderation/${review.id}`}
                      >
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !query.loading &&
          !query.error && (
            <EmptyState title="Tidak ada ulasan dalam antrean ini" />
          )
        )}
      </section>
    </>
  );
}

export function ModerationDetail() {
  const { id } = useParams();
  const query = useApiQuery(`/api/moderation/reviews/${id}`);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function decide(status) {
    if (busy) return;
    if (!reason.trim()) {
      setError('Isi alasan keputusan terlebih dahulu.');
      return;
    }
    if (
      !window.confirm(
        `${status === 'Removed' ? 'Hapus ulasan publik' : `Tetapkan status ${status}`}?${status === 'Removed' ? ' Tindakan ini tidak dapat dibatalkan.' : ''}`,
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await http.patch(`/api/moderation/reviews/${id}`, {
        status,
        reason: reason.trim(),
      });
      navigate('/moderation', {
        state: { message: 'Keputusan moderasi berhasil disimpan.' },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  const review = query.data;
  return (
    <>
      <PageHeader
        title="Moderation Detail"
        description="Tinjau konteks ulasan dan catat alasan keputusan."
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error || error}
        onRetry={query.retry}
      />
      {review && (
        <section className="card vd-card p-4">
          <h2 className="h4">{review.book?.title}</h2>
          <p>
            {review.user?.username} · {date(review.createdAt)} ·{' '}
            {review.moderationStatus}
          </p>
          <div className="alert alert-warning">
            Alasan laporan: {review.flagReason || 'Tidak tersedia'}
          </div>
          <blockquote
            className="border-start ps-3 text-break"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {review.publicReview}
          </blockquote>
          {review.moderationReason && (
            <p>Keputusan sebelumnya: {review.moderationReason}</p>
          )}
          <label className="form-label" htmlFor="decision-reason">
            Alasan keputusan *
          </label>
          <textarea
            id="decision-reason"
            className="form-control mb-4"
            rows={4}
            required
            maxLength={2000}
            disabled={busy}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-vd-primary"
              disabled={busy}
              onClick={() => decide('Approved')}
            >
              Approve
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={busy}
              onClick={() => decide('Rejected')}
            >
              Reject
            </button>
            <button
              className="btn btn-outline-danger"
              disabled={busy}
              onClick={() => decide('Removed')}
            >
              Remove Review
            </button>
            <Link
              className={`btn btn-outline-secondary ${busy ? 'disabled' : ''}`}
              to="/moderation"
            >
              Kembali
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
