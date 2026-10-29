# Model Data & Spesifikasi API VibeCore

---

## 1. Skema Model Data Database (PostgreSQL)

```dbml
Table users {
  id integer [primary key]
  username varchar [not null, unique]
  email varchar [not null, unique]
  password varchar [not null]
  role varchar [default: 'Member'] // 'Member', 'Librarian', 'Admin'
  profileId integer
  createdAt timestamp
  updatedAt timestamp
}

Table profiles {
  id integer [primary key]
  fullname varchar
  image varchar
  age integer
  nationality varchar
  gender varchar
  createdAt timestamp
  updatedAt timestamp
}

Table authors {
  id integer [primary key]
  pen_name varchar [not null]
  profileId integer
  userId integer
  createdAt timestamp
  updatedAt timestamp
}

Table genres {
  id integer [primary key]
  name varchar [not null]
  userId integer
  createdAt timestamp
  updatedAt timestamp
}

Table books {
  id integer [primary key]
  title varchar [not null]
  description text
  year integer
  page integer
  stock integer [default: 1]
  price integer
  image varchar
  status varchar [default: 'Available']
  isbn varchar
  googleBooksId varchar
  previewLink text
  embeddable boolean [default: false]
  authorId integer
  genreId integer
  userId integer
  createdAt timestamp
  updatedAt timestamp
}

Table mood_tags {
  id integer [primary key]
  name varchar [not null, unique]
  icon varchar
  color varchar
  description text
  createdAt timestamp
  updatedAt timestamp
}

Table book_moods {
  id integer [primary key]
  bookId integer [not null]
  moodTagId integer [not null]
  createdAt timestamp
  updatedAt timestamp
}

Table editorial_picks {
  id integer [primary key]
  bookId integer [not null]
  tagline varchar
  curatorNotes text
  curationWeight integer [default: 50]
  isActive boolean [default: true]
  createdAt timestamp
  updatedAt timestamp
}

Table wishlists {
  id integer [primary key]
  userId integer [not null]
  bookId integer [not null]
  priority varchar [default: 'Medium'] // 'Low', 'Medium', 'High'
  reason text
  visibility varchar [default: 'Public'] // 'Public', 'Private'
  createdAt timestamp
  updatedAt timestamp
}

Table reading_activities {
  id integer [primary key]
  userId integer [not null]
  bookId integer [not null]
  status varchar [default: 'Want to Read'] // 'Want to Read', 'Reading', 'Finished'
  startDate timestamp
  finishDate timestamp
  rating integer // 1 - 5
  quote text
  privateNote text
  publicReview text
  moodTag varchar
  isSpoiler boolean [default: false]
  isFlagged boolean [default: false]
  flagReason varchar
  moderationStatus varchar [default: 'Approved'] // 'Approved', 'Pending', 'Rejected'
  createdAt timestamp
  updatedAt timestamp
}

Ref: users.profileId - profiles.id
Ref: authors.profileId - profiles.id
Ref: books.authorId > authors.id
Ref: books.genreId > genres.id
Ref: books.userId > users.id
Ref: book_moods.bookId > books.id
Ref: book_moods.moodTagId > mood_tags.id
Ref: editorial_picks.bookId > books.id
Ref: wishlists.userId > users.id
Ref: wishlists.bookId > books.id
Ref: reading_activities.userId > users.id
Ref: reading_activities.bookId > books.id
```

---

## 2. Ringkasan Endpoint REST API

Base URL: `http://localhost:3360/api`

### A. Autentikasi (`/api/auth`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Registrasi akun baru (Member) beserta entri profil. |
| `POST` | `/api/auth/login` | Publik | Login dengan email dan kata sandi, mengembalikan token JWT. |
| `GET` | `/api/auth/me` | Bearer Token | Mengambil data profil pengguna yang sedang login. |
| `PUT` | `/api/auth/profile` | Bearer Token | Memperbarui data profil (nama, avatar, usia, kebangsaan). |

### B. Katalog Buku (`/api/books`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | Publik | Pencarian dan filter buku (search, genre, mood, limit, page). |
| `GET` | `/api/books/:id` | Publik | Detail lengkap buku, author, genre, mood, dan ulasan publik. |
| `POST` | `/api/books` | Admin / Librarian | Menambahkan buku baru ke inventaris. |
| `PUT` | `/api/books/:id` | Admin / Librarian | Memperbarui metadata dan stok fisik buku. |
| `DELETE`| `/api/books/:id` | Admin / Librarian | Menghapus buku dari katalog. |

