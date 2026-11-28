export function findImportDuplicate(book, checks) {
  return checks[0].data?.[0] || checks[1]?.data?.find(
    (item) => item.isbn?.replace(/[-\s]/g, '') === book.isbn.replace(/[-\s]/g, ''),
  ) || null;
}
