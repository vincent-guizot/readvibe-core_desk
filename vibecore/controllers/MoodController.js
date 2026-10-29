import db from '../models';

class MoodController {
  static async getAllMoods(req, res) {
    try {
      const moods = await db.mood_tag.findAll({
        include: [{ model: db.book, as: 'books', attributes: ['id', 'title'] }],
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ data: moods });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat mood tags.', error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const mood = await db.mood_tag.findByPk(id, {
        include: [
          {
            model: db.book,
            as: 'books',
            include: [{ model: db.author, as: 'author' }],
          },
        ],
      });
      if (!mood) {
        return res.status(404).json({ message: 'Mood tag tidak ditemukan.' });
      }
      return res.status(200).json({ data: mood });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat mood tag.', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, icon, color, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Nama mood wajib diisi.' });
      }
      const existing = await db.mood_tag.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ message: 'Mood tag dengan nama ini sudah ada.' });
      }
      const newMood = await db.mood_tag.create({ name, icon, color, description });
      return res.status(201).json({ message: 'Mood tag berhasil dibuat.', data: newMood });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal membuat mood tag.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const mood = await db.mood_tag.findByPk(id);
      if (!mood) {
        return res.status(404).json({ message: 'Mood tag tidak ditemukan.' });
      }
      const { name, icon, color, description } = req.body;
      await mood.update({
        name: name || mood.name,
        icon: icon !== undefined ? icon : mood.icon,
        color: color !== undefined ? color : mood.color,
        description: description !== undefined ? description : mood.description,
      });
      return res.status(200).json({ message: 'Mood tag berhasil diperbarui.', data: mood });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui mood tag.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const mood = await db.mood_tag.findByPk(id);
      if (!mood) {
        return res.status(404).json({ message: 'Mood tag tidak ditemukan.' });
      }
      await mood.destroy();
      return res.status(200).json({ message: 'Mood tag berhasil dihapus.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus mood tag.', error: error.message });
    }
  }

  static async assignMoodToBook(req, res) {
    try {
      const { bookId, moodTagId } = req.body;
      if (!bookId || !moodTagId) {
        return res.status(400).json({ message: 'bookId dan moodTagId wajib diisi.' });
      }
      const [bookMood, created] = await db.book_mood.findOrCreate({
        where: { bookId, moodTagId },
        defaults: { bookId, moodTagId },
      });
      return res.status(200).json({
        message: created ? 'Mood berhasil ditautkan ke buku.' : 'Mood sudah ditautkan sebelumnya.',
        data: bookMood,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menautkan mood ke buku.', error: error.message });
    }
  }
}

export default MoodController;
