// readvibe/src/lib/store.js
'use client';

const INITIAL_BOOKS = [
  {
    id: 'midnight-library',
    slug: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    year: 2020,
    isbn: '978-0525559474',
    genre: 'Contemporary Fiction',
    pages: 304,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.2,
    reviewsCount: 1842,
    coverUrl: '/assets/books/midnight-library.jpg',
    moods: ['Cozy', 'Thoughtful', 'Hopeful', 'Reflective'],
    synopsis: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets? Nora Seed finds herself faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.',
    editorialNote: 'Staff Vibe Pick: Best read on a quiet rainy afternoon with hot tea.',
    quote: 'Between life and death there is a library, and within that library, the shelves go on forever.',
    readingTime: '~5 hrs'
  },
  {
    id: 'comfort-book',
    slug: 'comfort-book',
    title: 'The Comfort Book',
    author: 'Matt Haig',
    year: 2021,
    isbn: '978-0593491362',
    genre: 'Self-Development',
    pages: 272,
    language: 'English',
    format: 'Hardcover & Digital',
    rating: 4.5,
    reviewsCount: 920,
    coverUrl: '/assets/books/comfort-book.jpg',
    moods: ['Warm & Healing', 'Calm', 'Hopeful'],
    synopsis: 'A collection of short, hopeful reflections, lists, and stories written by Matt Haig over several years. A soothing hug in book form, reminding us that we are enough and that dark times always pass.',
    editorialNote: 'Staff Vibe Pick: Keep on your bedside table for moments when you need gentle reassurance.',
    quote: 'Nothing is stronger than a small hope that doesn’t give up.',
    readingTime: '~4 hrs'
  },
  {
    id: 'coffee-cold',
    slug: 'coffee-cold',
    title: 'Before the Coffee Gets Cold',
    author: 'Toshikazu Kawaguchi',
    year: 2019,
    isbn: '978-1335430991',
    genre: 'Fiction',
    pages: 213,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.1,
    reviewsCount: 1420,
    coverUrl: '/assets/books/coffee-cold.jpg',
    moods: ['Bittersweet', 'Reflective', 'Cozy'],
    synopsis: 'In a small back alley in Tokyo, there is a cafe that has been serving carefully brewed coffee for more than a hundred years. But this coffee shop offers its customers a unique experience: the chance to travel back in time, before the coffee gets cold.',
    editorialNote: 'Staff Vibe Pick: Tender, melancholic, and deeply human.',
    quote: 'No matter what difficulties people face, they will always have the strength to overcome them. It just takes a cup of coffee.',
    readingTime: '~3.5 hrs'
  },
  {
    id: 'wild-built',
    slug: 'wild-built',
    title: 'A Psalm for the Wild-Built',
    author: 'Becky Chambers',
    year: 2021,
    isbn: '978-1250236210',
    genre: 'Science Fiction',
    pages: 160,
    language: 'English',
    format: 'Hardcover & Digital',
    rating: 4.4,
    reviewsCount: 780,
    coverUrl: '/assets/books/wild-built.jpg',
    moods: ['Gentle', 'Hopeful', 'Mindful', 'Cozy'],
    synopsis: 'Centuries after robots acquired self-awareness and walked into the wilderness, tea monk Dex encounters Mosscap, a robot seeking to answer the question: What do people need? A solar-punk novella of profound kindness.',
    editorialNote: 'Staff Vibe Pick: A balm for burnout and quiet existential wanderings.',
    quote: 'You do not have to have a reason to be here. You are here, and that is enough.',
    readingTime: '~2.5 hrs'
  },
  {
    id: 'little-prince',
    slug: 'little-prince',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    isbn: '978-0156012195',
    genre: 'Philosophy',
    pages: 96,
    language: 'English',
    format: 'Illustrated Hardcover',
    rating: 4.7,
    reviewsCount: 3450,
    coverUrl: '/assets/books/little-prince.jpg',
    moods: ['Melancholy', 'Thoughtful', 'Nostalgic', 'Gentle'],
    synopsis: 'A gentle pilot stranded in the desert meets an enigmatic young prince fallen from an asteroid, discovering timeless lessons about love, friendship, and what is truly invisible to the eye.',
    editorialNote: 'Classic Vibe: Timeless wisdom wrapped in gentle wonder.',
    quote: 'It is only with the heart that one can see rightly; what is essential is invisible to the eye.',
    readingTime: '~1.5 hrs'
  },
  {
    id: 'morisaki',
    slug: 'morisaki',
    title: 'Days at the Morisaki Bookshop',
    author: 'Satoshi Yagisawa',
    year: 2024,
    isbn: '978-0063278677',
    genre: 'Fiction',
    pages: 160,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.0,
    reviewsCount: 650,
    coverUrl: '/assets/books/morisaki.jpg',
    moods: ['Cozy', 'Warm & Healing', 'Calm'],
    synopsis: 'Set in Tokyo’s famous neighborhood of used bookstores, Jinbocho, a young woman recovers from heartbreak by living above her uncle’s eccentric shop, discovering solace in forgotten paperbacks and quiet tea.',
    editorialNote: 'Staff Vibe Pick: A love letter to bookstores and quiet corners.',
    quote: 'A bookshop is not merely a place where books are sold; it is a haven for the wandering heart.',
    readingTime: '~2.5 hrs'
  },
  {
    id: 'cerulean-sea',
    slug: 'cerulean-sea',
    title: 'The House in the Cerulean Sea',
    author: 'TJ Klune',
    year: 2020,
    isbn: '978-1250217288',
    genre: 'Fantasy',
    pages: 396,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.6,
    reviewsCount: 2150,
    coverUrl: '/assets/books/cerulean-sea.jpg',
    moods: ['Warm & Healing', 'Inspiring', 'Cozy', 'Hopeful'],
    synopsis: 'Linus Baker is a by-the-book caseworker at the Department in Charge of Magical Youth. When tasked with a classified investigation of an eccentric island orphanage, he discovers belonging, kindness, and courage.',
    editorialNote: 'Staff Vibe Pick: Like a warm hug on a cold stormy day.',
    quote: 'You’re too precious to be unloved.',
    readingTime: '~6 hrs'
  },
  {
    id: 'looking-for-library',
    slug: 'looking-for-library',
    title: 'What You Are Looking For Is in the Library',
    author: 'Michiko Aoyama',
    year: 2023,
    isbn: '978-1335005625',
    genre: 'Fiction',
    pages: 272,
    language: 'English',
    format: 'Hardcover & Digital',
    rating: 4.3,
    reviewsCount: 890,
    coverUrl: '/assets/books/looking-for-library.jpg',
    moods: ['Cozy', 'Inspiring', 'Thoughtful', 'Warm & Healing'],
    synopsis: 'In Tokyo, an enigmatic librarian named Sayuri Komachi asks visitors: "What are you looking for?" Along with the requested books, she offers an unexpected recommendation and a tiny felt gift that unlocks each person’s true longing.',
    editorialNote: 'Staff Vibe Pick: Charming, uplifting, and restorative.',
    quote: 'Books don’t give you the answer. They give you the space to find it yourself.',
    readingTime: '~4.5 hrs'
  },
  {
    id: 'klara-sun',
    slug: 'klara-sun',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    year: 2021,
    isbn: '978-0593318171',
    genre: 'Science Fiction',
    pages: 320,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.1,
    reviewsCount: 1670,
    coverUrl: '/assets/books/klara-sun.jpg',
    moods: ['Thoughtful', 'Bittersweet', 'Melancholy'],
    synopsis: 'An artificial friend with keen observational qualities carefully watches the behavior of passersby from her store window, hoping to be chosen by a child she can love and protect.',
    editorialNote: 'Literary Pick: Deeply poignant meditation on love and what makes us human.',
    quote: 'Do you believe in the human heart? I don’t mean simply the organ, obviously. Do you think there is something that makes each of us special and individual?',
    readingTime: '~5.5 hrs'
  },
  {
    id: 'sweet-bean-paste',
    slug: 'sweet-bean-paste',
    title: 'Sweet Bean Paste',
    author: 'Durian Sukegawa',
    year: 2017,
    isbn: '978-1786071958',
    genre: 'Fiction',
    pages: 224,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 4.2,
    reviewsCount: 540,
    coverUrl: '/assets/books/sweet-bean-paste.jpg',
    moods: ['Bittersweet', 'Warm & Healing', 'Mindful'],
    synopsis: 'Sentaro runs a small confectionery shop selling dorayaki pancakes filled with sweet bean paste. When an elderly woman with gnarled hands teaches him the art of listening to red beans, their unlikely friendship brings deep healing.',
    editorialNote: 'Food & Heart: Quietly devastating and uplifting in equal measure.',
    quote: 'Listen to the voice of the beans. To hear what they have to say.',
    readingTime: '~3.5 hrs'
  },
  {
    id: 'convenience-store',
    slug: 'convenience-store',
    title: 'Convenience Store Woman',
    author: 'Sayaka Murata',
    year: 2018,
    isbn: '978-0802128256',
    genre: 'Fiction',
    pages: 176,
    language: 'English',
    format: 'Paperback & Digital',
    rating: 3.9,
    reviewsCount: 1320,
    coverUrl: '/assets/books/convenience-store.jpg',
    moods: ['Thoughtful', 'Escapist', 'Bittersweet'],
    synopsis: 'Keiko Furukura has worked in a Tokyo Smile Mart for 18 years, finding comfort in predictable barcodes and routine, resisting societal pressure to conform to conventional marriage and corporate paths.',
    editorialNote: 'Quirky & Wry: A celebration of living life strictly on one’s own terms.',
    quote: 'A convenience store is a world of sound. From the chime of the door to the beeps of the bar code scanner.',
    readingTime: '~2.8 hrs'
  }
];

