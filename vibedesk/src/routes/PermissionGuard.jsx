import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PermissionGuard({ children, user, requiredRoles = [] }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#667085' }}>
        <h3>Akses Dibatasi</h3>
        <p>Anda tidak memiliki izin untuk melihat modul ini ({requiredRoles.join(', ')} required).</p>
      </div>
    );
  }

  return children;
}
