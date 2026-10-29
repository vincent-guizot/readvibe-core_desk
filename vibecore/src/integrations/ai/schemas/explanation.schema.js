export const explanationSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      bookId: { type: 'number' },
      matchScore: { type: 'number' },
      reason: { type: 'string' },
    },
    required: ['bookId', 'matchScore', 'reason'],
  },
};
