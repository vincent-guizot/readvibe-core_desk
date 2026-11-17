# VibeDesk — CMS & Backoffice ReadVibe

VibeDesk digunakan staf untuk mengelola katalog, taksonomi, kurasi, dan komunitas
ReadVibe. Aplikasi ini adalah frontend mandiri dalam repositori ReadVibe Ecosystem;
data dan otorisasi dilayani oleh VibeCore REST API.

## Teknologi

- React 19 dan Vite 8.
- React Router 7 untuk routing, route guard, dan lazy loading halaman.
- Redux Toolkit dan React Redux untuk state resource katalog/analytics.
- Bootstrap 5.3 untuk layout, grid, form, button, table, alert, modal, dan utility.
- Axios untuk layanan HTTP katalog/workspace.
- Recharts untuk grafik analytics; React Icons untuk ikon.
- Oxlint untuk pemeriksaan source.

Dependency dan versi lengkap tersedia di [package.json](package.json).

## Persiapan dan menjalankan aplikasi

Gunakan Node.js yang didukung Vite 8 (20.19+ atau 22.12+) dan npm.
Seluruh perintah berikut dijalankan dari direktori `vibedesk/`.

```bash
npm ci
```

Salin environment example. Pada PowerShell:

```powershell
Copy-Item .env.example .env
```

Pada Bash:

```bash
cp .env.example .env
```

Konfigurasi frontend:

```env
VITE_API_URL=http://localhost:3360
```

Jalankan:

```bash
npm run dev
```

- VibeDesk: http://localhost:3355
- VibeCore: http://localhost:3360
- ReadVibe: http://localhost:3350

VibeCore dan database PostgreSQL perlu tersedia untuk login dan operasi data.
Ikuti [README VibeCore](../vibecore/README.md) untuk konfigurasi backend,
migration, dan seed. CORS backend harus mengizinkan origin VibeDesk.

Port Vite ditentukan oleh script dan `vite.config.js`; `PORT` pada
`.env.example` tidak mengubah port Vite secara otomatis. Untuk port lain:

```bash
npm run dev -- --port 3356
```

Semua variabel berawalan `VITE_` dapat masuk ke bundle browser.
Simpan Google Books API key, Gemini API key, dan secret lainnya hanya di backend.

## Perintah pengembangan

| Perintah | Fungsi |
| --- | --- |
| `npm ci` | Install dependency sesuai lockfile |
| `npm run dev` | Development server di port 3355 |
| `npm run lint` | Pemeriksaan source dengan Oxlint |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Preview hasil build di port 3355 |

Untuk hosting produksi, layani hasil `dist/` dan arahkan URL halaman seperti
`/books` ke `index.html` agar BrowserRouter dapat menangani deep link.
`VITE_API_URL` dibaca saat build; ubah nilainya lalu rebuild jika target API berubah.

## Struktur source

```text
src/
├── app/
│   ├── App.jsx
│   ├── provider/           # Redux Provider dan BrowserRouter
│   ├── routes/             # Route definitions, auth/permission guards
│   └── store/              # Perakitan Redux store
├── components/
│   ├── layouts/            # Shell dashboard, sidebar, dan topbar
│   ├── shared/             # PageHeader, StatCard, CrudStatusAlert
│   └── ui/                 # Button, AsyncStatus, BarChart
├── constants/             # API URL dan default page size
├── features/
│   ├── books/components/  # Form modal buku dan import Google Books
│   └── workspace/         # Redux slice dan async thunks
├── helpers/               # Fungsi murni, misalnya normalisasi pencarian
├── hooks/                 # Search, filter, sorting, pagination, breadcrumbs
├── pages/                 # Halaman yang dirender router
├── services/              # HTTP client, API errors, CRUD dan workspace API
├── styles/
│   ├── index.css          # Urutan import Bootstrap dan CSS pendamping
│   ├── variable.css       # Brand tokens dan Bootstrap variable overrides
│   ├── components.css     # Styling khusus identitas VibeDesk
│   └── animation.css      # Entrance motion dan reduced-motion
└── main.jsx               # Entry point
```

Gambar yang diakses melalui URL berada di `public/assets/`.
Sumber desain bersama berada di `../Assets/`; screenshot referensi ada di
`../Assets/screenshots/vibedesk/`. Direktori `src/assets/` digunakan hanya bila
ada aset yang benar-benar diimpor dari source; aset starter Vite sudah dihapus.

## Halaman dan fungsi

| URL | Halaman | Fungsi yang tersedia |
| --- | --- | --- |
| `/login` | Login | Login staf melalui VibeCore |
| `/` | Control Center | Ringkasan katalog dan shortcut operasional |
| `/books` | Books Catalog | CRUD buku, search, filter kategori/penulis/mood/stok, sorting, pagination |
| `/authors` | Authors | Tambah, baca, ubah, hapus penulis |
| `/categories` | Categories & Genres | CRUD kategori buku |
| `/moods` | Mood Tags | CRUD mood, warna aksen, pencarian |
| `/editorial-picks` | Editorial Picks | CRUD kurasi, bobot, tagline, dan status aktif |
| `/wishlist-intel` | Wishlist Intelligence | Grafik permintaan buku dari wishlist |
| `/reading-analytics` | Reading Analytics | Grafik distribusi mood |
| `/moderation` | Content Moderation | Tinjau dan moderasi ulasan |
| `/members` | Members | Daftar member dan perubahan role |
| `/staff` | Staff & Permissions | Daftar dan tambah staf; route dibatasi untuk Admin |
| `/recommendation-settings` | Recommendation Settings | Pengaturan bobot rekomendasi |
| `/settings` | System Settings | Informasi layanan dan konfigurasi |

