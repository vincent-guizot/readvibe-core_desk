export class ApiResponse {
  static getRequestId(res) {
    return (
      res?.req?.id ||
      res?.req?.headers?.['x-request-id'] ||
      (typeof res?.getHeader === 'function' && res.getHeader('X-Request-Id')) ||
      `req_${Math.random().toString(36).substring(2, 10)}`
    );
  }

  static success(res, data = {}, message = 'Operation completed successfully.', statusCode = 200, meta = null) {
    const requestId = this.getRequestId(res);
    return res.status(statusCode).json({
      success: true,
      message,
      data: data !== undefined && data !== null ? data : {},
      meta: meta || null,
      error: null,
      requestId,
    });
  }

  static created(res, data = {}, message = 'Resource created successfully.') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, data = [], paginationMeta, message = 'Operation completed successfully.') {
    const meta = paginationMeta ? { pagination: paginationMeta } : null;
    return ApiResponse.success(res, Array.isArray(data) ? data : [], message, 200, meta);
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errorCode = 'ERROR', details = []) {
    const requestId = this.getRequestId(res);
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      meta: null,
      error: {
        code: errorCode || 'ERROR',
        details: Array.isArray(details) ? details : details ? [details] : [],
      },
      requestId,
    });
  }
}
