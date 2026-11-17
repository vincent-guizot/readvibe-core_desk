import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import StatCard from '../components/shared/StatCard';
import AsyncStatus from '../components/ui/AsyncStatus';
import BarChart from '../components/ui/BarChart';
import { useApiQuery } from '../hooks/useApiQuery';

export default function AnalyticsPage({
  categories = [],
  variant = 'wishlist',
}) {
  const [period, setPeriod] = useState('30');
  const [genreId, setGenreId] = useState('');
  const [sort, setSort] = useState('demand');
  const reading = variant === 'reading';
  const query = useApiQuery(
    reading ? '/api/analytics/reading' : '/api/analytics/wishlist-intelligence',
    { period, genreId, sort },
  );
  const data = query.data;
  const chart = (title, rows) => (
    <section className="card vd-card p-4 h-100">
      <h2 className="h5 mb-3">{title}</h2>
      {rows?.length ? (
        <BarChart data={rows} label={title} />
      ) : (
        <EmptyState
          compact
          title="Belum cukup data"
          description="Agregat akan tersedia setelah ada aktivitas pada periode ini."
        />
      )}
    </section>
  );
  return (
    <>
      <PageHeader
        title={reading ? 'Reading Analytics' : 'Wishlist Intelligence'}
        description={
          reading
            ? 'Agregat buku selesai, penilaian, dan preferensi baca.'
            : 'Permintaan agregat untuk membantu prioritas pengadaan.'
        }
      />
      <section className="card vd-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3">
          <label>
            Periode
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="30">30 hari</option>
              <option value="90">90 hari</option>
              <option value="365">365 hari</option>
              <option value="all">Semua waktu</option>
            </select>
          </label>
          <label>
            Kategori
            <select
              className="form-select"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          {!reading && (
            <label>
              Urutkan
              <select
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="demand">Permintaan tertinggi</option>
                <option value="deficit">Defisit stok tertinggi</option>
              </select>
            </label>
          )}
          <button
            className="btn btn-outline-secondary align-self-end"
            onClick={() => {
              setPeriod('30');
              setGenreId('');
              setSort('demand');
            }}
          >
            Reset
          </button>
        </div>
      </section>
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {data && (
        <>
          <div className="row g-3 mb-4">
            {(reading
              ? [
                  ['Buku Selesai', data.completed],
                  [
                    'Rating Rata-rata',
                    data.averageRating ?? 'Belum ada rating',
                  ],
                  ['Mood Populer', data.moods?.[0]?.name || '—'],
                ]
              : [
                  ['Total Permintaan', data.totalDemand],
                  ['Judul Diminta', data.requestedBooks],
                  ['Defisit Stok', data.stockDeficit],
                ]
            ).map(([label, value]) => (
              <div className="col-md-4" key={label}>
                <StatCard
                  icon={reading ? '☆' : '♡'}
                  label={label}
                  value={value}
                />
              </div>
            ))}
          </div>
          {reading ? (
            <>
              <div className="row g-4 mb-4">
                <div className="col-lg-6">
                  {chart('Distribusi mood aktivitas selesai', data.moods)}
                </div>
                <div className="col-lg-6">
                  {chart('Distribusi genre', data.genres)}
                </div>
              </div>
              <div className="mb-4">
                {chart('Tren penyelesaian bulanan', data.trends)}
              </div>
              <section className="card vd-card p-4">
                <h2 className="h5">Buku dengan rating tertinggi</h2>
                {data.highestRated?.length ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Buku</th>
                          <th>Rating</th>
                          <th>Jumlah penilaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.highestRated.map((book) => (
                          <tr key={book.id}>
                            <td>
                              <Link to={`/books/${book.id}`}>{book.title}</Link>
                            </td>
                            <td>{book.rating}</td>
                            <td>{book.ratingCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState compact title="Belum ada rating" />
                )}
              </section>
            </>
          ) : (
            <>
              <div className="mb-4">
                {chart(
                  'Buku paling diminta',
                  data.rows
                    .slice(0, 10)
                    .map((book) => ({ name: book.title, value: book.demand })),
                )}
              </div>
              <section className="card vd-card p-4">
                <h2 className="h5">Prioritas pengadaan</h2>
                {data.rows.length ? (
                  <div className="table-responsive">
                    <table className="table vd-table">
                      <thead>
                        <tr>
                          <th>Buku</th>
                          <th>Kategori</th>
                          <th>Permintaan</th>
                          <th>Stok</th>
                          <th>Defisit</th>
                          <th>Rekomendasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((book) => (
                          <tr key={book.id}>
                            <td>
                              <Link to={`/books/${book.id}`}>{book.title}</Link>
                            </td>
                            <td>{book.category || '—'}</td>
                            <td>{book.demand}</td>
                            <td>{book.stock || 0}</td>
                            <td>{book.stockDeficit}</td>
                            <td>
                              {book.stockDeficit > 0
                                ? `Tinjau pengadaan ${book.stockDeficit} eksemplar`
                                : 'Stok mencukupi permintaan'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState title="Belum ada permintaan" />
                )}
              </section>
            </>
          )}
          <p className="small text-secondary mt-3">
            Data agregat saja. Jumlah permintaan dihitung dari wishlist pada
            periode terpilih; defisit merupakan indikator untuk ditinjau, bukan
            pesanan otomatis.
          </p>
        </>
      )}
    </>
  );
}
