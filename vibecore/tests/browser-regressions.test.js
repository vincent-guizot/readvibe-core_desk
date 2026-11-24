const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../../readvibe');
const frontendRequire = createRequire(path.join(frontend, 'package.json'));
const React = frontendRequire('react');
const { renderToStaticMarkup } = frontendRequire('react-dom/server');

const book = { id: 1, title: 'QA book', author: 'QA author', genre: 'QA fiction', pages: 200, moods: [], synopsis: 'Actual synopsis' };
function render(file, hooks, props = {}, { query = 'bookId=1', react = React, push = () => {} } = {}) {
  const { code } = babel.transformFileSync(path.join(frontend, 'src', file), {
    babelrc: false, configFile: false,
    presets: [[path.join(frontend, 'node_modules/next/babel'), { 'preset-env': { modules: 'commonjs' } }]],
  });
  const exports = {};
  vm.runInNewContext(code, { exports, URL, URLSearchParams, require(name) {
    if (name.startsWith('@babel/runtime/')) return frontendRequire(`next/dist/compiled/${name}`);
    if (name === '@/hooks') return hooks;
    if (name === 'react') return react;
    if (name === 'next/navigation') return { useParams: () => ({ id: '1', slug: '1' }), useRouter: () => ({ push }), useSearchParams: () => new URLSearchParams(query) };
    if (name === 'next/link') return ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children);
    if (name === '@/components/ui') return { Progress: () => null };
    if (name.startsWith('@/components/')) return () => null;
    if (name === '@/services/http') return {};
    return frontendRequire(name);
  } });
  return renderToStaticMarkup(React.createElement(exports.default, props));
}
const hooks = {
  useBooks: () => ({ books: [book], getBookById: () => book, status: 'succeeded' }),
  useReading: () => ({ currentReading: [], finishedReads: [], status: 'succeeded', getBookProgress: () => null, isBookFinished: () => false, getFinishedDetail: () => null }),
  useWishlist: () => ({ wishlist: [], isWishlisted: () => false, isInWishlist: () => false }),
  useAuth: () => ({ isAuthenticated: false }),
};

test('guest Reader shows sign-in and real synopsis, never fabricated chapters', () => {
  const html = render('app/(main)/reader/[id]/page.js', hooks);
  assert.match(html, /Sign in to save your reading progress/);
  assert.match(html, /Actual synopsis/);
  assert.match(html, /A digital preview is not available/);
  assert.doesNotMatch(html, /The Letter|Mira|Redux Reading/);
});

