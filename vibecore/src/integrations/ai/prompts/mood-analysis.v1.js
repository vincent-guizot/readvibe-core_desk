export const buildMoodAnalysisPrompt = (moodTags, userText) => {
  return `
Analisis kondisi suasana hati pembaca berikut:
Mood Tags Terpilih: ${JSON.stringify(moodTags)}
Curahan Teks Bebas: "${userText}"

Ekstrak mood dominan dan kata kunci emosional dalam format JSON.
`;
};
