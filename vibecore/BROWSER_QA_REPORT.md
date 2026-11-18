# ReadVibe × VibeDesk — browser CRUD verification

Tanggal: 18 November 2026. Branch: `vibecore-e2e-qa`, dibuat dari `vibecore-next` (`6729563`).

## Kesimpulan dan batas klaim

CRUD inti diuji pada API Express/Sequelize/PostgreSQL nyata dan alur browser
ReadVibe–VibeDesk. Pengujian menemukan masalah pada data contoh, penyimpanan
profil/judul ulasan, privasi, kehilangan draft, serta header mobile. Masalah yang
ditemukan diperbaiki dan alur terkait diuji ulang. Laporan ini tidak menyamakan
kelulusan API dengan kelulusan setiap tombol UI; batas yang tersisa dicatat di bawah.

Semua mutasi pengujian memakai database `vibecore_qa_<uuid>` terpisah, seluruh
migration aktual, dan akun sintetis `*.example.invalid`. Browser memakai kedua
frontend development dengan URL API QA di environment proses. Tidak ada mock
respons API yang disuntikkan ke browser. Beberapa run dimulai kosong untuk create;
run terakhir memakai fixture melalui API untuk mengulang bug tertentu secara terarah.

## Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| Seluruh `vibecore/tests/*.test.js`, tiga flag DB aktif | 95 lulus, 0 gagal, 0 dilewati |
| Suite utama CRUD/RBAC di dalam run tersebut | 401 request HTTP diperiksa, termasuk persistensi, ownership, role, dan proyeksi publik |
| Postman lokal | 93 request, 307 assertion, 0 gagal; tanpa login/pelaporan cloud |
| VibeDesk unit | 14 lulus |
| VibeDesk lint dan build | Lulus |
| VibeCore build | Lulus, 104 file source |
| ReadVibe build | Lulus |
| ReadVibe ESLint file yang berubah | 0 error, 22 warning optimasi gambar dan dependensi hook; aturan tidak dinonaktifkan |
| Migrasi baru | Rollback/reapply dan guard duplikasi diuji pada PostgreSQL QA |
| Database development lokal | Preflight: 0 duplikasi username/email; keempat migrasi diterapkan, seluruh migration berstatus up |
| ForgeGuard gate | Tidak dapat dijalankan: repo belum memiliki `.forgeguard/config.toml` |
| Cleanup akhir | 0 database `vibecore_qa_` tersisa; server dan storage run interaktif terakhir ditutup dengan `quit` |

Rendering komponen dalam `browser-regressions.test.js` memakai React sebenarnya
dengan hook/dependensi terkontrol. Ini melengkapi bukti browser, bukan menggantikannya.

## Matriks observasi browser

`Lulus` berarti hasil terlihat setelah tindakan terkait, bukan hanya tombol diklik.
Create/update beberapa resource dilakukan pada run awal; regresi yang berubah
dijalankan ulang pada run berikutnya.

| No. | Skenario | Hasil yang diamati |
| --- | --- | --- |
| 1 | Admin login VibeDesk | Workspace dan navigasi Admin tersedia |
| 2 | Author create/update/reload | Nama pena dan biografi tersimpan; nama revisi tampil |
| 3 | Category create/update | Kategori revisi tampil pada daftar dan pilihan buku |
| 4 | Mood create/update | Mood revisi tampil dan dapat dipilih pada buku |
| 5 | Book create | Judul, 200 halaman, stok, penulis, kategori, mood dan sinopsis tampil pada detail |
| 6 | Book update | Judul revisi tampil setelah simpan |
| 7 | VibeDesk → ReadVibe catalog | Buku dan penulis yang dibuat di CMS muncul di Reader |
| 8 | Editorial create/update | Tagline revisi tersimpan di CMS |
| 9 | Editorial → ReadVibe | Tagline revisi tampil pada detail buku Reader |
| 10 | Member login dan reload | Sesi Member dipulihkan dari server |
| 11 | Wishlist create/reload | Tombol `In wishlist` dan item tersimpan setelah reload |
| 12 | Wishlist update | Alasan dan prioritas berubah; jumlah per prioritas ikut berubah |
| 13 | Wishlist public | Alasan publik tampil di halaman publik username yang benar |
| 14 | Wishlist private | Item tidak tampil di wishlist publik setelah diubah menjadi Only me |
| 15 | Start reading dari wishlist | Item keluar dari wishlist dan aktivitas membaca terbentuk |
| 16 | Progress update/reload | Halaman 42 dan catatan pribadi tetap ada setelah reload |
| 17 | Finish book | Rating 5, kutipan dan catatan tersimpan; buku muncul pada Finished Reads |
| 18 | Edit public review | Teks ulasan tersimpan dan muncul pada moderasi CMS |
| 19 | Moderation Reject | Status Rejected tersimpan; ulasan hilang dari detail publik Reader |
| 20 | Librarian authorization | Login berhasil; akses langsung `/settings` menampilkan Akses Dibatasi |
| 21 | Member CMS authorization | Login ditolak dengan pesan hanya Admin/Librarian |
| 22 | System settings save/reload | Google Books import nonaktif tetap nonaktif setelah reload |
| 23 | Staff create | Staf QA baru muncul pada daftar dengan role Librarian |
| 24 | Profile update/reload | Nama, username, bio dan lokasi tampil sesuai nilai baru setelah reload |
| 25 | Duplicate username | Error `Username sudah digunakan.` terlihat; form tetap terbuka |
| 26 | Profile counts/empty state | Jumlah sesuai fixture, tanpa contoh 3/12/18 buku |
| 27 | Review field persistence | Judul, teks publik dan private notes tetap tiga nilai terpisah setelah navigasi ulang |
| 28 | Hide review | Draft dan judul tetap tersimpan setelah reload; Only me tetap dipilih |
| 29 | Public isolation saat hidden | Profil publik tidak memuat teks ulasan maupun private notes |
| 30 | Republish review | Judul dan teks semula tampil kembali tanpa input ulang |
| 31 | No-review rating | Detail dengan 0 ulasan publik menampilkan Not rated yet, bukan angka 4.5 contoh |
| 32 | Home reading summary | Akun QA kosong menampilkan 0 buku selesai, bukan angka 3 contoh |
| 33 | Reader guest | Tautan sign-in tampil; tidak tertahan pada loading aktivitas |
| 34 | Reader missing ID | ID tidak ada menampilkan Book not found |
| 35 | ReadVibe mobile | Profil, review form dan header diperiksa; pada 320 px client/scroll width 305/305, kontrol Member dan guest berada di dalam layar |
| 36 | VibeDesk mobile | Detail buku dan buka navigasi bekerja pada 390 px; document width 375 px |

