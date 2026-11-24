# Matriks Hak Akses dan Privasi

Referensi: [router backend](../../vibecore/src/routes/index.js), middleware [authentication](../../vibecore/src/middlewares/authentication.js), dan [route VibeDesk](../../vibedesk/src/app/routes/index.jsx). Ditinjau pada 17 November 2026.

## Peran

| Kemampuan | Publik | Member aktif | Librarian aktif | Admin aktif |
| --- | --- | --- | --- | --- |
| Baca katalog, penulis, kategori, mood, editorial, ulasan publik | Ya | Ya | Ya | Ya |
| Meminta rekomendasi | Ya | Ya | Ya | Ya |
| Wishlist dan aktivitas milik akun sendiri | Tidak | Ya | Ya | Ya |
| Masuk ke VibeDesk | Tidak | Tidak | Ya | Ya |
| Mutasi buku, cover, penulis, kategori, mood, editorial | Tidak | Tidak | Ya | Ya |
| Pencarian Google Books melalui backend | Tidak | Tidak | Ya | Ya |
| Analytics CMS dan moderasi ulasan publik | Tidak | Tidak | Ya | Ya |
| Daftar/detail/status/hapus member | Tidak | Tidak | Tidak | Ya |
| Daftar/detail/tambah/edit/hapus staf | Tidak | Tidak | Tidak | Ya |
| Settings, preview ranking, dan health integrasi | Tidak | Tidak | Tidak | Ya |

Aktivitas personal memakai identitas akun login. Role staf tidak memberikan hak untuk membaca catatan privat member. Endpoint publik wishlist hanya menampilkan item Public; daftar finished reads publik menyaring status Finished dan moderasi Approved serta mengecualikan privateNote.

## Aturan akun

- Registrasi publik selalu membuat Member; input role dari pemanggil tidak menaikkan akses.
- Login menolak akun Suspended. Middleware memeriksa user database pada request terautentikasi dan menolak akun yang sudah suspended.
- Member tidak dapat mengakses endpoint CMS meskipun memodifikasi local storage atau klaim role JWT.
- Perubahan status member hanya menerima Active/Suspended dan tidak dipakai untuk mengubah akun staf.
- Admin tidak dapat menghapus, menangguhkan, atau menurunkan role dirinya sendiri melalui pengelolaan staf. Admin aktif terakhir dilindungi dengan transaksi dan lock database.
- Password tidak disertakan dalam response pengelolaan staf/member. JWT secret dan API key tidak dikirim melalui settings atau health.

## Moderasi dan data privat

Moderasi mengambil konteks ulasan publik, alasan laporan, status, serta audit keputusan. Payload keputusan memerlukan reason. Aksi Removed menghapus publicReview tanpa menghapus privateNote. Endpoint member mengembalikan profil aman dan jumlah aktivitas, bukan isi catatan atau wishlist privat.

Pembatasan UI membantu navigasi, sedangkan otorisasi backend menentukan izin request. Detail endpoint dan alias ada di [spesifikasi API](../backend/api-specification.md). Bukti pemeriksaan negatif RBAC tersedia di [QA Report](../../vibedesk/QA_REPORT.md); tidak ada pengujian ulang keamanan aplikasi dalam pekerjaan penataan dokumentasi ini.
