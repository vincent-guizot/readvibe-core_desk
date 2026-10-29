import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class MemberService {
  static async list({ search, role, page = 1, limit = 20 }) {
    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: members } = await db.user.findAndCountAll({
      where,
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [{ model: db.profile, as: 'profile' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    return {
      members,
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
        { model: db.profile, as: 'profile' },
        {
          model: db.wishlist,
          as: 'wishlists',
          include: [{ model: db.book, as: 'book' }],
        },
        {
          model: db.reading_activity,
          as: 'readingActivities',
          include: [{ model: db.book, as: 'book' }],
        },
      ],
    });

    if (!member) {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    return member;
  }

  static async updateStatus(id, status) {
    const member = await db.user.findByPk(id);
    if (!member) {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await member.update({ status });
    return member;
  }

  static async delete(id) {
    const member = await db.user.findByPk(id);
    if (!member) {
      throw AppError.notFound('Member tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await member.destroy();
    return member;
  }
}
