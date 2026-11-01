'use client';

import React from 'react';

export function Progress({
  value = 0,
  max = 100,
  className = '',
  height = '8px',
  color = 'var(--rv-vibe-coral)',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`progress w-100 ${className}`.trim()}
      style={{
        height,
        backgroundColor: 'rgba(53, 35, 63, 0.08)',
        borderRadius: '999px',
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax={max}
    >
      <div
        className="progress-bar"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
          borderRadius: '999px',
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

export default Progress;