test('Reader distinguishes missing book from loading and rejects unsafe preview schemes', () => {
  const missing = { ...hooks, useBooks: () => ({ getBookById: () => null, status: 'succeeded' }) };
  assert.match(render('app/(main)/reader/[id]/page.js', missing), /Book not found/);
  const unsafe = { ...hooks, useBooks: () => ({ getBookById: () => ({ ...book, previewLink: 'javascript:alert(1)' }), status: 'succeeded' }) };
  assert.doesNotMatch(render('app/(main)/reader/[id]/page.js', unsafe), /href="javascript:/);
});

test('home reading summary uses authenticated current-month activities', () => {
  const file = 'app/(main)/page.js';
  assert.match(render(file, hooks), /Sign in to track your reading/);
  const signedIn = { ...hooks, useAuth: () => ({ isAuthenticated: true }) };
  assert.match(render(file, signedIn), /0 books finished this month/);
  const populated = { ...signedIn, useReading: () => ({ status: 'succeeded', finishedReads: [{ finishDate: new Date().toISOString() }, { finishDate: '2000-01-01' }] }) };
  assert.match(render(file, populated), /1 books finished this month/);
});

test('book without public reviews has no invented rating', () => {
  assert.match(render('app/(main)/books/[slug]/page.js', hooks), /Not rated yet/);
});

test('finish form preserves existing private progress notes', () => {
  const privateHooks = { ...hooks, useReading: () => ({ getBookProgress: () => ({ notes: 'PRIVATE_PROGRESS' }), status: 'succeeded' }) };
  assert.match(render('components/modals/FinishBookModal.jsx', privateHooks, { book, isOpen: true }), /PRIVATE_PROGRESS/);
});

test('wishlist header reflects persisted per-item visibility', () => {
  const wishes = { ...hooks, useAuth: () => ({ user: { username: 'qa-member' } }), useWishlist: () => ({ wishlist: [{ bookId: 1, isPublic: true }, { bookId: 1, isPublic: false }] }) };
  const html = render('app/(main)/wishlist/page.js', wishes);
  assert.match(html, /1 public · 1 private/);
  assert.doesNotMatch(html, /Private ▾|Set to public to enable sharing/);
});

test('review editor keeps public review and private notes in separate controls during save', () => {
  const record = { id: 1, bookId: 1, reviewTitle: 'Saved title', reviewContent: 'PUBLIC_REVIEW', privateNotes: 'PRIVATE_NOTES', moods: [] };
  const editing = { ...hooks, useReading: () => ({ getFinishedDetail: () => record, status: 'loading' }) };
  const html = render('app/(main)/finished-reads/edit-review/page.js', editing);
  assert.match(html, /id="review-content"[^>]*>PUBLIC_REVIEW<\/textarea>/);
  assert.match(html, /id="review-private-notes"[^>]*>PRIVATE_NOTES<\/textarea>/);
  assert.match(html, /value="Saved title"/);
});

test('new profile uses empty shelves instead of example books and invented counts', () => {
  const empty = { ...hooks, useAuth: () => ({ user: { name: 'QA reader', username: 'qa-reader' } }) };
  const html = render('app/(main)/profile/page.js', empty);
  assert.match(html, /No books on this shelf yet/);
  assert.doesNotMatch(html, /The Midnight Library|Jakarta|October 2026/);
  assert.equal((html.match(/<strong class="h2">0<\/strong>/g) || []).length, 3);
});

test('account settings has empty password controls and real explicit deletion confirmation', () => {
  const member = { ...hooks, useAuth: () => ({ user: { name: 'QA reader', username: 'qa-reader', role: 'Member' } }) };
  const html = render('app/(main)/settings/page.js', member);
  assert.match(html, /id="account-current-password"[^>]*value=""/);
  assert.doesNotMatch(html, /••••/);
  assert.match(html, /Delete account/);
});

test('Vibe Card selects numeric activity IDs from URL and uses the saved quote', () => {
  const cardHooks = { ...hooks, useAuth: () => ({ user: { name: 'QA reader' } }), useReading: () => ({ status: 'succeeded', currentReading: [], finishedReads: [{ id: 7, bookId: 1, status: 'Finished', rating: 4, favoriteQuote: 'SAVED_QUOTE', moods: [] }] }) };
  const html = render('app/(main)/vibe-card/page.js', cardHooks);
  assert.match(html, /QA book/);
  assert.match(html, /SAVED_QUOTE/);
  assert.doesNotMatch(html, /The Midnight Library|A gentle reminder that every life/);
  const empty = { ...cardHooks, useReading: () => ({ status: 'succeeded', currentReading: [], finishedReads: [] }) };
  assert.match(render('app/(main)/vibe-card/page.js', empty), /No reading activity selected/);
});

test('Reader carries the entered quote through an encoded Vibe Card URL', () => {
  const quote = 'A & B? #1 + “hope” 🌿';
  let destination;
  const signedIn = { ...hooks, useAuth: () => ({ isAuthenticated: true }), useReading: () => ({ ...hooks.useReading(), getBookProgress: () => ({ currentPage: 10 }) }) };
  const html = render('app/(main)/reader/[id]/page.js', signedIn, {}, {
    react: { ...React, useState(initial) { return React.useState(initial === '' ? quote : initial); }, createElement(type, props, ...children) {
      if (type === 'button' && children.some((child) => typeof child === 'string' && child.includes('Make Vibe Card'))) props.onClick();
      return React.createElement(type, props, ...children);
    } },
    push: (url) => { destination = url; },
  });
  assert.match(html, /Use in Story Card/);
  const url = new URL(destination, 'http://localhost:3350');
  assert.equal(url.pathname, '/vibe-card');
  assert.equal(url.searchParams.get('bookId'), '1');
  assert.equal(url.searchParams.get('quote'), quote);
});

test('Vibe Card opens a current read with the reader quote instead of a false completion', () => {
  const quote = 'A & B? #1 + “hope” 🌿';
  const cardHooks = { ...hooks, useAuth: () => ({ user: { id: 1, name: 'QA reader' } }), useReading: () => ({ status: 'succeeded', finishedReads: [], currentReading: [{ id: 7, bookId: 1, status: 'Reading', book, favoriteQuote: 'OLD_QUOTE', privateNotes: 'PRIVATE_NOTES' }] }) };
  const html = render('app/(main)/vibe-card/page.js', cardHooks, {}, { query: new URLSearchParams({ bookId: '1', quote }).toString() });
  assert.match(html, /QA book/);
  assert.match(html, /A &amp; B\? #1 \+ “hope” 🌿/);
  assert.doesNotMatch(html, /No finished read selected|No reading activity selected|OLD_QUOTE|PRIVATE_NOTES/);
  assert.match(html, /id="showDateSwitch"[^>]*disabled/);
});

test('Reader blocks card navigation until signed in with a reading activity', () => {
  for (const isAuthenticated of [false, true]) {
    let navigated = false;
    const html = render('app/(main)/reader/[id]/page.js', { ...hooks, useAuth: () => ({ isAuthenticated }) }, {}, {
      react: { ...React, createElement(type, props, ...children) {
        if (type === 'button' && children.some((child) => typeof child === 'string' && child.includes('Make Vibe Card'))) {
          assert.equal(props.disabled, true);
          props.onClick();
        }
        return React.createElement(type, props, ...children);
      } },
      push: () => { navigated = true; },
    });
    assert.match(html, /Sign in and start reading this book to create a Vibe Card/);
    assert.equal(navigated, false);
  }
});

test('card preview uses ongoing wording for current reading and keeps completed wording for finished books', () => {
  const ongoing = render('components/books/VibeCardPreview.jsx', hooks, { book, isFinished: false, showDate: false, caption: 'A current quote' });
  assert.match(ongoing, /A chapter unfolding/);
  assert.match(ongoing, /A current quote/);
  assert.doesNotMatch(ongoing, /A chapter closed|Finished Recently/);
  const completed = render('components/books/VibeCardPreview.jsx', hooks, { book, isFinished: true, finishedDate: 'Nov 24, 2026' });
  assert.match(completed, /A chapter closed/);
  assert.match(completed, /Finished Nov 24, 2026/);
});
