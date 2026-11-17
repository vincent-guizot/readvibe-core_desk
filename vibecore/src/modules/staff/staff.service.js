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
      include: [
        { model: db.profile, as: 'profile', attributes: ['fullname', 'image'] },
      ],
      order: [
        ['role', 'ASC'],
        ['username', 'ASC'],
      ],
    });
  }

  static async create({
    username,
    email,
    password,
    role,
    fullname,
    status = 'Active',
  }) {
    const existing = await db.user.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
    if (existing) {
      throw AppError.conflict(
        'Email atau username sudah digunakan.',
        ErrorCodes.RESOURCE_ALREADY_EXISTS,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return db.sequelize.transaction(async (transaction) => {
      const profile = await db.profile.create(
        {
          fullname: fullname || username,
          image: null,
        },
        { transaction },
      );

      const user = await db.user.create(
        {
          username,
          email,
          password: hashedPassword,
          role,
          status,
          profileId: profile.id,
        },
        { transaction },
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profile,
      };
    });
  }

  static async getById(id, transaction) {
    const user = await db.user.findByPk(id, {
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [
        { model: db.profile, as: 'profile', attributes: ['fullname', 'image'] },
      ],
      transaction,
    });
    if (!user || !['Admin', 'Librarian'].includes(user.role))
      throw AppError.notFound('Staff tidak ditemukan.');
    return user;
  }

  static async update(id, { role, status }, actorId) {
    return db.sequelize.transaction(async (transaction) => {
      await db.sequelize.query(
        "SELECT pg_advisory_xact_lock(hashtext('vibecore:staff-access'))",
        { transaction },
      );
      const user = await db.user.findByPk(id, { transaction });
      if (!user || !['Admin', 'Librarian'].includes(user.role)) {
        throw AppError.notFound('Staff tidak ditemukan.', ErrorCodes.NOT_FOUND);
      }
      if (role !== undefined && !['Admin', 'Librarian'].includes(role))
        throw AppError.badRequest('Role tidak valid.');
      if (status !== undefined && !['Active', 'Suspended'].includes(status))
        throw AppError.badRequest('Status tidak valid.');
      if (
        String(actorId) === String(id) &&
        (role === 'Librarian' || status === 'Suspended')
      )
        throw AppError.conflict(
          'Admin tidak dapat menonaktifkan atau menurunkan perannya sendiri.',
        );
      if (
        user.role === 'Admin' &&
        user.status === 'Active' &&
        (role === 'Librarian' || status === 'Suspended')
      ) {
        const admins = await db.user.count({
          where: { role: 'Admin', status: 'Active' },
          transaction,
        });
        if (admins <= 1)
          throw AppError.conflict('Minimal satu Admin aktif harus tersedia.');
      }
      await user.update(
        {
          ...(role !== undefined && { role }),
          ...(status !== undefined && { status }),
        },
        { transaction },
      );
      return this.getById(id, transaction);
    });
  }

  static async delete(id, actorId) {
    return db.sequelize.transaction(async (transaction) => {
      await db.sequelize.query(
        "SELECT pg_advisory_xact_lock(hashtext('vibecore:staff-access'))",
        { transaction },
      );
      const user = await db.user.findByPk(id, { transaction });
      if (!user || !['Admin', 'Librarian'].includes(user.role)) {
        throw AppError.notFound('Staff tidak ditemukan.', ErrorCodes.NOT_FOUND);
      }
      if (String(actorId) === String(id))
        throw AppError.conflict('Anda tidak dapat menghapus akun sendiri.');
      if (
        user.role === 'Admin' &&
        user.status === 'Active' &&
        (await db.user.count({
          where: { role: 'Admin', status: 'Active' },
          transaction,
        })) <= 1
      )
        throw AppError.conflict('Admin terakhir tidak dapat dihapus.');
      await user.destroy({ transaction });
      return user;
    });
  }
}
