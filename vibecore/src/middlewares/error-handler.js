import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';
import { ErrorCodes } from '../contracts/error-codes';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  const details = err.details || [];

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  return ApiResponse.error(res, message, statusCode, errorCode, details);
};