Form tambah/edit buku dan Google Books Import dibuka melalui modal dari katalog
atau Control Center. Import mencari melalui VibeCore, kemudian meminta review
metadata, pemilihan penulis/kategori, stok, dan mood sebelum penyimpanan.

## State dan aliran data

Alur resource bersama:

```text
App → dispatch refreshWorkspace/fetchResource
    → services/workspace-api → Axios HTTP → VibeCore
    → Redux workspace slice → halaman
```

Setiap resource workspace memiliki:

```js
{
  data: [],          // null untuk resource berbentuk object sebelum dimuat
  loading: false,
  error: null,
  requestId: null
}
```

- Pending mengaktifkan loading dan membersihkan error sebelumnya.
- Fulfilled menyimpan data dan mematikan loading.
- Rejected menyimpan pesan error, mematikan loading, dan mempertahankan data lama.
- Request ID menjaga hasil agar sesuai request yang sedang dilacak.
- Request kedua untuk resource yang masih loading dicegah oleh thunk condition.
- `AsyncStatus` menampilkan loading/error dan retry melalui refresh workspace.
- Form CRUD mempertahankan state form, saving, dan pesan validasi secara lokal.
- Staff dan recommendation settings masih menggunakan fetch/state lokal.
- TanStack Query tidak digunakan; cache otomatis dan invalidation tidak tersedia.
  Mutation yang sukses meminta refresh secara eksplisit.

Books Catalog menggunakan hooks `useSearch`, `useFilter`, `useSorting`,
dan `usePagination` secara berurutan. Hooks tersebut memproses data yang sudah
dimuat di browser. Request buku workspace saat ini menggunakan `limit=100`,
sehingga pagination katalog berlaku pada koleksi yang sudah dimuat, bukan
seluruh record server. `useBreadcrumbs` membaca lokasi dari React Router.

## Layanan API yang digunakan frontend

| Resource | Endpoint / operasi |
| --- | --- |
| Login | `POST /api/auth/login` |
| Books | `/api/books`, `/api/books/:id` |
| Authors | `/api/authors`, `/api/authors/:id` |
| Categories | `/api/categories`, `/api/categories/:id` |
| Moods | `/api/moods`, `/api/moods/:id` |
| Editorial | `/api/editorial`, `/api/editorial/:id` |
| Google Books | `GET /api/integrations/google-books/search?query=...` |
| Overview | `GET /api/analytics/overview` |
| Wishlist | `GET /api/analytics/top-wishlisted` |
| Mood distribution | `GET /api/analytics/mood-distribution` |
| Moderation | `GET /api/moderation/reviews?status=Flagged`, `PATCH /api/moderation/reviews/:id` |
| Members / staff | `GET /api/members`, `GET/POST /api/staff`, `PATCH /api/staff/:id/role` |
| Recommendation settings | `GET/PUT /api/settings` |

CRUD clients menyediakan GET list/detail, POST create, PUT update, dan DELETE.
Lihat `services/catalog-api.js` dan `services/workspace-api.js` untuk kontrak
pemanggilan frontend. Backend tetap menjadi sumber kebenaran untuk validasi dan izin.
HTTP client katalog menggunakan timeout 15 detik dan menambahkan Bearer token dari
`localStorage.vibedesk_token`. Session user disimpan di `vibedesk_user`.

## Pedoman styling dan komponen

1. Gunakan grid, spacing, flex, typography, dan utility Bootstrap terlebih dahulu.
2. Gunakan `components/ui/` untuk presentasi reusable, tanpa aturan bisnis.
3. Tambahkan CSS custom hanya untuk brand, dimensi khusus, atau layout yang belum
   diwakili Bootstrap. Contoh: ilustrasi header dan warna status.
4. Card memakai kelas `card`; `vd-card` hanya menambah bayangan khas VibeDesk.
5. Button brand menggunakan variabel `--bs-btn-*` agar hover, focus, active,
   dan disabled tetap ditangani Bootstrap.
6. CSS diimpor hanya dari `styles/index.css`. Hindari CSS template dan duplikasi
   helper seperti spacing/warna yang sudah disediakan Bootstrap.
7. Animasi satu kali diterapkan pada halaman, form panel, statistik, modal, dan alert.
   `prefers-reduced-motion: reduce` menonaktifkan animasi custom tersebut.
8. Letakkan request baru di services, state domain di features, dan komposisi di app.

## Batas implementasi dan QA

Build yang berhasil memverifikasi kompilasi, bukan kesesuaian visual seluruh halaman
atau keberhasilan integrasi backend. Lakukan QA dengan backend aktif untuk login,
CRUD, relasi katalog, kegagalan request/retry, import, role access, serta tampilan
desktop dan mobile.

Beberapa tampilan dashboard/analytics masih memiliki angka, insight, atau status
statis. Global search/notifikasi pada shell belum memiliki alur lengkap. Login
saat ini juga memiliki quick login akun seed untuk pengembangan. Bagian tersebut
perlu ditinjau sebelum penggunaan produksi; jangan menganggap semua indikator
sebagai hasil monitoring layanan langsung.

Repository belum memiliki script test frontend otomatis. Gunakan build/lint sebagai
pemeriksaan teknis awal dan verifikasi interaksi melalui browser untuk perubahan UI.
