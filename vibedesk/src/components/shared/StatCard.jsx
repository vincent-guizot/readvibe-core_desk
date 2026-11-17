import React from 'react';

export default function StatCard({ icon, value, label, trend, tone = 'teal' }) {
  return (
    <article className={`card d-flex flex-row align-items-center gap-3 p-3 vd-stat-card vd-stat-card--${tone}`}>
      <span className="vd-stat-card__icon d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" aria-hidden="true">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {trend && <small>{trend}</small>}
      </div>
    </article>
  );
}
