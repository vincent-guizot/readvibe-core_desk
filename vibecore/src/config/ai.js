import { ENV } from './env';

export const AI_CONFIG = {
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.7,
  MAX_OUTPUT_TOKENS: 1024,
  IS_CONFIGURED: !!ENV.GEMINI_API_KEY,
};
