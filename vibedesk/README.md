# VibeDesk (CMS for ReadVibe)

VibeDesk adalah aplikasi Content Management System (CMS) dan Control Center untuk ekosistem **ReadVibe**, memungkinkan pengelolaan katalog buku, taksonomi mood, dan wishlist intelligence.

Aplikasi ini dibangun menggunakan **React 19**, **Vite**, **Bootstrap 5.3**, dan **React Router v7**.

## Spesifikasi & Port

- **Port Development**: `http://localhost:3355`
- **Backend API (VibeCore)**: `http://localhost:3360`

## Petunjuk Menjalankan Proyek Secara Mandiri

Proyek ini adalah proyek mandiri. Jalankan seluruh perintah langsung dari direktori `vibedesk`:

```bash
cd vibedesk
npm install
npm run dev
```

Buka peramban di `http://localhost:3355`.

### Script yang Tersedia

- `npm run dev` : Menjalankan Vite development server di port 3355.
- `npm run build` : Membangun bundel produksi di direktori `dist/`.
- `npm run preview` : Meninjau hasil build produksi secara lokal di port 3355.
- `npm run lint` : Menjalankan Oxlint linter.

## Konfigurasi Environment

Salin file `.env.example` menjadi `.env` sebelum menjalankan server:

```bash
cp .env.example .env
```

Isi variabel environment:
```env
PORT=3355
VITE_API_URL=http://localhost:3360
```

## Komunikasi dengan VibeCore API

Seluruh komunikasi data dengan backend dilakukan via REST API ke VibeCore (`http://localhost:3360`).
Variabel `VITE_API_URL` dapat diakses di dalam kode React via `import.meta.env.VITE_API_URL`.
