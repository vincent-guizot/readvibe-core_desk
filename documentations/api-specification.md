# Spesifikasi Endpoint REST API VibeCore

Dokumentasi komprehensif endpoint REST API **VibeCore** (`http://localhost:3360/api`).

Seluruh endpoint mengadopsi standar **Response Contract Envelope**:
- Respons Sukses: `{ success: true, message, data, meta, error: null, requestId }`
- Respons Gagal: `{ success: false, message, data: null, meta: null, error: { code, details }, requestId }`

---

## Ringkasan Endpoint

| Modul | Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api` | Public | Status layanan VibeCore & allowed origins |
| **Auth** | `POST` | `/api/auth/register` | Public | Registrasi akun baru (Member) |
| | `POST` | `/api/auth/login` | Public | Login akun & perolehan token JWT |
| | `GET` | `/api/auth/me` | Authenticated | Profil pengguna yang sedang aktif |
| | `PUT` | `/api/auth/profile` | Authenticated | Perbarui data profil pengguna |
| **Books** | `GET` | `/api/books` | Public | Katalog buku dengan pencarian, filter, & paginasi |
| | `GET` | `/api/books/:id` | Public | Detail buku lengkap beserta ulasan publik |
| | `POST` | `/api/books` | Librarian/Admin | Tambah buku manual ke katalog |
| | `PUT` | `/api/books/:id` | Librarian/Admin | Perbarui metadata atau stok buku |
| | `DELETE` | `/api/books/:id` | Librarian/Admin | Hapus buku dari katalog |
| **Recommendations** | `POST` | `/api/recommendations/match` | Public | Rekomendasi AI Vibe Matcher (Gemini 2.5) |
| **Reading** | `GET` | `/api/reading` | Authenticated | Rak buku pengguna (`Reading`, `Finished`) |
| | `POST` | `/api/reading/start` | Authenticated | Mulai membaca buku (pindah dari wishlist) |
| | `POST` | `/api/reading/finish` | Authenticated | Tandai selesai, input rating & kutipan Vibe Card |
| | `GET` | `/api/reading/vibe-card/:id` | Public/Auth | Data kartu visual 9:16 untuk ekspor Canvas/PNG |
| | `GET` | `/api/reading/user/:userId/finished` | Public | Riwayat buku selesai publik seorang pengguna |
| **Wishlists** | `GET` | `/api/wishlists` | Authenticated | Daftar buku incaran personal (Smart Wishlist) |
| | `POST` | `/api/wishlists` | Authenticated | Tambah buku ke wishlist dengan tingkat prioritas |
| | `PUT` | `/api/wishlists/:id` | Authenticated | Ubah prioritas, catatan alasan, atau visibilitas |
| | `DELETE` | `/api/wishlists/:id` | Authenticated | Hapus buku dari wishlist |
| | `GET` | `/api/wishlists/user/:userId` | Public | Wishlist publik milik pengguna |
| **Reviews** | `GET` | `/api/reviews/book/:bookId` | Public | Daftar ulasan publik untuk suatu buku |
| | `POST` | `/api/reviews` | Authenticated | Kirim ulasan dan rating publik baru |
| | `POST` | `/api/reviews/:id/report` | Authenticated | Laporkan ulasan bermasalah (spam/spoiler) |
| **Moods** | `GET` | `/api/moods` | Public | Daftar taksonomi mood tags emosional |
| | `GET` | `/api/moods/:id` | Public | Detail mood tag beserta buku terhubung |
| | `POST` | `/api/moods` | Librarian/Admin | Tambah mood tag baru |
| | `PUT` | `/api/moods/:id` | Librarian/Admin | Perbarui nama, warna, atau deskripsi mood |
| | `DELETE` | `/api/moods/:id` | Librarian/Admin | Hapus mood tag |
| **Editorial** | `GET` | `/api/editorial` | Public | Daftar kurasi pilihan editor (Editorial Picks) |
| | `POST` | `/api/editorial` | Librarian/Admin | Tetapkan buku sebagai pilihan editor |
| | `PUT` | `/api/editorial/:id` | Librarian/Admin | Ubah bobot kurasi atau catatan kurator |
| | `DELETE` | `/api/editorial/:id` | Librarian/Admin | Hapus pilihan editor |
| **Authors** | `GET` | `/api/authors` | Public | Daftar seluruh penulis |
| | `POST` | `/api/authors` | Librarian/Admin | Tambah penulis baru |
| | `PUT` | `/api/authors/:id` | Librarian/Admin | Perbarui profil penulis |
| | `DELETE` | `/api/authors/:id` | Librarian/Admin | Hapus penulis |
| **Categories** | `GET` | `/api/categories` | Public | Daftar kategori/genre buku |
| | `POST` | `/api/categories` | Librarian/Admin | Tambah kategori baru |
| | `PUT` | `/api/categories/:id` | Librarian/Admin | Perbarui kategori |
| | `DELETE` | `/api/categories/:id` | Librarian/Admin | Hapus kategori |
| **Members** | `GET` | `/api/members` | Librarian/Admin | Daftar seluruh akun member komunitas |
| | `GET` | `/api/members/:id` | Librarian/Admin | Detail member beserta aktivitas membaca |
| | `PATCH` | `/api/members/:id/status`| Admin | Perbarui status aktif/suspend member |
| | `DELETE` | `/api/members/:id` | Admin | Hapus akun member |
| **Moderation** | `GET` | `/api/moderation/reviews` | Librarian/Admin | Antrean ulasan yang ditandai (Flagged) |
| | `PATCH` | `/api/moderation/reviews/:id` | Librarian/Admin | Keputusan moderasi (`Approved`/`Rejected`) |
| **Analytics** | `GET` | `/api/analytics/overview` | Librarian/Admin | KPI metrik buku, member, wishlist, selesai |
| | `GET` | `/api/analytics/top-wishlisted` | Librarian/Admin | Tren buku paling banyak diincar (Wishlist Intel) |
| | `GET` | `/api/analytics/mood-distribution` | Librarian/Admin | Distribusi suasana hati komunitas pembaca |
| **Staff** | `GET` | `/api/staff` | Admin | Daftar akun staf perpustakaan |
| | `POST` | `/api/staff` | Admin | Buat akun staf baru (`Librarian` atau `Admin`) |
| | `PATCH` | `/api/staff/:id/role` | Admin | Ubah hak akses peran staf |
| | `DELETE` | `/api/staff/:id` | Admin | Hapus akun staf |
| **Settings** | `GET` | `/api/settings` | Admin | Pengaturan bobot rekomendasi & status sistem |
| | `PUT` | `/api/settings` | Admin | Perbarui bobot kurasi dan ambang batas AI |
| **Google Books**| `GET` | `/api/integrations/google-books/search` | Librarian/Admin | Cari metadata buku eksternal via ISBN/Judul |

---

## Detail Spesifikasi Endpoint Terpilih

### 1. `POST /api/recommendations/match`
Mencocokkan suasana hati pembaca dengan katalog buku menggunakan model Google Gemini 2.5 Flash didukung bobot kurasi editorial pustakawan.

#### Request Body:
```json
{
  "moodTags": ["🧘 Calm & Mindful"],
  "queryText": "Lagi penat butuh bacaan hangat tentang cara menata pikiran"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Rekomendasi buku berhasil ditemukan",
  "data": {
    "totalMatches": 2,
    "query": {
      "moodTags": ["🧘 Calm & Mindful"],
      "queryText": "Lagi penat butuh bacaan hangat tentang cara menata pikiran"
    },
    "matches": [
      {
        "book": {
          "id": 1,
          "title": "Filosofi Teras",
          "author": { "name": "Henry Manampiring" },
          "image": "https://...",
          "genre": { "name": "Filsafat & Self-Help" }
        },
        "matchScore": 0.94,
        "explanation": "Buku ini sangat ideal untuk meredakan penat dengan memandu kita fokus pada hal-hal yang dapat kita kendalikan."
      }
    ]
  },
  "meta": null,
  "error": null,
  "requestId": "req_88f92b"
}
```

---

### 2. `POST /api/reading/finish`
Menandai buku selesai dibaca, menyimpan rating bintang, kutipan favorit, catatan pribadi, dan ulasan publik terpisah.

#### Request Body:
```json
{
  "bookId": 1,
  "rating": 5,
  "quote": "Ketenangan sejati datang dari menerima apa yang berada di luar kendali kita.",
  "privateNote": "Catatan pribadi: dibaca saat cuti tahunan di Bandung.",
  "publicReview": "Buku yang mengubah cara pandang saya terhadap kekhawatiran hidup.",
  "moodTag": "🧘 Calm & Mindful",
  "isSpoiler": false
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Selamat! Buku berhasil ditandai selesai dibaca.",
  "data": {
    "id": 12,
    "userId": 3,
    "bookId": 1,
    "status": "Finished",
    "rating": 5,
    "quote": "Ketenangan sejati datang dari menerima apa yang berada di luar kendali kita.",
    "publicReview": "Buku yang mengubah cara pandang saya terhadap kekhawatiran hidup.",
    "moodTag": "🧘 Calm & Mindful",
    "isSpoiler": false,
    "finishDate": "2026-10-29T19:40:00.000Z",
    "book": {
      "id": 1,
      "title": "Filosofi Teras"
    }
  },
  "meta": null,
  "error": null,
  "requestId": "req_45a12d"
}
```

---

### 3. `GET /api/reading/vibe-card/:id`
Menyediakan data terformat untuk rendering kartu visual rasio 9:16 di sisi klien (Canvas / PNG export).

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Data Vibe Card berhasil dimuat.",
  "data": {
    "cardRatio": "9:16",
    "title": "Filosofi Teras",
    "author": "Henry Manampiring",
    "coverImage": "https://...",
    "rating": 5,
    "quote": "Ketenangan sejati datang dari menerima apa yang berada di luar kendali kita.",
    "mood": "🧘 Calm & Mindful",
    "reader": "Rian Mahendra",
    "finishDate": "2026-10-29T19:40:00.000Z"
  },
  "meta": null,
  "error": null,
  "requestId": "req_99c31e"
}
```
