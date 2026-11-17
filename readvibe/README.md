# ReadVibe (Client Web Application)

ReadVibe adalah platform pembaca buku cerdas berbasis AI Vibe Matcher yang mencocokkan buku dengan suasana hati pembaca, kartu berbagi estetik (#ReadVibeWrapped), dan smart reading tracker & wishlist.

Aplikasi ini dibangun menggunakan **Next.js 15 (App Router)**, **React 19**, dan **Bootstrap 5.3**.

---

## Spesifikasi & Port

- **Port Development**: `http://localhost:3350`
- **Backend API (VibeCore)**: `http://localhost:3360`
- **Branch Kerja Modul**: `readvibe`

---

## Petunjuk Menjalankan Proyek Secara Mandiri

Proyek ini adalah proyek mandiri dalam ekosistem ReadVibe. Jalankan seluruh perintah langsung dari direktori `readvibe`:

```bash
cd readvibe
npm install
npm run dev
```

Buka peramban di `http://localhost:3350`.

### Script yang Tersedia

- `npm run dev` : Menjalankan server development Next.js di port 3350.
- `npm run build` : Membangun bundel produksi Next.js.
- `npm start` : Menjalankan server produksi di port 3350.
- `npm run lint` : Menjalankan ESLint.

---

## Konfigurasi Environment

Salin file `.env.example` menjadi `.env` sebelum menjalankan server:

```bash
cp .env.example .env
```

Isi variabel environment:
```env
PORT=3350
NEXT_PUBLIC_API_URL=http://localhost:3360
```

---

## Struktur Rute Utama (App Router)

- `/` — Halaman beranda (Featured Books, Editorial Picks, Mood Explorer)
- `/search` — Pencarian buku dinamis dengan filter genre, mood, dan kueri teks
- `/recommendations` — AI Vibe Matcher kustom berdasarkan mood & prompt pengguna
- `/my-reading` — Manajemen aktivitas membaca (Currently Reading, Completed, Progress Tracking)
- `/wishlist` — Daftar keinginan membaca dengan filter mood dan catatan pembaca
- `/profile` — Profil pembaca dan preferensi bacaan
- `/books/[id]` — Detail buku, rating, dan metadata lengkap

---

## Komunikasi dengan VibeCore API

Seluruh komunikasi data dengan backend dilakukan via REST API ke VibeCore (`http://localhost:3360`).
Variabel `NEXT_PUBLIC_API_URL` dapat diakses di sisi klien maupun server pada Next.js via `process.env.NEXT_PUBLIC_API_URL`.
