import bcrypt from 'bcryptjs';
import db from './models';

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to database for seeding...');

    // 1. Seed Profiles & Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const [adminProfile] = await db.profile.findOrCreate({
      where: { fullname: 'System Admin' },
      defaults: { fullname: 'System Admin', age: 30, nationality: 'Indonesia', gender: 'Other' },
    });
    const [adminUser] = await db.user.findOrCreate({
      where: { email: 'admin@vibedesk.app' },
      defaults: {
        username: 'admin',
        email: 'admin@vibedesk.app',
        password: passwordHash,
        role: 'Admin',
        profileId: adminProfile.id,
      },
    });

    const [librarianProfile] = await db.profile.findOrCreate({
      where: { fullname: 'Librarian Sarah' },
      defaults: { fullname: 'Librarian Sarah', age: 28, nationality: 'Indonesia', gender: 'Female' },
    });
    const [librarianUser] = await db.user.findOrCreate({
      where: { email: 'librarian@vibedesk.app' },
      defaults: {
        username: 'librarian',
        email: 'librarian@vibedesk.app',
        password: passwordHash,
        role: 'Librarian',
        profileId: librarianProfile.id,
      },
    });

    const [memberProfile] = await db.profile.findOrCreate({
      where: { fullname: 'Vincent Reader' },
      defaults: { fullname: 'Vincent Reader', age: 25, nationality: 'Indonesia', gender: 'Male' },
    });
    const [memberUser] = await db.user.findOrCreate({
      where: { email: 'member@readvibe.app' },
      defaults: {
        username: 'vinc',
        email: 'member@readvibe.app',
        password: passwordHash,
        role: 'Member',
        profileId: memberProfile.id,
      },
    });

    // 2. Seed Mood Tags
    const moodData = [
      {
        name: '🌧️ Melancholy',
        icon: '🌧️',
        color: '#6c757d',
        description: 'Buku yang menyentuh kedalaman emosi, reflektif, dan penuh keharuan mendalam.',
      },
      {
        name: '⚡ High Energy',
        icon: '⚡',
        color: '#ffc107',
        description: 'Buku penuh motivasi, aksi nyata, produktivitas, dan penggerak langkah.',
      },
      {
        name: '🧘 Calm & Mindful',
        icon: '🧘',
        color: '#20c997',
        description: 'Buku penenang pikiran, stoikisme, kedamaian batin, dan kesadaran diri.',
      },
      {
        name: '🍂 Cozy Autumn',
        icon: '🍂',
        color: '#fd7e14',
        description: 'Kisah hangat yang nyaman dibaca di sofa bersama secangkir teh hangat.',
      },
      {
        name: '🖤 Dark Academia',
        icon: '🖤',
        color: '#343a40',
        description: 'Nuansa misteri intelektual, literatur klasik, perpustakaan tua, dan teka-teki.',
      },
      {
        name: '💡 Mind-Expanding',
        icon: '💡',
        color: '#0dcaf0',
        description: 'Buku yang merombak cara pandangmu terhadap dunia, sejarah, dan masa depan.',
      },
    ];

    const moods = [];
    for (const m of moodData) {
      const [tag] = await db.mood_tag.findOrCreate({
        where: { name: m.name },
        defaults: m,
      });
      moods.push(tag);
    }

    // 3. Seed Genres
    const genreNames = ['Filsafat & Stoikisme', 'Pengembangan Diri', 'Sastra & Fiksi', 'Sains & Sejarah', 'Psikologi'];
    const genres = [];
    for (const name of genreNames) {
      const [g] = await db.genre.findOrCreate({
        where: { name },
        defaults: { name, userId: adminUser.id },
      });
      genres.push(g);
    }

    // 4. Seed Authors
    const authorNames = [
      'Henry Manampiring',
      'James Clear',
      'Leila S. Chudori',
      'Yuval Noah Harari',
      'Matt Haig',
      'Marcus Aurelius',
    ];
    const authors = [];
    for (const pen_name of authorNames) {
      const [a] = await db.author.findOrCreate({
        where: { pen_name },
        defaults: { pen_name, userId: adminUser.id },
      });
      authors.push(a);
    }

    // 5. Seed Books
    const bookData = [
      {
        title: 'Filosofi Teras',
        description:
          'Penerapan filsafat Yunani-Kuno Stoa untuk mengendalikan emosi negatif dan menghasilkan mental yang tangguh dalam menghadapi kekhawatiran zaman modern.',
        year: 2019,
        page: 320,
        stock: 12,
        price: 98000,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        isbn: '9786024248444',
        googleBooksId: 'xU_oDwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=xU_oDwAAQBAJ',
        embeddable: true,
        authorId: authors[0].id,
        genreId: genres[0].id,
        userId: adminUser.id,
        moods: ['🧘 Calm & Mindful', '💡 Mind-Expanding'],
      },
      {
        title: 'Atomic Habits',
        description:
          'Perubahan kecil yang memberikan hasil luar biasa. Panduan praktis untuk membangun kebiasaan baik dan meninggalkan kebiasaan buruk setiap hari.',
        year: 2018,
        page: 320,
        stock: 15,
        price: 120000,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
        isbn: '9780735211292',
        googleBooksId: 'fFC3DwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=fFC3DwAAQBAJ',
        embeddable: true,
        authorId: authors[1].id,
        genreId: genres[1].id,
        userId: adminUser.id,
        moods: ['⚡ High Energy', '💡 Mind-Expanding'],
      },
      {
        title: 'Laut Bercerita',
        description:
          'Novel berlatar penghilangan paksa aktivis mahasiswa pada masa Orde Baru. Mengisahkan rasa kehilangan keluarga dan persahabatan yang tak pernah padam.',
        year: 2017,
        page: 379,
        stock: 8,
        price: 110000,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
        isbn: '9786024246945',
        googleBooksId: '4-hNDwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=4-hNDwAAQBAJ',
        embeddable: true,
        authorId: authors[2].id,
        genreId: genres[2].id,
        userId: adminUser.id,
        moods: ['🌧️ Melancholy', '🖤 Dark Academia'],
      },
      {
        title: 'Sapiens: Riwayat Singkat Umat Manusia',
        description:
          'Menelusuri sejarah evolusi manusia purba hingga menjadi penguasa planet bumi melalui tiga revolusi besar: kognitif, agrikultur, dan saintifik.',
        year: 2014,
        page: 512,
        stock: 10,
        price: 145000,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
        isbn: '9780062316097',
        googleBooksId: 'FmyBAwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=FmyBAwAAQBAJ',
        embeddable: true,
        authorId: authors[3].id,
        genreId: genres[3].id,
        userId: adminUser.id,
        moods: ['💡 Mind-Expanding'],
      },
      {
        title: 'The Midnight Library',
        description:
          'Antara hidup dan mati terdapat sebuah perpustakaan. Setiap buku memberikan kesempatan untuk mencoba kehidupan lain yang mungkin pernah kamu pilih.',
        year: 2020,
        page: 304,
        stock: 9,
        price: 115000,
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
        isbn: '9780525559474',
        googleBooksId: 'u3bCDwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=u3bCDwAAQBAJ',
        embeddable: true,
        authorId: authors[4].id,
        genreId: genres[2].id,
        userId: adminUser.id,
        moods: ['🌧️ Melancholy', '🍂 Cozy Autumn'],
      },
      {
        title: 'Meditations',
        description:
          'Catatan harian Kaisar Romawi Marcus Aurelius tentang disiplin diri, kerendahan hati, dan ketenangan jiwa di tengah intrik kekaisaran.',
        year: 2002,
        page: 256,
        stock: 6,
        price: 95000,
        image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400',
        isbn: '9780812968255',
        googleBooksId: 'N9VNDwAAQBAJ',
        previewLink: 'https://books.google.com/books?id=N9VNDwAAQBAJ',
        embeddable: true,
        authorId: authors[5].id,
        genreId: genres[0].id,
        userId: adminUser.id,
        moods: ['🧘 Calm & Mindful', '🖤 Dark Academia'],
      },
    ];

    const books = [];
    for (const b of bookData) {
      const { moods: bookMoodNames, ...bookFields } = b;
      const [createdBook] = await db.book.findOrCreate({
        where: { title: b.title },
        defaults: bookFields,
      });
      books.push(createdBook);

      // Link moods
      for (const moodName of bookMoodNames) {
        const foundMood = moods.find((m) => m.name === moodName);
        if (foundMood) {
          await db.book_mood.findOrCreate({
            where: { bookId: createdBook.id, moodTagId: foundMood.id },
            defaults: { bookId: createdBook.id, moodTagId: foundMood.id },
          });
        }
      }
    }

    // 6. Seed Editorial Picks
    await db.editorial_pick.findOrCreate({
      where: { bookId: books[0].id },
      defaults: {
        bookId: books[0].id,
        tagline: 'Pilihan Editor: Teman Terbaik Mengatasi Overthinking',
        curatorNotes: 'Buku wajib untuk siapa saja yang ingin belajar hidup lebih tenang di tengah kebisingan dunia.',
        curationWeight: 95,
        isActive: true,
      },
    });

    await db.editorial_pick.findOrCreate({
      where: { bookId: books[2].id },
      defaults: {
        bookId: books[2].id,
        tagline: 'Karya Sastra Fenomenal Indonesia',
        curatorNotes: 'Menyajikan perspektif sejarah kemanusiaan dengan narasi yang puitis dan menggetarkan.',
        curationWeight: 90,
        isActive: true,
      },
    });

    // 7. Seed Wishlist
    await db.wishlist.findOrCreate({
      where: { userId: memberUser.id, bookId: books[1].id },
      defaults: {
        userId: memberUser.id,
        bookId: books[1].id,
        priority: 'High',
        reason: 'Ingin memperbaiki rutinitas pagi dan meningkatkan fokus menulis.',
        visibility: 'Public',
      },
    });

    await db.wishlist.findOrCreate({
      where: { userId: memberUser.id, bookId: books[3].id },
      defaults: {
        userId: memberUser.id,
        bookId: books[3].id,
        priority: 'Medium',
        reason: 'Rekomendasi teman untuk memahami sejarah peradaban manusia.',
        visibility: 'Public',
      },
    });

    // 8. Seed Reading Activity (Finished read for Vibe Card)
    await db.reading_activity.findOrCreate({
      where: { userId: memberUser.id, bookId: books[0].id },
      defaults: {
        userId: memberUser.id,
        bookId: books[0].id,
        status: 'Finished',
        startDate: new Date('2026-09-01'),
        finishDate: new Date('2026-09-20'),
        rating: 5,
        quote: 'Kamu tidak bisa mengontrol apa yang orang lain katakan atau perbuat, tapi kamu bisa mengontrol reaksimu.',
        privateNote: 'Sangat relevan saat sedang menghadapi stres kerja bulan lalu. Wajib dibaca ulang tiap tahun.',
        publicReview: 'Buku yang sangat membuka mata tentang bagaimana mengendalikan emosi dan persepsi kita sehari-hari.',
        moodTag: '🧘 Calm & Mindful',
        isSpoiler: false,
        isFlagged: false,
        moderationStatus: 'Approved',
      },
    });

    // Seed Currently Reading
    await db.reading_activity.findOrCreate({
      where: { userId: memberUser.id, bookId: books[4].id },
      defaults: {
        userId: memberUser.id,
        bookId: books[4].id,
        status: 'Reading',
        startDate: new Date('2026-10-15'),
        rating: null,
        quote: 'Antara hidup dan mati ada jutaan pilihan yang belum diambil.',
        privateNote: 'Sudah bab 12, ceritanya sangat menyentuh.',
        moodTag: '🌧️ Melancholy',
        isSpoiler: false,
        isFlagged: false,
        moderationStatus: 'Approved',
      },
    });

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
