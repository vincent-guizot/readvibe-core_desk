import { Op } from 'sequelize';
import db from '../models';

class ReadingActivityController {
  static async getMyActivities(req, res) {
    try {
      const { status } = req.query;
      const where = { userId: req.user.id };
      if (status) where.status = status;

      const activities = await db.reading_activity.findAll({
        where,
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
        order: [['updatedAt', 'DESC']],
      });
      return res.status(200).json({ data: activities });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat aktivitas membaca.', error: error.message });
    }
  }

  static async getUserFinishedReads(req, res) {
    try {
      const { userId } = req.params;
      const user = await db.user.findByPk(userId, {
        attributes: ['id', 'username'],
        include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
      });
      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      // Explicitly exclude privateNote from public view!
      const finished = await db.reading_activity.findAll({
        where: {
          userId,
          status: 'Finished',
          moderationStatus: 'Approved',
        },
        attributes: [
          'id',
          'userId',
          'bookId',
          'status',
          'startDate',
          'finishDate',
          'rating',
          'quote',
          'publicReview',
          'moodTag',
          'isSpoiler',
          'createdAt',
        ],
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
        order: [['finishDate', 'DESC']],
      });

      return res.status(200).json({ user, data: finished });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat buku yang telah selesai dibaca.', error: error.message });
    }
  }

  // Status transition validation: Want to Read -> Reading -> Finished
  static async transitionStatus(req, res) {
    try {
      const { bookId, newStatus, rating, quote, privateNote, publicReview, moodTag, isSpoiler } = req.body;
      if (!bookId || !newStatus) {
        return res.status(400).json({ message: 'bookId dan newStatus wajib diisi.' });
      }

      const validStatuses = ['Want to Read', 'Reading', 'Finished'];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}` });
      }

      const [activity, created] = await db.reading_activity.findOrCreate({
        where: { userId: req.user.id, bookId },
        defaults: {
          userId: req.user.id,
          bookId,
          status: newStatus,
          startDate: newStatus === 'Reading' ? new Date() : null,
          finishDate: newStatus === 'Finished' ? new Date() : null,
        },
      });

      if (!created) {
        // Validate transition
        const currentStatus = activity.status;
        const validTransitions = {
          'Want to Read': ['Reading', 'Finished'],
          Reading: ['Finished', 'Want to Read'],
          Finished: ['Reading'], // re-reading
        };

        if (currentStatus !== newStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
          return res.status(400).json({
            message: `Transisi tidak valid dari "${currentStatus}" ke "${newStatus}".`,
          });
        }

        const updates = { status: newStatus };
        if (newStatus === 'Reading' && !activity.startDate) {
          updates.startDate = new Date();
        }
        if (newStatus === 'Finished') {
          updates.finishDate = new Date();
          if (rating) updates.rating = parseInt(rating, 10);
          if (quote !== undefined) updates.quote = quote;
          if (privateNote !== undefined) updates.privateNote = privateNote;
          if (publicReview !== undefined) updates.publicReview = publicReview;
          if (moodTag !== undefined) updates.moodTag = moodTag;
          if (isSpoiler !== undefined) updates.isSpoiler = !!isSpoiler;
        }

        await activity.update(updates);
      }

      // If transitioning to Reading or Finished, remove from Wishlist automatically
      if (['Reading', 'Finished'].includes(newStatus)) {
        await db.wishlist.destroy({ where: { userId: req.user.id, bookId } });
      }

      const fullActivity = await db.reading_activity.findByPk(activity.id, {
        include: [
          {
            model: db.book,
            as: 'book',
            include: [{ model: db.author, as: 'author' }],
          },
        ],
      });

      return res.status(200).json({
        message: `Status membaca berhasil diubah menjadi "${newStatus}".`,
        data: fullActivity,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mengubah status membaca.', error: error.message });
    }
  }

  // Mark finished with review, quote, and mood for Vibe Card
  static async finishAndReview(req, res) {
    try {
      const { bookId, rating, quote, privateNote, publicReview, moodTag, isSpoiler = false } = req.body;
      if (!bookId) {
        return res.status(400).json({ message: 'bookId wajib diisi.' });
      }

      // Duplicate check: update if exists or create
      const [activity] = await db.reading_activity.findOrCreate({
        where: { userId: req.user.id, bookId },
        defaults: {
          userId: req.user.id,
          bookId,
          status: 'Finished',
          startDate: new Date(),
          finishDate: new Date(),
          rating: rating ? parseInt(rating, 10) : 5,
          quote: quote || '',
          privateNote: privateNote || '',
          publicReview: publicReview || '',
          moodTag: moodTag || '',
          isSpoiler: !!isSpoiler,
          moderationStatus: 'Approved',
        },
      });

      await activity.update({
        status: 'Finished',
        finishDate: activity.finishDate || new Date(),
        rating: rating !== undefined ? parseInt(rating, 10) : activity.rating,
        quote: quote !== undefined ? quote : activity.quote,
        privateNote: privateNote !== undefined ? privateNote : activity.privateNote,
        publicReview: publicReview !== undefined ? publicReview : activity.publicReview,
        moodTag: moodTag !== undefined ? moodTag : activity.moodTag,
        isSpoiler: isSpoiler !== undefined ? !!isSpoiler : activity.isSpoiler,
      });

      // Clear from wishlist
      await db.wishlist.destroy({ where: { userId: req.user.id, bookId } });

      const fullData = await db.reading_activity.findByPk(activity.id, {
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
      });

      return res.status(200).json({
        message: 'Buku berhasil ditandai selesai dibaca dan kartu Vibe siap dibagikan!',
        data: fullData,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menyimpan ulasan.', error: error.message });
    }
  }

  // Report/Flag review for spam or spoiler
  static async flagReview(req, res) {
    try {
      const { id } = req.params;
      const { flagReason = 'Spam or Spoiler' } = req.body;

      const activity = await db.reading_activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: 'Ulasan tidak ditemukan.' });
      }

      await activity.update({
        isFlagged: true,
        flagReason,
        moderationStatus: 'Pending',
      });

      return res.status(200).json({
        message: 'Laporan berhasil dikirim dan akan dimoderasi oleh tim kurator.',
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal melaporkan ulasan.', error: error.message });
    }
  }
}

export default ReadingActivityController;
