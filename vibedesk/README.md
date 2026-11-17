# VibeDesk — CMS & Backoffice

VibeDesk adalah aplikasi operasional ReadVibe untuk Admin dan Librarian. React 19,
React Router 7, Vite, Bootstrap 5.3, Axios, Redux Toolkit, Recharts, dan JavaScript
digunakan tanpa TypeScript atau TanStack Query. Backend VibeCore memakai Express,
Sequelize, dan PostgreSQL.

## Menjalankan

Dari `vibedesk/`:

```bash
npm ci
```

Salin `.env.example` ke `.env`, lalu tetapkan:

```env
VITE_API_URL=http://localhost:3360
```

```bash
npm run dev
```

VibeDesk tersedia di `http://localhost:3355`. Jalankan VibeCore dan PostgreSQL
terlebih dahulu. Backend harus mengizinkan origin frontend melalui CORS. Jalankan
migrasi backend sampai `20261117120000-add-backoffice-settings-and-moderation-audit.js`.
Lihat [README VibeCore](../vibecore/README.md).

Google Books key, Gemini key, JWT secret, dan kredensial database berada di server.
Variabel `VITE_*` masuk ke browser; isilah hanya konfigurasi publik. JWT_SECRET wajib
dikonfigurasi di VibeCore. Frontend tidak melakukan login otomatis dengan akun seed.

Untuk deployment, sajikan `dist/` dengan fallback halaman ke `index.html` agar deep
link React Router bekerja. Ubah `VITE_API_URL` sebelum build untuk mengganti API.

## 31 halaman

| No. | Route | Fungsi |
| --- | --- | --- |
| 1 | `/login` | Login staf, ingat sesi, tampil/sembunyi password, loading/error |
| 2 | `/` | KPI aktual, perubahan katalog terbaru, alert stok/moderasi, quick actions |
| 3 | `/books` | Search judul/penulis/ISBN, filter kategori/penulis/mood/stok, sorting, pagination server, CRUD |
| 4 | `/books/new` | Form tambah buku, relasi, metadata dan cover |
| 5 | `/books/:id/edit` | Form bersama, nilai tersimpan, update dan hapus dengan konfirmasi |
| 6 | `/books/:id` | Sampul, metadata, stok, sinopsis, ulasan publik, kurasi dan profil penulis terkait |
| 7 | `/books/import` | Wizard empat tahap: cari, preview, mapping lokal, review dan konfirmasi |
| 8 | `/authors` | Search/sort, biografi, jumlah buku, detail/edit/hapus |
| 9 | `/authors/new` | Tambah nama pena dan biografi |
| 10 | `/authors/:id/edit` | Edit profil penulis |
| 11 | `/authors/:id` | Profil, biografi, jumlah dan tautan buku terkait |
| 12 | `/categories` | Search/sort, deskripsi, jumlah buku, edit/hapus |
| 13 | `/categories/new` | Tambah kategori |
| 14 | `/categories/:id/edit` | Edit kategori; konflik relasi ditampilkan dari API |
| 15 | `/moods` | Search/sort, warna HEX, deskripsi, jumlah buku, edit/hapus |
| 16 | `/moods/new` | Tambah mood dengan preview warna |
| 17 | `/moods/:id/edit` | Edit mood dan tampilkan konflik relasi |
| 18 | `/editorial-picks` | Search, filter aktif, sorting bobot/judul, catatan kurator, edit/hapus |
| 19 | `/editorial-picks/new` | Pilih buku, tagline, catatan, bobot 50–100%, status aktif |
| 20 | `/editorial-picks/:id/edit` | Update buku dan informasi kurasi |
| 21 | `/wishlist-intel` | Agregat permintaan, stok/defisit, prioritas pengadaan, periode/kategori/sort |
| 22 | `/reading-analytics` | Penyelesaian, rating, mood/genre, tren bulanan, buku rating tertinggi |
| 23 | `/moderation` | Daftar ulasan publik, laporan, alasan, tanggal, filter status |
| 24 | `/moderation/:id` | Review konteks, alasan keputusan, approve/reject/remove dan konfirmasi |
| 25 | `/members` | Search, filter status, pagination server, avatar dan jumlah aktivitas |
| 26 | `/members/:id` | Informasi akun, jumlah aktivitas/selesai/wishlist, suspend/aktifkan |
| 27 | `/staff` | Daftar/search staf, permission matrix, tambah/edit/hapus |
| 28 | `/staff/new` | Nama, username, email, password awal, role dan status |
| 29 | `/staff/:id/edit` | Update role/status dengan konfirmasi |
| 30 | `/recommendation-settings` | Slider/nilai bobot, preview urutan aktual, save/cancel, waktu simpan |
| 31 | `/settings` | Health API/database/Google Books, retry dan konfigurasi integrasi aman |

