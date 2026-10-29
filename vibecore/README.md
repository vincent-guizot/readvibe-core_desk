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

## Database & Sequelize

- Database: `library_ms`
- Migrasi: `npx sequelize-cli db:migrate`
- Konfigurasi: `config/database.js` dan `.sequelizerc`
