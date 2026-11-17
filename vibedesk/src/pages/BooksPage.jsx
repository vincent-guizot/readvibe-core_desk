import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AiOutlineCloudDownload,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSearch,
} from 'react-icons/ai';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import { visualAssets } from '../constants/visual-assets';
import StatCard from '../components/shared/StatCard';

import { useApiQuery } from '../hooks/useApiQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import AsyncStatus from '../components/ui/AsyncStatus';
import BookCover from '../features/books/components/BookCover';

const initialFilters = { categoryId: '', authorId: '', moodId: '', stock: '' };

export default function BooksPage({
  authors = [],
  categories = [],
  moods = [],
  onOpenImport,
  onOpenAddBook,
  onDeleteBook,
  onEditBook,
  kpi,
}) {
  const location = useLocation();
  const deleting = useSelector((state) => state.books.remove.loading);
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search);
  const [filters, setFilters] = useState(initialFilters);
  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => setFilters(initialFilters);
  const { categoryId, authorId, moodId, stock } = filters;
  const [sort, setSort] = useState('newest');
  const [activePage, setPage] = useState(1);
  const query = useApiQuery('/api/books', {
    search: term,
    genreId: categoryId,
    authorId,
    moodId,
    stock,
    sort,
    page: activePage,
    limit: 20,
  });
  const pagedBooks = query.data || [];
  const pageCount = Math.max(1, query.meta?.pagination?.totalPages || 1);
  const total = query.meta?.pagination?.totalItems || 0;
  const setCategoryId = (value) => {
    setFilter('categoryId', value);
    setPage(1);
  };
  const setAuthorId = (value) => {
    setFilter('authorId', value);
    setPage(1);
  };
  const setMoodId = (value) => {
    setFilter('moodId', value);
    setPage(1);
  };
  const setStock = (value) => {
    setFilter('stock', value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch('');
    clearFilters();
    setSort('newest');
    setPage(1);
  };

  return (
    <div>
      {location.state?.message && (
        <div className="alert alert-success" role="status">
          {location.state.message}
        </div>
      )}
      <PageHeader
        eyebrow="Books Catalog"
        title="Books Catalog"
        description="Kelola koleksi ReadVibe: tambah, ubah, import, dan pantau ketersediaan stok."
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onOpenImport}
            >
              <AiOutlineCloudDownload className="me-2" />
              Import Google Books
            </button>
            <button
              type="button"
              className="btn btn-vd-primary"
              onClick={onOpenAddBook}
            >
              <AiOutlinePlus className="me-2" />
              Tambah Buku Manual
            </button>
          </>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-lg-4 col-sm-6">
          <StatCard
            icon="▣"
            value={kpi?.totalBooks ?? '—'}
            label="Total Buku"
          />
        </div>
        <div className="col-lg-4 col-sm-6">
          <StatCard icon="＋" value={total} label="Hasil Filter" tone="lilac" />
        </div>
        <div className="col-lg-4 col-sm-6">
          <StatCard
            icon="!"
            value={kpi?.lowStockBooks ?? '—'}
            label="Stok ≤5"
            tone="gold"
          />
        </div>
      </div>

      <section className="card vd-card p-4">
        <AsyncStatus
          loading={query.loading}
          error={query.error}
          onRetry={query.retry}
        />
        <div className="vd-toolbar mb-4">
          <label className="flex-grow-1" style={{ minWidth: 220 }}>
            <span className="visually-hidden">Cari buku</span>
            <div className="position-relative">
              <AiOutlineSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                className="form-control ps-5"
                placeholder="Cari judul, ISBN, atau penulis..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </label>
          <label>
            <span className="form-label small fw-semibold mb-1">Kategori</span>
            <select
              className="form-select"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label small fw-semibold mb-1">Penulis</span>
            <select
              className="form-select"
              value={authorId}
              onChange={(event) => setAuthorId(event.target.value)}
            >
              <option value="">Semua penulis</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name || author.pen_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label small fw-semibold mb-1">Mood</span>
            <select
              className="form-select"
              value={moodId}
              onChange={(event) => setMoodId(event.target.value)}
            >
              <option value="">Semua mood</option>
              {moods.map((mood) => (
                <option key={mood.id} value={mood.id}>
                  {mood.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label small fw-semibold mb-1">Stok</span>
            <select
              className="form-select"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            >
              <option value="">Semua stok</option>
              <option value="available">Tersedia</option>
              <option value="low">Rendah</option>
              <option value="empty">Habis</option>
            </select>
          </label>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
          <span className="small text-body-secondary">
            Menampilkan {pagedBooks.length} dari {total} buku
          </span>
          <label className="d-flex align-items-center gap-2 small fw-semibold">
            Urutkan{' '}
            <select
              className="form-select form-select-sm"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Terbaru dibuat</option>
              <option value="title">Judul A–Z</option>
              <option value="stock">Stok terbanyak</option>
            </select>
          </label>
        </div>
        <div className="table-responsive">
          <table className="table vd-table mb-0">
            <thead>
              <tr>
                <th>Buku</th>
                <th>ISBN</th>
                <th>Kategori</th>
                <th>Mood</th>
                <th>Stok</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedBooks.map((book) => {
                const currentStock = Number(book.stock || 0);
                const status =
                  currentStock === 0
                    ? ['Habis', 'danger']
                    : currentStock <= 5
                      ? ['Stok rendah', 'warning']
                      : ['Aktif', 'active'];
                return (
                  <tr key={book.id}>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <BookCover
                          src={book.image}
                          title={book.title}
                          className="vd-catalog-cover"
                        />
                        <div>
                          <Link
                            to={`/books/${book.id}`}
                            className="fw-bold text-decoration-none"
                          >
                            {book.title}
                          </Link>
                          <span className="d-block small text-body-secondary">
                            {book.author?.name ||
                              book.author?.pen_name ||
                              'Penulis tidak diketahui'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="small">{book.isbn || '—'}</td>
                    <td>
                      <span className="vd-pill">{book.genre?.name || '—'}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(book.moods || []).slice(0, 2).map((mood) => (
                          <span className="vd-pill" key={mood.id}>
                            {mood.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{currentStock}</td>
                    <td>
                      <span className={`vd-status vd-status--${status[1]}`}>
                        {status[0]}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="vd-icon-button"
                          onClick={() => onEditBook(book)}
                          aria-label={`Ubah ${book.title}`}
                        >
                          <AiOutlineEdit />
                        </button>
                        <button
                          type="button"
                          className="vd-icon-button vd-icon-button--danger"
                          disabled={deleting}
                          onClick={async () => {
                            await onDeleteBook(book.id, book.title);
                            query.retry();
                          }}
                          aria-label={`Hapus ${book.title}`}
                        >
                          <AiOutlineDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!query.loading && !query.error && pagedBooks.length === 0 && (
          <EmptyState
            illustration={visualAssets.emptyBooks}
            title="No books found."
            description={
              total
                ? 'Coba kata pencarian atau filter lain untuk menemukan buku.'
                : 'Start building your catalog by adding your first book.'
            }
            actions={
              <button
                type="button"
                className="btn btn-vd-primary"
                onClick={total ? resetFilters : onOpenAddBook}
              >
                {total ? 'Reset Filter' : 'Add New Book'}
              </button>
            }
          />
        )}
        <footer className="d-flex justify-content-between align-items-center pt-4">
          <span className="small text-body-secondary">
            Halaman {activePage} dari {pageCount}
          </span>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
            >
              ←
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(Math.min(pageCount, activePage + 1))}
              disabled={activePage === pageCount}
            >
              →
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
