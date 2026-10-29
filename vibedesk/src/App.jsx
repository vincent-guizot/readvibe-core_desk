import React, { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import AppRoutes from './routes';
import GoogleBooksImportModal from './features/books/components/GoogleBooksImportModal';
import ManualAddBookModal from './features/books/components/ManualAddBookModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3360';

export default function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Global Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [moods, setMoods] = useState([]);
  const [editorialPicks, setEditorialPicks] = useState([]);
  const [wishlistIntelligence, setWishlistIntelligence] = useState(null);
  const [readingTrends, setReadingTrends] = useState(null);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [members, setMembers] = useState([]);

  // Toast / Alert
  const [toast, setToast] = useState('');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

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
        body: JSON.stringify({ email, password: 'admin123' }),
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

  const loadAllData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Books
      fetch(`${API_URL}/api/books?limit=100`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setBooks(res.data);
        })
        .catch(console.error);

      // 2. Authors
      fetch(`${API_URL}/api/authors`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setAuthors(res.data);
        })
        .catch(console.error);

      // 3. Categories
      fetch(`${API_URL}/api/categories`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setCategories(res.data);
        })
        .catch(console.error);

      // 4. Moods
      fetch(`${API_URL}/api/moods`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setMoods(res.data);
        })
        .catch(console.error);

      // 5. Editorial Picks
      fetch(`${API_URL}/api/editorial`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setEditorialPicks(res.data);
        })
        .catch(console.error);

      // 6. Analytics Overview
      fetch(`${API_URL}/api/analytics/overview`, { headers })
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setDashboardData(res.data);
        })
        .catch(console.error);

      // 7. Wishlist Top
      fetch(`${API_URL}/api/analytics/top-wishlisted`, { headers })
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setWishlistIntelligence({ topWishlistBooks: res.data });
        })
        .catch(console.error);

      // 8. Mood distribution
      fetch(`${API_URL}/api/analytics/mood-distribution`, { headers })
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setReadingTrends({ moodTrends: res.data });
        })
        .catch(console.error);

      // 9. Moderation
      fetch(`${API_URL}/api/moderation/reviews?status=Flagged`, { headers })
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setFlaggedReviews(res.data);
        })
        .catch(console.error);

      // 10. Members
      fetch(`${API_URL}/api/members`, { headers })
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setMembers(res.data);
        })
        .catch(console.error);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus buku "${title}" dari katalog?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(`Buku "${title}" berhasil dihapus.`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
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
        onOpenAddBook={() => setIsAddBookModalOpen(true)}
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
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        token={token}
        apiUrl={API_URL}
        onImportSuccess={() => {
          showToast('Buku berhasil diimpor dari Google Books!');
          loadAllData();
          setIsImportModalOpen(false);
        }}
      />

      {/* Manual Add Book Modal */}
      <ManualAddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        token={token}
        apiUrl={API_URL}
        authors={authors}
        categories={categories}
        moods={moods}
        onAddSuccess={() => {
          showToast('Buku manual berhasil ditambahkan.');
          loadAllData();
          setIsAddBookModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
