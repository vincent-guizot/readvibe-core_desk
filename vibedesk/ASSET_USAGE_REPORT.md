# VibeDesk Asset Usage Report

Branch: `vibedesk-crud`. Laporan ini diperbarui setelah perluasan CMS menjadi 31 route.
Lokasi sumber telah diperiksa: `../Assets/illustrations/`, termasuk `README.txt`
yang menjelaskan Batch 2. Tidak ada ilustrasi baru yang dibuat atau nama file diubah.

## Penempatan utama

| Asset asli | Pemakaian saat ini |
| --- | --- |
| `left-image-login.png` | Panel kiri Login; navy asli, tanpa overlay teks, object-fit cover |
| `books-on-table-with-coffee-shelf-in-the-right-and-leaves.png` | Panel visual utama Control Center |
| `vibedesk-book-stack.png` | Header Control Center dan form Add/Edit Book |
| `vibedesk-library-bookshelf.png` | Header Books Catalog |
| `vibedesk-open-book.png` | Header Reading Analytics |
| `vibedesk-reading-cup.png` | Header Editorial Picks dan panel editorial Control Center |
| `decor-leaf-branch.png` | Header metadata/settings dan empty state metadata |
| `decor-eucalyptus.png` | Header Wishlist, Moderation, Members dan Staff |
| `decor-leaf-sprig.png` | Aksen kecil footer sidebar |
| `empty-state-books.png` | Catalog kosong/tidak ada hasil dan katalog terbaru kosong |
| `empty-state-data.png` | Empty state data/moderasi/analytics/staf |
| `vibedesk-horizontal-color.png` | Logo sidebar dan Login |
| `vibedesk-icon-color.png` | Favicon yang sudah tersedia |

Dua aset utama diimpor melalui `new URL(..., import.meta.url)` dari lokasi sumber,
tanpa dipindah atau disalin lagi. Vite memaketkannya saat build. Development server
hanya mengizinkan direktori aplikasi dan direktori ilustrasi tersebut, bukan seluruh
direktori proyek induk. Mapping berada di `src/constants/visual-assets.js`.

15 salinan Batch 1–3 yang dibuat pada tahap integrasi sebelumnya tetap tersedia di
`public/assets/illustrations`, `decorations`, dan `effects`, dengan nama/aset asli
dipertahankan. File yang tidak digunakan tidak dimuat sebagai gambar oleh halaman.

## Transparansi dan batas sumber

Pemeriksaan Sharp pada dua file utama menghasilkan:

| Asset | Dimensi | Alpha |
| --- | --- | --- |
| `left-image-login.png` | 941 × 1672 | Tidak ada; opaque |
| `books-on-table-with-coffee-shelf-in-the-right-and-leaves.png` | 1374 × 1145 | Tidak ada; opaque |

Pola kotak-kotak pada area atas ilustrasi dashboard adalah bagian dari file sumber
opaque, bukan transparansi browser. File tidak dimodifikasi agar mengikuti sumber
yang diberikan. Batch RGBA sebelumnya mempertahankan alpha aslinya.

Book records menggunakan cover API atau ikon fallback ketika tidak tersedia/rusak.
Ilustrasi dekoratif tidak dipakai sebagai cover buku. Gambar dekoratif memiliki alt
kosong dan tidak dapat menerima fokus. Gambar utama memiliki deskripsi alt.
Header menyediakan kolom ilustrasi sendiri; forms/tabel tetap dominan. Gambar
header disembunyikan pada mobile, sementara empty state tetap proporsional.

## Aset yang dipertahankan tetapi belum dipakai

`vibedesk-login-illustration.png`, `effect-soft-sparkles.png`,
`decor-organic-shape.png`, `decor-white-flowers.png`, `decor-coral-brush.png`, dan
`decor-gold-dots.png` tersedia untuk pemakaian berikutnya. Layout saat ini membatasi
dekorasi untuk menjaga dominasi informasi operasional dan memakai Login asli baru.

Legacy berikut juga dipertahankan: `background card themes.png`, `themes.png`,
`books-login.png`, `books.png`, `books-notifications.png`, `book-stacks-text.png`,
`book-stack1.png`, `book-stack2.png`, dan `book-stack-with-flower-vase.png`.
Tidak semuanya perlu ditampilkan bersamaan: komposisi besar dan quote tertanam
akan menambah dekorasi yang tidak dibutuhkan. Logo navy/white/icon/stacked lain
tetap tersedia untuk konteks background berbeda.

## Verifikasi

31 route diperiksa melalui fixture UI terisolasi pada desktop 1440×1000,
tablet 834×1112, dan mobile 390×844. Detail bukti dan batas integrasi berada di
[QA Report](QA_REPORT.md). Screenshot Login dan dashboard diperiksa, termasuk
pemuatan dua aset utama serta komposisi panelnya. Tidak ada pengubahan bitmap,
generasi gambar, atau dependency frontend tambahan untuk integrasi ini.
