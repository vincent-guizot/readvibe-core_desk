import React, { useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { categoriesApi, getApiErrorMessage } from '../services/catalog-api';
import CrudStatusAlert from '../components/shared/CrudStatusAlert';
import PageHeader from '../components/shared/PageHeader';

const emptyForm = { name: '', description: '' };

export default function CategoriesPage({ categories, onRefresh }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setIsSaving(true);
    setStatus(null);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (editingId) {
        await categoriesApi.update(editingId, payload);
        setStatus({ type: 'success', message: 'Kategori berhasil diperbarui.' });
      } else {
        await categoriesApi.create(payload);
        setStatus({ type: 'success', message: 'Kategori berhasil ditambahkan.' });
      }
      resetForm();
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Kategori gagal disimpan.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;

    setDeletingId(category.id);
    setStatus(null);
    try {
      await categoriesApi.remove(category.id);
      if (editingId === category.id) resetForm();
      setStatus({ type: 'success', message: 'Kategori berhasil dihapus.' });
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Kategori gagal dihapus.') });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Katalog / Categories & Genres" title="Categories & Genres" description="Kelompokkan katalog dengan taksonomi yang konsisten." />
      <CrudStatusAlert status={status} />

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card vd-card p-4">
            <h5 className="fw-bold mb-3">{editingId ? 'Ubah Kategori' : 'Tambah Kategori Baru'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="category-name">Nama Kategori</label>
                <input id="category-name" type="text" className="form-control" placeholder="Misal: Biografi & Memoar" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="category-description">Deskripsi</label>
                <textarea id="category-description" className="form-control" rows="3" placeholder="Cakupan topik kategori..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-vd-primary btn-sm flex-grow-1" disabled={isSaving}>{isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Kategori'}</button>
                {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={isSaving}>Batal</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Kategori ({categories.length})</h5>
            {categories.length === 0 ? <p className="text-muted small mb-0">Belum ada kategori. Tambahkan kategori pertama.</p> : (
              <div className="row g-2">
                {categories.map((category) => (
                  <div className="col-md-6" key={category.id}>
                    <div className="p-3 border rounded bg-light h-100 d-flex justify-content-between gap-3">
                      <div>
                        <span className="fw-semibold">{category.name}</span>
                        {category.description && <p className="small text-muted mb-1">{category.description}</p>}
                        <span className="badge bg-white text-dark border">{category.books?.length || 0} buku</span>
                      </div>
                      <div className="btn-group btn-group-sm align-self-start" aria-label={`Aksi untuk ${category.name}`}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => { setForm({ name: category.name, description: category.description || '' }); setEditingId(category.id); setStatus(null); }} disabled={isSaving || deletingId === category.id} title="Ubah kategori"><AiOutlineEdit /></button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(category)} disabled={deletingId === category.id} title="Hapus kategori"><AiOutlineDelete /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
