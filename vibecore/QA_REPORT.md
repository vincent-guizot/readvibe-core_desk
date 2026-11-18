# VibeCore CRUD dan integrasi — QA

Tanggal: 18 November 2026. Branch: `vibecore-next`, dari `vibecore`.

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Semua `tests/*.test.js`, tiga flag DB diaktifkan | 71 tes lulus, 0 gagal, 0 dilewati |
| Suite CRUD/RBAC nyata | 401 request HTTP dengan status, envelope, persistence, akses dan privasi diperiksa |
| Collection Postman | 93 request, 307 assertion, 0 gagal; CLI v1.75.0, file lokal tanpa login/cloud reporting |
| VibeDesk `npm test` | 14 tes lulus |
| VibeDesk `npm run lint` | Lulus |
| VibeDesk `npm run build` | Lulus |
| VibeCore `npm run build` | Lulus, 104 file source |
| ReadVibe `npm run build` | Lulus pada Next.js 16.4.6, tanpa SecurityFatalError sebelumnya |
| ReadVibe `npm run test:security` | 4 tes lulus: resolved dependency/lockfile, glob compatibility, pola amplifikasi berbatas waktu, dan aturan lint aktif |
| `npm ls next eslint-config-next --depth=0` | Keduanya 16.4.6 |
| Audit npm ReadVibe online | 14 entry high, seluruhnya diturunkan dari advisory picomatch yang belum memiliki patch upstream; sebelumnya 15 entry dari dua advisory akar |
| Audit npm ReadVibe online `--omit=dev` | 0 temuan runtime |
| TypeScript ESLint / minimatch | 8.73.0 / 11.0.9; minimatch 7–11.0.0 tidak lagi terdapat pada lockfile |
| `git diff --check` | Lulus |
| Cleanup database uji setelah run | 0 database dengan prefix `vibecore_qa_` tertinggal pada pemeriksaan katalog PostgreSQL |
| ForgeGuard gate | Tidak tersedia: repository belum memiliki `.forgeguard/config.toml` |

## CRUD dan hak akses

Tes memakai app Express, router, middleware JWT/RBAC, validator, service, model,
dan database PostgreSQL hasil migration yang sebenarnya. Tidak ada stub untuk
autentikasi, ORM, atau respons CRUD pada ketiga suite baru.

- Authors, categories, moods, books: create/list/detail/update/delete untuk Admin
  dan Librarian; public read; Member dan anonymous ditolak saat menulis.
- Editorial: create/list/update/delete untuk kedua role staf dan public read.
- Wishlist dan reading: CRUD milik sendiri untuk Member/Librarian/Admin; pengguna
  lain mendapat 404 saat mencoba mengubah/menghapus resource; anonymous ditolak.
- Reading start menghapus wishlist terkait. Progres 0 dan pembaruan progres
  dipertahankan, lalu status Finished dapat dibaca melalui proyeksi publik aman.
- Reviews: create/update/read/report; moderasi hanya staf; keputusan Removed
  menghapus teks publik sambil mempertahankan privateNote dan audit keputusan.
- Members: dibuat melalui registrasi yang selalu menghasilkan Member; hanya Admin
  dapat membaca detail/agregat, mengubah status dan menghapus. Token akun suspended
  atau deleted ditolak. Detail tidak membocorkan catatan pribadi.
- Staff: CRUD Admin-only, dengan pengujian proteksi self-lockout; regresi lama juga
  mencakup Admin aktif terakhir dan transaksi pembuatan akun/profil.
- Settings: read/update/preview Admin-only, whitelist dan batas bobot diperiksa.
  Analytics tersedia untuk staf dan memakai agregat SQL nyata. Rekomendasi publik
  memakai ranker lokal. Google Books yang dinonaktifkan mengembalikan 403.

## Perbaikan yang dibuktikan regresi

Sebelum perbaikan, sembilan skenario HTTP negatif gagal: status/rating update
reading di luar domain, priority/visibility/reason wishlist yang tidak valid,
wishlist ke buku yang tidak ditemukan, review bukan teks, rating review di luar
1–5, dan review ke buku yang tidak ditemukan. Beberapa nilai tersimpan atau
menghasilkan 500 dengan pesan ORM.

