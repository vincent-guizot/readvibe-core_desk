'use client';

import React from 'react';

export function Skeleton({ className = '', width, height, borderRadius, style = {} }) {
  return (
    <div
      className={`animate-shimmer ${className}`.trim()}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: borderRadius || 'var(--rv-radius-sm)',
        backgroundColor: '#f1ebd9',
        ...style,
      }}
    />
  );
}

export function Progress({ value = 0, max = 100, className = '', height = '8px', color = 'var(--rv-vibe-coral)' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`progress w-100 ${className}`.trim()}
      style={{ height, backgroundColor: 'rgba(53, 35, 63, 0.08)', borderRadius: '999px' }}
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

export default Skeleton;
