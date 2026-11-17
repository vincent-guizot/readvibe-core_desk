export const catalogConfig = {
  authors: {
    title: 'Authors',
    singular: 'Author',
    endpoint: '/api/authors',
    description: 'Kelola nama pena dan profil penulis.',
    fields: [
      { key: 'pen_name', label: 'Nama pena', required: true },
      { key: 'bio', label: 'Biografi', multiline: true },
    ],
  },
  categories: {
    title: 'Categories & Genres',
    singular: 'Category',
    endpoint: '/api/categories',
    description: 'Kelompokkan koleksi dengan kategori yang konsisten.',
    fields: [
      { key: 'name', label: 'Nama kategori', required: true },
      { key: 'description', label: 'Deskripsi', multiline: true },
    ],
  },
  moods: {
    title: 'Mood Tags',
    singular: 'Mood',
    endpoint: '/api/moods',
    description: 'Kelola label suasana hati untuk penemuan buku.',
    fields: [
      { key: 'name', label: 'Nama mood', required: true },
      { key: 'color', label: 'Warna HEX', required: true },
      { key: 'description', label: 'Deskripsi', multiline: true },
    ],
  },
};
