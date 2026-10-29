# Spesifikasi Response Contract VibeCore API

Dokumen ini mendefinisikan standar format respons JSON (Response Envelope) yang digunakan oleh seluruh endpoint REST API pada **VibeCore**, serta dikonsumsi oleh aplikasi klien **ReadVibe** dan **VibeDesk**.

---

## 1. Standar Response Envelope

Semua respons API wajib dibungkus dalam struktur JSON envelope yang konsisten, baik untuk operasi yang berhasil maupun yang gagal.

### A. Kontrak Respons Berhasil (Success Response)

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": null,
  "error": null,
  "requestId": "req_a1b2c3d4"
}
```

#### Aturan Respons Berhasil:
1. `success`: Selalu bernilai boolean `true`.
2. `message`: Pesan informatif mengenai hasil operasi (Bahasa Inggris atau Bahasa Indonesia ramah pengguna).
3. `data`: Objek payload data hasil operasi. Jika mengembalikan daftar kosong, gunakan array kosong `[]` (bukan `null`).
4. `meta`: Menyimpan metadata seperti informasi paginasi (`meta.pagination`) atau statistik agregat. Bernilai `null` jika tidak terdapat metadata.
5. `error`: Selalu bernilai `null` pada respons berhasil.
6. `requestId`: ID unik pelacakan request (diambil dari header `X-Request-Id` atau dibuat otomatis oleh middleware `request-id.js`).

---

### B. Kontrak Respons Gagal (Failed Response)

```json
{
  "success": false,
  "message": "Please check the submitted fields.",
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "requestId": "req_a1b2c3d4"
}
```

#### Aturan Respons Gagal:
1. `success`: Selalu bernilai boolean `false`.
2. `message`: Penjelasan ringkas mengenai kegagalan operasi.
3. `data`: Selalu bernilai `null`.
4. `meta`: Selalu bernilai `null`.
5. `error`: Objek terstruktur yang memuat:
   - `code`: Kode error standar dalam huruf kapital (machine-readable) yang digunakan oleh frontend untuk menentukan percabangan UI/notifikasi.
   - `details`: Array berisi daftar detail kesalahan (misalnya daftar field formulir yang gagal validasi).
6. `requestId`: ID unik pelacakan request untuk keperluan investigasi dan audit log.

---

## 2. Struktur Paginasi (`meta.pagination`)

Untuk endpoint yang mendukung pembagian halaman (seperti katalog buku, daftar member, riwayat aktivitas), objek paginasi diletakkan di dalam `meta.pagination`:

```json
{
  "success": true,
  "message": "Katalog buku berhasil dimuat.",
  "data": [
    { "id": 1, "title": "Bumi Manusia" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "error": null,
  "requestId": "req_8f3a92b1"
}
```

---

## 3. Daftar Standar Error Codes

Frontend menggunakan properti `error.code` untuk menentukan tindakan antarmuka:

| HTTP Status | Error Code | Deskripsi & Tindakan Frontend |
| :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Field permintaan tidak memenuhi syarat; tandai input formulir dengan pesan kesalahan. |
| **401** | `UNAUTHORIZED` | Token otentikasi tidak ditemukan, kedaluwarsa, atau tidak valid; alihkan pengguna ke `/login`. |
| **403** | `FORBIDDEN` | Pengguna tidak memiliki izin peran (misal Member mencoba mengakses endpoint Staf/Admin); tampilkan layar akses ditolak. |
| **404** | `NOT_FOUND` | Sumber daya tidak ditemukan; tampilkan layar *Empty State* atau halaman 404. |
| **409** | `CONFLICT` / `DUPLICATE_ENTRY` | Data duplikat terdeteksi (seperti ISBN ganda, username/email sudah terdaftar, atau buku sudah ada di wishlist). |
| **422** | `INVALID_TRANSITION` | Perubahan status rak buku tidak diizinkan oleh aturan bisnis. |
| **429** | `TOO_MANY_REQUESTS` | Batas frekuensi permintaan terlampaui (rate limiter aktif); minta pengguna menunggu sesaat. |
| **502** | `AI_PROVIDER_ERROR` | Kesalahan saat menghubungi layanan Google Gemini AI; sistem otomatis beralih ke fallback semantik internal. |
| **502** | `GOOGLE_BOOKS_ERROR` | Kesalahan saat menghubungi layanan Google Books API. |
| **500** | `INTERNAL_SERVER_ERROR` | Kesalahan server tidak terduga; tampilkan pesan ramah tanpa membocorkan stack trace. |

---

## 4. Pemetaan Resource (Domain Resource Mappers)

Sesuai aturan keamanan dan integritas data, instance Sequelize tidak pernah dikirimkan secara langsung tanpa pemetaan field. Hal ini menjamin bahwa password hash, secret token, dan kolom internal sistem tidak akan bocor ke klien.

### A. Book Resource (`toBookResource`)
```json
{
  "id": 1,
  "title": "Filosofi Teras",
  "description": "Panduan stoisisme untuk mental yang tangguh.",
  "year": 2019,
  "page": 320,
  "stock": 10,
  "price": 98000,
  "image": "https://...",
  "status": "Available",
  "isbn": "9786024125189",
  "googleBooksId": "xyz123",
  "previewLink": "https://books.google.com/...",
  "embeddable": true,
  "author": {
    "id": 1,
    "name": "Henry Manampiring"
  },
  "genre": {
    "id": 2,
    "name": "Filsafat & Self-Help"
  },
  "moods": [
    { "id": 1, "name": "🧘 Calm & Mindful", "color": "#91A99A", "icon": "Sparkles" }
  ],
  "createdAt": "2026-10-29T19:00:00.000Z"
}
```

### B. User & Profile Resource (`toUserResource`)
> Catatan: Kolom `password` dan secret token dihapus secara mutlak dari respons.
```json
{
  "id": 2,
  "username": "sarah.librarian",
  "email": "sarah@vibedesk.app",
  "role": "Librarian",
  "profile": {
    "id": 2,
    "fullname": "Sarah Pustakawan",
    "image": "https://api.dicebear.com/...",
    "age": 28,
    "nationality": "Indonesia",
    "gender": "Female"
  },
  "createdAt": "2026-10-29T19:00:00.000Z"
}
```

### C. Reading Activity & Vibe Card Resource (`toReadingActivityResource`)
> Catatan Privasi: `privateNote` hanya disertakan jika pemanggil adalah pemilik akun atau Admin/Librarian yang berwenang. Endpoint publik tidak menyertakan catatan privat.
```json
{
  "id": 5,
  "userId": 3,
  "bookId": 1,
  "status": "Finished",
  "startDate": "2026-10-15T00:00:00.000Z",
  "finishDate": "2026-10-25T00:00:00.000Z",
  "rating": 5,
  "quote": "Ketenangan batin ada dalam kendali persepsi kita sendiri.",
  "publicReview": "Buku yang sangat membuka pikiran dan menenangkan.",
  "moodTag": "🧘 Calm & Mindful",
  "isSpoiler": false,
  "moderationStatus": "Approved",
  "book": {
    "id": 1,
    "title": "Filosofi Teras",
    "image": "https://..."
  },
  "createdAt": "2026-10-25T14:30:00.000Z"
}
```

### D. Smart Wishlist Resource (`toWishlistResource`)
```json
{
  "id": 8,
  "userId": 3,
  "bookId": 2,
  "priority": "High",
  "reason": "Ingin membaca ini untuk persiapan penelitian.",
  "visibility": "Public",
  "book": {
    "id": 2,
    "title": "Atomic Habits",
    "image": "https://..."
  },
  "createdAt": "2026-10-28T10:00:00.000Z"
}
```

---

## 5. Validasi Kontrak Output Google Gemini AI

Sebelum output Google Gemini AI digabungkan ke dalam respons API VibeCore:
1. Respons teks terstruktur dari model divalidasi terhadap skema JSON yang ketat ([explanation.schema.js](file:///c:/Users/vince/Downloads/ReadVibe/vibecore/src/integrations/ai/schemas/explanation.schema.js)).
2. Setiap rekomendasi buku dipastikan memiliki `bookId` yang valid dan terdaftar di dalam database katalog lokal VibeCore.
3. Skor kecocokan dinormalisasi antara rentang `0.0` hingga `1.0` (dikonversi ke persentase pada tampilan klien).
4. Jika validasi output AI gagal atau kuota API tercapai, sistem secara mulus beralih ke fallback semantik internal tanpa menghasilkan error 500 ke pengguna.
