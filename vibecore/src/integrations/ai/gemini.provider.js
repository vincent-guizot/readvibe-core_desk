import { ENV } from '../../config/env';
import { AI_CONFIG } from '../../config/ai';
import { logger } from '../../utils/logger';

export class GeminiProvider {
  static async generateContent(prompt) {
    if (!ENV.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY tidak dikonfigurasi di lingkungan server.');
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: AI_CONFIG.MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: AI_CONFIG.TEMPERATURE,
        },
      });

      return response.text;
    } catch (err) {
      logger.warn('Gagal memanggil Gemini API:', err.message);
      throw err;
    }
  }
}
