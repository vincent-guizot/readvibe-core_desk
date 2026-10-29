import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../contracts/error-codes';

export const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    try {
      const error = validatorFn(req);
      if (error) {
        return next(AppError.badRequest(error, ErrorCodes.VALIDATION_ERROR));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
