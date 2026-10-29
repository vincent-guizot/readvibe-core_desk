import jwt from 'jsonwebtoken';
import db from '../../models';
import { ENV } from '../config/env';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../contracts/error-codes';

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Token otentikasi tidak ditemukan.', ErrorCodes.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await db.user.findByPk(decoded.id, {
      include: [{ model: db.profile, as: 'profile' }],
    });

    if (!user) {
      return next(AppError.unauthorized('Pengguna tidak ditemukan atau token tidak valid.', ErrorCodes.UNAUTHORIZED));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(AppError.unauthorized('Token kedaluwarsa atau tidak valid.', ErrorCodes.UNAUTHORIZED));
  }
};
