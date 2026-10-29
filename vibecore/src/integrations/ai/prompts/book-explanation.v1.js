export const buildBookExplanationPrompt = (userMood, candidates) => {
  return `
Kamu adalah Kurator Empatik ReadVibe.
Suasana hati pembaca:
- Mood Tags: ${JSON.stringify(userMood.moodTags)}
- Catatan: "${userMood.queryText}"

Kandidat buku:
${JSON.stringify(candidates)}

Pilih maksimal 3 buku terbaik dan berikan skor kecocokan (80-98%) serta alasan personal 2-3 kalimat mengapa buku ini selaras dengan perasaan pembaca saat ini.
Kembalikan JSON array:
[
  {
    "bookId": number,
    "matchScore": number,
    "reason": string
  }
]
`;
};
