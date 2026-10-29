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
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }

  static async register({ username, email, password, fullname, role = 'Member' }) {
    const existingEmail = await db.user.findOne({ where: { email } });
    if (existingEmail) {
      throw AppError.conflict('Email sudah terdaftar.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    const existingUsername = await db.user.findOne({ where: { username } });
    if (existingUsername) {
      throw AppError.conflict('Username sudah digunakan.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
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
      role: role === 'Admin' || role === 'Librarian' ? role : 'Member',
      profileId: profile.id,
    });

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

  static async updateProfile(profileId, { fullname, image, age, nationality, gender }) {
    const profile = await db.profile.findByPk(profileId);
    if (!profile) {
      throw AppError.notFound('Profil tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await profile.update({ fullname, image, age, nationality, gender });
    return profile;
  }
}
