import { ENV } from '../../config/env';

// In-memory or persisted configuration settings for curation & AI weights
let currentConfig = {
  curationWeightBonus: 0.15,
  moodMatchBaseScore: 0.70,
  minMatchScoreThreshold: 0.30,
  enableGeminiExplanations: !!ENV.GEMINI_API_KEY,
  googleBooksEnabled: !!ENV.GOOGLE_BOOKS_API_KEY,
};

export class SettingsService {
  static getSettings() {
    return {
      ...currentConfig,
      geminiKeyConfigured: !!ENV.GEMINI_API_KEY,
      googleBooksKeyConfigured: !!ENV.GOOGLE_BOOKS_API_KEY,
      nodeEnv: ENV.NODE_ENV,
      port: ENV.PORT,
      corsOrigins: ENV.CORS_ORIGIN,
    };
  }

  static updateSettings(newSettings) {
    currentConfig = {
      ...currentConfig,
      ...newSettings,
    };
    return currentConfig;
  }
}
