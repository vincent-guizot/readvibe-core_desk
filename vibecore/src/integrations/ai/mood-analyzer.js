import { GeminiProvider } from './gemini.provider';
import { buildMoodAnalysisPrompt } from './prompts/mood-analysis.v1';
import { logger } from '../../utils/logger';

export class MoodAnalyzer {
  static async analyze(moodTags, queryText) {
    try {
      const prompt = buildMoodAnalysisPrompt(moodTags, queryText);
      const raw = await GeminiProvider.generateContent(prompt);
      return JSON.parse(raw);
    } catch (err) {
      logger.debug('MoodAnalyzer fallback to rule-based keyword extraction');
      return {
        dominantMood: moodTags[0] || 'Calm',
        keywords: (queryText || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      };
    }
  }
}
