export function findImportDuplicate(book, checks) {
  return checks[0].data?.[0] || checks[1]?.data?.find(
    (item) => item.isbn?.replace(/[-\s]/g, '') === book.isbn.replace(/[-\s]/g, ''),
  ) || null;
}

export function getImportMapping(book = {}, authors = [], categories = []) {
  const author = authors.find((item) => book.authors?.some(
    (name) => name.toLowerCase() === (item.pen_name || item.name || '').toLowerCase(),
  ));
  const category = categories.find((item) => book.categories?.some(
    (name) => name.toLowerCase() === item.name.toLowerCase(),
  ));
  return {
    authorId: author?.id || '',
    genreId: category?.id || '',
    stock: 1,
    moodIds: [],
  };
}

export function toImportedBookPayload(book, mapping) {
  return {
    title: book.title,
    description: book.description,
    year: book.publishedYear || null,
    page: book.pageCount || null,
    image: book.image || null,
    isbn: book.isbn || null,
    googleBooksId: book.googleBooksId,
    previewLink: book.previewLink || null,
    embeddable: book.embeddable,
    ...mapping,
    stock: Number(mapping.stock),
    authorId: Number(mapping.authorId),
    genreId: Number(mapping.genreId),
  };
}
