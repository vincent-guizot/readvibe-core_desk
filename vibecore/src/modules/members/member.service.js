import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class MemberService {
  static async list({ search, status, page = 1, limit = 20 }) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const where = { role: 'Member' };
    if (status && ['Active', 'Suspended'].includes(status)) where.status = status;
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: members } = await db.user.findAndCountAll({
      where,
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    const activityCounts = members.length ? await db.reading_activity.findAll({
      attributes: ['userId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'readingCount']],
      where: { userId: { [Op.in]: members.map((member) => member.id) } }, group: ['userId'], raw: true,
    }) : [];
    const countsById = new Map(activityCounts.map((row) => [row.userId, Number(row.readingCount)]));
    return {
      members: members.map((member) => ({ ...member.toJSON(), readingCount: countsById.get(member.id) || 0 })),
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
      },
    };
  }

  static async getById(id) {
    const member = await db.user.findByPk(id, {
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [
        { model: db.profile, as: 'profile', attributes: ['fullname', 'image'] },
      ],
    });

    if (!member || member.role !== 'Member') {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    const [readingCount, completedCount, wishlistCount] = await Promise.all([
      db.reading_activity.count({ where: { userId: id } }),
      db.reading_activity.count({ where: { userId: id, status: 'Finished' } }),
      db.wishlist.count({ where: { userId: id } }),
    ]);
    return { ...member.toJSON(), activitySummary: { readingCount, completedCount, wishlistCount } };
  }

  static async updateStatus(id, status) {
    if (!['Active', 'Suspended'].includes(status)) throw AppError.badRequest('Status harus Active atau Suspended.');
    const member = await db.user.findByPk(id);
    if (!member || member.role !== 'Member') {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await member.update({ status });
    return { id: member.id, status: member.status };
  }

  static async delete(id) {
    const member = await db.user.findByPk(id);
    if (!member || member.role !== 'Member') {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await member.destroy();
    return member;
  }
}