const INITIAL_CURRENT_READING = [
  {
    bookId: 'midnight-library',
    currentPage: 142,
    totalPages: 304,
    startedAt: 'Oct 12, 2026',
    notes: 'Reading before bed. Nora is currently visiting the life where she remained in the band with her brother.',
    lastRead: 'Today'
  },
  {
    bookId: 'coffee-cold',
    currentPage: 85,
    totalPages: 213,
    startedAt: 'Oct 20, 2026',
    notes: 'The second story with the husband and wife who is losing her memory is heartbreaking.',
    lastRead: 'Yesterday'
  },
  {
    bookId: 'wild-built',
    currentPage: 50,
    totalPages: 160,
    startedAt: 'Oct 25, 2026',
    notes: 'Mosscap asked Dex why humans drink hot leaf water. Absolutely delightful worldbuilding.',
    lastRead: '3 days ago'
  }
];

const INITIAL_FINISHED_READS = [
  {
    bookId: 'comfort-book',
    finishedAt: 'Oct 24, 2026',
    rating: 5,
    favoriteQuote: 'Nothing is stronger than a small hope that doesn’t give up.',
    moods: ['Warm & Healing', 'Hopeful'],
    privateNotes: 'Helped me through a stressful week of deadlines. Will reread annually.',
    vibeCardTheme: 'Paper'
  },
  {
    bookId: 'little-prince',
    finishedAt: 'Oct 15, 2026',
    rating: 5,
    favoriteQuote: 'It is only with the heart that one can see rightly; what is essential is invisible to the eye.',
    moods: ['Melancholy', 'Nostalgic'],
    privateNotes: 'Timeless masterpiece. Every age brings a whole new depth to this story.',
    vibeCardTheme: 'Twilight'
  },
  {
    bookId: 'cerulean-sea',
    finishedAt: 'Oct 02, 2026',
    rating: 5,
    favoriteQuote: 'You’re too precious to be unloved.',
    moods: ['Warm & Healing', 'Cozy'],
    privateNotes: 'Pure serotonin. Arthur and Linus are unforgettable.',
    vibeCardTheme: 'Botanical'
  },
  {
    bookId: 'morisaki',
    finishedAt: 'Sep 21, 2026',
    rating: 4,
    favoriteQuote: 'A bookshop is not merely a place where books are sold; it is a haven for the wandering heart.',
    moods: ['Cozy', 'Calm'],
    privateNotes: 'Made me want to visit Jinbocho and spend all day reading used books.',
    vibeCardTheme: 'Paper'
  },
  {
    bookId: 'looking-for-library',
    finishedAt: 'Sep 10, 2026',
    rating: 5,
    favoriteQuote: 'Books don’t give you the answer. They give you the space to find it yourself.',
    moods: ['Cozy', 'Inspiring'],
    privateNotes: 'The cat in the library and the felt crafts were so cute.',
    vibeCardTheme: 'Botanical'
  },
  {
    bookId: 'klara-sun',
    finishedAt: 'Aug 29, 2026',
    rating: 4,
    favoriteQuote: 'Do you believe in the human heart?',
    moods: ['Thoughtful', 'Bittersweet'],
    privateNotes: 'Haunting ending that stayed with me for weeks.',
    vibeCardTheme: 'Twilight'
  },
  {
    bookId: 'sweet-bean-paste',
    finishedAt: 'Aug 14, 2026',
    rating: 4,
    favoriteQuote: 'Listen to the voice of the beans. To hear what they have to say.',
    moods: ['Bittersweet', 'Mindful'],
    privateNotes: 'Simple, poetic, and heartwarming.',
    vibeCardTheme: 'Paper'
  },
  {
    bookId: 'convenience-store',
    finishedAt: 'Jul 28, 2026',
    rating: 4,
    favoriteQuote: 'A convenience store is a world of sound.',
    moods: ['Thoughtful', 'Escapist'],
    privateNotes: 'Sharp commentary on social conformity.',
    vibeCardTheme: 'Twilight'
  }
];

