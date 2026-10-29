import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--vd-soft-sand)' }}>
      {children}
    </div>
  );
}
