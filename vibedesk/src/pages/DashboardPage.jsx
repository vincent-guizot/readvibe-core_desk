import { Link } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import StatCard from '../components/shared/StatCard';
import { visualAssets } from '../constants/visual-assets';

export default function DashboardPage({ kpi, onOpenImport, onOpenAddBook }) {
  const cards = [
    ['Total Buku', 'totalBooks', '▣'],
    ['Total Member', 'totalMembers', '♙'],
    ['Stok ≤5', 'lowStockBooks', '!'],
    ['Kurasi Aktif', 'activeEditorialPicks', '☆'],
    ['Menunggu Moderasi', 'pendingModeration', '◷'],
  ];
  return (
    <>
      <PageHeader
        title="Control Center"
        description="Ringkasan operasional ReadVibe berdasarkan data VibeCore."
      />
      <div className="row g-3 mb-4">
        {cards.map(([label, key, icon]) => (
          <div className="col-xl col-sm-6" key={key}>
            <StatCard label={label} value={kpi?.[key] ?? '—'} icon={icon} />
          </div>
        ))}
      </div>
      <section className="card vd-card mb-4 overflow-hidden">
        <div className="row g-0 align-items-center">
          <div className="col-lg-6 p-4">
            <span className="vd-section-kicker">Ruang kerja kurator</span>
            <h2 className="h3 mt-2">
              Koleksi terawat, pengalaman membaca bermakna.
            </h2>
            <p className="text-secondary">
              Perbarui metadata, kelola ketersediaan, dan susun pilihan
              editorial.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-vd-primary" onClick={onOpenAddBook}>
                Tambah Buku Manual
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={onOpenImport}
              >
                Import Google Books
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src={visualAssets.dashboardPanel}
              className="vd-dashboard-cover"
              alt="Meja dengan buku dan kopi, rak buku serta tanaman di sisi kanan"
            />
          </div>
        </div>
      </section>
      <div className="row g-4">
        <div className="col-lg-8">
          <section className="card vd-card p-4 h-100">
            <div className="d-flex justify-content-between gap-3 mb-3">
              <h2 className="h5">Perubahan katalog terbaru</h2>
              <Link to="/books">Lihat katalog</Link>
            </div>
            {kpi?.recentBooks?.length ? (
              <ul className="list-group list-group-flush">
                {kpi.recentBooks.map((book) => (
                  <li
                    className="list-group-item px-0 d-flex justify-content-between gap-3"
                    key={book.id}
                  >
                    <Link to={`/books/${book.id}`}>{book.title}</Link>
                    <span className="small text-secondary">
                      {new Date(book.updatedAt).toLocaleString('id-ID')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                illustration={visualAssets.emptyBooks}
                title={
                  kpi ? 'Belum ada perubahan katalog' : 'Data belum tersedia'
                }
              />
            )}
          </section>
        </div>
        <div className="col-lg-4">
          <section className="card vd-card p-4 h-100">
            <h2 className="h5">Perhatian operasional</h2>
            {kpi ? (
              <>
                <Link className="d-block alert alert-warning" to="/books">
                  {kpi.lowStockBooks} judul memiliki stok ≤5.
                </Link>
                <Link
                  className="d-block alert alert-light border"
                  to="/moderation"
                >
                  {kpi.pendingModeration} ulasan menunggu moderasi.
                </Link>
              </>
            ) : (
              <p className="text-secondary">Menunggu ringkasan VibeCore.</p>
            )}
            <img
              src={visualAssets.readingCup}
              className="d-block mx-auto"
              width={130}
              height={110}
              style={{ objectFit: 'contain' }}
              alt=""
            />
            <Link
              className="btn btn-outline-secondary w-100 mt-2"
              to="/editorial-picks"
            >
              Kelola kurasi editorial
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
