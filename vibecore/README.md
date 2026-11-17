# VibeCore (Backend REST API Service)

VibeCore adalah layanan backend REST API terpusat untuk ekosistem **ReadVibe** (Client Pembaca) dan **VibeDesk** (CMS & Backoffice). Layanan ini dibangun menggunakan Express.js, Sequelize ORM, PostgreSQL, dan integrasi Google Gemini AI.

## Spesifikasi & Port

- **Port Development**: `http://localhost:3360`
- **Origin yang Diizinkan (CORS)**:
  - `http://localhost:3350` (ReadVibe Web Client)
  - `http://localhost:3355` (VibeDesk CMS Control Center)

## Petunjuk Menjalankan Proyek Secara Mandiri

Proyek ini adalah proyek mandiri. Jalankan seluruh perintah langsung dari direktori `vibecore`:

```bash
cd vibecore
npm install
npm run dev
```

Server akan aktif di `http://localhost:3360`.

### Script yang Tersedia

- `npm run dev` : Menjalankan server development dengan nodemon dan Babel di port 3360 (`src/server.js`).
- `npm run build` : Melakukan kompilasi Babel dari `src/` ke direktori `build/`.
- `npm start` : Menjalankan server hasil kompilasi produksi (`node build/server.js`).
- `npm test` : Menjalankan comprehensive automated test suite (80 pengujian endpoint & RBAC) di `tests/runner.js`.

## Konfigurasi Environment

Salin file `.env.example` menjadi `.env` sebelum menjalankan server:

```bash
cp .env.example .env
```

Contoh konfigurasi environment:
```env
PORT=3360
NODE_ENV=development
CORS_ORIGIN=http://localhost:3350,http://localhost:3355
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=library_ms
DB_HOST=127.0.0.1
DB_PORT=5432
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
```

## Struktur Modular (`src/modules/`)

### Metadata Books

`POST /api/books` dan `PUT /api/books/:id` menerima field metadata opsional:
`subtitle` dan `publisher` (maksimal 255 karakter), `edition` dan `language`
(100 karakter), `format` (50 karakter), serta `widthCm` dan `heightCm`
(cm, > 0 hingga 999999.99, maksimal dua desimal). Field teks di-trim dan string
kosong dinormalisasi menjadi `null`. Dimensi kosong/null menghapus nilai;
field yang dihilangkan pada update tidak mengubah nilai lama.
Metadata ikut dikembalikan pada GET daftar/detail buku.

Alur tetap `routes → validator → controller → service → Sequelize model`.
`book.metadata.js` menangani validasi dan normalisasi field metadata.
Publisher masih berupa nama teks, tanpa endpoint katalog penerbit baru.

Jalankan `npm run db:migrate -- --env development` sebelum menjalankan aplikasi
yang memakai model baru. Migration `20261117110000-add-book-metadata.js`
menambah tujuh kolom nullable secara transaksional tanpa backfill wajib.
Rollback migration menghapus kolom beserta metadata yang tersimpan; jangan
menjalankan rollback pada data yang diperlukan tanpa backup.

Tes unit/kontrak terisolasi:

```bash
node --test tests/book-update.test.js tests/book-metadata.test.js
```

Tes round-trip PostgreSQL opsional (PowerShell, memakai database sesuai environment
dan me-rollback record uji):

```powershell
$env:NODE_ENV = 'development'
$env:RUN_BOOKS_DB_TESTS = '1'
node --test tests/book-metadata.db.test.js
Remove-Item Env:\RUN_BOOKS_DB_TESTS
```

Tanpa `RUN_BOOKS_DB_TESTS=1`, tes database tersebut dilewati.

### Upload cover Books

- `POST /api/books/covers`: Bearer token Admin/Librarian, multipart dengan
  tepat satu field file bernama `cover`. JPG/PNG/WEBP, maksimal 5 × 1024 × 1024 byte.
- `GET /api/books/covers/:filename`: akses publik untuk cover buku, dengan
  `Content-Type: image/webp` dan `X-Content-Type-Options: nosniff`.
- Respons upload memakai envelope API standar; `data.path` berisi path relatif
  untuk diselesaikan terhadap alamat API oleh frontend, misalnya
  `/api/books/covers/<uuid>.webp`.

