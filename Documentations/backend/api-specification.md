# Spesifikasi Endpoint REST API VibeCore

Ditinjau dari router source pada 18 November 2026. Base development: `http://localhost:3360`. Tabel memakai prefix utama; alias prefix dijelaskan terpisah. Inventaris ini berasal dari source, bukan hasil probe endpoint live.

Akses **Login** berarti akun terautentikasi untuk resource miliknya; **Staf** berarti Admin/Librarian; **Admin** berarti Admin saja. Semua akun terautentikasi tetap diperiksa statusnya oleh middleware.

Status publik: `GET /` dan `GET /api` mengembalikan JSON status tanpa envelope. Endpoint domain memakai [response contract](response-contract.md), kecuali respons file cover.

## Auth

Sumber: [router](../../vibecore/src/modules/auth/auth.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Publik | AuthController.register |
| `POST` | `/api/auth/login` | Publik | AuthController.login |
| `POST` | `/api/auth/forgot-password` | Publik | PasswordResetController.requestReset; `{ email }`, pengiriman melalui SMTP |
| `POST` | `/api/auth/reset-password` | Publik | PasswordResetController.resetPassword; `{ token, password }`, cabut sesi lama |
| `GET` | `/api/auth/me` | Login | AuthController.me |
| `PUT` | `/api/auth/profile` | Login | AuthController.updateProfile |
| `GET` | `/api/auth/public/:username` | Publik | AuthController.publicProfile; tanpa email/password |
| `PUT` | `/api/auth/password` | Login | AuthController.changePassword; password saat ini wajib |
| `PATCH` | `/api/auth/account` | Login | AuthController.changeEmail; password saat ini wajib |
| `DELETE` | `/api/auth/account` | Login (Member) | AuthController.deleteAccount; hapus akun sendiri beserta data miliknya |

## Books

Sumber: [router](../../vibecore/src/modules/books/book.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/books` | Publik | BookController.list |
| `GET` | `/api/books/covers/:filename` | Publik | BookCoverController.get |
| `GET` | `/api/books/:id` | Publik | BookController.getById |
| `POST` | `/api/books` | Staf | BookController.create |
| `POST` | `/api/books/covers` | Staf | BookCoverController.upload |
| `PUT` | `/api/books/:id` | Staf | BookController.update |
| `DELETE` | `/api/books/:id` | Staf | BookController.delete |

## Recommendations

Sumber: [router](../../vibecore/src/modules/recommendations/recommendation.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `POST` | `/api/recommendations/match` | Publik | RecommendationController.matchVibe |
| `POST` | `/api/recommendations` | Publik | RecommendationController.matchVibe |
| `GET` | `/api/recommendations/editorial` | Publik | EditorialController.list |

## Reading

Sumber: [router](../../vibecore/src/modules/reading/reading.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/reading/user/:userId/finished` | Publik | ReadingController.getUserFinishedReads |
| `GET` | `/api/reading/vibe-card/:id` | Publik | ReadingController.getVibeCard |
| `GET` | `/api/reading/:id/vibecard` | Publik | ReadingController.getVibeCard |
| `GET` | `/api/reading` | Login | ReadingController.getMyActivities |
| `POST` | `/api/reading` | Login | ReadingController.startReading |
| `POST` | `/api/reading/start` | Login | ReadingController.startReading |
| `POST` | `/api/reading/finish` | Login | ReadingController.finishReading |
| `PUT` | `/api/reading/:id` | Login | ReadingController.updateActivity |
| `PATCH` | `/api/reading/:id` | Login | ReadingController.updateActivity |
| `DELETE` | `/api/reading/:id` | Login | ReadingController.deleteActivity |

## Wishlists

Sumber: [router](../../vibecore/src/modules/wishlists/wishlist.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/wishlists/user/:userId` | Publik | WishlistController.getUserPublicWishlist |
| `GET` | `/api/wishlists/username/:username` | Publik | WishlistController.getUserPublicWishlist; profil aman tanpa email/password |
| `GET` | `/api/wishlists/public/:userId` | Publik | WishlistController.getUserPublicWishlist |
| `GET` | `/api/wishlists` | Login | WishlistController.getMyWishlist |
| `POST` | `/api/wishlists` | Login | WishlistController.add |
| `PUT` | `/api/wishlists/:id` | Login | WishlistController.update |
| `DELETE` | `/api/wishlists/:id` | Login | WishlistController.remove |

## Reviews

Sumber: [router](../../vibecore/src/modules/reviews/review.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/reviews/book/:bookId` | Publik | ReviewController.getBookReviews |
| `POST` | `/api/reviews` | Login | ReviewController.submitReview |
| `POST` | `/api/reviews/:id/report` | Login | ReviewController.reportReview |

## Authors

Sumber: [router](../../vibecore/src/modules/authors/author.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/authors` | Publik | AuthorController.list |
| `GET` | `/api/authors/:id` | Publik | AuthorController.getById |
| `POST` | `/api/authors` | Staf | AuthorController.create |
| `PUT` | `/api/authors/:id` | Staf | AuthorController.update |
| `DELETE` | `/api/authors/:id` | Staf | AuthorController.delete |

## Categories

Sumber: [router](../../vibecore/src/modules/categories/category.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Publik | CategoryController.list |
| `GET` | `/api/categories/:id` | Publik | CategoryController.getById |
| `POST` | `/api/categories` | Staf | CategoryController.create |
| `PUT` | `/api/categories/:id` | Staf | CategoryController.update |
| `DELETE` | `/api/categories/:id` | Staf | CategoryController.delete |

## Moods

Sumber: [router](../../vibecore/src/modules/moods/mood.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/moods` | Publik | MoodController.list |
| `GET` | `/api/moods/:id` | Publik | MoodController.getById |
| `POST` | `/api/moods` | Staf | MoodController.create |
| `PUT` | `/api/moods/:id` | Staf | MoodController.update |
| `DELETE` | `/api/moods/:id` | Staf | MoodController.delete |

## Editorial

Sumber: [router](../../vibecore/src/modules/editorial/editorial.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/editorial` | Publik | EditorialController.list |
| `POST` | `/api/editorial` | Staf | EditorialController.create |
| `PUT` | `/api/editorial/:id` | Staf | EditorialController.update |
| `DELETE` | `/api/editorial/:id` | Staf | EditorialController.delete |

## Members

Sumber: [router](../../vibecore/src/modules/members/member.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/members` | Admin | MemberController.list |
| `GET` | `/api/members/:id` | Admin | MemberController.getById |
| `PATCH` | `/api/members/:id/status` | Admin | MemberController.updateStatus |
| `PUT` | `/api/members/:id/status` | Admin | MemberController.updateStatus |
| `DELETE` | `/api/members/:id` | Admin | MemberController.delete |

## Moderation

Sumber: [router](../../vibecore/src/modules/moderation/moderation.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/moderation/reviews` | Staf | ModerationController.listReviews |
| `GET` | `/api/moderation/reviews/:id` | Staf | ModerationController.getById |
| `PATCH` | `/api/moderation/reviews/:id` | Staf | ModerationController.moderate |
| `PUT` | `/api/moderation/reviews/:id` | Staf | ModerationController.moderate |

## Analytics

Sumber: [router](../../vibecore/src/modules/analytics/analytics.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/analytics/overview` | Staf | AnalyticsController.getOverview |
| `GET` | `/api/analytics/wishlist-intelligence` | Staf | AnalyticsController.wishlistIntelligence |
| `GET` | `/api/analytics/reading` | Staf | AnalyticsController.readingAnalytics |
| `GET` | `/api/analytics/top-wishlisted` | Staf | AnalyticsController.getTopWishlisted |
| `GET` | `/api/analytics/mood-distribution` | Staf | AnalyticsController.getMoodDistribution |

## Staff

Sumber: [router](../../vibecore/src/modules/staff/staff.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/staff` | Admin | StaffController.list |
| `GET` | `/api/staff/:id` | Admin | StaffController.getById |
| `POST` | `/api/staff` | Admin | StaffController.create |
| `PATCH` | `/api/staff/:id/role` | Admin | StaffController.update |
| `PUT` | `/api/staff/:id/role` | Admin | StaffController.update |
| `PUT` | `/api/staff/:id` | Admin | StaffController.update |
| `DELETE` | `/api/staff/:id` | Admin | StaffController.delete |

## Settings

Sumber: [router](../../vibecore/src/modules/settings/settings.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/settings` | Admin | SettingsController.getSettings |
| `GET` | `/api/settings/health` | Admin | SettingsController.health |
| `POST` | `/api/settings/preview` | Admin | SettingsController.preview |
| `PUT` | `/api/settings` | Admin | SettingsController.updateSettings |

## Google Books

Sumber: [router](../../vibecore/src/modules/../integrations/google-books/google-books.routes.js).

| Method | Endpoint | Akses | Handler |
| --- | --- | --- | --- |
| `GET` | `/api/integrations/google-books/search` | Staf | Pencarian melalui adapter |

## Cara menghitung endpoint

Tabel di atas memuat **85 registrasi method + path** pada prefix utama, termasuk alias suffix yang memang didaftarkan router. Ditambah dua status route (`/` dan `/api`) menjadi **87**. Jumlah URL jika seluruh alias prefix diekspansi akan lebih besar; angka ini tidak sama dengan jumlah use case atau jumlah halaman.

## Alias prefix

| Prefix utama | Alias kompatibilitas |
| --- | --- |
| /api/recommendations | /api/ai |
| /api/reading | /api/reading-activities |
| /api/wishlists | /api/wishlist |
| /api/editorial | /api/editorial-picks |
| /api/categories | /api/genres |
| /api/members | /api/users |

Alias memakai router yang sama; alias tidak menciptakan suffix baru. Contohnya `/api/ai/match` tersedia, sedangkan `/api/ai/vibe-match` tidak didaftarkan. Tidak ada endpoint `/api/integrations/google-books/import`, `/api/wishlists/:id/move-to-reading`, atau `/api/reading-activities/finish-and-review`.

## Query dan payload penting

- Auth: forgot-password menerima `{ email }` dan memerlukan SMTP; token reset sekali pakai berlaku 30 menit. Reset/change password memakai password baru minimal 12 karakter dan maksimal 72 byte UTF-8. Perubahan password/email membatalkan sesi lama. Profile update menyimpan fullname, image, bio, location dan username secara atomik; konflik username/email menghasilkan 409.
- Reading PUT/PATCH: status `Want to Read|Reading|Finished`; rating opsional integer JSON 1–5; isSpoiler boolean; currentPage integer 0–2147483647. quote/privateNote/publicReview/moodTag menerima string/null. reviewTitle berupa teks maksimal 255 karakter; reviewVisibility `Public|Private` menyembunyikan draft tanpa menghapus teks. Proyeksi publik dan moderasi staf tidak memuat draft privat.
- Review POST: publicReview wajib string tidak kosong; rating dan isSpoiler mengikuti batas tipe reading. Input tidak valid menghasilkan envelope error 400. POST wishlist/review dengan ID buku yang tidak ada menghasilkan 404.
- Wishlist POST/PUT: priority `Low|Medium|High`, visibility `Public|Private`, reason string/null. Wishlist publik berdasarkan username hanya memuat item Public.
- Books: search mencakup title, description, ISBN, dan pen_name; filter genreId, authorId, mood (nama), moodId, googleBooksId, stock; sort newest/title/stock; page dan limit. Stock available >5, low 1–5, empty 0. Page minimal 1 dan limit 1–100.
- Buku create/update: relasi authorId, genreId, moodIds; stock, price, ISBN/Google ID, preview dan metadata. subtitle/publisher maksimal 255, edition/language 100, format 50 karakter. widthCm/heightCm positif, maksimal 999999.99, dua desimal. Metadata kosong/null menghapus nilai; field yang tidak dikirim saat update dipertahankan.
- Cover: POST multipart field cover, satu JPG/PNG/WebP maksimal 5 MiB; konten diperiksa Sharp, maksimal 20 megapiksel, output WebP. URL hasil upload dipakai pada image saat menyimpan buku.
- Google Books: GET search?query= minimal dua karakter; backend memeriksa googleBooksEnabled. Wizard preview → mapping author/category/stock/mood → review/consent → POST /api/books. Relasi dipilih dari katalog lokal; tidak dibuat otomatis oleh endpoint pencarian.
- Member list: search, status, page, limit; hanya akun role Member. Detail mengembalikan profil aman dan counts, bukan catatan pribadi.
- Moderation: list memakai status; PATCH/PUT keputusan menerima status Approved/Rejected/Flagged/Removed dan reason wajib (maksimal 2000). Removed hanya mengosongkan publicReview. Report ulasan menerima reason opsional maksimal 255 karakter.
- Analytics wishlist-intelligence/reading: period 30/90/365/all dan genreId; wishlist menerima sort demand/deficit. Data berupa agregat tanpa identitas wishlist individual.
- Staff create: fullname, username, email, password 12–128 karakter, role Admin/Librarian, status Active/Suspended. Update role/status mengikuti proteksi self-lockout dan Admin aktif terakhir.
- Settings: curationWeightBonus, moodMatchBaseScore, minMatchScoreThreshold menerima angka 0–1; enableGeminiExplanations dan googleBooksEnabled boolean. PUT menyimpan whitelist field. Preview POST memakai `{ settings, moods }` dan ranker yang sama, tanpa menyimpan.
- Recommendations POST match: `{ moodTags, queryText }`; response totalMatches/query/matches, item berisi book, matchScore 0–98, reason. Ranking lokal memakai settings; Gemini explanations opsional.

Model data terpisah di [referensi database](spesifikasi-api-dan-data.md). Validasi rinci mengikuti validator dan service masing-masing modul; tabel ini tidak menyatakan seluruh daftar memiliki pagination server.

Koleksi dan instruksi run terisolasi tersedia di [Postman](../../vibecore/postman/README.md). Hasil serta batas pengujian ada di [QA Report](../../vibecore/QA_REPORT.md) dan [Browser QA Report](../../vibecore/BROWSER_QA_REPORT.md).
