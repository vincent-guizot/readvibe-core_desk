# Daftar Fitur & Sitemap Ekosistem

---

## 1. READVIBE (Client Web Application)

### Fitur Utama
1. **AI Vibe Matcher**:
   - Pemilihan chip mood tags emosional atau penulisan curahan hati bebas.
   - Pemrosesan Google Gemini AI terintegrasi di backend VibeCore.
   - Indikator kecocokan persentase (Match Score %) dan alasan kurasi personal.
   - Kondisi loading dengan animasi kutipan penenang, error, dan hasil kosong.
2. **Vibe Card Generator**:
   - Pembuatan kartu visual berasio **9:16** untuk dibagikan ke Instagram Story & WhatsApp Status.
   - Menampilkan cover buku, judul, rating bintang, kutipan favorit pembaca, badge mood, dan watermark `#ReadVibeWrapped`.
   - Unduh langsung sebagai file gambar **PNG** resolusi tinggi menggunakan rendering Canvas.
   - Dukungan Web Share API untuk berbagi langsung ke perangkat mobile dengan fallback otomatis unduh.
3. **Smart Wishlist**:
   - Pengaturan prioritas membaca: `Tinggi (Bulan Ini)`, `Sedang (Tahun Ini)`, `Santai`.
   - Catatan alasan personal ingin membaca.
   - Pengaturan visibilitas (`Publik` vs `Privat`).
   - Tautan berbagi profil/wishlist publik.
   - Tombol transisi instan dari Wishlist ke rak `Reading` atau `Finished`.
4. **Digital Preview**:
   - Penampil Google Books Embedded Viewer langsung di jendela modal tanpa meninggalkan aplikasi.
   - Fallback tautan eksternal jika penerbit membatasi pratinjau tertanam.
   - Indikator ketersediaan sampel bab.
5. **Manajemen Akun & Rak Membaca**:
   - Otentikasi JWT (Register, Login, Logout) dan Profil Pembaca.
   - Rak `Currently Reading` untuk melacak bacaan yang sedang berlangsung.
   - Rak `Finished Reads` untuk mengarsipkan buku yang telah selesai dibaca.
   - Catatan pribadi (terlindungi, hanya untuk pemilik) terpisah dari ulasan publik komunitas.
   - Statistik membaca pribadi (total buku, distribusi mood favorit).

### Sitemap ReadVibe
```
/ (Single Page Application dengan Tab Navigation & Deep Modals)
├── Tab: Discover / Home (Hero, AI Search, Editorial Picks, Eksplorasi Katalog)
├── Tab: AI Vibe Matcher (Interaktif Mood Tags, Free-text Prompt, Vibe Match Results)
├── Tab: My Reading (Rak Buku Sedang Dibaca, Start Date, Tombol Selesai & Review)
├── Tab: Smart Wishlist (Daftar Incaran, Filter Prioritas, Toggle Visibilitas, Pindah Rak)
├── Tab: Finished Reads (Arsip Bacaan Tuntas, Trigger Generator Kartu Vibe)
├── Tab: Reading Stats (Statistik Total Selesai, Bacaan Aktif, Distribusi Mood)
├── Tab: Public Profile / Wishlist (Pratinjau Halaman Publik Pengguna Bebas Rahasia)
├── Modal: Vibe Card 9:16 (Visual Story Card, Download PNG, Web Share)
├── Modal: Digital Preview (Google Books Embedded Viewer & External Link)
├── Modal: Tambah ke Wishlist (Form Prioritas, Alasan, Visibilitas)
├── Modal: Tandai Selesai Dibaca (Rating, Kutipan, Catatan Privat, Ulasan Publik)
└── Modal: Otentikasi (Login, Register Akun Baru, Quick Login Demo)
```

---

## 2. VIBEDESK (CMS & Backoffice)

### Fitur Utama
1. **Manajemen Katalog**:
   - CRUD lengkap data buku, penulis, dan kategori/genre.
   - Metadata fisik dan digital (stok eksemplar fisik, ISBN, link Google Books).
   - **1-Click Import Google Books**: Cari buku via ISBN atau judul, pratinjau metadata sebelum simpan, dan pencegahan duplikasi buku.
   - Input manual buku dengan pengaitan ke mood tags.
2. **Kurasi & Taksonomi Mood**:
   - CRUD mood tags beserta ikon emoji, warna, dan deskripsi filosofis.
   - Pengaitan buku ke banyak mood tags (*many-to-many*).
   - **Editorial Picks**: Menetapkan buku pilihan editor, tagline kurasi, catatan pustakawan, dan bobot kurasi (50% - 100%) yang mempengaruhi algoritma AI.
3. **Wishlist Intelligence (Analitik Inventaris)**:
   - Pemeringkatan buku paling banyak masuk wishlist member.
   - Komparasi jumlah permintaan wishlist terhadap stok fisik inventaris (Deteksi defisit stok untuk pengadaan buku baru).
   - Breakdown prioritas wishlist (*High, Medium, Low*).
4. **Analitik Tren Membaca**:
   - Distribusi agregat mood buku yang diselesaikan oleh komunitas.
   - Skor kepuasan rata-rata dan total ulasan terverifikasi.
   - Perlindungan privasi (catatan privat tidak ditampilkan).
5. **Moderasi Konten Komunitas**:
   - Antrean ulasan publik yang dilaporkan mengandung spoiler atau spam.
   - Tindakan moderasi: Setujui (*Approve*), Tolak (*Reject*), atau Hapus Teks Ulasan.
6. **Manajemen Member & Hak Akses Staf**:
   - Daftar seluruh pengguna terdaftar dengan peran masing-masing.
   - Pengaturan hak akses peran: `Member`, `Librarian`, `Admin`.

### Sitemap VibeDesk
```
/ (Backoffice SPA dengan React Router v7)
├── /                     -> Dashboard (KPI Cards, Koleksi Buku Terbaru, Quick Import)
├── /books                -> Katalog Buku (Tabel Inventaris, Pencarian, Filter, Hapus)
├── /authors              -> Manajemen Penulis (Tambah Penulis, Daftar Penulis)
├── /categories           -> Manajemen Kategori & Genre
├── /moods                -> Taksonomi Mood Tags & Resonansi Emosi
├── /editorial-picks      -> Pilihan Editor (Bobot Kurasi, Tagline, Catatan Pustakawan)
├── /wishlist-intel       -> Wishlist Intelligence (Tren Incaran, Peringatan Defisit Stok)
├── /reading-analytics    -> Analitik Tren Membaca (Distribusi Mood Agregat, Kepuasan)
├── /moderation           -> Antrean Moderasi Ulasan & Laporan Spam/Spoiler
├── /members              -> Manajemen Akun Member & Staf (Ubah Role Akses)
├── /settings             -> Pengaturan Sistem & Status Koneksi Endpoint VibeCore
├── Modal: 1-Click Import -> Pencarian Google Books API & Preview Sebelum Simpan
└── Modal: Input Manual   -> Form Tambah Buku Fisik Baru
```
