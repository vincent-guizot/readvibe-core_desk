import { ApiResponse } from '../utils/api-response';
import { ErrorCodes } from '../contracts/error-codes';

export const notFound = (req, res) => {
  return ApiResponse.error(
    res,
    `Rute endpoint '${req.method} ${req.originalUrl}' tidak ditemukan pada VibeCore API.`,
    404,
    ErrorCodes.NOT_FOUND,
    []
  );
};
