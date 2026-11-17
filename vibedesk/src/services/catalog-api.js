import http from './http';

const createCrudClient = (resource) => ({
  list: (params) => http.get(resource, { params }),
  getById: (id) => http.get(`${resource}/${id}`),
  create: (payload) => http.post(resource, payload),
  update: (id, payload) => http.put(`${resource}/${id}`, payload),
  remove: (id) => http.delete(`${resource}/${id}`),
});

export const booksApi = createCrudClient('/api/books');
export const authorsApi = createCrudClient('/api/authors');
export const categoriesApi = createCrudClient('/api/categories');
export const moodsApi = createCrudClient('/api/moods');
export const editorialPicksApi = createCrudClient('/api/editorial');
export const googleBooksApi = {
  search: (query) => http.get('/api/integrations/google-books/search', { params: { query } }),
};

export const getApiErrorMessage = (error, fallback = 'Permintaan tidak dapat diproses.') =>
  error?.message || fallback;
