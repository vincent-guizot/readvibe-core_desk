import http from './http';

export const resourceEndpoints = {
  books: '/api/books?limit=100',
  authors: '/api/authors',
  categories: '/api/categories',
  moods: '/api/moods',
  editorialPicks: '/api/editorial',
  dashboardData: '/api/analytics/overview',
  wishlistIntelligence: '/api/analytics/top-wishlisted',
  readingTrends: '/api/analytics/mood-distribution',
  flaggedReviews: '/api/moderation/reviews?status=Flagged',
  members: '/api/members',
};

export async function getWorkspaceResource(resource) {
  const response = await http.get(resourceEndpoints[resource]);
  if (resource === 'wishlistIntelligence') return { topWishlistBooks: response.data };
  if (resource === 'readingTrends') return { moodTrends: response.data };
  return response.data;
}
