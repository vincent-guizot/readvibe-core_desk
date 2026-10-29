'use client';

import React from 'react';
import { AiOutlineSync } from 'react-icons/ai';

export default function MoodPromptForm({ promptText, onChangePrompt, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className="form-label fw-bold small text-muted text-uppercase mb-2">
          Ceritakan Suasana Hatimu (Opsional)
        </label>
        <textarea
          className="form-control rounded-3 p-3"
          rows="3"
          placeholder="Misal: 'Sedang lelah setelah kerja berat, butuh bacaan yang hangat dan tidak terlalu teknis...'"
          value={promptText}
          onChange={(e) => onChangePrompt(e.target.value)}
        />
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="btn btn-rv-plum px-5 py-3 rounded-pill fw-bold shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <AiOutlineSync className="spinner-border spinner-border-sm me-2" />
              Mencocokkan Frekuensi Buku...
            </>
          ) : (
            '🔍 Temukan Rekomendasi Bukuku'
          )}
        </button>
      </div>
    </form>
  );
}
