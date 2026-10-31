/**
 * VibeDesk to VibeCore Live Integration Verification Script
 * Validates that all VibeDesk features and backoffice workflows communicate
 * seamlessly with the live VibeCore API on http://localhost:3360.
 */

const API_URL = process.env.VITE_API_URL || 'http://localhost:3360';

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

let passed = 0;
let failed = 0;

async function check(actionName, fn) {
  process.stdout.write(`  Checking ${actionName}... `);
  try {
    await fn();
    passed++;
    console.log(`${colors.green}✔ OK${colors.reset}`);
  } catch (err) {
    failed++;
    console.log(`${colors.red}✖ FAILED${colors.reset}`);
    console.log(`    ${colors.red}${err.message}${colors.reset}`);
  }
}

async function run() {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  VibeDesk (:3355) ⇄ VibeCore (:3360) Live Integration Suite${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  // 1. Auth Flow
  let adminToken = '';
  let librarianToken = '';

  await check('Admin Quick Login (admin@vibedesk.app)', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vibedesk.app', password: 'password123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.token) throw new Error(data.message || 'Login failed');
    adminToken = data.data.token;
  });

  await check('Librarian Login (librarian@vibedesk.app)', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'librarian@vibedesk.app', password: 'password123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.token) throw new Error(data.message || 'Login failed');
    librarianToken = data.data.token;
  });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  const librarianHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${librarianToken}`,
  };

  // 2. Dashboard KPI and Feed Loading
  await check('Dashboard KPI Overview Loading', async () => {
    const res = await fetch(`${API_URL}/api/analytics/overview`, { headers: librarianHeaders });
    const json = await res.json();
    if (!res.ok || typeof json.data?.totalBooks !== 'number') throw new Error('Failed to load KPIs');
  });

  await check('Wishlist Intelligence Data (Top Wishlisted)', async () => {
    const res = await fetch(`${API_URL}/api/analytics/top-wishlisted`, { headers: librarianHeaders });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error('Failed to load top wishlisted books');
  });

  await check('Reading Trends & Mood Distribution', async () => {
    const res = await fetch(`${API_URL}/api/analytics/mood-distribution`, { headers: librarianHeaders });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error('Failed to load mood distribution');
  });

  // 3. Books Management & Google Books
  let testBookId = null;

  await check('1-Click Google Books Search Integration', async () => {
    const res = await fetch(`${API_URL}/api/integrations/google-books/search?query=filosofi`, { headers: librarianHeaders });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error('Failed to search Google Books');
  });

  await check('Manual Add Book (POST /api/books)', async () => {
    const res = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: librarianHeaders,
      body: JSON.stringify({
        title: `VibeDesk Desk Test Book ${Date.now()}`,
        authorId: 1,
        genreId: 1,
        isbn: `978-VD-${Date.now().toString().slice(-6)}`,
        stock: 10,
        description: 'Buku uji coba dari antarmuka VibeDesk Backoffice.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        moodIds: [1, 2],
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error(json.message || 'Failed to create book');
    testBookId = json.data.id;
  });

  await check('Update Book Stock & Details (PUT /api/books/:id)', async () => {
    const res = await fetch(`${API_URL}/api/books/${testBookId}`, {
      method: 'PUT',
      headers: librarianHeaders,
      body: JSON.stringify({ stock: 25, price: 120000 }),
    });
    const json = await res.json();
    if (!res.ok || json.data?.stock !== 25) throw new Error('Failed to update book');
  });

  await check('Delete Book (DELETE /api/books/:id)', async () => {
    const res = await fetch(`${API_URL}/api/books/${testBookId}`, {
      method: 'DELETE',
      headers: librarianHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete book');
  });

  // 4. Categories & Genres CRUD
  let testCatId = null;

  await check('Create Category (POST /api/categories)', async () => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: librarianHeaders,
      body: JSON.stringify({ name: `Kategori Baru ${Date.now()}`, description: 'Uji VibeDesk' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error('Failed to create category');
    testCatId = json.data.id;
  });

  await check('Delete Category (DELETE /api/categories/:id)', async () => {
    const res = await fetch(`${API_URL}/api/categories/${testCatId}`, {
      method: 'DELETE',
      headers: librarianHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete category');
  });

  // 5. Moods & Emotions CRUD
  let testMoodId = null;

  await check('Create Mood Tag (POST /api/moods)', async () => {
    const res = await fetch(`${API_URL}/api/moods`, {
      method: 'POST',
      headers: librarianHeaders,
      body: JSON.stringify({ name: `✨ Vibe Desk Mood ${Date.now()}`, color: '#10B981', description: 'Energi positif' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error('Failed to create mood');
    testMoodId = json.data.id;
  });

  await check('Delete Mood Tag (DELETE /api/moods/:id)', async () => {
    const res = await fetch(`${API_URL}/api/moods/${testMoodId}`, {
      method: 'DELETE',
      headers: librarianHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete mood');
  });

  // 6. Authors CRUD
  let testAuthorId = null;

  await check('Create Author (POST /api/authors)', async () => {
    const res = await fetch(`${API_URL}/api/authors`, {
      method: 'POST',
      headers: librarianHeaders,
      body: JSON.stringify({ name: `Penulis Baru ${Date.now()}` }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error('Failed to create author');
    testAuthorId = json.data.id;
  });

  await check('Delete Author (DELETE /api/authors/:id)', async () => {
    const res = await fetch(`${API_URL}/api/authors/${testAuthorId}`, {
      method: 'DELETE',
      headers: librarianHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete author');
  });

  // 7. Editorial Picks CRUD
  let testPickId = null;

  await check('Create Editorial Pick (POST /api/editorial)', async () => {
    const res = await fetch(`${API_URL}/api/editorial`, {
      method: 'POST',
      headers: librarianHeaders,
      body: JSON.stringify({
        bookId: 1,
        note: 'Pilihan kurasi dari VibeDesk Backoffice.',
        curationWeight: 0.95,
        active: true,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error(json.message || 'Failed to create pick');
    testPickId = json.data.id;
  });

  await check('Delete Editorial Pick (DELETE /api/editorial/:id)', async () => {
    const res = await fetch(`${API_URL}/api/editorial/${testPickId}`, {
      method: 'DELETE',
      headers: librarianHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete editorial pick');
  });

  // 8. Content Moderation
  await check('Moderation Queue Retrieval (GET /api/moderation/reviews)', async () => {
    const res = await fetch(`${API_URL}/api/moderation/reviews?status=Flagged`, { headers: librarianHeaders });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error('Failed to retrieve moderation queue');
  });

  // 9. Staff & RBAC Management
  let testStaffId = null;

  await check('Admin Creates Staff Account (POST /api/staff)', async () => {
    const res = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        username: `staff_desk_${Date.now()}`,
        email: `staff_desk_${Date.now()}@vibedesk.app`,
        password: 'password123',
        role: 'Librarian',
        fullname: 'Staf Uji VibeDesk',
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.id) throw new Error('Failed to create staff');
    testStaffId = json.data.id;
  });

  await check('Admin Updates Staff Role (PATCH /api/staff/:id/role)', async () => {
    const res = await fetch(`${API_URL}/api/staff/${testStaffId}/role`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ role: 'Admin' }),
    });
    const json = await res.json();
    if (!res.ok || json.data?.role !== 'Admin') throw new Error('Failed to update staff role');
  });

  await check('Admin Deletes Staff Account (DELETE /api/staff/:id)', async () => {
    const res = await fetch(`${API_URL}/api/staff/${testStaffId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete staff account');
  });

  // 10. System Configuration Settings
  await check('Admin Updates Curation & AI Settings (PUT /api/settings)', async () => {
    const res = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        curationWeightBonus: 0.18,
        moodMatchBaseScore: 0.72,
      }),
    });
    if (!res.ok) throw new Error('Failed to update settings');
  });

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Passed  : ${colors.green}${colors.bold}${passed}${colors.reset}`);
  console.log(`  Failed  : ${failed > 0 ? colors.red : colors.green}${colors.bold}${failed}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}🎉 VIBEDESK INTEGRATION VERIFIED 100% WORKING!${colors.reset}\n`);
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('Fatal runner error:', e);
  process.exit(1);
});
