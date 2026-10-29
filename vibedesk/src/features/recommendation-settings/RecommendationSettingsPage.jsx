import React, { useState, useEffect } from 'react';

export default function RecommendationSettingsPage({ apiUrl, token }) {
  const [settings, setSettings] = useState({
    curationWeightBonus: 0.15,
    moodMatchBaseScore: 0.70,
    minMatchScoreThreshold: 0.30,
    enableGeminiExplanations: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch(console.error);
  }, [apiUrl, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--vd-desk-navy)' }}>
        Konfigurasi Algoritma Rekomendasi (Recommendation Settings)
      </h2>

      <div className="row g-4">
        <div className="col-md-7">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Bobot & Parameter AI Vibe Matcher</h5>
            {saved && <div className="alert alert-success py-2 small">Pengaturan berhasil disimpan!</div>}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Bonus Bobot Editorial Pick: {(settings.curationWeightBonus * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={settings.curationWeightBonus}
                  onChange={(e) => setSettings({ ...settings, curationWeightBonus: parseFloat(e.target.value) })}
                />
                <small className="text-muted d-block">
                  Penambahan skor kecocokan untuk buku yang dipilih secara kuratorial oleh staf pustaka.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Ambang Batas Minimum Kecocokan (Threshold): {(settings.minMatchScoreThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={settings.minMatchScoreThreshold}
                  onChange={(e) => setSettings({ ...settings, minMatchScoreThreshold: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="geminiSwitch"
                  checked={settings.enableGeminiExplanations}
                  onChange={(e) => setSettings({ ...settings, enableGeminiExplanations: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold" htmlFor="geminiSwitch">
                  Aktifkan Narasi Personalisasi Google Gemini AI
                </label>
              </div>

              <button type="submit" className="btn btn-vd-primary btn-sm px-4">
                Simpan Konfigurasi Rekomendasi
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-5">
          <div className="vd-card p-4">
            <h5 className="fw-bold mb-3">Dokumentasi Formula</h5>
            <p className="small text-muted mb-2">
              Formula Penilaian:
            </p>
            <div className="bg-light p-3 rounded small font-monospace mb-3">
              Score = (MoodScore * 0.50) + (CurationBonus) + (SemanticSimilarity * 0.35)
            </div>
            <p className="small text-muted mb-0">
              Hasil rekomendasi diprioritaskan berdasarkan skor akhir kecocokan suasana hati pembaca.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
