import db from '../models';

class WishlistController {
  static async getMyWishlist(req, res) {
    try {
      const items = await db.wishlist.findAll({
        where: { userId: req.user.id },
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
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ data: items });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat wishlist.', error: error.message });
    }
  }

  static async getUserPublicWishlist(req, res) {
    try {
      const { userId } = req.params;
      const user = await db.user.findByPk(userId, {
        attributes: ['id', 'username'],
        include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
      });
      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      const items = await db.wishlist.findAll({
        where: {
          userId,
          visibility: 'Public', // Only public wishlists are shown
        },
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
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        user,
        data: items,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat wishlist publik.', error: error.message });
    }
  }

  static async addToWishlist(req, res) {
    try {
      const { bookId, priority = 'Medium', reason = '', visibility = 'Public' } = req.body;
      if (!bookId) {
        return res.status(400).json({ message: 'bookId wajib diisi.' });
      }

      // Check duplicate per user per book
      const existing = await db.wishlist.findOne({
        where: { userId: req.user.id, bookId },
      });
      if (existing) {
        return res.status(409).json({ message: 'Buku ini sudah ada dalam wishlist Anda.' });
      }

      const newWish = await db.wishlist.create({
        userId: req.user.id,
        bookId,
        priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
        reason,
        visibility: visibility === 'Private' ? 'Private' : 'Public',
      });

      const fullItem = await db.wishlist.findByPk(newWish.id, {
        include: [
          {
            model: db.book,
            as: 'book',
            include: [{ model: db.author, as: 'author' }],
          },
        ],
      });

      return res.status(201).json({ message: 'Buku berhasil ditambahkan ke wishlist.', data: fullItem });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menambahkan ke wishlist.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const item = await db.wishlist.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Item wishlist tidak ditemukan.' });
      }

      // Ownership check
      if (item.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Anda tidak memiliki hak untuk mengubah item ini.' });
      }

      const { priority, reason, visibility } = req.body;
      await item.update({
        priority: priority || item.priority,
        reason: reason !== undefined ? reason : item.reason,
        visibility: visibility || item.visibility,
      });

      return res.status(200).json({ message: 'Wishlist berhasil diperbarui.', data: item });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui wishlist.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const item = await db.wishlist.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Item wishlist tidak ditemukan.' });
      }

      // Ownership check
      if (item.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Anda tidak memiliki hak untuk menghapus item ini.' });
      }

      await item.destroy();
      return res.status(200).json({ message: 'Item berhasil dihapus dari wishlist.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus item dari wishlist.', error: error.message });
    }
  }

  // Move from Wishlist to Reading shelf
  static async moveToReading(req, res) {
    try {
      const { id } = req.params;
      const item = await db.wishlist.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Item wishlist tidak ditemukan.' });
      }

      if (item.userId !== req.user.id) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }

      // Create or update reading activity
      const [activity] = await db.reading_activity.findOrCreate({
        where: { userId: req.user.id, bookId: item.bookId },
        defaults: {
          userId: req.user.id,
          bookId: item.bookId,
          status: 'Reading',
          startDate: new Date(),
        },
      });

      if (activity.status !== 'Reading') {
        await activity.update({ status: 'Reading', startDate: new Date() });
      }

      // Remove from wishlist
      await item.destroy();

      return res.status(200).json({
        message: 'Buku berhasil dipindahkan ke rak "Reading".',
        activity,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memindahkan ke rak reading.', error: error.message });
    }
  }
}

export default WishlistController;
