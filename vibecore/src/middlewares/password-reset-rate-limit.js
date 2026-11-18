import { AppError } from '../errors/app-error';

export const passwordResetRateLimit = () => {
  const requests = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, entry] of requests) if (entry.resetAt <= now) requests.delete(key);
    const ip = req.ip;
    const entry = requests.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    entry.count += 1;
    requests.set(ip, entry);
    if (entry.count > 5) {
      res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return next(new AppError('Terlalu banyak permintaan reset. Coba lagi nanti.', 429, 'TOO_MANY_REQUESTS'));
    }
    next();
  };
};
