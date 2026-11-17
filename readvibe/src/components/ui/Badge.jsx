'use client';

import React from 'react';
import { MOOD_COLOR_MAP } from '../../constants';

export function Badge({
  children,
  variant = 'default', // 'default' | 'coral' | 'mood' | 'success' | 'warning' | 'danger'
  className = '',
  ...props
}) {
  const variantStyles = {
    default: { backgroundColor: 'var(--rv-soft-lilac)', color: 'var(--rv-ink-plum)' },
    coral: { backgroundColor: '#fee2e2', color: 'var(--rv-vibe-coral)' },
    success: { backgroundColor: '#dcfce7', color: '#166534' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    danger: { backgroundColor: '#fee2e2', color: '#b91c1c' },
    mood: { backgroundColor: 'var(--rv-soft-lilac)', color: 'var(--rv-ink-plum)' },
  }[variant] || {};

  return (
    <span
      className={`rv-badge ${className}`.trim()}
      style={variantStyles}
      {...props}
    >
      {children}
    </span>
  );
}

export function VibeBadge({ mood, className = '', ...props }) {
  const moodStyle = MOOD_COLOR_MAP[mood] || {
    bg: 'var(--rv-soft-lilac)',
    text: 'var(--rv-ink-plum)',
    border: 'var(--rv-border)',
  };

  return (
    <span
      className={`rv-badge ${className}`.trim()}
      style={{
        backgroundColor: moodStyle.bg,
        color: moodStyle.text,
        border: `1px solid ${moodStyle.border || 'transparent'}`,
      }}
      {...props}
    >
      ✦ {mood}
    </span>
  );
}

export default Badge;