Form metadata dan Editorial memakai route tersendiri. Tidak ada modal CRUD atau
modal import. Penghapusan/keputusan memakai konfirmasi browser. Belum ada alur
draft/publish buku; status ketersediaan diturunkan dari stok.

## Akses dan sesi

| Modul | Admin | Librarian | Member |
| --- | --- | --- | --- |
| Dashboard, katalog, metadata, editorial, analytics, moderasi | Ya | Ya | Tidak |
| Members, Staff, Recommendation Settings, System Settings | Ya | Tidak | Tidak |

Backend membaca role dan status akun dari database untuk setiap request yang
memerlukan autentikasi. Route guard frontend hanya membantu navigasi.
Registrasi publik selalu membuat Member. Akun suspend ditolak saat login dan saat
menggunakan token yang sudah diterbitkan. Admin tidak dapat menghapus,
menonaktifkan, atau menurunkan perannya sendiri; minimal satu Admin aktif dijaga.

Tanpa “Ingat sesi”, token/user berada di `sessionStorage`; dengan pilihan tersebut
digunakan `localStorage`. Logout dan respons 401 membersihkan sesi serta workspace.
Sesi tersimpan dibaca dengan aman dan dikonfirmasi melalui `GET /api/auth/me`.
Token tidak ditampilkan dalam UI. Detail member hanya memuat informasi akun dan
jumlah agregat; catatan, kutipan, daftar wishlist serta bacaan pribadi tidak dikirim.

## Struktur source

```text
src/
├── app/
│   ├── App.jsx
│   ├── provider/           # Redux Provider + BrowserRouter
│   ├── routes/             # Lazy routes + auth/permission guards
│   └── store/              # Redux Toolkit
├── components/
│   ├── layouts/            # Sidebar, topbar, drawer, profile/logout
│   ├── shared/             # PageHeader, StatCard, EmptyState, Pagination
│   └── ui/                 # Button, AsyncStatus, BarChart
├── features/
│   ├── auth/               # Session storage helpers
│   ├── books/              # Redux, form, cover upload, detail/save hooks
│   ├── catalog/            # Shared metadata list/editor + author detail
│   ├── editorial/          # Routed list/editor
│   ├── community/          # Members + moderation views
│   ├── staff/              # Staff list/editor
│   ├── settings/           # Persisted settings forms and preview
│   └── workspace/          # Shared resources + loading/error state
├── constants/              # API configuration and asset registry
├── helpers/
├── hooks/                  # API query, debounce, search/filter/sort/page/breadcrumbs
├── pages/                  # Dashboard, Books, import, analytics, settings, login
├── services/               # Centralized Axios, errors, CRUD/workspace clients
├── styles/                 # Tokens, Bootstrap supplements, animation, Books, assets
└── main.jsx
```

Redux tetap digunakan untuk resource bersama serta detail/save/remove Books.
Setiap resource memiliki `data`, `loading`, `error`, dan request ID. Daftar terfilter
dan detail lokal menggunakan `useApiQuery`: respons lama dibatalkan/diabaikan dan
data lama tidak ditampilkan sebagai hasil query baru. Form menyimpan field dan
status mutasi secara lokal; tombol mutasi dinonaktifkan selama request.

Search menggunakan debounce 300ms. Pagination Books dan Members bekerja pada
server, bukan pada cache workspace yang dibatasi 100 buku. Authors/Categories/Moods
memakai search/sort lokal atas endpoint metadata lengkap. Refresh setelah mutasi
dilakukan eksplisit. Axios mempunyai timeout 15 detik dan normalisasi API error.

## API utama

