import React from 'react';
import { AiOutlineCloudDownload, AiOutlineDelete, AiOutlineEdit, AiOutlinePlus, AiOutlineSearch } from 'react-icons/ai';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';

import { useSearch } from '../hooks/useSearch';
import { useFilter } from '../hooks/useFilter';
import { useSorting } from '../hooks/useSorting';
import { usePagination } from '../hooks/usePagination';

const searchText = (book) => [book.title, book.author?.name || book.author?.pen_name, book.isbn].join(' ');
const initialFilters = { categoryId: '', authorId: '', moodId: '', stock: '' };
const matchesFilters = (book, { categoryId, authorId, moodId, stock }) => {
  const count = Number(book.stock || 0);
  return (!categoryId || String(book.genreId) === categoryId)
    && (!authorId || String(book.authorId) === authorId)
    && (!moodId || book.moods?.some((mood) => String(mood.id) === moodId))
    && (!stock || (stock === 'available' && count > 5) || (stock === 'low' && count > 0 && count <= 5) || (stock === 'empty' && count === 0));
};
const comparators = {
  title: (left, right) => left.title.localeCompare(right.title),
  stock: (left, right) => Number(right.stock || 0) - Number(left.stock || 0),
  newest: (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
};

export default function BooksPage({ books, authors = [], categories = [], moods = [], onOpenImport, onOpenAddBook, onDeleteBook, onEditBook }) {
  const { search, setSearch, results: searchedBooks } = useSearch(books, searchText);
  const { filters, setFilter, resetFilters: clearFilters, results: matchedBooks } = useFilter(searchedBooks, initialFilters, matchesFilters);
  const { categoryId, authorId, moodId, stock } = filters;
  const { sort, setSort, results: filteredBooks } = useSorting(matchedBooks, comparators, 'newest');
  const { page: activePage, setPage, pageCount, results: pagedBooks } = usePagination(filteredBooks);
  const setCategoryId = (value) => { setFilter('categoryId', value); setPage(1); };
  const setAuthorId = (value) => { setFilter('authorId', value); setPage(1); };
  const setMoodId = (value) => { setFilter('moodId', value); setPage(1); };
  const setStock = (value) => { setFilter('stock', value); setPage(1); };
  const lowStock = books.filter((book) => Number(book.stock) > 0 && Number(book.stock) <= 5).length;
  const outOfStock = books.filter((book) => Number(book.stock) === 0).length;
  const resetFilters = () => { setSearch(''); clearFilters(); setSort('newest'); setPage(1); };

  return (
    <div>
      <PageHeader
        eyebrow="Books Catalog"
        title="Books Catalog"
        description="Kelola koleksi ReadVibe: tambah, ubah, import, dan pantau ketersediaan stok."
        actions={<><button type="button" className="btn btn-outline-secondary" onClick={onOpenImport}><AiOutlineCloudDownload className="me-2" />Import Google Books</button><button type="button" className="btn btn-vd-primary" onClick={onOpenAddBook}><AiOutlinePlus className="me-2" />Tambah Buku Manual</button></>}
      />

      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6"><StatCard icon="▣" value={books.length.toLocaleString('id-ID')} label="Total Buku" /></div>
        <div className="col-lg-3 col-sm-6"><StatCard icon="＋" value={books.filter((book) => book.createdAt).slice(0, 5).length} label="Buku Terbaru" tone="lilac" /></div>
        <div className="col-lg-3 col-sm-6"><StatCard icon="!" value={lowStock} label="Stok Rendah" tone="gold" /></div>
        <div className="col-lg-3 col-sm-6"><StatCard icon="□" value={outOfStock} label="Stok Habis" tone="coral" /></div>
      </div>

      <section className="card vd-card p-4">
        <div className="vd-toolbar mb-4">
          <label className="flex-grow-1" style={{ minWidth: 220 }}><span className="visually-hidden">Cari buku</span><div className="position-relative"><AiOutlineSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" /><input className="form-control ps-5" placeholder="Cari judul, ISBN, atau penulis..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div></label>
          <label><span className="form-label small fw-semibold mb-1">Kategori</span><select className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label><span className="form-label small fw-semibold mb-1">Penulis</span><select className="form-select" value={authorId} onChange={(event) => setAuthorId(event.target.value)}><option value="">Semua penulis</option>{authors.map((author) => <option key={author.id} value={author.id}>{author.name || author.pen_name}</option>)}</select></label>
          <label><span className="form-label small fw-semibold mb-1">Mood</span><select className="form-select" value={moodId} onChange={(event) => setMoodId(event.target.value)}><option value="">Semua mood</option>{moods.map((mood) => <option key={mood.id} value={mood.id}>{mood.name}</option>)}</select></label>
          <label><span className="form-label small fw-semibold mb-1">Stok</span><select className="form-select" value={stock} onChange={(event) => setStock(event.target.value)}><option value="">Semua stok</option><option value="available">Tersedia</option><option value="low">Rendah</option><option value="empty">Habis</option></select></label>
          <button type="button" className="btn btn-outline-secondary" onClick={resetFilters}>Reset</button>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3 mb-3"><span className="small text-body-secondary">Menampilkan {pagedBooks.length} dari {filteredBooks.length} buku</span><label className="d-flex align-items-center gap-2 small fw-semibold">Urutkan <select className="form-select form-select-sm" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Terbaru dibuat</option><option value="title">Judul A–Z</option><option value="stock">Stok terbanyak</option></select></label></div>
        <div className="table-responsive"><table className="table vd-table mb-0"><thead><tr><th>Buku</th><th>ISBN</th><th>Kategori</th><th>Mood</th><th>Stok</th><th>Status</th><th className="text-end">Aksi</th></tr></thead><tbody>{pagedBooks.map((book) => { const currentStock = Number(book.stock || 0); const status = currentStock === 0 ? ['Habis', 'danger'] : currentStock <= 5 ? ['Stok rendah', 'warning'] : ['Aktif', 'active']; return <tr key={book.id}><td><div className="d-flex gap-2 align-items-center"><img src={book.image || 'https://via.placeholder.com/40x60'} alt="" className="rounded" style={{ height: 56, objectFit: 'cover', width: 40 }} /><div><strong>{book.title}</strong><span className="d-block small text-body-secondary">{book.author?.name || book.author?.pen_name || 'Penulis tidak diketahui'}</span></div></div></td><td className="small">{book.isbn || '—'}</td><td><span className="vd-pill">{book.genre?.name || '—'}</span></td><td><div className="d-flex flex-wrap gap-1">{(book.moods || []).slice(0, 2).map((mood) => <span className="vd-pill" key={mood.id}>{mood.name}</span>)}</div></td><td>{currentStock}</td><td><span className={`vd-status vd-status--${status[1]}`}>{status[0]}</span></td><td><div className="d-flex justify-content-end gap-1"><button type="button" className="vd-icon-button" onClick={() => onEditBook(book)} aria-label={`Ubah ${book.title}`}><AiOutlineEdit /></button><button type="button" className="vd-icon-button vd-icon-button--danger" onClick={() => onDeleteBook(book.id, book.title)} aria-label={`Hapus ${book.title}`}><AiOutlineDelete /></button></div></td></tr>; })}</tbody></table></div>
        {pagedBooks.length === 0 && <div className="py-5 text-center text-body-secondary">Tidak ada buku yang cocok dengan filter saat ini.</div>}
        <footer className="d-flex justify-content-between align-items-center pt-4"><span className="small text-body-secondary">Halaman {activePage} dari {pageCount}</span><div className="btn-group"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(Math.max(1, activePage - 1))} disabled={activePage === 1}>←</button><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(Math.min(pageCount, activePage + 1))} disabled={activePage === pageCount}>→</button></div></footer>
      </section>
    </div>
  );
}