Alur upload: route → authentication/authorization → Multer validator →
BookCoverController → BookCoverService → filesystem. Multer membatasi body
sebelum gambar diproses. Sharp memeriksa isi, menolak format/animasi yang tidak
didukung dan gambar di atas 20 megapiksel, lalu menormalisasi menjadi WebP
dengan sisi terpanjang maksimal 2400 px tanpa memperbesar gambar. Nama file
menggunakan UUID; nama/ekstensi dari klien tidak digunakan untuk penyimpanan.

File runtime disimpan di `storage/book-covers/` (diabaikan Git). Opsional:
`BOOK_COVER_STORAGE_DIR` untuk lokasi penyimpanan persisten. Pada deployment
container/multi-instance, konfigurasi volume bersama/persisten yang dapat dibaca
dan ditulis proses VibeCore. Ini penyimpanan lokal, bukan integrasi cloud storage.
Frontend memakai `VITE_API_URL` untuk membentuk URL cover yang disimpan di buku;
gunakan alamat API publik yang stabil pada build deployment.

Upload hanya menyimpan file; hubungkan URL hasilnya ke field `image` saat
POST/PUT buku. File tidak otomatis dihapus ketika cover diganti atau buku
dihapus, agar URL yang masih dipakai tidak terputus. Upload yang berhasil tetapi
tidak pernah dihubungkan ke buku dapat menjadi file yatim; pembersihannya perlu
memeriksa referensi terlebih dahulu.

Tes endpoint tanpa database:

```bash
node --test tests/book-cover.test.js
```

Tes mencakup akses anonim/member, upload staf, MIME/content spoofing, ukuran,
batas piksel, multiple file/field, path traversal, serving publik, dan kegagalan
storage. Server dan direktori sementara dibersihkan setelah tes.

Setiap modul mengadopsi pola arsitektur:
`Route → Middleware → Controller → Service → Model`

Modul-modul yang tersedia:
- `auth`: Registrasi, otentikasi login JWT, dan profil pengguna.
- `books`: CRUD katalog buku fisik/digital, metadata, dan pencegahan duplikasi ISBN.
- `recommendations`: Algoritma AI Vibe Matcher dengan integrasi Google Gemini AI.
- `reading`: Pelacakan rak buku (Reading, Finished), rating, kutipan, dan data Vibe Card 9:16.
- `wishlists`: Smart Wishlist dengan prioritas, visibilitas (Public/Private), dan catatan personal.
- `reviews`: Ulasan publik terpisah dari catatan pribadi, moderasi spoiler/spam.
- `moods`: CRUD mood tags dan taksonomi suasana hati pembaca.
- `editorial`: Kurasi pilihan editor dan pengelolaan bobot kurasi.
- `authors`: CRUD entitas penulis buku.
- `categories`: CRUD kategori/genre buku.
- `members`: Manajemen akun member pembaca dan status.
- `moderation`: Antrean moderasi ulasan publik.
- `analytics`: Wishlist intelligence, tren mood membaca, dan agregasi data.
- `staff`: Pengelolaan staf perpustakaan (Admin, Librarian).
- `settings`: Konfigurasi bobot rekomendasi dan integrasi API.
- `integrations/google-books`: Pencarian dan import metadata Google Books 1-click.

## Database & Sequelize CLI

VibeCore menggunakan Sequelize ORM dan Sequelize CLI untuk manajemen skema basis data PostgreSQL (`library_ms`).

### Perintah Database (NPM Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run db:create` | Membuat database `library_ms` baru di PostgreSQL |
| `npm run db:drop` | Menghapus database `library_ms` |
| `npm run db:migrate` | Menjalankan seluruh migrasi skema tabel yang tertunda |
| `npm run db:migrate:status` | Memeriksa status migrasi (`up` / `down`) |
| `npm run db:migrate:undo` | Membatalkan (*rollback*) migrasi terakhir |
| `npm run db:migrate:undo:all` | Membatalkan seluruh migrasi |
| `npm run db:seed` / `npm run db:seed:all` | Menjalankan seeder ekosistem (data awal demo) |
| `npm run db:seed:undo` / `npm run db:seed:undo:all` | Menghapus/membersihkan data seeder |
| `npm run db:setup` | Alur inisialisasi awal: `db:create` + `db:migrate` + `db:seed:all` |
| `npm run db:reset` | Reset total: `db:drop` + `db:create` + `db:migrate` + `db:seed:all` |
| `npm run migration:generate -- --name <nama>` | Membuat berkas migrasi baru |
| `npm run seed:generate -- --name <nama>` | Membuat berkas seeder baru |

