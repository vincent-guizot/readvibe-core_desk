# Arsitektur Ekosistem ReadVibe

## 1. Ikhtisar Arsitektur

Ekosistem ReadVibe dirancang sebagai arsitektur **tiga proyek mandiri** yang berada di dalam satu folder induk repositori untuk kemudahan organisasi dan version control.

Tidak ada dependensi bersama di root, tidak menggunakan npm workspaces atau monorepo toolchain. Seluruh komunikasi antarlayanan dilakukan secara murni melalui **REST API HTTP & JSON**.

```
                           +---------------------------+
                           |  Pengguna / Pembaca Buku  |
                           +-------------+-------------+
                                         |
                                         v
                         +-------------------------------+
                         |           READVIBE            |
                         |     Client Web Application    |
                         |  (Next.js 16 + React 19 App)  |
                         |     http://localhost:3350     |
                         +---------------+---------------+
                                         |
                                         | REST API (JSON)
                                         | CORS Origin: :3350
                                         v
+------------------------+  REST API (JSON)  +-------------------------------+
|        VIBEDESK        |------------------>|           VIBECORE            |
|   CMS & Control Center | CORS Origin: :3355|       Backend API Service     |
| (Vite + React 19 SPA)  |                   |   (Express.js + Sequelize)   |
|  http://localhost:3355 |                   |     http://localhost:3360     |
+------------------------+                   +---------------+---------------+
            ^                                                |
            |                                  +-------------+-------------+
     Admin & Staf Kurasi                       |                           |
                                               v                           v
                                     +-------------------+       +-------------------+
                                     |    PostgreSQL     |       |   Google APIs     |
                                     |   (library_ms)    |       | (Gemini & Books)  |
                                     +-------------------+       +-------------------+
```

---

## 2. Matriks Port & Koneksi Development

| Proyek | Peran & Teknologi | Port Development | Target Endpoint API | Origin CORS Diizinkan |
| :--- | :--- | :--- | :--- | :--- |
| **ReadVibe** | Client Web Application (Next.js 16, React 19, Bootstrap 5.3) | `http://localhost:3350` | `http://localhost:3360/api` | - |
| **VibeDesk** | CMS & Backoffice (Vite, React 19, Bootstrap 5.3, React Router v7) | `http://localhost:3355` | `http://localhost:3360/api` | - |
| **VibeCore** | Backend API Engine (Express.js, Sequelize ORM, PostgreSQL) | `http://localhost:3360` | - | `http://localhost:3350`, `http://localhost:3355` |

---

## 3. Prinsip Isolasi & Keamanan

1. **Backend Secrets Isolation**:
   * Kunci rahasia API eksternal (`GEMINI_API_KEY`, `GOOGLE_BOOKS_API_KEY`) dan credential database hanya disimpan di lingkungan backend `vibecore/.env`.
   * Frontend tidak memiliki akses langsung ke kredensial pihak ketiga.
2. **Perlindungan Data Pribadi (Privacy by Design)**:
   * Endpoint publik ([/api/wishlists/user/:userId](file:///c:/Users/vince/Downloads/ReadVibe/vibecore/controllers/WishlistController.js) dan [/api/reading-activities/user/:userId/finished](file:///c:/Users/vince/Downloads/ReadVibe/vibecore/controllers/ReadingActivityController.js)) secara eksplisit mengecualikan `privateNote` dan item dengan status `visibility: 'Private'`.
3. **Pencegahan Duplikasi Data**:
   * Database dan controller membatasi 1 wishlist dan 1 aktivitas ulasan per pengguna per buku.
4. **Validasi Transisi Status Membaca**:
   * Status aktivitas membaca divalidasi dengan siklus wajar: `Want to Read` &rarr; `Reading` &rarr; `Finished`.
