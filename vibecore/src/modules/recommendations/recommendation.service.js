import { CandidateSelector } from './candidate-selector';
import { Ranker } from './ranker';
import { ExplanationGenerator } from './explanation-generator';
import { toBookResource } from '../../contracts/resources/book.resource';
import { SettingsService } from '../settings/settings.service';

export class RecommendationService {
  static async getVibeRecommendations(moodTags = [], queryText = '') {
    // 1. Candidate Selection from Catalog
    const candidates = await CandidateSelector.selectCandidates(moodTags);
    if (!candidates || candidates.length === 0) {
      return [];
    }

    // 2. Ranking Algorithm
    const settings = await SettingsService.getSettings();
    const ranked = Ranker.rank(candidates, moodTags, queryText, settings);

    // 3. Empathetic Explanation Generation (Gemini AI or Heuristic)
    const explained = settings.enableGeminiExplanations
      ? await ExplanationGenerator.generate({ moodTags, queryText }, ranked)
      : ranked.map((item) => ({ ...item, reason: item.defaultReason }));

    return explained.map((item) => ({
      book: toBookResource(item.book),
      matchScore: item.matchScore,
      reason: item.reason,
    }));
  }
}
