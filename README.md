# ReadVibe Ecosystem

ReadVibe menghubungkan aplikasi pembaca, CMS untuk staf, dan REST API dalam satu repositori. Setiap aplikasi memiliki dependency, environment, dan script sendiri.

| Aplikasi | Fungsi | Teknologi | Development |
| --- | --- | --- | --- |
| **ReadVibe** | Pencarian buku, rekomendasi mood, reading tracker, wishlist, dan profil | Next.js 16, React 19, Redux Toolkit, Bootstrap | [localhost:3350](http://localhost:3350) |
| **VibeDesk** | CMS dan backoffice untuk Admin serta Librarian | Vite, React 19, React Router 7, Redux Toolkit, Bootstrap | [localhost:3355](http://localhost:3355) |
| **VibeCore** | Autentikasi, katalog, aktivitas membaca, analytics, dan integrasi | Express, Sequelize, PostgreSQL | [localhost:3360](http://localhost:3360) |

## Struktur repositori

```text
readvibe/        Aplikasi pembaca
vibedesk/        CMS dan backoffice
vibecore/        REST API, model, migrasi, dan seeder
Assets/         Ilustrasi asli, logo, dan referensi desain
Documentations/ Dokumentasi arsitektur dan database
```

Jalankan npm dari folder aplikasi masing-masing; tidak ada npm workspace atau script npm di root. Kedua frontend mengakses VibeCore melalui REST API. Sebagian ilustrasi VibeDesk diimpor langsung dari `Assets/illustrations`, sehingga folder tersebut harus tersedia saat development dan build.

## Fitur VibeDesk

VibeDesk menyediakan **31 route halaman** dengan akses berdasarkan role:

- Buku: pencarian, filter, sorting, pagination, tambah, edit, detail, metadata, dan upload cover.
- Google Books: wizard pencarian, preview, pemetaan data, pemeriksaan duplikat, dan konfirmasi import melalui backend.
- Katalog: CRUD penulis, kategori, mood, serta editorial picks.
- Operasional: pengelolaan member dan staf, moderasi ulasan publik, serta dashboard.
- Analytics: wishlist intelligence dan statistik membaca dari agregat backend.
- Settings: konfigurasi sistem dan bobot rekomendasi yang tersimpan di PostgreSQL.

Form tambah dan edit menggunakan route tersendiri. Frontend menangani loading, error, retry, serta feedback mutasi. Halaman member, staf, recommendation settings, dan system settings dibatasi untuk Admin. Daftar route lengkap tersedia di [README VibeDesk](vibedesk/README.md).

## Persiapan lokal

Siapkan Git, Node.js/npm yang kompatibel dengan dependency proyek, dan PostgreSQL yang berjalan. Contoh berikut memakai PowerShell. Setiap terminal baru dimulai dari root repositori. Salin template environment hanya jika `.env` belum tersedia.

### 1. Backend dan database

```powershell
cd vibecore
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `vibecore/.env` sesuai koneksi PostgreSQL:

```dotenv
PORT=3360
NODE_ENV=development
CORS_ORIGIN=http://localhost:3350,http://localhost:3355
JWT_SECRET=ganti_dengan_secret_acak_yang_panjang
JWT_EXPIRES_IN=7d
DB_USER=postgres
DB_PASSWORD=isi_password_postgresql
DB_NAME=readvibe
DB_HOST=127.0.0.1
DB_PORT=5432
GEMINI_API_KEY=
GOOGLE_BOOKS_API_KEY=
```

`5432` adalah contoh port PostgreSQL standar. Template backend saat ini memakai `1000`; isi port yang benar untuk instalasi Anda. Tetapkan seluruh variabel database secara eksplisit agar aplikasi dan Sequelize CLI menggunakan konfigurasi yang sama. `JWT_SECRET` wajib diisi untuk autentikasi.

Jika database belum ada, buat terlebih dahulu:

```powershell
npm run db:create
```

Untuk database baru maupun database yang sudah ada, jalankan migrasi lalu server:

```powershell
npm run db:migrate
npm run db:migrate:status
npm run dev
```

Migrasi mencakup metadata buku, penyimpanan settings, dan audit moderasi. Server tersedia di [localhost:3360](http://localhost:3360), dengan endpoint aplikasi di bawah `/api`.

Untuk database development yang memerlukan data demo, jalankan `npm run db:seed:all` dari terminal backend terpisah. Seeder membuat akun Admin `admin@vibedesk.app` dengan password demo `password123` jika akun belum ada. Kredensial demo hanya untuk development; seeder tidak mengganti password akun yang sudah tersedia.

### 2. VibeDesk

Dari terminal baru di root repositori:

```powershell
cd vibedesk
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Pastikan `vibedesk/.env` berisi:

```dotenv
VITE_API_URL=http://localhost:3360
```

```powershell
npm run dev
```

Buka [VibeDesk](http://localhost:3355), lalu login menggunakan akun **Admin** atau **Librarian**. Akun Member tidak memiliki akses CMS.

### 3. ReadVibe

Dari terminal baru di root repositori:

```powershell
cd readvibe
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Pastikan `readvibe/.env` berisi:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3360
```

```powershell
npm run dev
```

Buka [ReadVibe](http://localhost:3350). Untuk testing VibeDesk saja, cukup jalankan PostgreSQL, VibeCore, dan VibeDesk.

## Integrasi dan penyimpanan

Google Books dan Gemini dipanggil dari backend. Isi API key pada environment VibeCore untuk fitur terkait. Kredensial database, JWT secret, dan API key tidak boleh masuk ke variabel frontend `VITE_*` atau `NEXT_PUBLIC_*`.

Cover buku disimpan di backend. Saat deployment, gunakan penyimpanan persisten melalui `BOOK_COVER_STORAGE_DIR` dan sertakan direktori tersebut dalam backup. Detail format, batas ukuran, dan konfigurasi ada di [README VibeCore](vibecore/README.md).

## Pemeriksaan dan build

Jalankan perintah dari direktori aplikasi terkait:

| Direktori | Pemeriksaan | Build |
| --- | --- | --- |
| `readvibe/` | `npm run lint` | `npm run build` |
| `vibedesk/` | `npm run lint` dan `npm test` | `npm run build` |
| `vibecore/` | Tes terisolasi di bawah | `npm run build` |

Tes backend terisolasi, dari root repositori:

```powershell
cd vibecore
node --test tests/backoffice.test.js tests/book-cover.test.js tests/book-update.test.js tests/book-metadata.test.js
```

Tes PostgreSQL opsional, prasyarat, dan hasil pemeriksaan implementasi terdokumentasi di [QA Report](vibedesk/QA_REPORT.md). Pemeriksaan tampilan memakai fixture terisolasi; hasil tersebut tidak berarti seluruh alur telah diuji terhadap backend live. Google Books live dan deployment perlu diverifikasi di environment tujuan.

Untuk produksi, ReadVibe dan VibeCore menyediakan `npm start` setelah build. VibeDesk menghasilkan folder `dist/`; sajikan dengan fallback ke `index.html` agar route langsung bekerja. Sesuaikan URL API, CORS, dan environment sebelum build atau menjalankan server.

## Dokumentasi

- [ReadVibe: aplikasi pembaca](readvibe/README.md)
- [VibeDesk: route, arsitektur frontend, dan kontrak API](vibedesk/README.md)
- [VibeCore: backend, database, upload, dan integrasi](vibecore/README.md)
- [Arsitektur dan database ekosistem](Documentations/README.md)
- [Pemetaan aset VibeDesk](vibedesk/ASSET_USAGE_REPORT.md)
- [Hasil QA dan batas verifikasi](vibedesk/QA_REPORT.md)
