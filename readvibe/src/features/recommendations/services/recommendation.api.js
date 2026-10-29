import http from '../../../services/http';

export const recommendationApi = {
  matchVibe: async (moodTags, queryText) => {
    const response = await http.post('/api/recommendations/match', {
      moodTags,
      queryText,
    });
    return response.data;
  },
};
