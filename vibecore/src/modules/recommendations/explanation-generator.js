import { GeminiProvider } from '../../integrations/ai/gemini.provider';
import { buildBookExplanationPrompt } from '../../integrations/ai/prompts/book-explanation.v1';
import { logger } from '../../utils/logger';

export class ExplanationGenerator {
  static async generate(userMood, rankedItems) {
    // Attempt Gemini generation if configured
    try {
      const candidatesPayload = rankedItems.map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        author: item.book.author?.pen_name,
        genre: item.book.genre?.name,
        moods: (item.book.moods || []).map((m) => m.name),
        description: item.book.description,
      }));

      const prompt = buildBookExplanationPrompt(userMood, candidatesPayload);
      const rawText = await GeminiProvider.generateContent(prompt);
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return rankedItems.map((item) => {
          const aiMatch = parsed.find((p) => p.bookId === item.book.id);
          return {
            book: item.book,
            matchScore: aiMatch ? aiMatch.matchScore : item.matchScore,
            reason: aiMatch ? aiMatch.reason : item.defaultReason,
          };
        });
      }
    } catch (err) {
      logger.debug('Gemini explanation generation skipped, using heuristic reasoning:', err.message);
    }

    // Fallback: use calculated ranked items
    return rankedItems.map((item) => ({
      book: item.book,
      matchScore: item.matchScore,
      reason: item.defaultReason,
    }));
  }
}
