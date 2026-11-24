# Alur Pengguna

Ditinjau dari router dan service pada 17 November 2026. Diagram menjelaskan implementasi backend dan alur CMS; bukan rekaman pengujian live. Daftar endpoint ada di [spesifikasi API](../backend/api-specification.md).

## Rekomendasi mood

```mermaid
sequenceDiagram
  actor Reader as Pembaca
  participant UI as ReadVibe
  participant API as VibeCore
  participant DB as PostgreSQL
  participant Gemini
  Reader->>UI: Pilih mood dan isi teks
  UI->>API: POST /api/recommendations/match
  API->>DB: Ambil kandidat dan settings
  API->>API: Ranker lokal, ambang skor, maksimal 3 hasil
  alt enableGeminiExplanations aktif
    API->>Gemini: Minta penjelasan hasil ranking
    Gemini-->>API: Penjelasan atau fallback generator
  else Nonaktif
    API->>API: Gunakan defaultReason
  end
  API-->>UI: totalMatches, query, matches
  UI-->>Reader: Buku, matchScore, reason
```

Skor ranking memakai rentang 0–98; settings numerik memakai 0–1. Gemini bukan pengganti ranker lokal. Kandidat kosong menghasilkan daftar hasil kosong.

## Wishlist, membaca, dan Vibe Card

```mermaid
sequenceDiagram
  actor Reader as Pembaca login
  participant UI as ReadVibe
  participant API as VibeCore
  participant DB as PostgreSQL
  Reader->>UI: Mulai membaca buku
  UI->>API: POST /api/reading/start dengan bookId
  API->>DB: Buat/update aktivitas Reading
  API->>DB: Hapus wishlist user dan buku tersebut
  API-->>UI: Aktivitas membaca
  Reader->>UI: Selesaikan dan tulis ulasan
  UI->>API: POST /api/reading/finish
  API->>DB: Simpan Finished, rating, quote, privateNote, publicReview
  API-->>UI: Aktivitas pemilik
  Reader->>UI: Buka Vibe Card
  UI->>UI: Render preview dan ekspor kartu
```

Backend juga menyediakan `GET /api/reading/vibe-card/:id` untuk data kartu publik pada aktivitas Finished, tanpa privateNote. UI dapat membangun kartu dari data yang sudah dimuat; diagram tidak mengklaim setiap preview memanggil endpoint kartu. Start/finish menerima bookId dan dapat membuat atau memperbarui aktivitas; tidak ada endpoint move-to-reading khusus atau jaminan state machine ketat pada seluruh update.

## Wizard import VibeDesk

```mermaid
sequenceDiagram
  actor Staff as Admin atau Librarian
  participant UI as VibeDesk /books/import
  participant API as VibeCore
  participant Books as Google Books
  participant DB as PostgreSQL
  Staff->>UI: Cari judul atau ISBN
  UI->>API: GET /api/integrations/google-books/search?query=...
  API->>DB: Baca googleBooksEnabled
  API->>Books: Cari melalui adapter backend
  Books-->>API: Metadata volume
  API-->>UI: Metadata domain
  Staff->>UI: Pilih kandidat dan preview
  UI->>API: GET /api/books untuk cek Google ID atau ISBN
  Staff->>UI: Mapping author/category lokal, stok, mood
  Staff->>UI: Review dan centang persetujuan
  UI->>API: POST /api/books
  API->>DB: Periksa duplikat dan simpan buku beserta mood
  API-->>UI: Buku tersimpan
  UI-->>Staff: Navigasi ke detail buku
```

Duplikat diblokir pada wizard dan diperiksa kembali saat create. Author/category yang belum ada dibuat melalui halaman katalog terkait. API key tetap di backend. Wizard memiliki empat tahap; bukan modal atau import satu klik. Kegagalan provider dikembalikan sebagai error, bukan daftar sukses kosong.

## Laporan dan moderasi

```mermaid
sequenceDiagram
  actor Member
  actor Staff as Admin atau Librarian
  participant API as VibeCore
  participant DB as PostgreSQL
  Member->>API: POST /api/reviews/:id/report dengan reason opsional
  API->>DB: Set Flagged, isFlagged dan flagReason
  Staff->>API: GET /api/moderation/reviews
  API-->>Staff: Ulasan publik dan konteks laporan
  Staff->>API: GET /api/moderation/reviews/:id
  Staff->>API: PATCH /api/moderation/reviews/:id dengan status dan reason
  API->>DB: Simpan moderationStatus, moderationReason, moderatedBy
  alt Removed
    API->>DB: Kosongkan publicReview
  end
  API-->>Staff: id dan moderationStatus
```

Keputusan menerima Approved, Rejected, Flagged, atau Removed. Reason wajib; catatan privat pemilik tidak masuk konteks moderasi dan tidak dihapus oleh Removed. Halaman CMS memakai `/moderation` dan `/moderation/:id`.
