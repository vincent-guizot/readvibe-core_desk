# Model Data VibeCore

Referensi logis berdasarkan [model Sequelize](../../vibecore/models/) dan [migrasi](../../vibecore/migrations/), ditinjau 17 November 2026. DBML ini merangkum kolom dan relasi domain; bukan dump database live atau daftar lengkap constraint/index fisik. Endpoint dipisahkan ke [spesifikasi API](api-specification.md).

## Skema logis

```dbml
Table users {
  id integer [primary key]
  username varchar [not null, unique]
  email varchar [not null, unique]
  password varchar [not null]
  role varchar [default: 'Member'] // 'Member', 'Librarian', 'Admin'
  status varchar [default: 'Active'] // 'Active', 'Suspended'
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
  subtitle varchar(255)
  publisher varchar(255)
  edition varchar(100)
  language varchar(100)
  format varchar(50)
  widthCm decimal(8,2)
  heightCm decimal(8,2)
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
  moderationReason text
  moderatedBy integer
  moderationStatus varchar [default: 'Approved'] // 'Approved', 'Pending', 'Flagged', 'Rejected', 'Removed'
  createdAt timestamp
  updatedAt timestamp
}

Table application_settings {
  id varchar [primary key]
  value jsonb [not null]
  updatedBy integer
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

## Persistence dan migrasi

- books memakai authorId, genreId, userId; book_moods menghubungkan buku dengan mood_tags. Kategori API disimpan pada tabel genres.
- wishlists menyimpan priority, reason, visibility; reading_activities menyimpan status, rating, quote, privateNote, publicReview, dan audit moderasi. Public projection tidak boleh dianggap setara dengan seluruh kolom tabel.
- application_settings memakai key backoffice, value JSONB, updatedBy dan timestamp. updatedBy/moderatedBy adalah identitas aktor yang tersimpan; DBML tidak mengklaim constraint foreign key untuk kolom audit.
- 20261117110000-add-book-metadata menambah tujuh kolom metadata nullable. Publisher berupa teks, bukan tabel katalog penerbit.
- 20261117120000-add-backoffice-settings-and-moderation-audit membuat application_settings dan menambah moderationReason/moderatedBy dalam transaksi.
- Jalankan npm run db:migrate dan npm run db:migrate:status dari vibecore dengan environment database tujuan. Rollback menghapus kolom/tabel beserta nilainya; siapkan backup sebelum rollback data yang diperlukan.
- Pemeriksaan duplikat ISBN/Google ID dilakukan service buku; DBML ini tidak menyatakan keduanya memiliki unique constraint. Aturan duplikasi dan constraint per pasangan user/book harus diperiksa pada service serta migrasi terkait.
- File cover berada di storage backend, sedangkan books.image menyimpan URL. File yatim belum dibersihkan otomatis.

Privasi dan akses berada di [matriks keamanan](../security/matriks-hak-akses.md). Setup database mengikuti [README backend](../../vibecore/README.md), termasuk DB_NAME dan port yang ditetapkan environment.
