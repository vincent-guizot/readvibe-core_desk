import React, { useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { editorialPicksApi, getApiErrorMessage } from '../../services/catalog-api';
import CrudStatusAlert from '../../shared/components/CrudStatusAlert';

const emptyForm = { bookId: '', tagline: '', note: '', curationWeight: 90, active: true };

export default function EditorialPicksPage({ picks, books, onRefresh }) {
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
    if (!editingId && !form.bookId) return;

    setIsSaving(true);
    setStatus(null);
    try {
      const payload = {
        tagline: form.tagline.trim() || 'Pilihan Redaksi',
        note: form.note.trim(),
        curationWeight: Number(form.curationWeight),
        active: form.active,
      };

      if (editingId) {
        await editorialPicksApi.update(editingId, payload);
        setStatus({ type: 'success', message: 'Pilihan editor berhasil diperbarui.' });
      } else {
        await editorialPicksApi.create({ ...payload, bookId: Number(form.bookId) });
        setStatus({ type: 'success', message: 'Buku ditetapkan sebagai pilihan editor.' });
      }
      resetForm();
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Pilihan editor gagal disimpan.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (pick) => {
    setForm({
      bookId: String(pick.bookId),
      tagline: pick.tagline || '',
      note: pick.note || pick.curatorNotes || '',
      curationWeight: pick.curationWeight || 50,
      active: pick.isActive ?? pick.active ?? true,
    });
    setEditingId(pick.id);
    setStatus(null);
  };

  const handleDelete = async (pick) => {
    const title = pick.book?.title || 'pilihan editor ini';
    if (!window.confirm(`Hapus "${title}" dari pilihan editor?`)) return;

    setDeletingId(pick.id);
    setStatus(null);
    try {
      await editorialPicksApi.remove(pick.id);
      if (editingId === pick.id) resetForm();
      setStatus({ type: 'success', message: 'Pilihan editor berhasil dihapus.' });
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Pilihan editor gagal dihapus.') });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>Kurasi Pilihan Editor</h2>
      <p className="text-muted small mb-4">Atur buku unggulan dan bobot kurasi yang dipakai sebagai sinyal rekomendasi.</p>
      <CrudStatusAlert status={status} />

      <div className="row g-4">
        <div className="col-md-5">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">{editingId ? 'Ubah Pilihan Editor' : 'Tambah Pilihan Editor'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="editorial-book">Pilih Buku</label>
                <select id="editorial-book" className="form-select" value={form.bookId} onChange={(event) => setForm((current) => ({ ...current, bookId: event.target.value }))} required disabled={isSaving || editingId !== null}>
                  <option value="">-- Pilih Buku dari Katalog --</option>
                  {books.map((book) => <option key={book.id} value={book.id}>{book.title} ({book.author?.name || book.author?.pen_name || 'Penulis'})</option>)}
                </select>
                {editingId && <div className="form-text">Buku tidak dapat diubah; hapus lalu buat kurasi baru bila diperlukan.</div>}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="editorial-tagline">Tagline</label>
                <input id="editorial-tagline" type="text" className="form-control" placeholder="Pilihan Redaksi" value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="editorial-note">Catatan Kurator</label>
                <textarea id="editorial-note" className="form-control" rows="3" placeholder="Alasan buku ini penting untuk direkomendasikan..." value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="editorial-weight">Bobot Kurasi: {form.curationWeight}%</label>
                <input id="editorial-weight" type="range" className="form-range" min="50" max="100" value={form.curationWeight} onChange={(event) => setForm((current) => ({ ...current, curationWeight: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="form-check mb-3">
                <input id="editorial-active" className="form-check-input" type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} disabled={isSaving} />
                <label className="form-check-label small" htmlFor="editorial-active">Tampilkan sebagai kurasi aktif</label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-vd-primary btn-sm flex-grow-1" disabled={isSaving}>{isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tetapkan Pilihan'}</button>
                {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={isSaving}>Batal</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-7">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Kurasi ({picks.length})</h5>
            {picks.length === 0 ? <p className="text-muted small mb-0">Belum ada pilihan editor.</p> : (
              <div className="d-flex flex-column gap-3">
                {picks.map((pick) => (
                  <div key={pick.id} className="p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                      <div>
                        <span className="badge bg-warning text-dark me-2">★ Bobot: {pick.curationWeight}%</span>
                        <span className={`badge ${pick.isActive ? 'bg-success' : 'bg-secondary'}`}>{pick.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        <h6 className="fw-bold mt-2 mb-0">{pick.book?.title || 'Buku tidak tersedia'}</h6>
                        {pick.tagline && <small className="text-muted">{pick.tagline}</small>}
                      </div>
                      <div className="btn-group btn-group-sm" aria-label={`Aksi untuk ${pick.book?.title || 'pilihan editor'}`}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => handleEdit(pick)} disabled={isSaving || deletingId === pick.id} title="Ubah pilihan editor"><AiOutlineEdit /></button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(pick)} disabled={deletingId === pick.id} title="Hapus pilihan editor"><AiOutlineDelete /></button>
                      </div>
                    </div>
                    <p className="small text-muted mb-0 fst-italic">{pick.note || pick.curatorNotes || 'Tanpa catatan kurator.'}</p>
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
