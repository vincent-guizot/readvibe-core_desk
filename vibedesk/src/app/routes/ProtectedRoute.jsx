import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user }) {
  if (!['Admin', 'Librarian'].includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
