# Sitemap dan Fitur Ekosistem

Inventaris source pada 17 November 2026. Keberadaan route menunjukkan halaman terdaftar, bukan bukti semua fitur halaman sudah terhubung ke backend atau diuji live.

## ReadVibe

Next.js App Router menyediakan katalog, pencarian, vibe matcher, rak bacaan, wishlist, finished reads, statistik, profil, dan Vibe Card. Preview buku dan ekspor kartu dapat memakai komponen/modal dalam halaman.

Sumber: [folder App Router](../../readvibe/src/app/). Route group `(main)` dan `(auth)` tidak menjadi bagian URL.

| Route source |
| --- |
| `/` |
| `/books/[slug]` |
| `/discover` |
| `/finished-reads` |
| `/finished-reads/edit-review` |
| `/forgot-password` |
| `/login` |
| `/my-reading` |
| `/notifications` |
| `/profile` |
| `/reader/[id]` |
| `/register` |
| `/search` |
| `/settings` |
| `/stats` |
| `/u/[username]` |
| `/u/[username]/wishlist` |
| `/vibe-card` |
| `/vibe-matcher` |
| `/wishlist` |

Halaman seperti forgot-password dan notifications tetap masuk inventaris route; ketersediaan endpoint pendukung harus diperiksa sebelum dianggap fitur backend lengkap.

## VibeDesk: 31 route

Sumber: [router CMS](../../vibedesk/src/app/routes/index.jsx). Login bersifat publik; seluruh halaman lain membutuhkan Admin/Librarian. Member, Staff, Recommendation Settings, dan System Settings hanya Admin.

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

## Pola interaksi CMS

- Form tambah/edit buku dan metadata katalog memiliki route sendiri; modal konfirmasi hanya dipakai untuk keputusan seperti hapus.
- Books memakai pencarian debounced, filter, sorting dan pagination server. Metadata katalog memakai pencarian/sort lokal sesuai resource.
- Wizard Google Books melalui pencarian, preview, mapping relasi, dan review dengan persetujuan sebelum POST buku.
- Dashboard dan analytics memuat agregat backend; settings tersimpan di database.
- Member hanya akun role Member; pengelolaan staf memiliki menu dan endpoint tersendiri.
- Loading, error, retry, empty state, feedback mutasi, sidebar desktop dan drawer mobile mendukung operasi CMS.

Detail payload dan akses ada di [API](../backend/api-specification.md) dan [matriks akses](../security/matriks-hak-akses.md).
