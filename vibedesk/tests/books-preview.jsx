// Isolated browser QA: all API data below stays in memory. Never shipped in dist.
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { store } from '../src/app/store';
import AppRoutes from '../src/app/routes';
import DashboardLayout from '../src/components/layouts/DashboardLayout';
import { http } from '../src/services/http';
import '../src/styles/index.css';

const params = new URLSearchParams(location.search);
const empty = params.has('empty');
const now = new Date().toISOString();
const author = {
  id: 1,
  pen_name: 'Penulis Uji',
  bio: 'Biografi fixture untuk QA.',
  books: [{ id: 1, title: 'Buku Uji CRUD' }],
};
const category = {
  id: 1,
  name: 'Fiksi',
  description: 'Kategori fixture',
  books: [{ id: 1 }],
};
const mood = {
  id: 1,
  name: 'Reflektif',
  color: '#3C8C84',
  description: 'Mood fixture',
  books: [{ id: 1 }],
};
const book = {
  id: 1,
  title: 'Buku Uji CRUD',
  subtitle: 'Novel fixture',
  publisher: 'Penerbit Uji',
  edition: 'Pertama',
  language: 'Bahasa Indonesia',
  format: 'Paperback',
  widthCm: '13.50',
  heightCm: '20.00',
  authorId: 1,
  genreId: 1,
  author,
  genre: category,
  moods: [mood],
  description: 'Sinopsis fixture. Tidak disimpan ke database.',
  stock: 4,
  price: 89000,
  year: 2020,
  page: 200,
  reviews: [],
  createdAt: now,
  updatedAt: now,
};
const editorial = {
  id: 1,
  bookId: 1,
  book,
  tagline: 'Pilihan kurator QA',
  curatorNotes: 'Catatan kurator fixture',
  curationWeight: 70,
  isActive: true,
};
const member = {
  id: 1,
  username: 'member-qa',
  email: 'member@example.invalid',
  role: 'Member',
  status: 'Active',
  createdAt: now,
  profile: { fullname: 'Member QA' },
  activitySummary: { readingCount: 3, completedCount: 1, wishlistCount: 2 },
};
const staff = {
  id: 2,
  username: 'librarian-qa',
  email: 'staff@example.invalid',
  role: 'Librarian',
  status: 'Active',
  createdAt: now,
  profile: { fullname: 'Staf QA' },
};
const review = {
  id: 1,
  bookId: 1,
  userId: 1,
  book,
  user: { username: 'member-qa' },
  publicReview: 'Ulasan publik fixture untuk ditinjau.',
  flagReason: 'Laporan uji',
  moderationStatus: 'Flagged',
  createdAt: now,
  updatedAt: now,
};
const collections = Object.fromEntries(
  Object.entries({
    books: [book],
    authors: [author],
    categories: [category],
    moods: [mood],
    editorial: [editorial],
    members: [member],
    staff: [staff],
    moderation: [review],
  }).map(([key, rows]) => [key, empty ? [] : structuredClone(rows)]),
);
let settings = {
  curationWeightBonus: 0.15,
  moodMatchBaseScore: 0.7,
  minMatchScoreThreshold: 0.3,
  enableGeminiExplanations: false,
  googleBooksEnabled: true,
  updatedAt: now,
};
const overview = () => ({
  totalBooks: collections.books.length,
  totalMembers: collections.members.length,
  lowStockBooks: collections.books.filter((b) => b.stock <= 5).length,
  activeEditorialPicks: collections.editorial.filter((p) => p.isActive).length,
  pendingModeration: collections.moderation.length,
  recentBooks: collections.books,
});
const coverUrls = [];
window.addEventListener('pagehide', () =>
  coverUrls.forEach((url) => URL.revokeObjectURL(url)),
);
http.defaults.adapter = async (config) => {
  const url = new URL(config.url, 'http://fixture.invalid');
  const payload =
    typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const query = { ...Object.fromEntries(url.searchParams), ...config.params };
  let data;
  let meta = null;
  const fail = (status, message) => {
    throw new AxiosError(message, 'ERR_BAD_RESPONSE', config, null, {
      status,
      data: { message },
    });
  };
  if (params.get('error') === 'api' && config.method === 'get')
    fail(503, 'Fixture service unavailable');
  if (url.pathname === '/api/books/covers') {
    const cover = URL.createObjectURL(config.data.get('cover'));
    coverUrls.push(cover);
    data = { path: cover };
  } else if (url.pathname === '/api/analytics/overview') data = overview();
  else if (url.pathname === '/api/analytics/wishlist-intelligence')
    data = {
      rows: empty
        ? []
        : [{ ...book, demand: 7, stockDeficit: 3, category: 'Fiksi' }],
      totalDemand: empty ? 0 : 7,
      requestedBooks: empty ? 0 : 1,
      stockDeficit: empty ? 0 : 3,
    };
  else if (url.pathname === '/api/analytics/reading')
    data = {
      completed: empty ? 0 : 3,
      averageRating: empty ? null : 4.5,
      moods: empty ? [] : [{ name: 'Reflektif', value: 3 }],
      genres: empty ? [] : [{ name: 'Fiksi', value: 3 }],
      trends: empty ? [] : [{ name: '2026-11', value: 3 }],
      highestRated: empty
        ? []
        : [{ id: 1, title: book.title, rating: 4.5, ratingCount: 3 }],
    };
  else if (url.pathname === '/api/settings/health')
    data = {
      api: 'healthy',
      database: 'healthy',
      googleBooks: 'reachable',
      checkedAt: now,
      googleBooksKeyConfigured: false,
    };
  else if (url.pathname === '/api/settings/preview')
    data = empty
      ? []
      : [
          {
            id: 1,
            title: book.title,
            matchScore: Math.min(
              98,
              Math.round(
                (payload.settings.moodMatchBaseScore +
                  payload.settings.curationWeightBonus) *
                  100,
              ),
            ),
          },
        ];
  else if (url.pathname === '/api/settings') {
    if (config.method === 'put') settings = { ...settings, ...payload };
    data = settings;
  } else if (url.pathname === '/api/integrations/google-books/search')
    data = [
      {
        googleBooksId: 'qa-google-book',
        title: 'Buku Import QA',
        authors: ['Penulis Uji'],
        categories: ['Fiksi'],
        isbn: '9780000000001',
        pageCount: 210,
        publishedYear: 2024,
        description:
          'Metadata Google Books tiruan untuk QA, tanpa request provider.',
      },
    ];
  else {
    const [resource, segment, subsegment] = url.pathname
      .replace('/api/', '')
      .split('/');
    const id = resource === 'moderation' ? subsegment : segment;
    const rows = collections[resource];
    if (!rows) fail(404, 'Unknown fixture endpoint');
    if (config.method === 'get' && !id) {
      data = rows.filter(
        (item) =>
          (!query.googleBooksId ||
            item.googleBooksId === query.googleBooksId) &&
          (!query.search ||
            `${item.title || ''} ${item.pen_name || ''} ${item.username || ''} ${item.email || ''} ${item.isbn || ''}`
              .toLowerCase()
              .includes(query.search.toLowerCase())),
      );
      if (query.status)
        data = data.filter(
          (item) =>
            (resource === 'moderation'
              ? item.moderationStatus
              : item.status) === query.status,
        );
      meta = {
        pagination: { totalItems: data.length, totalPages: 1, currentPage: 1 },
      };
    } else if (config.method === 'post') {
      data = {
        ...payload,
        id: Math.max(0, ...rows.map((row) => row.id)) + 1,
        ...(resource === 'books' && {
          author,
          genre: category,
          moods: [mood],
          reviews: [],
        }),
      };
      rows.push(data);
    } else {
      const index = rows.findIndex((row) => String(row.id) === String(id));
      if (index < 0) fail(404, 'Data fixture tidak ditemukan.');
      if (['put', 'patch'].includes(config.method))
        rows[index] = { ...rows[index], ...payload };
      data = rows[index];
      if (config.method === 'delete') rows.splice(index, 1);
    }
  }
  return {
    data: { data: structuredClone(data), meta },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};
const user = {
  id: 99,
  role: params.get('role') || 'Admin',
  username: 'QA fixture',
  email: 'qa@example.invalid',
};
export function Preview() {
  const navigate = useNavigate();
  return (
    <>
      <div
        className="alert alert-warning rounded-0 mb-0 py-2 small"
        role="status"
      >
        Isolated VibeDesk QA fixture — data in-memory, bukan database.
      </div>
      <DashboardLayout
        user={user}
        onLogout={() => navigate('/login')}
        pendingCount={collections.moderation.length}
      >
        <AppRoutes
          user={user}
          kpi={overview()}
          books={collections.books}
          authors={collections.authors}
          categories={collections.categories}
          moods={collections.moods}
          onRefresh={() => {}}
          onOpenImport={() => navigate('/books/import')}
          onOpenAddBook={() => navigate('/books/new')}
          onEditBook={(item) => navigate(`/books/${item.id}/edit`)}
          onDeleteBook={async (id) => {
            if (!window.confirm('Hapus buku fixture?')) return false;
            await http.delete(`/api/books/${id}`);
            return true;
          }}
          onLoginSuccess={() => navigate('/')}
        />
      </DashboardLayout>
    </>
  );
}
const root =
  import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(
  <Provider store={store}>
    <MemoryRouter initialEntries={[params.get('route') || '/books/new']}>
      <Preview />
    </MemoryRouter>
  </Provider>,
);
