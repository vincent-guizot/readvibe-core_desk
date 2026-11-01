import http from '@/services/http';

export const recommendationApi = {
  matchVibe: async (moodTags, queryText) => {
    try {
      const response = await http.post('/api/recommendations/match', {
        moodTags,
        queryText,
      });
      return response.data;
    } catch (err) {
      console.warn('[AI Matcher] Live API unavailable, falling back to local engine:', err.message);
      return null;
    }
  },

  getEditorialPicks: async () => {
    try {
      const response = await http.get('/api/recommendations/editorial');
      return response.data;
    } catch (err) {
      console.warn('[AI Matcher] Editorial picks fallback:', err.message);
      return null;
    }
  },

  /**
   * Local heuristic AI Vibe Matcher fallback
   * Calculates similarity score based on mood tags, query text, genre, and page length
   */
  calculateLocalVibeMatch: (books = [], { moodTags = [], queryText = '', genre = 'Any genre', maxLength = 'Any length', finishedIds = [] }) => {
    const q = queryText.toLowerCase().trim();
    const queryTokens = q ? q.split(/\s+/) : [];

    const scored = books
      .filter((book) => {
        // Exclude finished if applicable
        if (finishedIds.includes(book.id) || finishedIds.includes(book.slug)) {
          return false;
        }

        // Filter genre if specific
        if (genre !== 'Any genre' && book.genre && !book.genre.toLowerCase().includes(genre.toLowerCase())) {
          return false;
        }

        // Filter page length
        if (maxLength === 'Under 300 pages' && book.pages > 300) return false;
        if (maxLength === '300 - 500 pages' && (book.pages < 300 || book.pages > 500)) return false;

        return true;
      })
      .map((book) => {
        let score = 70; // baseline score

        // 1. Mood resonance
        if (moodTags.length > 0 && book.moods) {
          const matchedMoodCount = book.moods.filter((bm) =>
            moodTags.some((sm) => bm.toLowerCase().includes(sm.toLowerCase()))
          ).length;
          score += matchedMoodCount * 8;
        }

        // 2. Query text semantic overlap
        if (queryTokens.length > 0) {
          const bookText = `${book.title} ${book.synopsis || ''} ${book.genre || ''} ${book.editorialNote || ''}`.toLowerCase();
          queryTokens.forEach((token) => {
            if (token.length > 3 && bookText.includes(token)) {
              score += 4;
            }
          });
        }

        // Clamp score between 75% and 98%
        const finalScore = Math.min(Math.max(score, 75), 98);

        // Generate dynamic explanation
        const topMood = book.moods?.[0] || 'Reflective';
        let whyFits = book.editorialNote || `Buku ini memancarkan suasana ${topMood.toLowerCase()} yang selaras dengan frekuensi hatimu saat ini.`;
        if (moodTags.length > 0) {
          whyFits = `Dipilih karena menghadirkan nuansa ${moodTags.join(' & ')} yang pas dengan pencarianmu: ${book.synopsis?.slice(0, 110) || ''}...`;
        }

        return {
          id: book.slug || book.id,
          title: book.title,
          author: book.author,
          rating: book.rating?.toString() || '4.5',
          reviews: book.reviewsCount ? book.reviewsCount.toLocaleString() : '1,240',
          category: book.genre || 'Fiction',
          tag: topMood,
          matchScore: `${finalScore}% match`,
          scoreValue: finalScore,
          isTopPick: false,
          coverUrl: book.coverUrl || '/assets/books/midnight-library.jpg',
          whyFits,
          book,
        };
      });

    // Sort by score descending
    scored.sort((a, b) => b.scoreValue - a.scoreValue);

    // Top pick for the highest score
    if (scored.length > 0) {
      scored[0].isTopPick = true;
    }

    return scored.slice(0, 4);
  },
};

export default recommendationApi;
