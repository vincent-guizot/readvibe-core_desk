# ReadVibe Ecosystem

Repositori ini menaungi tiga proyek mandiri dalam satu folder induk untuk mempermudah organisasi pengembangan:

```
/
├── readvibe/          # Client Web Application (Next.js 16) -> Port 3350
├── vibedesk/          # CMS Control Center (Vite + React 19) -> Port 3355
├── vibecore/          # Backend REST API (Express.js)       -> Port 3360
├── Assets/            # Sumber Aset Bersama (Logos, Design, References)
└── Documentations/    # Dokumentasi Arsitektur & Database Ekosistem
```

## Kemandirian Proyek

Setiap proyek bersifat independen dan memiliki:
- `package.json` dan lockfile mandiri.
- Manajemen dependensi dan instalasi masing-masing (`cd <proyek> && npm install`).
- Konfigurasi environment (`.env` dan `.env.example`) sendiri.
- Script build dan development masing-masing.
- README dan dokumentasi tersendiri.

> Tidak menggunakan monorepo/npm workspaces, skrip root terpusat, atau impor source code lintas proyek. Komunikasi antaraplikasi sepenuhnya melalui REST API.

---

## Petunjuk Menjalankan Proyek

Buka masing-masing proyek di terminal terpisah:

### 1. ReadVibe (Client)
```bash
cd readvibe
npm install
npm run dev
```
Akses di: [http://localhost:3350](http://localhost:3350)

### 2. VibeDesk (CMS)
```bash
cd vibedesk
npm install
npm run dev
```
Akses di: [http://localhost:3355](http://localhost:3355)

### 3. VibeCore (Backend API)
```bash
cd vibecore
npm install
npm run dev
```
Akses di: [http://localhost:3360](http://localhost:3360)

---

## Port Development & Alamat API

| Proyek | Port Development | Target Endpoint API | Origin CORS Diizinkan |
| :--- | :--- | :--- | :--- |
| **ReadVibe** | `http://localhost:3350` | `http://localhost:3360` | - |
| **VibeDesk** | `http://localhost:3355` | `http://localhost:3360` | - |
| **VibeCore** | `http://localhost:3360` | - | `http://localhost:3350`, `http://localhost:3355` |

Untuk informasi arsitektur dan skema database, lihat direktori [Documentations/](Documentations/README.md).
