import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class StaffService {
  static async list() {
    return await db.user.findAll({
      where: {
        role: { [Op.in]: ['Admin', 'Librarian'] },
      },
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [{ model: db.profile, as: 'profile' }],
      order: [['role', 'ASC'], ['username', 'ASC']],
    });
  }

  static async create({ username, email, password, role, fullname }) {
    const existing = await db.user.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
    if (existing) {
      throw AppError.conflict('Email atau username sudah digunakan.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = await db.profile.create({
      fullname: fullname || username,
      image: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    });

    const user = await db.user.create({
      username,
      email,
      password: hashedPassword,
      role,
      profileId: profile.id,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile,
    };
  }

  static async updateRole(id, role) {
    const user = await db.user.findByPk(id);
    if (!user) {
      throw AppError.notFound('Staff tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await user.update({ role });
    return user;
  }

  static async delete(id) {
    const user = await db.user.findByPk(id);
    if (!user) {
      throw AppError.notFound('Staff tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await user.destroy();
    return user;
  }
}
