export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = 'ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}