const INITIAL_WISHLIST = [
  {
    bookId: 'morisaki',
    priority: 'High',
    reason: 'Recommended by Sarah for cozy winter reading',
    referrer: 'Sarah (Book Club)',
    isPublic: true,
    addedAt: 'Oct 18, 2026'
  },
  {
    bookId: 'looking-for-library',
    priority: 'High',
    reason: 'Saw in a cozy Japanese bookshop reel, perfect for quiet weekends',
    referrer: 'Instagram Reel',
    isPublic: true,
    addedAt: 'Oct 21, 2026'
  },
  {
    bookId: 'klara-sun',
    priority: 'Medium',
    reason: 'Nominated for Booker prize, want to explore Ishiguro’s sci-fi',
    referrer: 'Goodreads',
    isPublic: true,
    addedAt: 'Oct 10, 2026'
  },
  {
    bookId: 'sweet-bean-paste',
    priority: 'Medium',
    reason: 'Need a warm food literature book to unwind with',
    referrer: 'Japanese Lit Podcast',
    isPublic: true,
    addedAt: 'Oct 05, 2026'
  },
  {
    bookId: 'convenience-store',
    priority: 'Low',
    reason: 'Curious about contemporary Tokyo slice-of-life',
    referrer: 'Twitter thread',
    isPublic: false,
    addedAt: 'Sep 28, 2026'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Reading Milestone reached!',
    message: 'You have finished 12 books in 2026! 60% of your annual goal.',
    time: '2 hours ago',
    read: false,
    link: '/stats'
  },
  {
    id: 'notif-2',
    title: 'New Vibe Match for you',
    message: 'Based on your cozy evening reading vibe: "Before the Coffee Gets Cold".',
    time: '1 day ago',
    read: false,
    link: '/books/coffee-cold'
  },
  {
    id: 'notif-3',
    title: 'Maya liked your Vibe Card',
    message: 'Your Vibe Card for "The Midnight Library" was saved to @maya_reads collection.',
    time: '3 days ago',
    read: true,
    link: '/profile'
  }
];

