export const moodAnalysisSchema = {
  type: 'object',
  properties: {
    dominantMood: { type: 'string' },
    intensity: { type: 'number' },
    keywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['dominantMood', 'keywords'],
};