### C. Penulis & Kategori (`/api/authors`, `/api/genres`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/authors` | Publik | Mengambil daftar penulis beserta jumlah karya. |
| `POST` | `/api/authors` | Admin / Librarian | Mendaftarkan penulis baru. |
| `GET` | `/api/genres` | Publik | Mengambil daftar kategori/genre. |
| `POST` | `/api/genres` | Admin / Librarian | Menambahkan kategori baru. |

### D. Mood & Pilihan Editor (`/api/moods`, `/api/editorial-picks`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/moods` | Publik | Daftar mood tags emosional. |
| `POST` | `/api/moods` | Admin / Librarian | Membuat mood tag baru. |
| `POST` | `/api/moods/assign` | Admin / Librarian | Menautkan mood tag ke buku. |
| `GET` | `/api/editorial-picks` | Publik | Buku kurasi pilihan editor aktif beserta bobot kurasi. |
| `POST` | `/api/editorial-picks` | Admin / Librarian | Menetapkan buku pilihan editor dan bobot kurasi (50-100%). |

### E. Smart Wishlist (`/api/wishlists`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlists/my` | Bearer Token | Mengambil wishlist milik pengguna yang login. |
| `GET` | `/api/wishlists/user/:id` | Publik | Mengambil wishlist publik milik pengguna lain (privat disaring). |
| `POST` | `/api/wishlists` | Bearer Token | Menambahkan buku ke wishlist (cegah duplikasi per user per buku). |
| `PUT` | `/api/wishlists/:id` | Bearer Token | Mengubah prioritas (High/Med/Low) atau alasan membaca. |
| `DELETE`| `/api/wishlists/:id` | Bearer Token | Menghapus buku dari wishlist. |
| `POST` | `/api/wishlists/:id/move-to-reading` | Bearer Token | Memindahkan buku dari wishlist ke rak "Reading". |

### F. Aktivitas Membaca & Ulasan (`/api/reading-activities`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reading-activities/my` | Bearer Token | Mengambil rak membaca pengguna (`Reading`, `Finished`). |
| `GET` | `/api/reading-activities/user/:id/finished` | Publik | Mengambil buku selesai dibaca milik user publik (tanpa catatan privat). |
| `POST` | `/api/reading-activities/transition` | Bearer Token | Validasi dan transisi status (Want to Read &rarr; Reading &rarr; Finished). |
| `POST` | `/api/reading-activities/finish-and-review` | Bearer Token | Tandai selesai, simpan rating, quote 9:16, catatan privat, dan ulasan. |
| `POST` | `/api/reading-activities/:id/flag` | Bearer Token | Laporkan ulasan yang melanggar (spam / spoiler). |

### G. AI Vibe Matcher (`/api/ai/vibe-match`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/vibe-match` | Publik | Memproses mood tags & teks bebas via Google Gemini AI / heuristik. |

### H. Integrasi Google Books (`/api/integrations/google-books`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/integrations/google-books/search` | Admin / Librarian | Pencarian buku via Google Books API. |
| `POST` | `/api/integrations/google-books/import` | Admin / Librarian | 1-Click Import metadata ke inventaris database lokal. |

### I. Analitik & Moderasi (`/api/analytics`, `/api/moderation`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/user/stats` | Bearer Token | Statistik membaca pengguna login. |
| `GET` | `/api/analytics/dashboard` | Admin / Librarian | KPI ringkasan dashboard CMS. |
| `GET` | `/api/analytics/wishlist-intelligence`| Admin / Librarian | Analitik buku paling diminati vs stok fisik inventaris. |
| `GET` | `/api/analytics/reading-trends` | Admin / Librarian | Distribusi tren mood membaca komunitas. |
| `GET` | `/api/moderation/reviews` | Admin / Librarian | Antrean laporan spam/spoiler. |
| `PUT` | `/api/moderation/reviews/:id` | Admin / Librarian | Tindakan moderasi: Approve, Reject, atau Hapus Teks. |
