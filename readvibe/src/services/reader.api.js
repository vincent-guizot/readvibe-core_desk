import http from './http';

export const forCurrentSession = (operation) => async (payload, api) => {
  const token = api.getState().auth.token;
  if (!token) throw new Error('Silakan login terlebih dahulu.');
  const result = await operation(payload, api);
  if (api.getState().auth.token !== token) throw new Error('Sesi berubah. Silakan login kembali.');
  return result;
};

export const mapBook = (book) => ({
  ...book, slug: String(book.id),
  author: book.author?.pen_name || book.author?.name || '',
  genre: book.genre?.name || '', pages: book.page || 0,
  coverUrl: book.image || '', synopsis: book.description || '',
  moods: (book.moods || []).map((mood) => mood.name),
  editorialNote: book.editorialPicks?.find((pick) => pick.isActive)?.tagline || '',
});
export const mapUser = (user) => ({ ...user, name: user.profile?.fullname || user.username, avatar: user.profile?.image || '', bio: user.profile?.bio || '', location: user.profile?.location || '' });
const dateLabel = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
export const mapReading = (activity) => ({
  ...activity, totalPages: activity.book?.page || 0, currentPage: activity.currentPage ?? 0,
  startedAt: dateLabel(activity.startDate), finishedAt: dateLabel(activity.finishDate),
  notes: activity.privateNote || '', privateNotes: activity.privateNote || '',
  favoriteQuote: activity.quote || '', reviewContent: activity.publicReview || '',
  containsSpoilers: !!activity.isSpoiler, moods: activity.moodTag ? [activity.moodTag] : [],
  book: activity.book ? mapBook(activity.book) : null,
});
const priorityLabels = { Low: 'Someday', Medium: 'Soon', High: 'Next up' };
export const mapWishlist = (item) => ({
  ...item, priority: priorityLabels[item.priority] || item.priority,
  isPublic: item.visibility === 'Public', addedAt: dateLabel(item.createdAt),
  book: item.book ? mapBook(item.book) : null,
});
export const wishlistPayload = (payload) => ({
  bookId: payload.bookId,
  ...(payload.priority !== undefined ? { priority: ({ Someday: 'Low', Soon: 'Medium', 'Next up': 'High' })[payload.priority] || payload.priority } : {}),
  ...(payload.reason !== undefined ? { reason: payload.reason } : {}),
  ...(payload.isPublic !== undefined ? { visibility: payload.isPublic ? 'Public' : 'Private' } : {}),
});
export async function fetchCatalog() {
  let page = 1;
  const books = [];
  let response;
  do {
    response = await http.get('/api/books', { params: { page, limit: 100 } });
    books.push(...response.data.map(mapBook));
    page += 1;
  } while (response.meta?.pagination?.hasNextPage);
  return books;
}
export const readingPayload = (data) => ({
  ...(data.reviewTitle !== undefined ? { reviewTitle: data.reviewTitle } : {}),
  ...(data.visibility !== undefined ? { reviewVisibility: data.visibility === 'private' ? 'Private' : 'Public' } : {}),
  ...(data.rating !== undefined ? { rating: Number(data.rating) } : {}),
  ...(data.favoriteQuote !== undefined ? { quote: data.favoriteQuote } : {}),
  ...(data.privateNotes !== undefined ? { privateNote: data.privateNotes } : {}),
  ...(data.reviewContent !== undefined ? { publicReview: data.reviewContent } : {}),
  ...(data.moods !== undefined ? { moodTag: data.moods[0] || '' } : {}),
  ...(data.containsSpoilers !== undefined ? { isSpoiler: data.containsSpoilers } : {}),
  ...(data.currentPage !== undefined ? { currentPage: Number(data.currentPage) } : {}),
  ...(data.dateFinished ? { finishDate: data.dateFinished } : {}),
});