Validator kini menolak nilai di luar kontrak dengan 400 sebelum persistence.
Wishlist/review memeriksa keberadaan buku dan menghasilkan 404. Suite juga
memeriksa bahwa status, rating dan visibility lama tidak berubah akibat request
yang ditolak. Rating harus integer JSON 1–5; isSpoiler harus boolean. Reading
text fields menerima string/null; reason wishlist menerima string/null.

## Bukti alur lintas frontend

`cross-client.db.test.js` memuat layanan HTTP/interceptor/catalog VibeDesk serta
layanan HTTP/mapper/thunk Redux ReadVibe yang sebenarnya. Hanya alamat API dan
browser storage yang diinjeksi untuk lingkungan Node; request tetap menuju API
dan PostgreSQL nyata.

1. VibeDesk membuat taxonomy dan buku; ReadVibe memuat ID/metadata yang sama.
2. Wishlist ReadVibe menambah demand pada analytics VibeDesk; reading start
   menghapus wishlist dan mengurangi demand.
3. Progres halaman 42 bertahan saat dimuat pada store frontend baru; detail member
   CMS hanya mengandung aggregate counts, tanpa catatan privat.
4. Ulasan ReadVibe muncul di moderasi CMS; keputusan Removed menghilangkannya
   dari endpoint publik dan mempertahankan catatan pribadi pembaca.
5. Update buku CMS terlihat oleh ReadVibe. Token Member dengan metadata sesi UI
   palsu bertuliskan Admin tetap ditolak oleh backend.
6. Delete buku menghapus dependent reading; taxonomy dapat dihapus setelah relasi
   dilepas. CORS mengizinkan origin ReadVibe 3350 dan VibeDesk 3355.

Ini bukti integrasi layanan/state frontend, bukan pengujian klik seluruh halaman
melalui browser. Layout dan aksesibilitas semua halaman tidak diaudit ulang.

## Menjalankan ulang

Dari `vibecore`, dengan dependency dan PostgreSQL lokal tersedia:

```bash
npm run test:unit
npm run test:crud
npm run test:postman
```

Suite CRUD dan Postman memerlukan izin CREATE DATABASE. Keduanya membuat database
`vibecore_qa_<uuid>`, menerapkan semua migration, dan membersihkan server, storage
cover serta database sementara setelah run. Database development yang sudah ada
tidak dipakai untuk mutasi suite baru. Run menolak NODE_ENV production dan host
database non-loopback. Environment Postman dengan kredensial fixture hanya ada
di direktori sementara dan dihapus setelah run.

Seluruh regresi, termasuk tes PostgreSQL development lama dengan fixture rollback:

```powershell
$env:RUN_CRUD_DB_TESTS='1'
$env:RUN_AUTH_DB_TESTS='1'
$env:RUN_BOOKS_DB_TESTS='1'
$testFiles = @(rg --files tests -g '*.test.js')
node --test --test-concurrency=4 @testFiles
```

## Batas yang masih terbuka

- Layanan SMTP nyata belum dipilih; reset password diuji dengan SMTP lokal pada
  regresi khusus, tanpa pengiriman ke inbox eksternal.
- Panggilan Gemini/Google Books nyata, kuota dan kredensial deployment tidak diuji.
  Collection tidak memanggil provider eksternal atau health probe provider.
- Patch Next.js dan pembaruan TypeScript ESLint/minimatch menutup dua advisory
  yang sudah memiliki rilis patched. Audit lengkap masih berisi 14 entry high
  dari satu advisory picomatch pada tooling development. Registry/advisory resmi
  belum menyediakan patch picomatch. Rincian sumber, status dan regresi tersedia
  di [Dependency Security ReadVibe](../readvibe/DEPENDENCY_SECURITY.md). Tidak ada
  downgrade konfigurasi lint, override ke versi tidak terverifikasi, atau
  pengecualian advisory untuk membuat audit tampak bersih.
- Tidak ada migration baru pada pekerjaan ini; tiga migration dari branch
  `vibecore` tetap dipakai. Tidak ada deployment atau merge ke development.
