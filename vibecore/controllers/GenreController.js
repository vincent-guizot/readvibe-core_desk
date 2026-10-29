import db from '../models';

class GenreController {
  static async getAllGenres(req, res) {
    try {
      const genres = await db.genre.findAll({
        include: [{ model: db.book, as: 'books', attributes: ['id'] }],
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ data: genres });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat daftar kategori.', error: error.message });
    }
  }

  // Backward compatibility alias
  static async getAllAuthors(req, res) {
    return GenreController.getAllGenres(req, res);
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const genre = await db.genre.findByPk(id, {
        include: [{ model: db.book, as: 'books' }],
      });
      if (!genre) {
        return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
      }
      return res.status(200).json({ data: genre });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat kategori.', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
      }
      const newGenre = await db.genre.create({
        name,
        userId: req.user ? req.user.id : null,
      });
      return res.status(201).json({ message: 'Kategori berhasil ditambahkan.', data: newGenre });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menambahkan kategori.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const genre = await db.genre.findByPk(id);
      if (!genre) {
        return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
      }
      await genre.update({ name: req.body.name || genre.name });
      return res.status(200).json({ message: 'Kategori berhasil diperbarui.', data: genre });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui kategori.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const genre = await db.genre.findByPk(id);
      if (!genre) {
        return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
      }
      await genre.destroy();
      return res.status(200).json({ message: 'Kategori berhasil dihapus.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus kategori.', error: error.message });
    }
  }
}

export default GenreController;