### Berkas Konfigurasi & Direktori

- **Konfigurasi DB**: `config/database.js` & `.sequelizerc`
- **Direktori Migrasi**: `migrations/`
- **Direktori Seeder**: `seeders/` (`20261029191500-seed-readvibe-ecosystem.js`)

## VibeDesk CMS — 31 halaman

Frontend dan matriks akses dijelaskan dalam [README VibeDesk](../vibedesk/README.md).
Jalankan migrasi `20261117120000-add-backoffice-settings-and-moderation-audit.js`
setelah migrasi metadata buku. Migrasi tersebut menambah `application_settings`
(JSONB, actor dan timestamp) serta `moderationReason`/`moderatedBy` pada ulasan.
Tidak ada record member/buku lama yang dihapus.

Perubahan kontrak backoffice:

- Books list mendukung search penulis, filter mood ID/stok, sorting allowlist dan
  pagination maksimum 100. Respons detail buku membatasi kolom ulasan publik.
- Editorial update menerima `bookId`, bukan hanya informasi kurasi.
- `GET /api/analytics/overview` menyertakan stok ≤5, kurasi aktif, antrean moderasi
  dan perubahan katalog terbaru. Metrik diambil dari database.
- `GET /api/analytics/wishlist-intelligence` dan `GET /api/analytics/reading`
  menerima `period=30|90|365|all` dan `genreId`. Wishlist menerima sort demand/deficit.
  Seluruh respons agregat tidak menyertakan identitas/catatan member.
- Members adalah Admin-only dan dibatasi pada role Member. List memakai pagination
  server dan jumlah aktivitas; detail hanya memuat profil aman dan jumlah aktivitas.
  Catatan, kutipan, isi wishlist dan daftar bacaan pribadi tidak dimuat.
- `GET /api/moderation/reviews/:id` memberi konteks ulasan publik.
  PATCH keputusan menerima `status` dan `reason` wajib (maksimum 2000 karakter).
  `Removed` menghapus teks ulasan publik, mempertahankan catatan pribadi dan audit
  keputusan. `Approved`, `Rejected`, dan `Flagged` tetap tersedia.
- Staff mendukung GET detail serta PUT role/status. Password awal staf minimal
  12 karakter; profil dan akun dibuat dalam satu transaksi. Mutasi akses diserialkan
  dengan transaction advisory lock PostgreSQL untuk menjaga minimal satu Admin aktif.
  Admin tidak dapat menurunkan, suspend, atau menghapus akunnya sendiri.
- Settings GET/PUT tersimpan di database. Hanya field bobot dan toggle integrasi
  yang diizinkan. `GET /api/settings/health` melakukan probe database/Google Books
  tanpa mengirim secret. `POST /api/settings/preview` memakai ranker yang sama
  dengan rekomendasi aktual; perubahan bobot tidak lagi hanya mengubah tampilan.
- Gangguan Google Books menghasilkan error 502 yang aman, bukan hasil kosong palsu.
  Toggle server dapat menonaktifkan endpoint pencarian/import.
- Registrasi publik selalu menghasilkan Member. Status Suspended ditolak pada login
  dan autentikasi token. JWT secret harus tersedia melalui environment server.

Tes terisolasi (tidak memakai database):

```bash
node --test tests/backoffice.test.js tests/book-cover.test.js tests/book-update.test.js tests/book-metadata.test.js
```

Tes PostgreSQL development, memakai fixture transaksi dan rollback:

```powershell
$env:RUN_BOOKS_DB_TESTS='1'
node --test tests/backoffice.db.test.js tests/book-metadata.db.test.js
```

Tes tersebut memeriksa query agregat, filter, pagination, kolom baru dan persistence
tanpa mengubah record yang sudah ada. Laporan UI dan batas pengujian ada di
[QA Report](../vibedesk/QA_REPORT.md). `npm test` backend tetap merupakan runner
HTTP legacy yang membutuhkan server dan data seed; gunakan command terisolasi
di atas untuk regresi perubahan ini.
