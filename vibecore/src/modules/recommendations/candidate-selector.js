import db from '../../../models';

export class CandidateSelector {
  static async selectCandidates(selectedMoods = []) {
    const includeMood = {
      model: db.mood_tag,
      as: 'moods',
      through: { attributes: [] },
    };

    const books = await db.book.findAll({
      include: [
        { model: db.author, as: 'author' },
        { model: db.genre, as: 'genre' },
        includeMood,
        { model: db.editorial_pick, as: 'editorialPicks' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return books;
  }
}
