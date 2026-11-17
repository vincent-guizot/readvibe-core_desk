import { useLocation } from 'react-router-dom';

const labels = { books: 'Books Catalog', authors: 'Authors', categories: 'Categories & Genres', moods: 'Mood Tags', 'editorial-picks': 'Editorial Picks', 'wishlist-intel': 'Wishlist Intelligence', 'reading-analytics': 'Reading Analytics', moderation: 'Content Moderation', members: 'Members', staff: 'Staff & Permissions', 'recommendation-settings': 'Recommendation Settings', settings: 'System Settings' };

export function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return [{ label: 'Control Center', path: '/' }, ...segments.map((segment, index) => ({
    label: labels[segment] || segment,
    path: '/' + segments.slice(0, index + 1).join('/'),
  }))];
}
