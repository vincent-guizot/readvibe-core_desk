import db from '../models';

class AIController {
  static async matchVibe(req, res) {
    try {
      const { moodTags = [], queryText = '' } = req.body;

      if ((!moodTags || moodTags.length === 0) && (!queryText || queryText.trim() === '')) {
        return res.status(400).json({
          message: 'Pilih setidaknya satu mood tag atau tulis suasana hatimu saat ini.',
        });
      }

      // Fetch all available books with author, genre, and moods from catalog
      const allBooks = await db.book.findAll({
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          { model: db.mood_tag, as: 'moods' },
          { model: db.editorial_pick, as: 'editorialPicks' },
        ],
      });

      if (allBooks.length === 0) {
        return res.status(200).json({
          matches: [],
          message: 'Katalog buku saat ini masih kosong.',
        });
      }

      // Check if GEMINI_API_KEY is available
      const geminiApiKey = process.env.GEMINI_API_KEY;
      let matchedResults = null;

      if (geminiApiKey) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });

          const catalogSummary = allBooks.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author ? b.author.pen_name : 'Unknown',
            genre: b.genre ? b.genre.name : 'General',
            moods: b.moods ? b.moods.map((m) => m.name) : [],
            description: b.description || '',
          }));

          const prompt = `
Kamu adalah kurator buku empatik ReadVibe.
Pengguna sedang merasakan suasana hati / mood:
- Mood Tags: ${JSON.stringify(moodTags)}
- Catatan Bebas Pengguna: "${queryText}"

Katalog buku yang tersedia:
${JSON.stringify(catalogSummary)}

Tugasmu:
Pilih maksimal 3 buku paling cocok dari katalog di atas yang paling beresonansi dengan emosi pengguna.
Kembalikan JSON murni dalam format:
[
  {
    "bookId": number,
    "matchScore": number (antara 80 hingga 98),
    "reason": "Penjelasan personal 2-3 kalimat mengapa buku ini sangat selaras dengan suasana hati pengguna saat ini."
  }
]
`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          if (response && response.text) {
            const parsed = JSON.parse(response.text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              matchedResults = parsed;
            }
          }
        } catch (aiError) {
          console.warn('Gemini API call failed or timed out, falling back to heuristic vibe matcher:', aiError.message);
        }
      }

      // Fallback: Intelligent heuristic matching based on mood tags, query text, and keywords
      if (!matchedResults) {
        matchedResults = AIController.heuristicVibeMatch(allBooks, moodTags, queryText);
      }

      // Merge match details with full book data
      const finalMatches = matchedResults
        .map((match) => {
          const book = allBooks.find((b) => b.id === match.bookId);
          if (!book) return null;
          return {
            book,
            matchScore: match.matchScore,
            reason: match.reason,
            matchedMoods: book.moods.map((m) => m.name).filter((name) => moodTags.includes(name)),
          };
        })
        .filter(Boolean);

      return res.status(200).json({
        totalMatches: finalMatches.length,
        query: { moodTags, queryText },
        matches: finalMatches,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memproses AI Vibe Matcher.', error: error.message });
    }
  }

  // Heuristic vibe matching algorithm
  static heuristicVibeMatch(allBooks, selectedMoods, queryText) {
    const textLower = (queryText || '').toLowerCase();

    const scored = allBooks.map((book) => {
      let score = 70; // baseline
      const reasons = [];

      // 1. Mood Tag overlap
      const bookMoodNames = (book.moods || []).map((m) => m.name);
      let moodHits = 0;
      for (const sm of selectedMoods) {
        if (bookMoodNames.some((bm) => bm.toLowerCase().includes(sm.toLowerCase()) || sm.toLowerCase().includes(bm.toLowerCase()))) {
          moodHits += 1;
        }
      }

      if (moodHits > 0) {
        score += moodHits * 10;
        reasons.push(`Buku ini memiliki tag suasana hati yang selaras dengan pilihanmu (${moodHits} tag cocok).`);
      }

      // 2. Query Text Keyword resonance
      const content = `${book.title} ${book.description} ${book.genre ? book.genre.name : ''}`.toLowerCase();
      const keywords = ['overthinking', 'tenang', 'kebiasaan', 'habits', 'sedih', 'hilang', 'sejarah', 'filsafat', 'fokus', 'lelah'];
      let keywordHits = 0;

      for (const kw of keywords) {
        if (textLower.includes(kw) && content.includes(kw)) {
          keywordHits += 1;
        }
      }

      if (keywordHits > 0) {
        score += keywordHits * 6;
        reasons.push('Tema dan narasi buku ini secara langsung menjawab keresahan yang kamu ceritakan.');
      }

      // 3. Editorial weight bonus
      if (book.editorialPicks && book.editorialPicks.length > 0) {
        score += 4;
      }

      // Cap between 82 and 98
      const finalScore = Math.min(98, Math.max(82, score));

      if (reasons.length === 0) {
        reasons.push('Alur cerita dan kedalaman karakternya akan memberikan ruang refleksi yang menenangkan untukmu.');
      }

      return {
        bookId: book.id,
        matchScore: finalScore,
        reason: reasons.join(' '),
      };
    });

    // Sort descending by matchScore
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 3);
  }
}

export default AIController;