const INITIAL_USER = {
  id: 'user-vincent',
  name: 'Vincent',
  username: 'vincent',
  email: 'vincent@readvibe.app',
  bio: 'Book collector, slow reader, chasing cozy stories and warm coffee.',
  location: 'Jakarta / Bandung',
  joinedDate: 'March 2026',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  stats: {
    finished: 12,
    pages: 3120,
    avgRating: 4.5,
    topMood: 'Cozy',
    currentReading: 3,
    wishlist: 5,
    vibeCards: 8
  },
  topVibes: ['Cozy', 'Mindful', 'Hopeful', 'Thoughtful'],
  favoriteGenres: ['Contemporary Fiction', 'Sci-Fi', 'Japanese Literature', 'Philosophy'],
  readingGoal: { target: 20, completed: 12 }
};

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    bookId: 'midnight-library',
    reviewerName: 'Vincent',
    reviewerUsername: 'vincent',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    date: 'Oct 24, 2026',
    mood: 'Hopeful',
    content: 'An extraordinary novel that made me rethink all the paths I didn’t take in life. Matt Haig has a gentle way of holding up a mirror to our deepest regrets and showing us how beautiful the present actually is.',
    helpfulCount: 38,
    isSpoiler: false
  },
  {
    id: 'rev-2',
    bookId: 'midnight-library',
    reviewerName: 'Maya Lin',
    reviewerUsername: 'maya_reads',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    rating: 4,
    date: 'Oct 19, 2026',
    mood: 'Cozy',
    content: 'Warm and comforting concept. Some of the parallel lives were brief, but the overall message about appreciating the little moments resonated deeply.',
    helpfulCount: 24,
    isSpoiler: false
  },
  {
    id: 'rev-3',
    bookId: 'midnight-library',
    reviewerName: 'Julian Ray',
    reviewerUsername: 'julianbooks',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 4,
    date: 'Oct 04, 2026',
    mood: 'Thoughtful',
    content: 'Read this in two sittings during a rainy weekend. Perfect companion for when you need perspective.',
    helpfulCount: 15,
    isSpoiler: false
  }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

