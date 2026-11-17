import React, { useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from 'react-icons/ai';
import { authorsApi, getApiErrorMessage } from '../services/catalog-api';
import CrudStatusAlert from '../components/shared/CrudStatusAlert';
import PageHeader from '../components/shared/PageHeader';

const emptyForm = { name: '', bio: '' };

export default function AuthorsPage({ authors, onRefresh }) {
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
      const payload = { name: form.name.trim(), bio: form.bio.trim() };
      if (editingId) {
        await authorsApi.update(editingId, payload);
        setStatus({ type: 'success', message: 'Penulis berhasil diperbarui.' });
      } else {
        await authorsApi.create(payload);
        setStatus({ type: 'success', message: 'Penulis berhasil ditambahkan.' });
      }
      resetForm();
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Penulis gagal disimpan.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (author) => {
    setForm({ name: author.name || author.pen_name || '', bio: author.bio || '' });
    setEditingId(author.id);
    setStatus(null);
  };

  const handleDelete = async (author) => {
    if (!window.confirm(`Hapus penulis "${author.name || author.pen_name}"?`)) return;

    setDeletingId(author.id);
    setStatus(null);
    try {
      await authorsApi.remove(author.id);
      if (editingId === author.id) resetForm();
      setStatus({ type: 'success', message: 'Penulis berhasil dihapus.' });
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Penulis gagal dihapus.') });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Katalog / Authors" title="Authors" description="Kelola profil penulis yang terhubung dengan katalog buku." />
      <CrudStatusAlert status={status} />

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card vd-card p-4">
            <h5 className="fw-bold mb-3">{editingId ? 'Ubah Penulis' : 'Tambah Penulis Baru'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="author-name">Nama Pena / Penulis</label>
                <input id="author-name" type="text" className="form-control" placeholder="Misal: Pramoedya Ananta Toer" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="author-bio">Biografi Singkat</label>
                <textarea id="author-bio" className="form-control" rows="3" placeholder="Profil dan latar belakang penulis..." value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-vd-primary btn-sm flex-grow-1" disabled={isSaving}>{isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Penulis'}</button>
                {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={isSaving}>Batal</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card vd-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Daftar Penulis ({authors.length})</h5>
              <AiOutlinePlus className="text-muted" aria-hidden="true" />
            </div>
            {authors.length === 0 ? <p className="text-muted small mb-0">Belum ada penulis. Tambahkan penulis pertama.</p> : (
              <ul className="list-group list-group-flush">
                {authors.map((author) => (
                  <li key={author.id} className="list-group-item d-flex justify-content-between align-items-center gap-3 px-0">
                    <div className="flex-grow-1">
                      <span className="fw-semibold">{author.name || author.pen_name}</span>
                      {author.bio && <p className="small text-muted mb-0">{author.bio}</p>}
                      <span className="badge bg-light text-dark border mt-1">{author.books?.length || 0} buku terhubung</span>
                    </div>
                    <div className="btn-group btn-group-sm" aria-label={`Aksi untuk ${author.name || author.pen_name}`}>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => handleEdit(author)} disabled={isSaving || deletingId === author.id} title="Ubah penulis"><AiOutlineEdit /></button>
                      <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(author)} disabled={deletingId === author.id} title="Hapus penulis"><AiOutlineDelete /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
