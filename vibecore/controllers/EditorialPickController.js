import db from '../models';

class EditorialPickController {
  static async getAll(req, res) {
    try {
      const picks = await db.editorial_pick.findAll({
        where: { isActive: true },
        include: [
          {
            model: db.book,
            as: 'book',
            include: [
              { model: db.author, as: 'author' },
              { model: db.genre, as: 'genre' },
              { model: db.mood_tag, as: 'moods' },
            ],
          },
        ],
        order: [['curationWeight', 'DESC']],
      });
      return res.status(200).json({ data: picks });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat editorial picks.', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { bookId, tagline, curatorNotes, curationWeight = 50, isActive = true } = req.body;
      if (!bookId) {
        return res.status(400).json({ message: 'bookId wajib diisi.' });
      }
      const newPick = await db.editorial_pick.create({
        bookId,
        tagline,
        curatorNotes,
        curationWeight: parseInt(curationWeight, 10),
        isActive: !!isActive,
      });

      const fullPick = await db.editorial_pick.findByPk(newPick.id, {
        include: [{ model: db.book, as: 'book' }],
      });

      return res.status(201).json({ message: 'Editorial pick berhasil ditambahkan.', data: fullPick });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menambahkan editorial pick.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const pick = await db.editorial_pick.findByPk(id);
      if (!pick) {
        return res.status(404).json({ message: 'Editorial pick tidak ditemukan.' });
      }

      const { tagline, curatorNotes, curationWeight, isActive } = req.body;
      await pick.update({
        tagline: tagline !== undefined ? tagline : pick.tagline,
        curatorNotes: curatorNotes !== undefined ? curatorNotes : pick.curatorNotes,
        curationWeight: curationWeight !== undefined ? parseInt(curationWeight, 10) : pick.curationWeight,
        isActive: isActive !== undefined ? !!isActive : pick.isActive,
      });

      return res.status(200).json({ message: 'Editorial pick berhasil diperbarui.', data: pick });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui editorial pick.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const pick = await db.editorial_pick.findByPk(id);
      if (!pick) {
        return res.status(404).json({ message: 'Editorial pick tidak ditemukan.' });
      }
      await pick.destroy();
      return res.status(200).json({ message: 'Editorial pick berhasil dihapus.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus editorial pick.', error: error.message });
    }
  }
}

export default EditorialPickController;
