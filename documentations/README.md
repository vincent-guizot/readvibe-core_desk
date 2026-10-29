# Dokumentasi Ekosistem ReadVibe, VibeDesk, dan VibeCore

Selamat datang di pusat dokumentasi resmi ekosistem **ReadVibe**, **VibeDesk**, dan **VibeCore**.

---

## Daftar Isi Dokumentasi

1. [Arsitektur Ekosistem & Matriks Port](arsitektur.md)
   - Gambaran umum arsitektur proyek mandiri.
   - Matriks port development dan origin CORS.
   - Prinsip isolasi backend dan perlindungan data pribadi.

2. [Daftar Fitur & Sitemap Lengkap](sitemap-dan-fitur.md)
   - Fitur utama ReadVibe (AI Vibe Matcher, Vibe Card 9:16, Smart Wishlist, Digital Preview).
   - Fitur utama VibeDesk (1-Click Google Books Import, Wishlist Intelligence, Kurasi, Moderasi).
   - Struktur sitemap navigasi kedua aplikasi.

3. [Alur Pengguna (User Flows)](alur-pengguna.md)
   - Diagram urutan (*sequence diagrams*) untuk alur AI Vibe Matching.
   - Alur pembuatan dan pengunduhan kartu Vibe 9:16.
   - Alur 1-Click Import Google Books.
   - Alur moderasi ulasan komunitas.

4. [Model Data & Spesifikasi API VibeCore](spesifikasi-api-dan-data.md)
   - Skema lengkap tabel database PostgreSQL (DBML ERD).
   - Daftar endpoint REST API, parameter, dan respons.

5. [Matriks Hak Akses & Peran (RBAC)](matriks-hak-akses.md)
   - Pemetaan izin untuk peran `Member`, `Librarian`, dan `Admin`.

6. [Design System & Panduan Visual](design-system.md)
   - Identitas visual ReadVibe (Ink Plum, Vibe Coral, Cream Paper, DM Serif Display).
   - Identitas visual VibeDesk (Desk Navy, Curator Teal, Soft Sand, Manrope).
   - Aturan visual bersama (spacing, radius, focus states, logo).

7. [Laporan Progres Implementasi & Konfigurasi](progres-implementasi.md)
   - Rangkuman fitur selesai dan integrasi API eksternal.

---

## Petunjuk Menjalankan Proyek Secara Mandiri

Buka tiga terminal terpisah:

```bash
# Terminal 1: ReadVibe (Client Web App)
cd readvibe
npm install
npm run dev
# Akses: http://localhost:3350

# Terminal 2: VibeDesk (CMS & Backoffice)
cd vibedesk
npm install
npm run dev
# Akses: http://localhost:3355

# Terminal 3: VibeCore (Backend REST API)
cd vibecore
npm install
npm run dev
# Akses: http://localhost:3360
```
