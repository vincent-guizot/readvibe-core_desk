import { useEffect, useState } from 'react';
import http from '../../services/http';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import AsyncStatus from '../../components/ui/AsyncStatus';
import EmptyState from '../../components/shared/EmptyState';

const weights = [
  [
    'moodMatchBaseScore',
    'Skor dasar kecocokan',
    'Skor awal kandidat sebelum bonus mood, kata kunci, dan kurasi.',
  ],
  [
    'curationWeightBonus',
    'Pengali bobot editorial',
    'Bobot kurasi (50–100) dikalikan nilai ini sebagai bonus skor.',
  ],
  [
    'minMatchScoreThreshold',
    'Ambang kecocokan minimum',
    'Kandidat di bawah ambang ini tidak masuk rekomendasi.',
  ],
];

export default function SettingsForm({ initial, recommendation = false }) {
  const keys = recommendation
    ? weights.map(([key]) => key)
    : ['googleBooksEnabled', 'enableGeminiExplanations'];
  const values = Object.fromEntries(keys.map((key) => [key, initial[key]]));
  const [saved, setSaved] = useState(values);
  const [form, setForm] = useState(values);
  const [audit, setAudit] = useState(initial.updatedAt);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [preview, setPreview] = useState({
    data: null,
    error: null,
    loading: false,
  });
  const [previewVersion, setPreviewVersion] = useState(0);
  const delayed = useDebouncedValue(JSON.stringify(form));
  useEffect(() => {
    if (!recommendation) return;
    let active = true;
    const controller = new AbortController();
    http
      .post(
        '/api/settings/preview',
        { settings: JSON.parse(delayed) },
        { signal: controller.signal },
      )
      .then(({ data }) => {
        if (active) setPreview({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (active)
          setPreview({ data: null, error: error.message, loading: false });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [delayed, recommendation, previewVersion]);
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await http.put('/api/settings', form);
      setSaved(Object.fromEntries(keys.map((key) => [key, data[key]])));
      setAudit(data.updatedAt);
      setFeedback({
        type: 'success',
        message: 'Pengaturan tersimpan di database.',
      });
    } catch (error) {
      setFeedback({ type: 'danger', message: error.message });
    } finally {
      setBusy(false);
    }
  }
  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    if (recommendation) setPreview({ data: null, error: null, loading: true });
  }
  return (
    <div className="row g-4">
      <div className={recommendation ? 'col-lg-7' : 'col-12'}>
        <form className="card vd-card p-4" onSubmit={save}>
          {feedback && (
            <div role="status" className={`alert alert-${feedback.type}`}>
              {feedback.message}
            </div>
          )}
          <fieldset disabled={busy}>
            {recommendation
              ? weights.map(([key, label, explanation]) => (
                  <div className="mb-4" key={key}>
                    <label className="form-label fw-semibold" htmlFor={key}>
                      {label}
                    </label>
                    <input
                      id={key}
                      type="range"
                      className="form-range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={form[key]}
                      onChange={(e) => update(key, Number(e.target.value))}
                    />
                    <input
                      aria-label={`${label} nilai`}
                      type="number"
                      className="form-control"
                      required
                      min={0}
                      max={1}
                      step={0.01}
                      value={form[key]}
                      onChange={(e) =>
                        update(
                          key,
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                    />
                    <p className="small text-secondary mt-2">{explanation}</p>
                  </div>
                ))
              : [
                  ['googleBooksEnabled', 'Aktifkan import Google Books'],
                  [
                    'enableGeminiExplanations',
                    'Aktifkan penjelasan Gemini (memerlukan konfigurasi server)',
                  ],
                ].map(([key, label]) => (
                  <label className="form-check mb-4" key={key}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={form[key]}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
            <div className="d-flex gap-2">
              <button className="btn btn-vd-primary" disabled={busy}>
                {busy ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={busy}
                onClick={() => {
                  setForm(saved);
                  setFeedback(null);
                }}
              >
                Batalkan Perubahan
              </button>
            </div>
          </fieldset>
          <p className="small text-secondary mt-3 mb-0">
            Terakhir disimpan:{' '}
            {audit
              ? new Date(audit).toLocaleString('id-ID')
              : 'Menggunakan nilai bawaan server'}
          </p>
        </form>
      </div>
      {recommendation && (
        <div className="col-lg-5">
          <section className="card vd-card p-4">
            <h2 className="h5">Preview urutan langsung</h2>
            <p className="small text-secondary">
              Katalog aktual tanpa preferensi mood; memakai algoritma yang sama
              dengan rekomendasi. Preview mengikuti nilai formulir; simpan untuk
              menerapkannya.
            </p>
            <AsyncStatus
              loading={preview.loading}
              error={preview.error}
              onRetry={() => {
                setPreview({ data: null, error: null, loading: true });
                setPreviewVersion((value) => value + 1);
              }}
            />
            {preview.data?.length ? (
              <ol>
                {preview.data.map((book) => (
                  <li key={book.id} className="mb-3">
                    {book.title}
                    <strong className="d-block">Skor {book.matchScore}</strong>
                  </li>
                ))}
              </ol>
            ) : (
              !preview.loading &&
              !preview.error && (
                <EmptyState
                  compact
                  title="Tidak ada kandidat melewati ambang"
                />
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
