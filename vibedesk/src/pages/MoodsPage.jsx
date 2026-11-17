import React, { useMemo, useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit, AiOutlineHeart, AiOutlinePlus, AiOutlineSearch, AiOutlineTag } from 'react-icons/ai';
import { getApiErrorMessage, moodsApi } from '../services/catalog-api';
import CrudStatusAlert from '../components/shared/CrudStatusAlert';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';

const emptyForm = { name: '', description: '', color: '#3C8C84' };

export default function MoodsPage({ moods, onRefresh }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const visibleMoods = useMemo(() => moods.filter((mood) => (
    `${mood.name} ${mood.description || ''}`.toLowerCase().includes(query.toLowerCase().trim())
  )), [moods, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
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
      <PageHeader
        eyebrow="Katalog / Mood Tags"
        title="Mood Tags"
        description="Atur bahasa emosional yang menghubungkan katalog dengan suasana hati pembaca."
        actions={<button type="button" className="btn btn-vd-primary" onClick={() => { resetForm(); setShowForm(true); }}><AiOutlinePlus /> Mood Tag Baru</button>}
      />
      <CrudStatusAlert status={status} />

      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard icon={<AiOutlineTag />} value={moods.length} label="Total Mood Tags" tone="lilac" /></div>
        <div className="col-md-4"><StatCard icon={<AiOutlineHeart />} value={moods.reduce((total, mood) => total + (mood.books?.length || 0), 0)} label="Koneksi Buku" tone="coral" /></div>
        <div className="col-md-4"><StatCard icon={<AiOutlineHeart />} value={moods.filter((mood) => (mood.books?.length || 0) > 0).length} label="Mood Aktif" tone="gold" /></div>
      </div>

      {showForm && (
        <div className="card vd-card p-4 mb-4 vd-form-panel">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div><span className="vd-section-kicker">Taxonomy editor</span><h5 className="mb-0">{editingId ? 'Ubah Mood Tag' : 'Tambah Mood Tag'}</h5></div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetForm} disabled={isSaving}>Tutup</button>
          </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small fw-semibold" htmlFor="mood-name">Nama Mood</label>
                <input id="mood-name" type="text" className="form-control" placeholder="Misal: Cozy Sunday" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required disabled={isSaving} />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold" htmlFor="mood-color">Warna Aksen</label>
                <input id="mood-color" type="color" className="form-control form-control-color w-100" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold" htmlFor="mood-description">Deskripsi Resonansi Emosi</label>
                <input id="mood-description" className="form-control" placeholder="Buku yang membawa rasa hangat dan santai..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="col-md-2 d-flex gap-2">
                <button type="submit" className="btn btn-vd-primary btn-sm flex-grow-1" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
                {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={isSaving}>Batal</button>}
              </div>
              </div>
            </form>
        </div>
      )}

      <div className="card vd-card p-0 overflow-hidden">
        <div className="vd-table-toolbar px-4 py-3">
          <div><span className="vd-section-kicker">Mood library</span><h5 className="mb-0">Semua Mood Tags <span className="text-muted fw-normal">({visibleMoods.length})</span></h5></div>
          <label className="vd-inline-search"><AiOutlineSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari mood tag..." aria-label="Cari mood tag" /></label>
        </div>
        {visibleMoods.length === 0 ? <p className="text-muted small p-4 mb-0">Belum ada mood tag yang sesuai.</p> : (
          <div className="table-responsive">
            <table className="table vd-data-table align-middle mb-0">
              <thead><tr><th>MOOD TAG</th><th>DESKRIPSI</th><th>TERHUBUNG KE</th><th>WARNA</th><th className="text-end">AKSI</th></tr></thead>
              <tbody>{visibleMoods.map((mood) => (
                <tr key={mood.id}>
                  <td><span className="vd-mood-dot" style={{ background: mood.color || '#3C8C84' }} /><strong>{mood.name}</strong></td>
                  <td className="text-muted small">{mood.description || 'Belum ada deskripsi.'}</td>
                  <td><span className="vd-count-pill">{mood.books?.length || 0} buku</span></td>
                  <td><span className="vd-color-swatch" style={{ background: mood.color || '#3C8C84' }} /> <span className="small text-muted">{mood.color || '#3C8C84'}</span></td>
                  <td className="text-end"><div className="d-inline-flex gap-1" aria-label={`Aksi untuk ${mood.name}`}><button type="button" className="vd-icon-button" onClick={() => { setForm({ name: mood.name, description: mood.description || '', color: mood.color || '#3C8C84' }); setEditingId(mood.id); setShowForm(true); setStatus(null); }} disabled={isSaving || deletingId === mood.id} title="Ubah mood tag"><AiOutlineEdit /></button><button type="button" className="vd-icon-button vd-icon-button--danger" onClick={() => handleDelete(mood)} disabled={deletingId === mood.id} title="Hapus mood tag"><AiOutlineDelete /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
