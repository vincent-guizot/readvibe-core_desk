# Alur Pengguna (User Flows)

---

## 1. Alur AI Vibe Matching (ReadVibe)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pembaca (User)
    participant RV as ReadVibe Frontend
    participant VC as VibeCore Backend
    participant Gemini as Google Gemini AI
    participant DB as PostgreSQL Database

    User->>RV: Pilih mood tags (misal: "Calm & Mindful") dan/atau tulis curahan hati
    User->>RV: Klik "Cari Vibe"
    RV->>RV: Tampilkan status loading dengan kutipan reflektif
    RV->>VC: POST /api/ai/vibe-match { moodTags, queryText }
    VC->>DB: Query buku aktif beserta author, genre, dan moods
    alt Gemini API Key Tersedia
        VC->>Gemini: Kirim katalog buku dan emosi pengguna
        Gemini-->>VC: Kembalikan JSON (bookId, matchScore, personal reasoning)
    else Fallback Heuristik
        VC->>VC: Hitung skor resonansi berdasarkan overlap mood & kata kunci
    end
    VC-->>RV: Kembalikan daftar rekomendasi teratas (Match Score & Reason)
    RV-->>User: Tampilkan kartu hasil kurasi, alasan personal, dan opsi aksi (Wishlist / Preview)
```

---

## 2. Alur Transisi Status Membaca & Pembuatan Vibe Card (9:16)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pembaca
    participant RV as ReadVibe
    participant VC as VibeCore
    participant DB as PostgreSQL

    User->>RV: Klik "Mulai Membaca" dari Wishlist
    RV->>VC: POST /api/wishlists/:id/move-to-reading
    VC->>DB: Hapus dari wishlists, buat entri di reading_activities (status: 'Reading')
    VC-->>RV: Konfirmasi status membaca dimulai
    Note over User,RV: Pengguna membaca buku...
    User->>RV: Klik "Tandai Selesai Dibaca & Buat Vibe Card"
    RV-->>User: Tampilkan formulir review (Rating, Kutipan, Catatan Privat, Mood)
    User->>RV: Submit formulir
    RV->>VC: POST /api/reading-activities/finish-and-review
    VC->>DB: Update status 'Finished', simpan rating, quote, privateNote, publicReview
    VC-->>RV: Konfirmasi tuntas dan kirim data ulasan
    RV-->>User: Otomatis buka Modal Pratinjau Vibe Card (9:16)
    User->>RV: Klik "Unduh PNG" atau "Bagikan"
    RV->>RV: Render Canvas 1080x1920 dan picu download gambar / Web Share API
```

---

## 3. Alur 1-Click Import Google Books (VibeDesk)

```mermaid
sequenceDiagram
    autonumber
    actor Curator as Pustakawan / Admin
    participant VD as VibeDesk Backoffice
    participant VC as VibeCore Backend
    participant GBooks as Google Books API
    participant DB as PostgreSQL

    Curator->>VD: Buka modal "1-Click Import Google Books"
    Curator->>VD: Masukkan ISBN atau Judul Buku
    VD->>VC: GET /api/integrations/google-books/search?query=...
    VC->>GBooks: Request data volume (maxResults=8)
    GBooks-->>VC: Response metadata buku dan status embeddable
    VC->>DB: Periksa duplikasi ISBN di database lokal
    VC-->>VD: Kirim hasil pencarian beserta flag 'isAlreadyImported'
    VD-->>Curator: Tampilkan hasil pencarian, thumbnail, dan status preview
    Curator->>VD: Klik tombol "1-Click Import" pada buku terpilih
    VD->>VC: POST /api/integrations/google-books/import { metadata }
    VC->>DB: Buat/Hubungkan Author, Genre, dan record Book baru
    VC-->>VD: Konfirmasi buku berhasil masuk inventaris katalog
    VD-->>Curator: Tampilkan notifikasi sukses dan refresh tabel buku
```

---

## 4. Alur Moderasi Ulasan Komunitas

```mermaid
sequenceDiagram
    autonumber
    actor Member as Member ReadVibe
    actor Curator as Staf VibeDesk
    participant VC as VibeCore
    participant DB as PostgreSQL

    Member->>VC: POST /api/reading-activities/:id/flag { flagReason: 'Spoiler' }
    VC->>DB: Update isFlagged=true, moderationStatus='Pending'
    Curator->>VC: GET /api/moderation/reviews
    VC->>DB: Ambil daftar ulasan berstatus 'Pending' / isFlagged=true
    VC-->>Curator: Tampilkan antrean ulasan di menu Moderasi
    alt Disetujui (Aman)
        Curator->>VC: PUT /api/moderation/reviews/:id { status: 'Approved' }
        VC->>DB: Update moderationStatus='Approved', isFlagged=false
    else Mengandung Pelanggaran
        Curator->>VC: PUT /api/moderation/reviews/:id { status: 'Rejected', action: 'delete' }
        VC->>DB: Hapus teks publicReview agar tidak tampil di publik
    end
```
