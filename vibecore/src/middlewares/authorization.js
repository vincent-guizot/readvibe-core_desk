import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../contracts/error-codes';

export const authorization = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Otentikasi diperlukan.', ErrorCodes.UNAUTHORIZED));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.`,
          ErrorCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
