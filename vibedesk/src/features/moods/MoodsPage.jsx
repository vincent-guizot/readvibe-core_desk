import React, { useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { getApiErrorMessage, moodsApi } from '../../services/catalog-api';
import CrudStatusAlert from '../../shared/components/CrudStatusAlert';

const emptyForm = { name: '', description: '', color: '#3C8C84' };

export default function MoodsPage({ moods, onRefresh }) {
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
      const payload = { name: form.name.trim(), description: form.description.trim(), color: form.color };
      if (editingId) {
        await moodsApi.update(editingId, payload);
        setStatus({ type: 'success', message: 'Mood tag berhasil diperbarui.' });
      } else {
        await moodsApi.create(payload);
        setStatus({ type: 'success', message: 'Mood tag berhasil ditambahkan.' });
      }
      resetForm();
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Mood tag gagal disimpan.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (mood) => {
    if (!window.confirm(`Hapus mood tag "${mood.name}"?`)) return;

    setDeletingId(mood.id);
    setStatus(null);
    try {
      await moodsApi.remove(mood.id);
      if (editingId === mood.id) resetForm();
      setStatus({ type: 'success', message: 'Mood tag berhasil dihapus.' });
      await onRefresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'Mood tag gagal dihapus.') });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--vd-desk-navy)' }}>Taksonomi Mood & Suasana Hati</h2>
      <p className="text-muted small mb-4">Atur bahasa emosional yang dipakai untuk mengkurasi katalog.</p>
      <CrudStatusAlert status={status} />

      <div className="row g-4">
        <div className="col-md-4">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">{editingId ? 'Ubah Mood Tag' : 'Tambah Mood Tag'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="mood-name">Nama Mood</label>
                <input id="mood-name" type="text" className="form-control" placeholder="Misal: Cozy Sunday" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="mood-color">Warna Aksen</label>
                <input id="mood-color" type="color" className="form-control form-control-color w-100" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="mood-description">Deskripsi Resonansi Emosi</label>
                <textarea id="mood-description" className="form-control" rows="3" placeholder="Buku yang membawa rasa hangat dan santai..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-vd-primary btn-sm flex-grow-1" disabled={isSaving}>{isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Mood Tag'}</button>
                {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={isSaving}>Batal</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Daftar Mood Tags ({moods.length})</h5>
            {moods.length === 0 ? <p className="text-muted small mb-0">Belum ada mood tag. Tambahkan mood tag pertama.</p> : (
              <div className="d-flex flex-column gap-3">
                {moods.map((mood) => (
                  <div key={mood.id} className="p-3 border rounded bg-light" style={{ borderLeft: `5px solid ${mood.color || '#3C8C84'}` }}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h6 className="fw-bold mb-1">{mood.name}</h6>
                        <p className="small text-muted mb-1">{mood.description || 'Tidak ada deskripsi.'}</p>
                        <span className="badge bg-white text-dark border">{mood.books?.length || 0} buku terhubung</span>
                      </div>
                      <div className="btn-group btn-group-sm" aria-label={`Aksi untuk ${mood.name}`}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => { setForm({ name: mood.name, description: mood.description || '', color: mood.color || '#3C8C84' }); setEditingId(mood.id); setStatus(null); }} disabled={isSaving || deletingId === mood.id} title="Ubah mood tag"><AiOutlineEdit /></button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(mood)} disabled={deletingId === mood.id} title="Hapus mood tag"><AiOutlineDelete /></button>
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
