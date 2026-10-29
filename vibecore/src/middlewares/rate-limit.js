// Simple in-memory sliding window rate limiter
const requestCounts = new Map();

export const rateLimit = (limit = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const entry = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    } else {
      entry.count += 1;
    }

    requestCounts.set(ip, entry);

    if (entry.count > limit) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        errorCode: 'TOO_MANY_REQUESTS',
        message: 'Batas frekuensi permintaan terlampaui. Silakan coba sesaat lagi.',
      });
    }

    next();
  };
};
