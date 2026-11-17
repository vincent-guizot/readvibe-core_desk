import React from 'react';
import { AiOutlineBarChart, AiOutlineBook, AiOutlineCloudDownload, AiOutlineFlag, AiOutlinePlus, AiOutlineTeam, AiOutlineWarning } from 'react-icons/ai';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';

export default function DashboardPage({ kpi, books, onOpenImport, onOpenAddBook }) {
  const totalBooks = kpi?.totalBooks || books.length;
  const lowStock = books.filter((book) => Number(book.stock) > 0 && Number(book.stock) <= 5).length;
  const outOfStock = books.filter((book) => Number(book.stock) === 0).length;
  const recentBooks = books.slice(0, 5);

  return (
    <div>
      <PageHeader eyebrow="Control Center" title="Control Center" description="Ringkasan operasional, kurasi, dan perkembangan ekosistem ReadVibe." />

      <div className="row g-3 mb-4">
        <div className="col-xl col-md-6"><StatCard icon={<AiOutlineBook />} value={totalBooks.toLocaleString('id-ID')} label="Total Buku" trend="↑ Koleksi aktif" /></div>
        <div className="col-xl col-md-6"><StatCard icon={<AiOutlineTeam />} value={(kpi?.totalMembers || 0).toLocaleString('id-ID')} label="Total Member" trend="↑ Komunitas bertumbuh" tone="lilac" /></div>
        <div className="col-xl col-md-6"><StatCard icon={<AiOutlineWarning />} value={lowStock + outOfStock} label="Stok Rendah / Habis" trend={`${outOfStock} buku perlu perhatian`} tone="gold" /></div>
        <div className="col-xl col-md-6"><StatCard icon={<AiOutlineBarChart />} value={(kpi?.totalWishlists || 0).toLocaleString('id-ID')} label="Wishlist Aktif" trend="Sinyal permintaan koleksi" tone="coral" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7"><section className="card vd-card p-4 h-100"><div className="d-flex align-items-start gap-2 mb-3"><span className="fs-4">ϟ</span><div><h2 className="vd-section-title">Quick Actions</h2><p className="text-body-secondary small mb-0">Akses cepat untuk tugas operasional harian.</p></div></div><div className="row g-3"><div className="col-sm-6"><button type="button" className="btn btn-vd-primary w-100 py-3" onClick={onOpenAddBook}><AiOutlinePlus size={22} className="d-block mx-auto mb-2" />Tambah Buku Manual</button></div><div className="col-sm-6"><button type="button" className="btn btn-outline-secondary w-100 py-3" onClick={onOpenImport}><AiOutlineCloudDownload size={22} className="d-block mx-auto mb-2" />Import Google Books</button></div></div></section></div>
        <div className="col-lg-5"><section className="card vd-card p-4 h-100"><div className="d-flex align-items-center justify-content-between mb-3"><h2 className="vd-section-title">Alert Prioritas</h2><span className="small text-success fw-semibold">Lihat semua →</span></div><div className="d-flex flex-column gap-2"><div className="vd-status vd-status--danger w-100"><AiOutlineWarning /> {lowStock + outOfStock} buku stok rendah atau habis.</div><div className="vd-status vd-status--warning w-100"><AiOutlineFlag /> 5 laporan ulasan menunggu moderasi.</div><div className="vd-status vd-status--active w-100">● Koneksi VibeCore dan Google Books normal.</div></div></section></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8"><section className="card vd-card p-4 h-100"><div className="d-flex justify-content-between align-items-center mb-3"><div><h2 className="vd-section-title">Koleksi Terbaru</h2><p className="text-body-secondary small mb-0">Buku terakhir yang masuk ke katalog.</p></div><span className="small text-success fw-semibold">Lihat katalog →</span></div>{recentBooks.length === 0 ? <p className="text-body-secondary mb-0">Belum ada buku di katalog.</p> : <div className="table-responsive"><table className="table vd-table mb-0"><thead><tr><th>Buku</th><th>Kategori</th><th>Stok</th><th>Status</th></tr></thead><tbody>{recentBooks.map((book) => <tr key={book.id}><td><div className="d-flex align-items-center gap-2"><img src={book.image || 'https://via.placeholder.com/36x52'} alt="" className="rounded" style={{ height: 48, objectFit: 'cover', width: 34 }} /><div><strong>{book.title}</strong><span className="d-block small text-body-secondary">{book.author?.name || book.author?.pen_name || 'Penulis belum dipetakan'}</span></div></div></td><td><span className="vd-pill">{book.genre?.name || 'Tanpa kategori'}</span></td><td>{book.stock ?? 0}</td><td><span className={`vd-status ${book.stock > 5 ? 'vd-status--active' : book.stock > 0 ? 'vd-status--warning' : 'vd-status--danger'}`}>{book.stock > 5 ? 'Aktif' : book.stock > 0 ? 'Stok rendah' : 'Habis'}</span></td></tr>)}</tbody></table></div>}</section></div>
        <div className="col-lg-4"><section className="card vd-card p-4 h-100 d-flex flex-column justify-content-between"><div><span className="vd-pill mb-3">Kurasi koleksi</span><h2 className="vd-section-title fs-2">Kelola koleksi, kuatkan kurasi.</h2><p className="text-body-secondary mt-3">Jaga kualitas katalog dan pengalaman membaca komunitas ReadVibe melalui metadata yang konsisten.</p></div><button type="button" className="btn btn-outline-secondary">Lihat panduan kurasi →</button></section></div>
      </div>
    </div>
  );
}
