# ReadVibe dependency security

Ditinjau 18 November 2026 pada branch `vibecore-next`.

## Perubahan

- Next.js dan eslint-config-next: 16.4.3 → 16.4.6.
- TypeScript ESLint beserta paket keluarganya: 8.72.1 → 8.73.0, tetap dalam rentang
  dependency eslint-config-next yang sudah ada.
- minimatch yang dipakai TypeScript ESLint: 10.2.6 → 11.0.9 melalui dependency
  resmi upstream, tanpa override major atau fork lokal.

Advisory [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
mencakup minimatch >=7.0.0 dan <11.0.1. Lockfile tidak lagi mengandung minimatch
dalam rentang tersebut; minimatch 3.1.5 milik dependency ESLint lain berada di
luar rentang advisory ini.

## Advisory yang belum memiliki patch upstream

Audit online setelah pembaruan melaporkan 14 entry high, semuanya berasal dari
satu advisory picomatch yang sama pada dependency lint. Baseline sesudah patch
Next.js adalah 15 entry (6 moderate, 9 high) dari dua advisory akar. Severity
meta-package dihitung ulang oleh npm; 14 entry tersebut bukan 14 advisory baru.
Audit online `npm audit --omit=dev` melaporkan 0 temuan. Ini status ReadVibe,
bukan hasil audit dependency VibeCore atau VibeDesk.

[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) mencakup
picomatch <=4.0.7 dan masih menyatakan **Patched versions: None**. Registry npm
dan daftar rilis upstream juga masih menunjuk 4.0.7 sebagai rilis terbaru pada
pemeriksaan ini.

Dependency tersebut masuk melalui tooling development:

- eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → picomatch;
- eslint-import-resolver-typescript → tinyglobby/fdir → picomatch;
- TypeScript ESLint → typescript-estree → tinyglobby → picomatch.

Advisory ini tetap terbuka. Mengganti nomor versi, mengecualikan advisory, atau
menghapus aturan Next lint tidak digunakan sebagai perbaikan. Saran otomatis npm
untuk menurunkan eslint-config-next ke 14.2.35 tidak diterapkan pada aplikasi
Next.js 16. Konfigurasi lint tetap memakai preset Next Core Web Vitals.

Audit `--omit=dev` dipakai hanya untuk memisahkan status dependency runtime dari
tooling, bukan untuk menyatakan seluruh tree bersih. Audit offline tidak dijadikan
bukti hilangnya advisory. Jalankan lint/build pada repository tepercaya dan
periksa kembali advisory ini sebelum menerima pola glob atau konfigurasi tooling
dari sumber yang tidak tepercaya. Pola glob bukan input API publik ReadVibe.

## Verifikasi pembaruan

```bash
npm run test:security
npm run build
npm audit --json
npm audit --omit=dev --json
```

Empat regresi khusus memeriksa resolved dependency dan lockfile, kompatibilitas
glob dasar, preprocessing pola amplifikasi dalam worker dengan batas waktu,
serta penolakan synchronous script/conditional React hook oleh konfigurasi lint
aplikasi yang sebenarnya. Tes tersebut tidak mengklaim memperbaiki picomatch.

Hasil regresi lintas aplikasi dan batas bukti lainnya tersedia pada
[QA VibeCore](../vibecore/QA_REPORT.md).
