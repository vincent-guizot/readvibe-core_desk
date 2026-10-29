export class Ranker {
  static rank(candidates, selectedMoods = [], queryText = '') {
    const textLower = (queryText || '').toLowerCase();

    const scored = candidates.map((book) => {
      let score = 70;
      const reasons = [];

      // 1. Mood Tag resonance
      const bookMoodNames = (book.moods || []).map((m) => m.name.toLowerCase());
      let moodHits = 0;

      for (const sm of selectedMoods) {
        const cleanSm = sm.toLowerCase();
        if (bookMoodNames.some((bm) => bm.includes(cleanSm) || cleanSm.includes(bm))) {
          moodHits += 1;
        }
      }

      if (moodHits > 0) {
        score += moodHits * 10;
        reasons.push(`Buku ini selaras dengan ${moodHits} preferensi suasana hati yang kamu pilih.`);
      }

      // 2. Keyword matching in title and synopsis
      const content = `${book.title} ${book.description || ''} ${book.genre?.name || ''}`.toLowerCase();
      const keywords = ['overthinking', 'tenang', 'kebiasaan', 'habits', 'sedih', 'hilang', 'sejarah', 'filsafat', 'fokus', 'lelah', 'semangat', 'refleksi'];
      let keywordHits = 0;

      for (const kw of keywords) {
        if (textLower.includes(kw) && content.includes(kw)) {
          keywordHits += 1;
        }
      }

      if (keywordHits > 0) {
        score += keywordHits * 5;
        reasons.push('Tema dan narasi buku ini menjawab keresahan yang kamu ceritakan.');
      }

      // 3. Editorial Pick Curation Weight
      const activePick = (book.editorialPicks || []).find((p) => p.isActive);
      if (activePick) {
        score += Math.round((activePick.curationWeight || 50) * 0.08);
        reasons.push(`Pilihan kurator perpustakaan (${activePick.tagline || 'Rekomendasi Utama'}).`);
      }

      const matchScore = Math.min(98, Math.max(80, score));

      return {
        book,
        matchScore,
        defaultReason: reasons.join(' ') || 'Alur ceritanya akan memberikan ruang refleksi yang menenangkan untukmu.',
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 3);
  }
}
