# Status Implementasi Ekosistem

Ditinjau dari source code pada **17 November 2026**. Dokumen ini adalah inventaris implementasi, bukan hasil pengujian ulang atau bukti layanan sedang berjalan.

## Inventaris

| Area | Implementasi pada source | Referensi |
| --- | --- | --- |
| ReadVibe | Next.js App Router; katalog, vibe matcher, wishlist, my reading, finished reads, statistik, profil publik, Vibe Card | [Halaman](../../readvibe/src/app/), [sitemap](../product/sitemap-dan-fitur.md) |
| VibeDesk | 31 route; CRUD dan form terpisah, wizard import, dashboard, analytics, member, moderasi, staf, settings | [README CMS](../../vibedesk/README.md) |
| Backend | Router modular, validator, controller, service, Sequelize; auth dan role berdasarkan akun database | [Arsitektur](../architecture/arsitektur.md), [API](../backend/api-specification.md) |
| Persistence | Metadata buku, JSONB application_settings, audit moderasi, cover pada storage backend | [Model data](../backend/spesifikasi-api-dan-data.md) |
| Desain | Bootstrap sebagai fondasi, custom tokens/styles, ilustrasi asli dan layout responsif | [Design system](../design/design-system.md) |

## Verifikasi yang sudah tercatat

[QA Report VibeDesk](../../vibedesk/QA_REPORT.md) mencatat 14 tes frontend, 24 tes backend terisolasi, 4 tes PostgreSQL, lint/build, dan 93 pemeriksaan tampilan fixture. Angka tersebut berasal dari pekerjaan implementasi sebelum integrasi ke main, bukan hasil eksekusi baru pada perubahan dokumentasi ini.

[Laporan historis](ecosystem-final-summary-report.md) mempertahankan klaim pengujian tahap sebelumnya. Tanggal, environment, dan relevansinya harus dipastikan sebelum angka lama dipakai untuk keputusan rilis.

## Yang masih perlu diverifikasi di environment tujuan

- Kredensial login, konfigurasi database/JWT/CORS, dan jalannya seluruh service.
- Alur browser terhadap backend/database live, bukan hanya fixture UI.
- Google Books live, key/kuota, dan enable/disable fitur.
- Gemini explanations: key server dan settings enableGeminiExplanations; ranking dasar tetap lokal.
- Penyimpanan persisten serta backup cover; cleanup cover yatim belum otomatis.
- Deployment build, routing fallback SPA, origin API, dan akses jaringan.
- ForgeGuard gate: repo belum diinisialisasi; laporan gate tidak boleh ditulis sebagai lolos.

Setup dan perintah pemeriksaan tersedia di [README utama](../../README.md). Pemeriksaan source bukan jaminan seluruh fitur UI sudah terhubung atau telah diuji live.
