import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionGuard from './PermissionGuard';
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const BooksPage = lazy(() => import('../../pages/BooksPage'));
const AuthorsPage = lazy(() => import('../../pages/AuthorsPage'));
const CategoriesPage = lazy(() => import('../../pages/CategoriesPage'));
const MoodsPage = lazy(() => import('../../pages/MoodsPage'));
const EditorialPicksPage = lazy(() => import('../../pages/EditorialPicksPage'));
const AnalyticsPage = lazy(() => import('../../pages/AnalyticsPage'));
const ModerationPage = lazy(() => import('../../pages/ModerationPage'));
const MembersPage = lazy(() => import('../../pages/MembersPage'));
const StaffPage = lazy(() => import('../../pages/StaffPage'));
const RecommendationSettingsPage = lazy(() => import('../../pages/RecommendationSettingsPage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));

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
  onEditBook,
  onDeleteBook,
  onRefresh,
  onModerate,
  onUpdateRole,
  onLoginSuccess,
  apiUrl,
}) {
  return (
    <Suspense fallback={<div role="status" className="py-4 text-muted">Memuat halaman...</div>}><Routes>
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
              authors={authors}
              categories={categories}
              moods={moods}
              onOpenImport={onOpenImport}
              onOpenAddBook={onOpenAddBook}
              onDeleteBook={onDeleteBook}
              onEditBook={onEditBook}
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
            <AnalyticsPage wishlistData={wishlistIntelligence?.topWishlistBooks} readingData={readingTrends} variant="wishlist" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reading-analytics"
        element={
          <ProtectedRoute user={user}>
            <AnalyticsPage wishlistData={wishlistIntelligence?.topWishlistBooks} readingData={readingTrends} variant="reading" />
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
    </Routes></Suspense>
  );
}
