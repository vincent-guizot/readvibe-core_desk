# VibeDesk CMS — QA Report

Tanggal: 17 November 2026. Branch: `vibedesk-crud`.
Tidak ada commit, push, atau pembuatan branch/PR pada pekerjaan ini.
Daftar 31 route dan API berada di [README](README.md).

## Pemeriksaan yang dijalankan

| Pemeriksaan | Hasil |
| --- | --- |
| Frontend `npm run lint` | Lolos, tanpa warning |
| Frontend `npm test` | 14 tes lolos |
| Frontend `npm run build` | Lolos |
| Backend `npm run build` | Lolos, 100 source files dikompilasi |
| Backend targeted tests | 24 tes lolos |
| PostgreSQL integration tests | 4 tes lolos; fixture transaksi di-rollback |
| Migrasi backoffice lokal | `20261117120000-add-backoffice-settings-and-moderation-audit.js` berhasil diterapkan |
| Browser desktop 1440×1000 | 31/31 route, tanpa overflow horizontal/error fixture/gambar rusak |
| Browser tablet 834×1112 | 31/31 route, tanpa overflow horizontal/error fixture/gambar rusak |
| Browser mobile 390×844 | 31/31 route, tanpa overflow horizontal/error fixture/gambar rusak |
| Aset utama | Login/dashboard berhasil dimuat dari sumber asli; keduanya opaque |
| Kontras teks representatif | Primary 5.38:1; kicker 4.82:1; status 4.77–6.15:1; tahapan 5.10:1; secondary pada sand 5.28:1 |
| `git diff --check` | Lolos |
| ForgeGuard gate | Tidak dapat berjalan: repository belum diinisialisasi dan tidak memiliki `.forgeguard/config.toml` |

Tes frontend mencakup race request detail buku, 404/retry, create/update/delete,
duplicate submit, metadata nullable, batas dimensi, upload-before-save, retry URL
upload, serta pemilihan/pembersihan storage sesi dan penolakan state Member/rusak.

Tes backend targeted dijalankan dengan:

```bash
node --test tests/backoffice.test.js tests/book-cover.test.js tests/book-update.test.js tests/book-metadata.test.js
```

Cakupannya: autentikasi dan RBAC pada router aktual, akun suspend, penolakan role
Admin dari klaim token yang tidak sesuai database, akses settings/members/staff,
validasi keputusan, pembatasan field member/moderasi, penghapusan ulasan publik
tanpa menghapus catatan pribadi, penyimpanan alasan laporan, registrasi publik
Member-only, transaksi pembuatan staf, proteksi Admin terakhir/self-lockout,
bound settings, konsistensi ranker/preview, dan error provider Google Books yang
tidak mengungkap kredensial. Tes cover memakai HTTP server lokal, Multer dan Sharp
aktual, termasuk MIME/content spoofing, ukuran/piksel, path traversal dan storage error.

Tes PostgreSQL:

```powershell
$env:RUN_BOOKS_DB_TESTS='1'
node --test tests/backoffice.db.test.js tests/book-metadata.db.test.js
```

Query analytics dan Books dijalankan pada PostgreSQL development nyata. Fixture
transaction memverifikasi completion/rating/mood/genre/trend, wishlist demand dan
defisit, metadata buku, JSONB settings, serta kolom alasan moderasi. Rollback
diperiksa agar record fixture tidak tertinggal; record yang sudah ada tidak diubah.

## Alur UI yang diperiksa

Browser memakai `tests/books-preview.html`: router dan komponen produksi dengan
adapter API in-memory yang bertanda QA. Data fixture tidak ditambahkan ke aplikasi
produksi dan tidak masuk build `dist/`.

- Membuka seluruh 31 halaman pada tiga ukuran layar, dengan font Manrope.
- Tambah dan edit Author, tambah Category, tambah Mood beserta warna.
- Tambah Editorial Pick hingga kembali ke daftar dengan notifikasi sukses.
- Wizard import: pencarian, preview, mapping penulis/kategori, stok, final review,
  tombol konfirmasi dinonaktifkan sebelum persetujuan, lalu halaman detail hasil import.
- Mengimpor ulang kandidat yang sama: warning duplikat muncul dan langkah mapping
  diblokir.
- Ubah/simpan bobot, preview diperbarui, lalu cancel mengembalikan nilai tersimpan.
- Show/hide password dan pemeriksaan komposisi ilustrasi Login.
- Sidebar desktop diciutkan menjadi sekitar 88px; drawer mobile dapat dibuka,
  ditutup dengan Escape, dan mengembalikan fokus ke tombol pemicu.
- Notifikasi mengarahkan ke moderasi dan profile dropdown menjalankan logout.
  Masalah lapisan popover yang sempat tertutup header konten sudah diperbaiki dan
  klik navigasi/logout diuji ulang.
- Librarian ditolak di route administrasi; Member diarahkan ke Login.
- Catalog empty state serta API error dengan tombol retry ditampilkan.
- Override viewport browser dikembalikan setelah QA.

## Batas bukti

Matrix 93 pemeriksaan adalah QA UI terisolasi, bukan 93 sesi end-to-end terhadap
backend live. Tes HTTP keamanan memakai user/model fixture; tes SQL/persistence
memakai PostgreSQL nyata. Tidak semua mutasi setiap modul dijalankan melalui browser
terhadap database live, dan kredensial login deployment tidak diuji melalui fixture.

Panggilan Google Books nyata beserta kuota/key environment deployment belum
diverifikasi; test provider mensimulasikan kegagalan, sedangkan halaman health
menyediakan probe aktual saat dipakai. Konfigurasi volume cover dan backup perlu
disediakan pada deployment. Tidak ada perubahan deployment atau data production.

Ilustrasi dashboard yang diberikan memiliki pola kotak-kotak tertanam pada file
opaque. File dipertahankan tanpa edit, sesuai arahan memakai sumber asli. Detail
inventaris dan transparansi terdapat di [Asset Usage Report](ASSET_USAGE_REPORT.md).