| Resource | Endpoint |
| --- | --- |
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Books CRUD | `GET/POST /api/books`, `GET/PUT/DELETE /api/books/:id` |
| Cover | `POST /api/books/covers`, `GET /api/books/covers/:filename` |
| Authors CRUD | `GET/POST /api/authors`, `GET/PUT/DELETE /api/authors/:id` |
| Categories CRUD | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id` |
| Moods CRUD | `GET/POST /api/moods`, `GET/PUT/DELETE /api/moods/:id` |
| Editorial | `GET/POST /api/editorial`, `PUT/DELETE /api/editorial/:id` |
| Import search | `GET /api/integrations/google-books/search?query=...` |
| Dashboard | `GET /api/analytics/overview` |
| Wishlist | `GET /api/analytics/wishlist-intelligence` |
| Reading | `GET /api/analytics/reading` |
| Moderation | `GET /api/moderation/reviews`, `GET/PATCH /api/moderation/reviews/:id` |
| Members | `GET /api/members`, `GET /api/members/:id`, `PATCH /api/members/:id/status` |
| Staff | `GET/POST /api/staff`, `GET/PUT/DELETE /api/staff/:id` |
| Settings | `GET/PUT /api/settings`, `GET /api/settings/health`, `POST /api/settings/preview` |

Books query: `search`, `genreId`, `authorId`, `moodId`, `stock=available|low|empty`,
`sort=newest|title|stock`, `page`, `limit`. Pagination dibatasi maksimum 100 item.
Analytics query: `period=30|90|365|all`, `genreId`; wishlist juga menerima
`sort=demand|deficit`. Semua analytics berupa agregat tanpa identitas member.
Defisit wishlist adalah indikator permintaan dikurangi stok, bukan pesanan otomatis.
Rating rata-rata bernilai kosong saat belum ada rating; metrik tidak direkayasa.

Google Books dipanggil hanya melalui VibeCore. Wizard memeriksa ISBN/Google Books ID
sebelum mapping; backend memeriksa kembali sebelum create. Gangguan provider
ditampilkan sebagai error, bukan disamarkan menjadi hasil kosong. Status Google
Books pada settings adalah hasil probe, bukan jaminan sisa kuota.

## Buku dan upload cover

Form bersama menyimpan title, ISBN, author/category, synopsis, year/page, stock,
price, image dan mood IDs. Metadata opsional: `subtitle`/`publisher` (255 karakter),
`edition`/`language` (100), `format` (50), `widthCm`/`heightCm` (>0 sampai 999999.99,
maksimum dua desimal). Input opsional kosong dikirim sebagai `null`; field yang
tidak dikirim klien lama dipertahankan oleh update backend.

Cover menerima JPG/PNG/WebP maksimum 5 MB melalui pilihan file atau drag-and-drop.
Preview lokal tidak langsung mengunggah file. Saat Simpan, upload dijalankan sebelum
POST/PUT buku. Kegagalan upload menghentikan save. Retry save setelah upload sukses
memakai URL sebelumnya untuk file yang sama. URL manual tetap tersedia.
Object URL dilepas ketika pilihan diganti/dibatalkan atau form dilepas.

VibeCore memeriksa isi gambar, maksimum 20 megapiksel, menormalkan menjadi WebP,
dan menyimpan nama UUID. Konfigurasikan volume persisten `BOOK_COVER_STORAGE_DIR`
di server; backup file bersama database. File yatim belum dibersihkan otomatis
karena penghapusan harus memeriksa referensi buku terlebih dahulu.

## Design dan assets

Manrope digunakan untuk seluruh aplikasi. Bootstrap mengatur grid, form, table,
button dan states; CSS custom melengkapi brand, ukuran, drawer dan ilustrasi.
Warna tombol utama digelapkan sedikit dari teal brand untuk kontras teks putih.
Focus keyboard terlihat; drawer mendukung Escape, focus trap dan pengembalian fokus.
Motion menghormati `prefers-reduced-motion`.

Sidebar dapat diciutkan pada desktop dan menjadi drawer pada tablet/mobile. Topbar
memiliki breadcrumb, antrean moderasi melalui notifikasi, serta profile/logout.
Nama file aset dipertahankan; dua ilustrasi utama diimpor langsung dari
`../Assets/illustrations/` tanpa salinan baru. Build memaketkan aset tersebut.
Lihat [Asset Usage Report](ASSET_USAGE_REPORT.md).

## Pemeriksaan

```bash
npm run lint
npm test
npm run build
```

Fixture browser: `http://localhost:3355/tests/books-preview.html?route=/books`.
Gunakan `&empty`, `&error=api`, atau `&role=Librarian` untuk kondisi berbeda.
Fixture bertanda QA, memakai API in-memory, tidak menyimpan sesi, dan tidak masuk
build produksi. Semua API produksi tetap melalui VibeCore.

Lihat [QA Report](QA_REPORT.md) untuk bukti yang dijalankan dan batas verifikasinya.
Periksa ulang health provider pada environment deployment. Migrasi dan pengujian
lokal tidak membuktikan konfigurasi, storage, atau kuota layanan di production.
