import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionGuard from './PermissionGuard';
import DashboardPage from '../features/dashboard/DashboardPage';
import BooksPage from '../features/books/BooksPage';
import AuthorsPage from '../features/authors/AuthorsPage';
import CategoriesPage from '../features/categories/CategoriesPage';
import MoodsPage from '../features/moods/MoodsPage';
import EditorialPicksPage from '../features/editorial/EditorialPicksPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import ModerationPage from '../features/moderation/ModerationPage';
import MembersPage from '../features/members/MembersPage';
import StaffPage from '../features/staff/StaffPage';
import RecommendationSettingsPage from '../features/recommendation-settings/RecommendationSettingsPage';
import SettingsPage from '../features/settings/SettingsPage';
import LoginPage from '../features/auth/LoginPage';

export default function AppRoutes({
  user,
  token,
  kpi,
  books,
  authors,
  categories,
  moods,
  editorialPicks,
  wishlistIntelligence,
  readingTrends,
  flaggedReviews,
  members,
  onOpenImport,
  onOpenAddBook,
  onDeleteBook,
  onRefresh,
  onModerate,
  onUpdateRole,
  onLoginSuccess,
  apiUrl,
}) {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage onLoginSuccess={onLoginSuccess} apiUrl={apiUrl} />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <DashboardPage
              kpi={kpi}
              books={books}
              onOpenImport={onOpenImport}
              onOpenAddBook={onOpenAddBook}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/books"
        element={
          <ProtectedRoute user={user}>
            <BooksPage
              books={books}
              onOpenImport={onOpenImport}
              onOpenAddBook={onOpenAddBook}
              onDeleteBook={onDeleteBook}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/authors"
        element={
          <ProtectedRoute user={user}>
            <AuthorsPage authors={authors} onRefresh={onRefresh} token={token} apiUrl={apiUrl} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute user={user}>
            <CategoriesPage categories={categories} onRefresh={onRefresh} token={token} apiUrl={apiUrl} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/moods"
        element={
          <ProtectedRoute user={user}>
            <MoodsPage moods={moods} onRefresh={onRefresh} token={token} apiUrl={apiUrl} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editorial-picks"
        element={
          <ProtectedRoute user={user}>
            <EditorialPicksPage picks={editorialPicks} books={books} onRefresh={onRefresh} token={token} apiUrl={apiUrl} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist-intel"
        element={
          <ProtectedRoute user={user}>
            <AnalyticsPage wishlistData={wishlistIntelligence?.topWishlistBooks} readingData={readingTrends} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reading-analytics"
        element={
          <ProtectedRoute user={user}>
            <AnalyticsPage wishlistData={wishlistIntelligence?.topWishlistBooks} readingData={readingTrends} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/moderation"
        element={
          <ProtectedRoute user={user}>
            <ModerationPage reviews={flaggedReviews} onModerate={onModerate} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members"
        element={
          <ProtectedRoute user={user}>
            <MembersPage members={members} onUpdateRole={onUpdateRole} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute user={user}>
            <PermissionGuard user={user} requiredRoles={['Admin']}>
              <StaffPage apiUrl={apiUrl} token={token} />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendation-settings"
        element={
          <ProtectedRoute user={user}>
            <RecommendationSettingsPage apiUrl={apiUrl} token={token} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute user={user}>
            <SettingsPage apiUrl={apiUrl} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
