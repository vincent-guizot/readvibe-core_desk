import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/layouts/DashboardLayout';
import AppRoutes from './routes/index';
import { deleteBook } from '../features/books/booksSlice';
import {
  refreshWorkspace,
  resetWorkspace,
} from '../features/workspace/workspaceSlice';
import {
  readSession,
  saveSession,
  clearSession,
} from '../features/auth/session';
import AsyncStatus from '../components/ui/AsyncStatus';
import http from '../services/http';

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [session, setSession] = useState(readSession);
  const [toast, setToast] = useState('');
  const resources = useSelector((state) => state.workspace);
  const data = Object.fromEntries(
    Object.entries(resources).map(([key, resource]) => [key, resource.data]),
  );
  const loading = Object.values(resources).some((resource) => resource.loading);
  const errors = Object.entries(resources).filter(
    ([, resource]) => resource.error,
  );
  useEffect(() => {
    const expired = () => {
      setSession({ token: null, user: null });
      dispatch(resetWorkspace());
    };
    window.addEventListener('vibedesk:session-expired', expired);
    return () =>
      window.removeEventListener('vibedesk:session-expired', expired);
  }, [dispatch]);
  useEffect(() => {
    if (!session.token) return;
    let active = true;
    http
      .get('/api/auth/me')
      .then(({ data: result }) => {
        if (!active) return;
        if (!['Admin', 'Librarian'].includes(result.user?.role)) {
          clearSession();
          setSession({ token: null, user: null });
          dispatch(resetWorkspace());
          return;
        }
        saveSession(
          session.token,
          result.user,
          !!localStorage.getItem('vibedesk_token'),
        );
        setSession((current) => ({ ...current, user: result.user }));
        dispatch(refreshWorkspace());
      })
      .catch((error) => {
        if (active) setToast(error.message);
      });
    return () => {
      active = false;
    };
  }, [session.token, dispatch]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const refresh = () => dispatch(refreshWorkspace());
  const logout = () => {
    clearSession();
    setSession({ token: null, user: null });
    dispatch(resetWorkspace());
    navigate('/login', { replace: true });
  };
  async function removeBook(id, title) {
    if (
      !window.confirm(
        `Hapus buku "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return false;
    const result = await dispatch(deleteBook(id));
    if (deleteBook.fulfilled.match(result)) {
      setToast('Buku berhasil dihapus.');
      refresh();
      return true;
    } else if (!result.meta.condition)
      setToast(result.payload || 'Buku gagal dihapus.');
    return false;
  }
  return (
    <DashboardLayout
      user={session.user}
      onLogout={logout}
      toast={toast}
      pendingCount={data.dashboardData?.pendingModeration || 0}
    >
      {session.token && (
        <AsyncStatus
          loading={loading}
          error={
            errors.length
              ? errors
                  .map(([key, resource]) => `${key}: ${resource.error}`)
                  .join(' · ')
              : null
          }
          onRetry={refresh}
        />
      )}
      <AppRoutes
        {...data}
        kpi={data.dashboardData}
        user={session.user}
        onOpenImport={() => navigate('/books/import')}
        onOpenAddBook={() => navigate('/books/new')}
        onEditBook={(book) => navigate(`/books/${book.id}/edit`)}
        onDeleteBook={removeBook}
        onRefresh={refresh}
        onLoginSuccess={(token, user, remember) => {
          saveSession(token, user, remember);
          setSession({ token, user });
        }}
      />
    </DashboardLayout>
  );
}
