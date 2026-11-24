# Response Contract VibeCore

Sumber: [ApiResponse](../../vibecore/src/utils/api-response.js), [pagination](../../vibecore/src/utils/pagination.js), [error codes](../../vibecore/src/contracts/error-codes.js), dan controller modul. Ditinjau pada 17 November 2026.

## Envelope JSON

Endpoint domain yang memakai ApiResponse menghasilkan envelope berikut. Contoh ini menunjukkan bentuk data, bukan hasil request live.

```json
{
  "success": true,
  "message": "Katalog buku berhasil dimuat.",
  "data": [],
  "meta": null,
  "error": null,
  "requestId": "contoh-request-id"
}
```

```json
{
  "success": false,
  "message": "Akses ditolak",
  "data": null,
  "meta": null,
  "error": { "code": "FORBIDDEN", "details": [] },
  "requestId": "contoh-request-id"
}
```

Data dapat berupa object atau array sesuai endpoint. ApiResponse.success menormalisasi null/undefined menjadi object kosong; delete buku, misalnya, tidak mengembalikan null. details dinormalisasi menjadi array. requestId berasal dari konteks request/header atau fallback helper.

Pengecualian: `GET /` dan `GET /api` mengembalikan JSON status tanpa envelope. `GET /api/books/covers/:filename` mengirim file gambar pada respons sukses, bukan JSON. Kegagalan request dapat ditangani oleh middleware error.

## Pagination

Books dan Members mengembalikan meta.pagination:

```json
{
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Query memakai page dan limit, sedangkan nama pada response adalah currentPage dan itemsPerPage. Page minimal 1, limit dibatasi 1–100. Tidak semua daftar dipaginasi server; metadata katalog tertentu diproses di frontend.

## Error

| HTTP | Kode yang digunakan | Makna |
| --- | --- | --- |
| 400 | VALIDATION_ERROR, BAD_REQUEST | Payload atau query tidak dapat diproses |
| 401 | UNAUTHORIZED | Token/akun tidak valid untuk autentikasi |
| 403 | FORBIDDEN | Role, status, atau pengaturan tidak mengizinkan operasi |
| 404 | NOT_FOUND | Resource tidak ditemukan |
| 409 | CONFLICT, DUPLICATE_ENTRY, RESOURCE_ALREADY_EXISTS | Konflik data, duplikat, atau relasi |
| 413 | INVALID_COVER_UPLOAD | File cover melewati batas ukuran |
| 429 | TOO_MANY_REQUESTS | Rate limit |
| 502 | GOOGLE_BOOKS_ERROR | Kegagalan provider pencarian Google Books |
| 500 | INTERNAL_SERVER_ERROR atau kode AppError | Kegagalan server |

Kode tepat mengikuti titik yang menghasilkan error; keberadaan konstanta di error-codes.js tidak berarti setiap kode selalu digunakan. Frontend membaca error.code dan error.details. Jangan menganggap kegagalan provider sebagai hasil pencarian kosong.

## Resource dan privasi

- Books list/detail/create/update saat ini mengembalikan model beserta relasi yang dipilih service, termasuk metadata tambahan. Mapper toBookResource dipakai pada rekomendasi dan memiliki field yang lebih terbatas; jangan menganggap seluruh response buku identik.
- Author menggunakan pen_name, bukan field name pada mapper buku rekomendasi.
- Rekomendasi mengembalikan data `{ totalMatches, query, matches }`. Item matches berisi book, matchScore (angka 0–98), dan reason. Skor tidak berada dalam rentang 0–1; bobot settings berada dalam rentang 0–1.
- Response Member memakai profil aman dan counts; tidak memuat isi privateNote atau daftar aktivitas privat.
- Response moderasi memuat konteks publicReview dan audit. Removed menghapus teks publik dan mengembalikan id serta moderationStatus.
- Route reading pribadi memakai user login. Pemanggilan mapper dengan flag privat pada controller pemilik bukan izin umum bagi staf untuk membaca catatan member.
- Vibe Card publik mengembalikan judul, author, coverImage, rating, quote, mood, reader, finishDate, dan cardRatio; tidak mengirim privateNote.

Gemini dipakai untuk penjelasan setelah ranking lokal ketika diaktifkan. Validasi dan fallback penjelasan tidak mengubah model data menjadi kontrak baru. Lihat [service rekomendasi](../../vibecore/src/modules/recommendations/recommendation.service.js) dan [spesifikasi API](api-specification.md).
