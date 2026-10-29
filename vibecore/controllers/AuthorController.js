import db from '../models';

class AuthorController {
  static async getAllAuthors(req, res) {
    try {
      const authors = await db.author.findAll({
        include: [{ model: db.book, as: 'books', attributes: ['id', 'title'] }],
        order: [['pen_name', 'ASC']],
      });
      return res.status(200).json({ data: authors });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat daftar penulis.', error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const author = await db.author.findByPk(id, {
        include: [{ model: db.book, as: 'books' }],
      });
      if (!author) {
        return res.status(404).json({ message: 'Penulis tidak ditemukan.' });
      }
      return res.status(200).json({ data: author });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat detail penulis.', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { pen_name } = req.body;
      if (!pen_name) {
        return res.status(400).json({ message: 'Nama pena / penulis wajib diisi.' });
      }
      const newAuthor = await db.author.create({
        pen_name,
        userId: req.user ? req.user.id : null,
      });
      return res.status(201).json({ message: 'Penulis berhasil ditambahkan.', data: newAuthor });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menambahkan penulis.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const author = await db.author.findByPk(id);
      if (!author) {
        return res.status(404).json({ message: 'Penulis tidak ditemukan.' });
      }
      await author.update({ pen_name: req.body.pen_name || author.pen_name });
      return res.status(200).json({ message: 'Data penulis berhasil diperbarui.', data: author });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui penulis.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const author = await db.author.findByPk(id);
      if (!author) {
        return res.status(404).json({ message: 'Penulis tidak ditemukan.' });
      }
      await author.destroy();
      return res.status(200).json({ message: 'Penulis berhasil dihapus.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus penulis.', error: error.message });
    }
  }

  static async bookList(req, res) {
    try {
      const { id } = req.params;
      const books = await db.book.findAll({
        where: { authorId: id },
        include: [{ model: db.genre, as: 'genre' }],
      });
      return res.status(200).json({ data: books });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat buku penulis.', error: error.message });
    }
  }
}

export default AuthorController;
