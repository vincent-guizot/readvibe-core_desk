export class BookMetadataMapper {
  static toDomain(volume) {
    const info = volume.volumeInfo || {};
    const access = volume.accessInfo || {};

    const identifiers = info.industryIdentifiers || [];
    const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier;
    const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier;
    const primaryIsbn = isbn13 || isbn10 || (identifiers.length > 0 ? identifiers[0].identifier : null);

    const yearMatch = (info.publishedDate || '').match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

    return {
      googleBooksId: volume.id,
      title: info.title || 'Untitled Book',
      authors: info.authors || ['Unknown Author'],
      description: info.description || '',
      publishedYear: year,
      pageCount: info.pageCount || 0,
      categories: info.categories || [],
      image:
        info.imageLinks?.thumbnail?.replace('http:', 'https:') ||
        info.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
        '',
      isbn: primaryIsbn,
      embeddable: access.embeddable || false,
      previewLink: info.previewLink || '',
    };
  }
}
