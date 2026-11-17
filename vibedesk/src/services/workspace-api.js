import http from './http';

export const resourceEndpoints = {
  books: '/api/books?limit=100',
  authors: '/api/authors',
  categories: '/api/categories',
  moods: '/api/moods',
  editorialPicks: '/api/editorial',
  dashboardData: '/api/analytics/overview',
};

export async function getWorkspaceResource(resource) {
  const response = await http.get(resourceEndpoints[resource]);
  return response.data;
}
