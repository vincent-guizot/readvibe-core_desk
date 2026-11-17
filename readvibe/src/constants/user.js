/**
 * Initial User Profile & Reading Preferences
 */

export const INITIAL_USER = {
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
