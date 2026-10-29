import { RecommendationService } from './recommendation.service';
import { ApiResponse } from '../../utils/api-response';

export class RecommendationController {
  static async matchVibe(req, res, next) {
    try {
      const { moodTags = [], queryText = '' } = req.body;
      const matches = await RecommendationService.getVibeRecommendations(moodTags, queryText);

      return ApiResponse.success(res, {
        totalMatches: matches.length,
        query: { moodTags, queryText },
        matches,
      }, 'Rekomendasi buku berhasil ditemukan');
    } catch (err) {
      next(err);
    }
  }
}
