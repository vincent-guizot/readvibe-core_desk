'use client';

import React from 'react';

export default function MoodPicker({ moods = [], selectedMoods = [], onToggleMood }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {moods.map((m) => {
        const name = typeof m === 'string' ? m : m.name;
        const isSelected = selectedMoods.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onToggleMood(name)}
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
              isSelected
                ? 'btn-rv-coral text-white shadow-sm'
                : 'btn-outline-secondary'
            }`}
          >
            {name} {isSelected && '✓'}
          </button>
        );
      })}
    </div>
  );
}
