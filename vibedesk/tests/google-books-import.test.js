import assert from 'node:assert/strict';
import test from 'node:test';
import { findImportDuplicate, getImportMapping, toImportedBookPayload } from '../src/features/books/google-books-import.js';

test('Google Books ID duplicates take precedence over an ISBN match', () => {
  const byGoogleId = { id: 1, isbn: 'other' };
  const byIsbn = { id: 2, isbn: '978-123' };
  assert.equal(findImportDuplicate({ isbn: '978123' }, [{ data: [byGoogleId] }, { data: [byIsbn] }]), byGoogleId);
});

test('ISBN duplicate checks ignore hyphens and whitespace and skip unrelated results', () => {
  const match = { id: 2, isbn: '978-1 23' };
  assert.equal(findImportDuplicate({ isbn: '978 123' }, [{ data: [] }, { data: [{ id: 1 }, { isbn: '123' }, match] }]), match);
  assert.equal(findImportDuplicate({ isbn: '999' }, [{ data: [] }, { data: [match] }]), null);
});

test('books without an ISBN need only the Google Books duplicate response', () => {
  assert.equal(findImportDuplicate({}, [{ data: [] }]), null);
});

test('mapping matches local pen names, fallback names and categories case-insensitively', () => {
  const book = { authors: ['JANE DOE'], categories: ['FICTION'] };
  const categories = [{ id: 4, name: 'Fiction' }];
  assert.deepEqual(getImportMapping(book, [{ id: 2, pen_name: 'Jane Doe' }], categories), { authorId: 2, genreId: 4, stock: 1, moodIds: [] });
  assert.equal(getImportMapping(book, [{ id: 3, name: 'Jane Doe' }], categories).authorId, 3);
});

test('unmatched metadata leaves relations unselected and creates independent mapping state', () => {
  const first = getImportMapping();
  const second = getImportMapping({ authors: ['Unknown'], categories: ['Unknown'] }, [{ id: 1, name: 'Known' }], [{ id: 2, name: 'Known' }]);
  assert.deepEqual(second, { authorId: '', genreId: '', stock: 1, moodIds: [] });
  first.moodIds.push(9);
  assert.deepEqual(second.moodIds, []);
});

test('import payload preserves provider metadata and converts chosen IDs and zero stock', () => {
  const book = { title: 'Book', description: 'Description', publishedYear: 2024, pageCount: 120, image: 'https://example.test/cover.jpg', isbn: '978123', googleBooksId: 'volume', previewLink: 'https://books.google.com/books?id=volume', embeddable: true };
  const mapping = { authorId: '2', genreId: '3', stock: '0', moodIds: [4] };
  assert.deepEqual(toImportedBookPayload(book, mapping), {
    title: 'Book', description: 'Description', year: 2024, page: 120, image: book.image, isbn: '978123', googleBooksId: 'volume', previewLink: book.previewLink, embeddable: true,
    authorId: 2, genreId: 3, stock: 0, moodIds: [4],
  });
  assert.equal(mapping.stock, '0');
  assert.equal(book.publishedYear, 2024);
});

test('missing optional import metadata retains nulls and non-embeddable previews', () => {
  const payload = toImportedBookPayload({ title: 'Book', googleBooksId: 'volume', embeddable: false }, { authorId: '1', genreId: '2', stock: '1', moodIds: [] });
  for (const field of ['year', 'page', 'image', 'isbn', 'previewLink']) assert.equal(payload[field], null, field);
  assert.equal(payload.embeddable, false);
});
