import { CandidateSelector } from './candidate-selector';
import { Ranker } from './ranker';
import { ExplanationGenerator } from './explanation-generator';
import { toBookResource } from '../../contracts/resources/book.resource';

export class RecommendationService {
  static async getVibeRecommendations(moodTags = [], queryText = '') {
    // 1. Candidate Selection from Catalog
    const candidates = await CandidateSelector.selectCandidates(moodTags);
    if (!candidates || candidates.length === 0) {
      return [];
    }

    // 2. Ranking Algorithm
    const ranked = Ranker.rank(candidates, moodTags, queryText);

    // 3. Empathetic Explanation Generation (Gemini AI or Heuristic)
    const explained = await ExplanationGenerator.generate({ moodTags, queryText }, ranked);

    return explained.map((item) => ({
      book: toBookResource(item.book),
      matchScore: item.matchScore,
      reason: item.reason,
    }));
  }
}
