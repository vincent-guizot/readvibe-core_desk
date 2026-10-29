# Matriks Hak Akses & Peran (Role-Based Access Control)

---

## 1. Definisi Peran (Roles)

1. **Member**: Pengguna umum pembaca buku pada aplikasi ReadVibe.
2. **Librarian (Pustakawan)**: Staf kurator konten dan pengelola inventaris katalog di VibeDesk.
3. **Admin (Administrator)**: Pengelola sistem tingkat tinggi yang memiliki kendali penuh atas pengguna, peran, dan konfigurasi.

---

## 2. Matriks Hak Akses Fitur

| Modul / Tindakan | Publik (Tanpa Login) | Member (ReadVibe) | Librarian (VibeDesk) | Admin (VibeDesk) |
| :--- | :---: | :---: | :---: | :---: |
| **Eksplorasi Katalog Buku** | ✅ | ✅ | ✅ | ✅ |
| **Gunakan AI Vibe Matcher** | ✅ | ✅ | ✅ | ✅ |
| **Pratinjau Digital Google Books**| ✅ | ✅ | ✅ | ✅ |
| **Kelola Smart Wishlist Pribadi** | ❌ | ✅ | ✅ | ✅ |
| **Tandai Buku Selesai & Vibe Card**| ❌ | ✅ | ✅ | ✅ |
| **Tulis Catatan Pribadi (Privat)** | ❌ | ✅ | ✅ | ✅ |
| **Kirim Ulasan Publik & Rating** | ❌ | ✅ | ✅ | ✅ |
| **Laporkan Ulasan (Spam/Spoiler)** | ❌ | ✅ | ✅ | ✅ |
| **Akses Backoffice VibeDesk** | ❌ | ❌ | ✅ | ✅ |
| **1-Click Import Google Books** | ❌ | ❌ | ✅ | ✅ |
| **CRUD Buku, Penulis, Kategori** | ❌ | ❌ | ✅ | ✅ |
| **Kelola Mood Tags & Taksonomi** | ❌ | ❌ | ✅ | ✅ |
| **Kelola Editorial Picks & Bobot**| ❌ | ❌ | ✅ | ✅ |
| **Lihat Wishlist Intelligence** | ❌ | ❌ | ✅ | ✅ |
| **Lihat Reading Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Moderasi Ulasan Komunitas** | ❌ | ❌ | ✅ | ✅ |
| **Ubah Peran Pengguna (Role)** | ❌ | ❌ | ❌ | ✅ |
| **Hapus Akun Pengguna** | ❌ | ❌ | ❌ | ✅ |
