import express from 'express';
import { requestId } from './middlewares/request-id';
import { corsMiddleware } from './config/cors';
import { rateLimit } from './middlewares/rate-limit';
import { notFound } from './middlewares/not-found';
import { errorHandler } from './middlewares/error-handler';
import routes from './routes';

const app = express();

// Global Middlewares
app.use(requestId);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit(500, 60 * 1000)); // 500 requests per minute

// Health Check at root
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'VibeCore API',
    status: 'healthy',
    documentation: '/Documentations/README.md',
    originsAllowed: ['http://localhost:3350', 'http://localhost:3355'],
    port: 3360,
  });
});

// Mount Routes
app.use(routes);

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