## Perbaikan berdasarkan temuan

- Halaman Reader tidak lagi mengarang bab cerita untuk setiap buku. Ia menampilkan
  sinopsis, preview penyedia bila URL HTTP(S) tersedia, dan pelacak progres dari
  salinan pembaca. ID tidak ditemukan dan kondisi guest punya hasil yang jelas.
- Profil sendiri dan publik memakai data server, jumlah nyata, serta empty state.
  Profil publik mengambil proyeksi publik server dan tidak memakai catatan privat
  akun yang sedang login sebagai refleksi orang lain.
- Bio/lokasi/username pada editor profil benar-benar disimpan; konflik username
  tidak menutup form atau mengubah profil sebagian.
- Judul ulasan disimpan. Private notes terpisah dari teks ulasan. Visibilitas
  Private menyembunyikan draft tanpa menghapus teks; query buku, review publik,
  finished shelf publik dan moderasi staf tidak membocorkan draft.
- Delete review menghapus teks/judul ulasan sambil mempertahankan finished read
  dan private notes. Remove finished read adalah tindakan terpisah dengan pesan
  konfirmasi yang menyebut hilangnya riwayat serta notes.
- Pengaturan akun tidak lagi mengaku berhasil lewat timer/localStorage: perubahan
  email/password dan penghapusan Member memanggil API, memeriksa password saat
  ini dan menolak mutasi tanpa otorisasi. Password/email baru membatalkan sesi lama.
- Constraint unik database melindungi username/email, termasuk registrasi
  bersamaan yang tidak meninggalkan profil yatim.
- Ringkasan bulan, rating, statistik halaman dan Vibe Card memakai aktivitas
  tersimpan, tanpa buku/rating/kutipan contoh saat data kosong. Timeline statistik
  mencakup November/Desember. Notifikasi awal contoh dihapus.
- Header mobile memakai logo ringkas; tombol profil dan Sign In tidak terpotong.
  Kontrol rating serta form progres/profil diberi label yang bisa diakses.

## Cakupan yang belum terbukti lewat browser penuh

- Perubahan status/akses staf dan suspend Member memicu masalah kontrol sesi
  browser pada konfirmasi native. Pembuatan staf terbukti di UI; perubahan
  status/role dan guard self-lockout terbukti melalui tes HTTP/DB, bukan dinyatakan
  lulus sebagai alur klik penuh. Pengguna menyatakan tidak melihat dialog saat
  diminta membatalkannya; sesi baru dipakai untuk pemeriksaan berikutnya.
- Final delete permanen pada UI dan perubahan password melalui browser tidak
  dieksekusi. DELETE resource, account cascade, password salah, token lama dan
  ownership telah diuji melalui HTTP pada database disposable. Ini bukan bukti
  klik semua dialog konfirmasi.
- File chooser upload cover, submit registrasi browser, export/download Vibe Card,
  dan setiap kombinasi keyboard/fokus belum diuji menyeluruh di browser. Upload
  HTTP, validasi cover dan alur client save/upload punya tes tersendiri.
- SMTP nyata belum dikonfigurasi. Tes recovery memakai SMTP lokal; tidak ada klaim
  email reset dikirim ke layanan sebenarnya. Google Books/Gemini live provider
  belum terbukti; status Google Books unavailable terlihat pada QA.
- Notifikasi tetap fitur lokal; belum ada CRUD notifikasi server yang dibuktikan.
- Satu permintaan screenshot jendela ChatGPT ditolak review otomatis karena dapat
  membuka chat tak terkait. Tidak diteruskan; semua gambar bukti berasal dari tab
  localhost QA yang sesuai.

## Menjalankan ulang

Dari `vibecore`:

```powershell
$env:RUN_CRUD_DB_TESTS='1'
$env:RUN_AUTH_DB_TESTS='1'
$env:RUN_BOOKS_DB_TESTS='1'
$files = @(rg --files tests -g '*.test.js')
node --test --test-concurrency=4 @files
npm run test:postman
```

Untuk browser, jalankan `node tests/browser-qa-server.js` dalam terminal interaktif.
Catat baseUrl dan akun fixture yang hanya berlaku pada run itu. Mulai frontend
ReadVibe dengan `NEXT_PUBLIC_API_URL` dan VibeDesk dengan `VITE_API_URL` menunjuk
baseUrl tersebut, pada port 3350 dan 3355. Ketik `quit` lalu Enter pada terminal
API QA setelah selesai agar server, database dan storage run itu dibersihkan.
Jangan masukkan kredensial fixture ke file environment yang dilacak Git.

Bukti gambar: [index](qa-evidence/2026-11-18/README.md).
