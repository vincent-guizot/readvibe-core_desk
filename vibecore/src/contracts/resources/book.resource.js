export const toBookResource = (book) => {
  if (!book) return null;
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    year: book.year,
    page: book.page,
    stock: book.stock,
    price: book.price,
    image: book.image,
    status: book.status,
    isbn: book.isbn,
    googleBooksId: book.googleBooksId,
    previewLink: book.previewLink,
    embeddable: book.embeddable,
    author: book.author ? { id: book.author.id, pen_name: book.author.pen_name } : null,
    genre: book.genre ? { id: book.genre.id, name: book.genre.name } : null,
    moods: book.moods ? book.moods.map((m) => ({ id: m.id, name: m.name, icon: m.icon, color: m.color })) : [],
    editorialPicks: book.editorialPicks || [],
    reviews: book.reviews || [],
    createdAt: book.createdAt,
  };
};
