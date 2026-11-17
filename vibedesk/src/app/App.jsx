import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import AppRoutes from './routes/index';
import GoogleBooksImportModal from '../features/books/components/GoogleBooksImportModal';
import ManualAddBookModal from '../features/books/components/ManualAddBookModal';
import { booksApi, getApiErrorMessage } from '../services/catalog-api';

import { useDispatch, useSelector } from 'react-redux';
import { refreshWorkspace } from '../features/workspace/workspaceSlice';
import { API_URL } from '../constants/api';
import AsyncStatus from '../components/ui/AsyncStatus';

export default function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const dispatch = useDispatch();
  const resources = useSelector((state) => state.workspace);
  const { dashboardData, books, authors, categories, moods, editorialPicks, wishlistIntelligence, readingTrends, flaggedReviews, members } = Object.fromEntries(
    Object.entries(resources).map(([key, resource]) => [key, resource.data]),
  );
  const loading = Object.values(resources).some((resource) => resource.loading);
  const errors = Object.entries(resources).filter(([, resource]) => resource.error);

  // Toast / Alert
  const [toast, setToast] = useState('');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Initialize
  useEffect(() => {
    const savedToken = localStorage.getItem('vibedesk_token');
    const savedUser = localStorage.getItem('vibedesk_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      handleQuickLogin('admin@vibedesk.app');
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleQuickLogin = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('vibedesk_token', data.data.token);
        localStorage.setItem('vibedesk_user', JSON.stringify(data.data.user));
        setToken(data.data.token);
        setUser(data.data.user);
        showToast(`Login aktif sebagai: ${data.data.user.role} (${data.data.user.username})`);
      }
    } catch (e) {
      console.error('Quick login error:', e);
    }
  };

  const loadAllData = () => dispatch(refreshWorkspace());

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus buku "${title}" dari katalog?`)) return;
    try {
      await booksApi.remove(id);
      showToast(`Buku "${title}" berhasil dihapus.`);
      loadAllData();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Buku gagal dihapus.'));
    }
  };

  const handleModeration = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/moderation/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Ulasan berhasil diperbarui statusnya: ${status}`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/api/staff/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showToast('Hak akses berhasil diperbarui.');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout user={user} onQuickLogin={handleQuickLogin} toast={toast}>
      {token && <AsyncStatus loading={loading} error={errors.length ? errors.map(([key, resource]) => `${key}: ${resource.error}`).join(' · ') : null} onRetry={loadAllData} />}
      <AppRoutes
        user={user}
        token={token}
        kpi={dashboardData}
        books={books}
        authors={authors}
        categories={categories}
        moods={moods}
        editorialPicks={editorialPicks}
        wishlistIntelligence={wishlistIntelligence}
        readingTrends={readingTrends}
        flaggedReviews={flaggedReviews}
        members={members}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAddBook={() => {
          setEditingBook(null);
          setIsAddBookModalOpen(true);
        }}
        onEditBook={(book) => {
          setEditingBook(book);
          setIsAddBookModalOpen(true);
        }}
        onDeleteBook={handleDeleteBook}
        onRefresh={loadAllData}
        onModerate={handleModeration}
        onUpdateRole={handleUpdateRole}
        onLoginSuccess={(tok, usr) => {
          localStorage.setItem('vibedesk_token', tok);
          localStorage.setItem('vibedesk_user', JSON.stringify(usr));
          setToken(tok);
          setUser(usr);
        }}
        apiUrl={API_URL}
      />

      {/* Google Books 1-Click Import Modal */}
      <GoogleBooksImportModal
        key={`google-import-${isImportModalOpen}`}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        authors={authors}
        categories={categories}
        moods={moods}
        onImportSuccess={() => {
          showToast('Buku berhasil diimpor dari Google Books!');
          loadAllData();
          setIsImportModalOpen(false);
        }}
      />

      {/* Manual Add Book Modal */}
      <ManualAddBookModal
        key={`${editingBook?.id || 'new'}-${isAddBookModalOpen}`}
        isOpen={isAddBookModalOpen}
        onClose={() => {
          setIsAddBookModalOpen(false);
          setEditingBook(null);
        }}
        token={token}
        apiUrl={API_URL}
        authors={authors}
        categories={categories}
        moods={moods}
        book={editingBook}
        onAddSuccess={() => {
          showToast(editingBook ? 'Buku berhasil diperbarui.' : 'Buku manual berhasil ditambahkan.');
          loadAllData();
          setIsAddBookModalOpen(false);
          setEditingBook(null);
        }}
      />
    </DashboardLayout>
  );
}
