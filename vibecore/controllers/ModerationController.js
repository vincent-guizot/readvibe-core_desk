import { Op } from 'sequelize';
import db from '../models';

class ModerationController {
  static async getFlaggedReviews(req, res) {
    try {
      const { status } = req.query;
      const where = {};
      if (status) {
        where.moderationStatus = status;
      } else {
        where[Op.or] = [{ isFlagged: true }, { moderationStatus: 'Pending' }];
      }

      const reviews = await db.reading_activity.findAll({
        where,
        include: [
          {
            model: db.user,
            as: 'user',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: db.book,
            as: 'book',
            attributes: ['id', 'title', 'image'],
          },
        ],
        order: [['updatedAt', 'DESC']],
      });

      return res.status(200).json({ data: reviews });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat antrean moderasi.', error: error.message });
    }
  }

  static async updateModerationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, action } = req.body; // status: 'Approved' | 'Rejected' | 'Deleted'
      const review = await db.reading_activity.findByPk(id);
      if (!review) {
        return res.status(404).json({ message: 'Ulasan tidak ditemukan.' });
      }

      if (action === 'delete') {
        // Clear public review text while preserving user's rating / finish status
        await review.update({
          publicReview: null,
          isFlagged: false,
          moderationStatus: 'Rejected',
        });
        return res.status(200).json({ message: 'Konten ulasan publik berhasil dihapus.' });
      }

      const newStatus = ['Approved', 'Rejected', 'Pending'].includes(status) ? status : 'Approved';
      await review.update({
        moderationStatus: newStatus,
        isFlagged: newStatus === 'Approved' ? false : review.isFlagged,
      });

      return res.status(200).json({
        message: `Status moderasi diubah menjadi "${newStatus}".`,
        data: review,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui status moderasi.', error: error.message });
    }
  }
}

export default ModerationController;
