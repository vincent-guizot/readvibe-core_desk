import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../models';
import { ENV } from '../../config/env';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }

  static async register({ username, email, password, fullname }) {
    const existingEmail = await db.user.findOne({ where: { email } });
    if (existingEmail) {
      throw AppError.conflict('Email sudah terdaftar.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    const existingUsername = await db.user.findOne({ where: { username } });
    if (existingUsername) {
      throw AppError.conflict('Username sudah digunakan.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profile, user;
    try {
      await db.sequelize.transaction(async (transaction) => {
        profile = await db.profile.create({
          fullname: fullname || username,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        }, { transaction });
        user = await db.user.create({
          username, email, password: hashedPassword, role: 'Member', profileId: profile.id,
        }, { transaction });
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email atau username sudah digunakan.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
      throw error;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile,
      },
    };
  }

  static async login({ email, password }) {
    const user = await db.user.findOne({
      where: { email },
      include: [{ model: db.profile, as: 'profile' }],
    });

    if (!user) {
      throw AppError.unauthorized('Email atau password salah.', ErrorCodes.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized('Email atau password salah.', ErrorCodes.UNAUTHORIZED);
    }

    if (user.status === 'Suspended') throw AppError.forbidden('Akun dinonaktifkan. Hubungi administrator.', ErrorCodes.FORBIDDEN);

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  static async publicProfile(username) {
    const user = await db.user.findOne({ where: { username, status: 'Active' }, attributes: ['id', 'username', 'createdAt'], include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image', 'bio', 'location'] }] });
    if (!user) throw AppError.notFound('Pengguna tidak ditemukan.');
    return user;
  }

  static async changeAccount(userId, payload, action) {
    try {
      await db.sequelize.transaction(async (transaction) => {
        const user = await db.user.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!user || !await bcrypt.compare(payload.currentPassword, user.password)) throw AppError.unauthorized('Password saat ini salah.');
        if (action === 'delete') {
          if (user.role !== 'Member') throw AppError.forbidden('Akun staf harus dikelola melalui VibeDesk.');
          await db.wishlist.destroy({ where: { userId }, transaction });
          await db.reading_activity.destroy({ where: { userId }, transaction });
          await db.password_reset_token.destroy({ where: { userId }, transaction });
          await user.destroy({ transaction });
          await db.profile.destroy({ where: { id: user.profileId }, transaction });
          return;
        }
        const updates = action === 'password' ? { password: await bcrypt.hash(payload.password, 10) } : { email: payload.email.trim().toLowerCase() };
        await user.update({ ...updates, tokenVersion: (user.tokenVersion || 0) + 1 }, { transaction });
        await db.password_reset_token.destroy({ where: { userId }, transaction });
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email sudah digunakan.');
      throw error;
    }
  }

  static async updateProfile(profileId, { fullname, image, bio, location, username, age, nationality, gender }, userId) {
    const profile = await db.profile.findByPk(profileId);
    if (!profile) {
      throw AppError.notFound('Profil tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    try {
      await db.sequelize.transaction(async (transaction) => {
        if (username !== undefined) await db.user.update({ username }, { where: { id: userId, profileId }, transaction });
        await profile.update({ fullname, image, bio, location, age, nationality, gender }, { transaction });
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Username sudah digunakan.');
      throw error;
    }
    return profile;
  }
}
