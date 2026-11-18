# VibeCore Postman

`VibeCore.postman_collection.json` berisi 93 request berurutan untuk CRUD,
hak akses, ownership, privasi, settings, analytics, dan rekomendasi lokal.
Collection memakai schema Postman v2.1 dan hanya menerima URL HTTP localhost.
Jumlah request mencakup skenario sukses dan penolakan; bukan jumlah endpoint unik.

## Run terisolasi yang disarankan

Dari direktori `vibecore`:

```bash
npm run test:postman
```

Prasyarat: dependency backend terpasang, PostgreSQL lokal dapat diakses memakai
konfigurasi development pada `config/database.js`, user database memiliki izin
CREATE DATABASE, dan Postman CLI tersedia di PATH. Login Postman tidak diperlukan
untuk run file lokal. Runner memakai `--no-report-events` untuk menonaktifkan
pelaporan hasil ke cloud.

Runner membuat database `vibecore_qa_<uuid>`, menjalankan semua migration, membuat
empat akun fixture, dan menjalankan server API produksi di port sementara.
Environment berisi kredensial acak ditulis hanya ke direktori sementara OS.
Setelah run selesai/gagal, server ditutup, database uji dihapus, dan environment
sementara dibersihkan. Database development yang sudah ada tidak dipakai untuk
mutasi run ini. Runner menolak NODE_ENV production dan host database non-loopback.

## Import dan run manual

1. Import collection dan `local.postman_environment.example.json` ke Postman.
2. Salin environment menjadi `local.postman_environment.json` jika menyimpan ke
   filesystem. Nama tersebut diabaikan Git; template example tidak berisi secret.
3. Isi `baseUrl`, email/password untuk Admin, Librarian, Member, dan satu Member
   lain; isi `fixturePassword` minimal 12 karakter untuk akun fixture yang dibuat
   collection. Pakai akun QA khusus pada database lokal, bukan akun pribadi.
4. Jalankan seluruh folder `CRUD Regression` secara berurutan. ID dan JWT diperoleh
   saat run, tidak perlu ditempel ke collection.

Contoh CLI dari direktori `vibecore`:

```bash
postman collection run postman/VibeCore.postman_collection.json -e postman/local.postman_environment.json -i "CRUD Regression" --no-report-events
```

Run manual membuat fixture dan menghapusnya pada request terakhir. Run juga
memperbarui nama profil Member QA serta mengubah settings sementara lalu
mengembalikannya ke nilai awal. Run yang dihentikan sebelum request cleanup dapat
meninggalkan fixture/settings sementara. Gunakan runner terisolasi di atas agar
cleanup database tetap dilakukan ketika request atau assertion gagal.

Collection tidak mengirim email, mengambil data Google Books eksternal, atau
menjalankan probe health provider. Toggle Google Books dinonaktifkan sementara
untuk membuktikan respons 403 yang eksplisit. Upload cover, reset password, dan
provider failure tetap dicakup suite backend khusus, bukan run collection ini.
