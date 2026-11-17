import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionGuard from './PermissionGuard';

const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const BooksPage = lazy(() => import('../../pages/BooksPage'));
const BookCreatePage = lazy(() => import('../../pages/BookCreatePage'));
const BookEditPage = lazy(() => import('../../pages/BookEditPage'));
const BookDetailPage = lazy(() => import('../../pages/BookDetailPage'));
const GoogleBooksImportPage = lazy(
  () => import('../../pages/GoogleBooksImportPage'),
);
const AnalyticsPage = lazy(() => import('../../pages/AnalyticsPage'));
const RecommendationSettingsPage = lazy(
  () => import('../../pages/RecommendationSettingsPage'),
);
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const catalog = (name) =>
  lazy(() =>
    import('../../features/catalog/CatalogPages').then((module) => ({
      default: module[name],
    })),
  );
const CatalogList = catalog('CatalogList');
const CatalogEditor = catalog('CatalogEditor');
const AuthorDetail = catalog('AuthorDetail');
const EditorialList = lazy(() =>
  import('../../features/editorial/EditorialPages').then((m) => ({
    default: m.EditorialList,
  })),
);
const EditorialEditor = lazy(() =>
  import('../../features/editorial/EditorialPages').then((m) => ({
    default: m.EditorialEditor,
  })),
);
const community = (name) =>
  lazy(() =>
    import('../../features/community/CommunityPages').then((module) => ({
      default: module[name],
    })),
  );
const MembersList = community('MembersList');
const MemberDetail = community('MemberDetail');
const ModerationList = community('ModerationList');
const ModerationDetail = community('ModerationDetail');
const StaffList = lazy(() =>
  import('../../features/staff/StaffPages').then((m) => ({
    default: m.StaffList,
  })),
);
const StaffEditor = lazy(() =>
  import('../../features/staff/StaffPages').then((m) => ({
    default: m.StaffEditor,
  })),
);

export default function AppRoutes(props) {
  const { user, authors, categories, moods, onRefresh } = props;
  const guarded = (element, admin = false) => (
    <ProtectedRoute user={user}>
      {admin ? (
        <PermissionGuard user={user} requiredRoles={['Admin']}>
          {element}
        </PermissionGuard>
      ) : (
        element
      )}
    </ProtectedRoute>
  );
  return (
    <Suspense
      fallback={
        <div role="status" className="py-4 text-secondary">
          Memuat halaman...
        </div>
      }
    >
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={props.onLoginSuccess} />}
        />
        <Route path="/" element={guarded(<DashboardPage {...props} />)} />
        <Route path="/books" element={guarded(<BooksPage {...props} />)} />
        <Route
          path="/books/new"
          element={guarded(
            <BookCreatePage
              authors={authors}
              categories={categories}
              moods={moods}
            />,
          )}
        />
        <Route
          path="/books/import"
          element={guarded(
            <GoogleBooksImportPage
              authors={authors}
              categories={categories}
              moods={moods}
              onRefresh={onRefresh}
            />,
          )}
        />
        <Route
          path="/books/:id/edit"
          element={guarded(
            <BookEditPage
              authors={authors}
              categories={categories}
              moods={moods}
              onDeleteBook={props.onDeleteBook}
            />,
          )}
        />
        <Route
          path="/books/:id"
          element={guarded(<BookDetailPage canManage />)}
        />
        {['authors', 'categories', 'moods'].map((resource) => (
          <Route
            key={resource}
            path={`/${resource}`}
            element={guarded(<CatalogList resource={resource} />)}
          />
        ))}
        {['authors', 'categories', 'moods'].flatMap((resource) =>
          ['new', ':id/edit'].map((suffix) => (
            <Route
              key={`${resource}-${suffix}`}
              path={`/${resource}/${suffix}`}
              element={guarded(
                <CatalogEditor resource={resource} onRefresh={onRefresh} />,
              )}
            />
          )),
        )}
        <Route path="/authors/:id" element={guarded(<AuthorDetail />)} />
        <Route path="/editorial-picks" element={guarded(<EditorialList />)} />
        <Route
          path="/editorial-picks/new"
          element={guarded(<EditorialEditor onRefresh={onRefresh} />)}
        />
        <Route
          path="/editorial-picks/:id/edit"
          element={guarded(<EditorialEditor onRefresh={onRefresh} />)}
        />
        <Route
          path="/wishlist-intel"
          element={guarded(
            <AnalyticsPage categories={categories} variant="wishlist" />,
          )}
        />
        <Route
          path="/reading-analytics"
          element={guarded(
            <AnalyticsPage categories={categories} variant="reading" />,
          )}
        />
        <Route path="/moderation" element={guarded(<ModerationList />)} />
        <Route path="/moderation/:id" element={guarded(<ModerationDetail />)} />
        <Route path="/members" element={guarded(<MembersList />, true)} />
        <Route path="/members/:id" element={guarded(<MemberDetail />, true)} />
        <Route
          path="/staff"
          element={guarded(<StaffList user={user} />, true)}
        />
        <Route path="/staff/new" element={guarded(<StaffEditor />, true)} />
        <Route
          path="/staff/:id/edit"
          element={guarded(<StaffEditor />, true)}
        />
        <Route
          path="/recommendation-settings"
          element={guarded(<RecommendationSettingsPage />, true)}
        />
        <Route path="/settings" element={guarded(<SettingsPage />, true)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
