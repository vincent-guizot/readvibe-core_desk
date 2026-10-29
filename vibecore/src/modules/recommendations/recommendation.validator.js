export const validateRecommendationQuery = (req) => {
  const { moodTags, queryText } = req.body;

  if ((!moodTags || moodTags.length === 0) && (!queryText || queryText.trim() === '')) {
    return 'Pilih setidaknya satu mood tag atau tuliskan suasana hatimu saat ini.';
  }

  return null;
};
