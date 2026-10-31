/**
 * VibeCore Comprehensive Automated Test Suite
 * Covers all 38 endpoints across 16 functional modules for ReadVibe and VibeDesk.
 * Validates HTTP Status Codes, RBAC Permissions, and the Standard Response Envelope Contract.
 *
 * Usage: node tests/runner.js or npm test
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3360';

// ANSI terminal colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Global test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

/**
 * Standard test assertion helper
 */
async function test(name, fn) {
  totalTests++;
  const startTime = Date.now();
  try {
    await fn();
    passedTests++;
    const duration = Date.now() - startTime;
    console.log(`  ${colors.green}✔${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
  } catch (err) {
    failedTests++;
    const duration = Date.now() - startTime;
    console.log(`  ${colors.red}✖${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
    console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
    failures.push({ name, error: err.message });
  }
}

/**
 * Section Header Banner
 */
function section(title) {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
}

/**
 * Helper to execute HTTP requests and parse JSON
 */
async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  let json = null;
  const rawText = await res.text();
  try {
    json = JSON.parse(rawText);
  } catch {
    json = { raw: rawText };
  }

  return {
    status: res.status,
    headers: res.headers,
    data: json,
  };
}

/**
 * Assert response contract envelope
 */
function assertContract(res, expectedStatus, isSuccess = true) {
  if (res.status !== expectedStatus) {
    throw new Error(`Expected HTTP status ${expectedStatus}, received ${res.status}. Body: ${JSON.stringify(res.data)}`);
  }

  const body = res.data;
  if (isSuccess) {
    if (body.success !== undefined && body.success !== true) {
      throw new Error(`Expected success=true, received ${body.success}`);
    }
  } else {
    if (body.success !== undefined && body.success !== false) {
      throw new Error(`Expected success=false, received ${body.success}`);
    }
  }
}

// Stored authentication tokens and test state
let adminToken = '';
let librarianToken = '';
let memberToken = '';
let currentMemberId = null;

let createdBookId = null;
let createdAuthorId = null;
let createdCategoryId = null;
let createdMoodId = null;
let createdPickId = null;
let createdStaffId = null;
let createdReadingId = null;
let createdWishlistId = null;
let testReviewId = null;
let registeredMemberId = null;

async function run() {
  console.log(`\n${colors.bold}${colors.magenta}🚀 Starting VibeCore Test Suite against ${BASE_URL}${colors.reset}`);
  const suiteStartTime = Date.now();

  // =========================================================================
  // 1. System Health & Base API
  // =========================================================================
  section('1. System Health & Base API');

  await test('GET /api - Base health check returns status online', async () => {
    const res = await api('/api');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.status !== 'online') throw new Error(`Expected online, got ${res.data.status}`);
    if (!res.data.originsAllowed || !res.data.originsAllowed.includes('http://localhost:3350')) {
      throw new Error('Allowed origins missing ReadVibe 3350');
    }
  });

  // =========================================================================
  // 2. Authentication & Authorization
  // =========================================================================
  section('2. Authentication & Authorization (RBAC)');

  await test('POST /api/auth/login - Admin login returns JWT & Admin role', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@vibedesk.app', password: 'password123' },
    });
    assertContract(res, 200);
    adminToken = res.data.data.token;
    if (!adminToken) throw new Error('Missing JWT token');
    if (res.data.data.user.role !== 'Admin') throw new Error(`Role mismatch: ${res.data.data.user.role}`);
  });

  await test('POST /api/auth/login - Librarian login returns JWT & Librarian role', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'librarian@vibedesk.app', password: 'password123' },
    });
    assertContract(res, 200);
    librarianToken = res.data.data.token;
    if (!librarianToken) throw new Error('Missing JWT token');
    if (res.data.data.user.role !== 'Librarian') throw new Error(`Role mismatch: ${res.data.data.user.role}`);
  });

  await test('POST /api/auth/login - Member login returns JWT & Member role', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'member@readvibe.app', password: 'password123' },
    });
    assertContract(res, 200);
    memberToken = res.data.data.token;
    currentMemberId = res.data.data.user.id;
    if (!memberToken) throw new Error('Missing JWT token');
    if (res.data.data.user.role !== 'Member') throw new Error(`Role mismatch: ${res.data.data.user.role}`);
  });

  await test('POST /api/auth/login - Invalid credentials returns 401 Unauthorized', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'wrong@vibedesk.app', password: 'wrongpassword' },
    });
    assertContract(res, 401, false);
  });

  await test('POST /api/auth/register - Register new member account returns 201 Created', async () => {
    const unique = Date.now();
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        username: `testuser_${unique}`,
        email: `test_${unique}@readvibe.app`,
        password: 'password123',
        fullname: 'Test Automated Member',
      },
    });
    assertContract(res, 201);
    registeredMemberId = res.data.data.user.id;
    if (!res.data.data.token) throw new Error('Registration did not return token');
  });

  await test('POST /api/auth/register - Duplicate email returns 409 Conflict', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        username: `diff_${Date.now()}`,
        email: 'member@readvibe.app',
        password: 'password123',
      },
    });
    assertContract(res, 409, false);
  });

  await test('GET /api/auth/me - Authenticated member retrieves current profile', async () => {
    const res = await api('/api/auth/me', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 200);
    if (res.data.data.user.email !== 'member@readvibe.app') {
      throw new Error(`Unexpected user email: ${res.data.data.user.email}`);
    }
  });

  await test('GET /api/auth/me - Missing token returns 401 Unauthorized', async () => {
    const res = await api('/api/auth/me');
    assertContract(res, 401, false);
  });

  await test('PUT /api/auth/profile - Member updates profile information', async () => {
    const res = await api('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        fullname: 'Reader Updated Profile',
        age: 26,
        nationality: 'Indonesia',
        gender: 'Not specified',
      },
    });
    assertContract(res, 200);
    const updatedName = res.data.data.profile?.fullname || res.data.data.fullname;
    if (updatedName !== 'Reader Updated Profile') {
      throw new Error(`Profile fullname not updated: ${updatedName}`);
    }
  });

  // =========================================================================
  // 3. Books Catalog
  // =========================================================================
  section('3. Books Catalog Module');

  await test('GET /api/books - List catalog books with pagination envelope', async () => {
    const res = await api('/api/books?page=1&limit=5');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Data is not an array');
    const pagination = res.data.meta?.pagination || res.data.meta;
    if (!pagination || (typeof pagination.total !== 'number' && typeof pagination.totalItems !== 'number')) {
      throw new Error('Meta pagination information missing');
    }
  });

  await test('GET /api/books?search=stoikisme - Filter books by query keyword', async () => {
    const res = await api('/api/books?search=stoikisme');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Data is not an array');
  });

  await test('GET /api/books/:id - Get existing book detail', async () => {
    const res = await api('/api/books/1');
    assertContract(res, 200);
    if (res.data.data.id !== 1) throw new Error('Returned book id does not match');
    if (!res.data.data.author) throw new Error('Author association missing in book detail');
  });

  await test('GET /api/books/:id - Non-existent book returns 404 Not Found', async () => {
    const res = await api('/api/books/999999');
    assertContract(res, 404, false);
  });

  await test('POST /api/books - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { title: 'Unauthorized Book' },
    });
    assertContract(res, 403, false);
  });

  await test('POST /api/books - Librarian creates new book returns 201 Created', async () => {
    const res = await api('/api/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        title: `Automated Test Book ${Date.now()}`,
        description: 'Test book created during automated test execution.',
        year: 2026,
        page: 320,
        stock: 5,
        price: 95000,
        authorId: 1,
        genreId: 1,
        moodIds: [1, 3],
        isbn: `978-${Date.now().toString().slice(-9)}`,
      },
    });
    assertContract(res, 201);
    createdBookId = res.data.data.id;
    if (!createdBookId) throw new Error('No book ID returned');
  });

  await test('PUT /api/books/:id - Librarian updates book details', async () => {
    const res = await api(`/api/books/${createdBookId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        title: 'Updated Test Book Title',
        stock: 12,
      },
    });
    assertContract(res, 200);
    if (res.data.data.title !== 'Updated Test Book Title') throw new Error('Book title not updated');
    if (res.data.data.stock !== 12) throw new Error('Book stock not updated');
  });

  await test('DELETE /api/books/:id - Librarian deletes book returns 200 OK', async () => {
    const res = await api(`/api/books/${createdBookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 4. Recommendation Engine & AI Vibe Matcher
  // =========================================================================
  section('4. Recommendation Engine & AI Vibe Matcher');

  await test('POST /api/recommendations/match - Vibe Matcher returns ranked recommendations', async () => {
    const res = await api('/api/recommendations/match', {
      method: 'POST',
      body: {
        moodTags: ['Calm & Mindful', 'Mind-Expanding'],
        queryText: 'Saya merasa lelah dan butuh ketenangan serta refleksi diri.',
      },
    });
    assertContract(res, 200);
    const matches = res.data.data?.matches || res.data.data;
    if (!Array.isArray(matches)) throw new Error('Recommendations is not an array');
    if (matches.length > 0) {
      const top = matches[0];
      if (typeof top.matchScore !== 'number') throw new Error('Missing matchScore in recommendation');
      if (!top.book || !top.book.title) throw new Error('Missing book details in recommendation');
    }
  });

  await test('POST /api/recommendations/match - Empty payload returns 400 Bad Request', async () => {
    const res = await api('/api/recommendations/match', {
      method: 'POST',
      body: { moodTags: [], queryText: '' },
    });
    assertContract(res, 400, false);
  });

  await test('GET /api/recommendations/editorial - Public editorial curated picks', async () => {
    const res = await api('/api/recommendations/editorial');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Editorial picks data is not an array');
  });

  // =========================================================================
  // 5. Reading Activities & Vibe Card
  // =========================================================================
  section('5. Reading Activities & Shareable Vibe Card');

  await test('POST /api/reading/start - Start reading book returns 201 Created', async () => {
    const res = await api('/api/reading/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { bookId: 1 },
    });
    assertContract(res, 201);
    createdReadingId = res.data.data.id;
    if (res.data.data.status !== 'Reading') throw new Error(`Status should be Reading, got ${res.data.data.status}`);
  });

  await test('GET /api/reading - Get member reading activities', async () => {
    const res = await api('/api/reading', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Activities is not an array');
  });

  await test('PUT /api/reading/:id - Update reading activity progress and private note', async () => {
    const res = await api(`/api/reading/${createdReadingId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        privateNote: 'Catatan pribadi: halaman 45 sangat berkesan.',
      },
    });
    assertContract(res, 200);
  });

  await test('POST /api/reading/finish - Finish reading book with rating & quote', async () => {
    const res = await api('/api/reading/finish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        bookId: 1,
        rating: 5,
        quote: 'Kamu tidak bisa mengendalikan dunia, tapi kamu bisa mengendalikan responsmu.',
        publicReview: 'Buku yang sangat membuka mata tentang bagaimana menghadapi kecemasan hidup modern.',
        moodTag: '🧘 Calm & Mindful',
        isSpoiler: false,
      },
    });
    assertContract(res, 200);
    if (res.data.data.status !== 'Finished') throw new Error('Status not Finished');
  });

  await test('GET /api/reading/:id/vibecard - Generate 9:16 Vibe Card shareable data', async () => {
    const res = await api(`/api/reading/${createdReadingId}/vibecard`);
    assertContract(res, 200);
    if (res.data.data.cardRatio !== '9:16') throw new Error('cardRatio must be 9:16');
    if (!res.data.data.quote) throw new Error('Vibe Card missing quote');
    if (!res.data.data.mood) throw new Error('Vibe Card missing mood');
  });

  await test('GET /api/reading/user/:userId/finished - Public finished reads without private note leaks', async () => {
    const res = await api(`/api/reading/user/${currentMemberId}/finished`);
    assertContract(res, 200);
    if (!Array.isArray(res.data.data.finished)) throw new Error('finished is not an array');
    const first = res.data.data.finished[0];
    if (first && first.privateNote) {
      throw new Error('SECURITY VIOLATION: privateNote leaked in public reads endpoint!');
    }
  });

  await test('DELETE /api/reading/:id - Remove reading activity returns 200 OK', async () => {
    const res = await api(`/api/reading/${createdReadingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 6. Wishlist Management
  // =========================================================================
  section('6. Wishlist Module');

  await test('POST /api/wishlist - Add book to member wishlist returns 201 Created', async () => {
    // Clean up if book 4 was already in wishlist from previous runs
    const existing = await api('/api/wishlist', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    if (Array.isArray(existing.data?.data)) {
      for (const item of existing.data.data) {
        if (item.bookId === 4) {
          await api(`/api/wishlist/${item.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${memberToken}` },
          });
        }
      }
    }

    const res = await api('/api/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        bookId: 4,
        priority: 'High',
        reason: 'Ingin membaca sejarah peradaban manusia.',
        visibility: 'Public',
      },
    });
    assertContract(res, 201);
    createdWishlistId = res.data.data.id;
    if (!createdWishlistId) throw new Error('Wishlist ID was not returned');
  });

  await test('POST /api/wishlist - Duplicate wishlist book returns 409 Conflict', async () => {
    const res = await api('/api/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        bookId: 4,
      },
    });
    assertContract(res, 409, false);
  });

  await test('GET /api/wishlist - Member retrieves personal wishlist', async () => {
    const res = await api('/api/wishlist', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Wishlist data is not an array');
  });

  await test('PUT /api/wishlist/:id - Update wishlist item priority & notes', async () => {
    const res = await api(`/api/wishlist/${createdWishlistId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        priority: 'Top Priority',
        reason: 'Harus selesai dibaca bulan ini.',
      },
    });
    assertContract(res, 200);
    if (res.data.data.priority !== 'Top Priority') throw new Error('Priority not updated');
  });

  await test('GET /api/wishlist/public/:userId - View user public wishlist', async () => {
    const res = await api(`/api/wishlist/public/${currentMemberId}`);
    assertContract(res, 200);
    if (!Array.isArray(res.data.data.items)) throw new Error('Public wishlist items is not an array');
  });

  await test('DELETE /api/wishlist/:id - Remove item from wishlist', async () => {
    const res = await api(`/api/wishlist/${createdWishlistId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 7. Reviews & Ratings
  // =========================================================================
  section('7. Reviews & Ratings Module');

  await test('POST /api/reviews - Submit review & rating for book', async () => {
    const res = await api('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        bookId: 3,
        rating: 5,
        quote: 'Kenangan tidak akan hilang, ia hanya bersemayam menunggu untuk disapa.',
        publicReview: 'Karya sastra yang sangat menyentuh hati dan sarat sejarah Indonesia.',
        moodTag: '🌧️ Melancholy',
        isSpoiler: false,
      },
    });
    assertContract(res, 201);
    testReviewId = res.data.data.id;
    if (!testReviewId) throw new Error('Review ID was not returned');
  });

  await test('GET /api/reviews/book/:bookId - List approved reviews for a book', async () => {
    const res = await api('/api/reviews/book/3');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Reviews is not an array');
  });

  await test('POST /api/reviews/:id/report - Flag review for moderation review', async () => {
    const res = await api(`/api/reviews/${testReviewId}/report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { reason: 'Potensi spoiler tanpa tanda peringatan' },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 8. Content Moderation
  // =========================================================================
  section('8. Content Moderation (Staff & Admin)');

  await test('GET /api/moderation/reviews - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/moderation/reviews', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/moderation/reviews - Librarian lists flagged reviews', async () => {
    const res = await api('/api/moderation/reviews', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Flagged reviews is not an array');
  });

  await test('PUT /api/moderation/reviews/:id - Librarian moderates flagged review', async () => {
    const res = await api(`/api/moderation/reviews/${testReviewId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        status: 'Approved',
        isSpoiler: true,
      },
    });
    assertContract(res, 200);
    if (res.data.data.moderationStatus !== 'Approved') throw new Error('Status not set to Approved');
  });

  // =========================================================================
  // 9. Editorial Picks Management
  // =========================================================================
  section('9. Editorial Picks Management');

  await test('GET /api/editorial - Public editorial picks list', async () => {
    const res = await api('/api/editorial');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Editorial list is not an array');
  });

  await test('POST /api/editorial - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/editorial', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { bookId: 1 },
    });
    assertContract(res, 403, false);
  });

  await test('POST /api/editorial - Librarian creates editorial pick returns 201 Created', async () => {
    const res = await api('/api/editorial', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        bookId: 1,
        tagline: 'Wajib Baca untuk Jiwa Modern',
        curatorNotes: 'Pilihan redaksi bulan ini untuk melatih ketenangan batin.',
        curationWeight: 85,
        isActive: true,
      },
    });
    assertContract(res, 201);
    createdPickId = res.data.data.id;
  });

  await test('PUT /api/editorial/:id - Librarian updates editorial pick', async () => {
    const res = await api(`/api/editorial/${createdPickId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        curationWeight: 95,
        tagline: 'Rekomendasi Utama Perpustakaan',
      },
    });
    assertContract(res, 200);
    if (res.data.data.curationWeight !== 95) throw new Error('Weight not updated');
  });

  await test('DELETE /api/editorial/:id - Librarian deletes editorial pick', async () => {
    const res = await api(`/api/editorial/${createdPickId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 10. Moods Taxonomy
  // =========================================================================
  section('10. Moods Taxonomy');

  await test('GET /api/moods - Public moods list', async () => {
    const res = await api('/api/moods');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Moods is not an array');
    if (res.data.data.length === 0) throw new Error('No moods returned');
  });

  await test('GET /api/moods/:id - Get mood details by ID', async () => {
    const res = await api('/api/moods/1');
    assertContract(res, 200);
    if (res.data.data.id !== 1) throw new Error('Mood ID does not match');
  });

  await test('POST /api/moods - Librarian creates new mood tag returns 201 Created', async () => {
    const res = await api('/api/moods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        name: `Automated Mood ${Date.now()}`,
        description: 'Vibe mood tag created during automated testing',
        color: '#8B5CF6',
        icon: 'Moon',
      },
    });
    assertContract(res, 201);
    createdMoodId = res.data.data.id;
  });

  await test('PUT /api/moods/:id - Librarian updates mood tag', async () => {
    const res = await api(`/api/moods/${createdMoodId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        color: '#6366F1',
      },
    });
    assertContract(res, 200);
    if (res.data.data.color !== '#6366F1') throw new Error('Mood color not updated');
  });

  await test('DELETE /api/moods/:id - Librarian deletes mood tag', async () => {
    const res = await api(`/api/moods/${createdMoodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 11. Categories Taxonomy
  // =========================================================================
  section('11. Categories Taxonomy');

  await test('GET /api/categories - Public categories list', async () => {
    const res = await api('/api/categories');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Categories is not an array');
  });

  await test('GET /api/categories/:id - Get category details by ID', async () => {
    const res = await api('/api/categories/1');
    assertContract(res, 200);
    if (res.data.data.id !== 1) throw new Error('Category ID does not match');
  });

  await test('POST /api/categories - Librarian creates category returns 201 Created', async () => {
    const res = await api('/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        name: `Automated Category ${Date.now()}`,
        description: 'Category for testing purposes',
      },
    });
    assertContract(res, 201);
    createdCategoryId = res.data.data.id;
  });

  await test('PUT /api/categories/:id - Librarian updates category', async () => {
    const res = await api(`/api/categories/${createdCategoryId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        description: 'Updated category description',
      },
    });
    assertContract(res, 200);
  });

  await test('DELETE /api/categories/:id - Librarian deletes category', async () => {
    const res = await api(`/api/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 12. Authors Taxonomy
  // =========================================================================
  section('12. Authors Taxonomy');

  await test('GET /api/authors - Public authors list returns virtual name & pen_name', async () => {
    const res = await api('/api/authors');
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Authors is not an array');
    const author = res.data.data[0];
    if (!author.pen_name && !author.name) throw new Error('Author name/pen_name missing');
  });

  await test('GET /api/authors/:id - Get author details by ID', async () => {
    const res = await api('/api/authors/1');
    assertContract(res, 200);
    if (res.data.data.id !== 1) throw new Error('Author ID does not match');
  });

  await test('POST /api/authors - Librarian creates author returns 201 Created', async () => {
    const res = await api('/api/authors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        name: `Test Author ${Date.now()}`,
      },
    });
    assertContract(res, 201);
    createdAuthorId = res.data.data.id;
  });

  await test('PUT /api/authors/:id - Librarian updates author name', async () => {
    const res = await api(`/api/authors/${createdAuthorId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        name: 'Updated Pen Name Author',
      },
    });
    assertContract(res, 200);
  });

  await test('DELETE /api/authors/:id - Librarian deletes author', async () => {
    const res = await api(`/api/authors/${createdAuthorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 13. Members Management
  // =========================================================================
  section('13. Members Management (Staff & Admin)');

  await test('GET /api/members - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/members', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/members - Librarian lists members with pagination meta', async () => {
    const res = await api('/api/members?page=1&limit=10', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Members is not an array');
    if (!res.data.meta) throw new Error('Missing pagination meta');
  });

  await test('GET /api/members/:id - Get member detail by ID', async () => {
    const res = await api(`/api/members/${registeredMemberId}`, {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
  });

  await test('PUT /api/members/:id/status - Update member status', async () => {
    const res = await api(`/api/members/${registeredMemberId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: { status: 'Suspended' },
    });
    assertContract(res, 200);
  });

  await test('DELETE /api/members/:id - Admin deletes member account', async () => {
    const res = await api(`/api/members/${registeredMemberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 14. Staff Management
  // =========================================================================
  section('14. Staff Management (Admin Only)');

  await test('GET /api/staff - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/staff', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/staff - Librarian blocked with 403 Forbidden', async () => {
    const res = await api('/api/staff', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/staff - Admin retrieves staff accounts list', async () => {
    const res = await api('/api/staff', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Staff is not an array');
  });

  await test('POST /api/staff - Admin creates new staff returns 201 Created', async () => {
    const unique = Date.now();
    const res = await api('/api/staff', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        username: `staff_${unique}`,
        email: `staff_${unique}@vibedesk.app`,
        password: 'password123',
        role: 'Librarian',
        fullname: 'New Test Librarian',
      },
    });
    assertContract(res, 201);
    createdStaffId = res.data.data.id;
  });

  await test('PUT /api/staff/:id/role - Admin updates staff role', async () => {
    const res = await api(`/api/staff/${createdStaffId}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: 'Admin' },
    });
    assertContract(res, 200);
    if (res.data.data.role !== 'Admin') throw new Error('Role not updated');
  });

  await test('DELETE /api/staff/:id - Admin deletes staff account', async () => {
    const res = await api(`/api/staff/${createdStaffId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertContract(res, 200);
  });

  // =========================================================================
  // 15. Analytics & KPIs
  // =========================================================================
  section('15. Analytics & KPIs (Staff & Admin)');

  await test('GET /api/analytics/overview - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/analytics/overview', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/analytics/overview - Librarian retrieves dashboard KPIs', async () => {
    const res = await api('/api/analytics/overview', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    const d = res.data.data;
    if (typeof d.totalBooks !== 'number' || typeof d.totalMembers !== 'number') {
      throw new Error('Analytics overview missing metric counters');
    }
  });

  await test('GET /api/analytics/top-wishlisted - Top wishlisted books ranking', async () => {
    const res = await api('/api/analytics/top-wishlisted?limit=5', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Top wishlisted is not an array');
  });

  await test('GET /api/analytics/mood-distribution - Catalog mood distribution breakdown', async () => {
    const res = await api('/api/analytics/mood-distribution', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Mood distribution is not an array');
  });

  // =========================================================================
  // 16. Settings & Integrations
  // =========================================================================
  section('16. Settings & Google Books Integration');

  await test('GET /api/settings - Member blocked with 403 Forbidden', async () => {
    const res = await api('/api/settings', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assertContract(res, 403, false);
  });

  await test('GET /api/settings - Admin retrieves system & AI configuration', async () => {
    const res = await api('/api/settings', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertContract(res, 200);
    if (res.data.data.curationWeightBonus === undefined) throw new Error('Missing curationWeightBonus');
  });

  await test('PUT /api/settings - Admin updates system configuration', async () => {
    const res = await api('/api/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        curationWeightBonus: 0.20,
        moodMatchBaseScore: 0.75,
      },
    });
    assertContract(res, 200);
  });

  await test('GET /api/integrations/google-books/search - Search volumes metadata', async () => {
    const res = await api('/api/integrations/google-books/search?query=stoic', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 200);
    if (!Array.isArray(res.data.data)) throw new Error('Google Books search result is not an array');
  });

  await test('GET /api/integrations/google-books/search - Missing query parameter returns 400 Bad Request', async () => {
    const res = await api('/api/integrations/google-books/search', {
      headers: { Authorization: `Bearer ${librarianToken}` },
    });
    assertContract(res, 400, false);
  });

  // =========================================================================
  // Final Summary Report
  // =========================================================================
  const totalDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  VibeCore Test Suite Execution Summary${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Endpoints Tested : ${colors.bold}${totalTests}${colors.reset}`);
  console.log(`  Passed                 : ${colors.green}${colors.bold}${passedTests}${colors.reset}`);
  console.log(`  Failed                 : ${failedTests > 0 ? colors.red : colors.green}${colors.bold}${failedTests}${colors.reset}`);
  console.log(`  Duration               : ${colors.dim}${totalDuration}s${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failedTests > 0) {
    console.log(`${colors.red}${colors.bold}Failed Test Cases:${colors.reset}`);
    failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.name} -> ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}🎉 ALL ${totalTests} TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal Test Runner Failure:', err);
  process.exit(1);
});