async function apiFetch(path, options = {}) {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('readvibe_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.warn(`[VibeCore Sync] ${path} offline/network notice:`, err.message);
    return null;
  }
}

// Helper to safely get from localStorage
function getLocalItem(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalItem(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export const readVibeStore = {
  // Sync all live data from VibeCore
  syncWithVibeCore: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('readvibe_token');
    if (!token) return;

    try {
      // 1. Sync User Profile
      const meRes = await apiFetch('/api/auth/me');
      if (meRes?.data?.user) {
        const u = meRes.data.user;
        const current = getLocalItem('readvibe_user', INITIAL_USER);
        const merged = {
          ...current,
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.profile?.fullname || u.username,
          avatar: u.profile?.image || current.avatar,
        };
        setLocalItem('readvibe_user', merged);
      }

      // 2. Sync Reading Activities
      const readRes = await apiFetch('/api/reading');
      if (Array.isArray(readRes?.data)) {
        const serverActivities = readRes.data;
        const reading = serverActivities
          .filter((a) => a.status === 'Reading')
          .map((a) => ({
            id: a.id,
            bookId: a.book?.id || a.bookId,
            currentPage: a.currentPage || 1,
            totalPages: a.book?.page || 250,
            startedAt: new Date(a.startDate || a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            notes: a.privateNote || '',
            lastRead: 'Today',
            book: a.book,
          }));

        const finished = serverActivities
          .filter((a) => a.status === 'Finished')
          .map((a) => ({
            id: a.id,
            bookId: a.book?.id || a.bookId,
            finishedAt: new Date(a.finishDate || a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rating: a.rating || 5,
            favoriteQuote: a.quote || '',
            moods: a.moodTag ? [a.moodTag] : ['Cozy'],
            privateNotes: a.privateNote || '',
            vibeCardTheme: 'Paper',
            book: a.book,
          }));

        if (reading.length > 0) setLocalItem('readvibe_current_reading', reading);
        if (finished.length > 0) setLocalItem('readvibe_finished_reads', finished);
      }

      // 3. Sync Wishlist
      const wishRes = await apiFetch('/api/wishlist');
      if (Array.isArray(wishRes?.data)) {
        const items = wishRes.data.map((w) => ({
          id: w.id,
          bookId: w.book?.id || w.bookId,
          priority: w.priority || 'Medium',
          reason: w.reason || '',
          isPublic: w.visibility === 'Public',
          addedAt: new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          book: w.book,
        }));
        setLocalItem('readvibe_wishlist', items);
      }
    } catch (e) {
      console.warn('Sync with VibeCore error:', e);
    }
  },
  // Books
  getBooks: () => {
    return INITIAL_BOOKS;
  },

  getBookById: (id) => {
    return INITIAL_BOOKS.find((b) => b.id === id || b.slug === id) || INITIAL_BOOKS[0];
  },

  // Currently Reading
  getCurrentReading: () => {
    return getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
  },

  updateReadingProgress: (bookId, newPage, notes) => {
    const list = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    let targetItem = null;
    const updated = list.map((item) => {
      if (item.bookId === bookId) {
        targetItem = {
          ...item,
          currentPage: Number(newPage),
          notes: notes !== undefined ? notes : item.notes,
          lastRead: 'Just now'
        };
        return targetItem;
      }
      return item;
    });
    setLocalItem('readvibe_current_reading', updated);

    if (targetItem && targetItem.id) {
      apiFetch(`/api/reading/${targetItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          privateNote: notes,
        }),
      });
    }

    return updated;
  },

  startReadingBook: (bookId) => {
    const list = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    const book = INITIAL_BOOKS.find((b) => b.id === bookId || b.slug === bookId);
    if (!list.some((item) => item.bookId === bookId)) {
      const newItem = {
        bookId: book?.id || bookId,
        currentPage: 1,
        totalPages: book?.pages || 250,
        startedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: '',
        lastRead: 'Today'
      };
      const updated = [newItem, ...list];
      setLocalItem('readvibe_current_reading', updated);
      
      // Remove from wishlist if it was there
      readVibeStore.removeFromWishlist(bookId);

      // Async sync with live VibeCore
      const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 1);
      apiFetch('/api/reading/start', {
        method: 'POST',
        body: JSON.stringify({ bookId: numericId }),
      }).then((res) => {
        if (res?.data?.id) {
          newItem.id = res.data.id;
          setLocalItem('readvibe_current_reading', [newItem, ...list]);
        }
      });

      return updated;
    }
    return list;
  },

  // Finished Reads
  getFinishedReads: () => {
    return getLocalItem('readvibe_finished_reads', INITIAL_FINISHED_READS);
  },

  markBookAsFinished: ({ bookId, rating = 5, favoriteQuote = '', moods = [], privateNotes = '', vibeCardTheme = 'Paper' }) => {
    // Remove from current reading
    const current = getLocalItem('readvibe_current_reading', INITIAL_CURRENT_READING);
    const updatedCurrent = current.filter((item) => item.bookId !== bookId);
    setLocalItem('readvibe_current_reading', updatedCurrent);

    // Add to finished reads
    const finished = getLocalItem('readvibe_finished_reads', INITIAL_FINISHED_READS);
    const newFinishedItem = {
      bookId,
      finishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: Number(rating),
      favoriteQuote,
      moods: moods.length > 0 ? moods : ['Cozy', 'Hopeful'],
      privateNotes,
      vibeCardTheme
    };
    const updatedFinished = [newFinishedItem, ...finished.filter((f) => f.bookId !== bookId)];
    setLocalItem('readvibe_finished_reads', updatedFinished);

    // Update user stats
    const user = readVibeStore.getUser();
    if (user && user.stats) {
      user.stats.finished = (user.stats.finished || 12) + 1;
      setLocalItem('readvibe_user', user);
    }

    // Async sync with live VibeCore
    const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 1);
    apiFetch('/api/reading/finish', {
      method: 'POST',
      body: JSON.stringify({
        bookId: numericId,
        rating: Number(rating),
        quote: favoriteQuote,
        publicReview: favoriteQuote || 'Selesai dibaca via ReadVibe.',
        privateNote: privateNotes,
        moodTag: moods.length > 0 ? moods[0] : 'Thoughtful',
      }),
    });

    return updatedFinished;
  },

  // Wishlist
  getWishlist: () => {
    return getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
  },

  addToWishlist: ({ bookId, priority = 'Medium', reason = '', referrer = '', isPublic = true }) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    const existingIndex = list.findIndex((w) => w.bookId === bookId);
    const entry = {
      bookId,
      priority,
      reason,
      referrer,
      isPublic,
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...list];
    }
    setLocalItem('readvibe_wishlist', updated);

    // Async sync with live VibeCore
    const numericId = typeof bookId === 'number' ? bookId : (!isNaN(Number(bookId)) ? Number(bookId) : 2);
    apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({
        bookId: numericId,
        priority,
        reason,
        visibility: isPublic ? 'Public' : 'Private',
      }),
    }).then((res) => {
      if (res?.data?.id) {
        entry.id = res.data.id;
      }
    });

    return updated;
  },

  removeFromWishlist: (bookId) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    const itemToRemove = list.find((w) => w.bookId === bookId);
    const updated = list.filter((w) => w.bookId !== bookId);
    setLocalItem('readvibe_wishlist', updated);

    if (itemToRemove && itemToRemove.id) {
      apiFetch(`/api/wishlist/${itemToRemove.id}`, { method: 'DELETE' });
    }
    return updated;
  },

  isInWishlist: (bookId) => {
    const list = getLocalItem('readvibe_wishlist', INITIAL_WISHLIST);
    return list.some((w) => w.bookId === bookId);
  },

  // Notifications
  getNotifications: () => {
    return getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
  },

  markAllNotificationsRead: () => {
    const notifs = getLocalItem('readvibe_notifications', INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setLocalItem('readvibe_notifications', updated);
    return updated;
  },

  // User Profile
  getUser: () => {
    return getLocalItem('readvibe_user', INITIAL_USER);
  },

  updateUser: (updates) => {
    const current = getLocalItem('readvibe_user', INITIAL_USER);
    const updated = { ...current, ...updates };
    setLocalItem('readvibe_user', updated);
    return updated;
  },

  // Reviews
  getReviewsForBook: (bookId) => {
    const all = getLocalItem('readvibe_reviews', INITIAL_REVIEWS);
    return all.filter((r) => r.bookId === bookId);
  },

  addReview: ({ bookId, rating, mood, content, isSpoiler = false }) => {
    const all = getLocalItem('readvibe_reviews', INITIAL_REVIEWS);
    const user = readVibeStore.getUser();
    const newRev = {
      id: `rev-${Date.now()}`,
      bookId,
      reviewerName: user.name || 'Vincent',
      reviewerUsername: user.username || 'vincent',
      reviewerAvatar: user.avatar,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      mood: mood || 'Cozy',
      content,
      helpfulCount: 0,
      isSpoiler
    };
    const updated = [newRev, ...all];
    setLocalItem('readvibe_reviews', updated);
    return updated;
  }
};
