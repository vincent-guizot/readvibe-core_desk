import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user }) {
  const token = localStorage.getItem('vibedesk_token');
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
