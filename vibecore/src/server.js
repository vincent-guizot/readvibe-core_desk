import app from './app';
import db from '../models';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const PORT = ENV.PORT || 3360;

let server;

async function startServer() {
  try {
    // Authenticate database connection
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully with PostgreSQL (library_ms).');

    // Start listening
    server = app.listen(PORT, () => {
      logger.info(`VibeCore API Server running at http://localhost:${PORT}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
      logger.info(`Allowed CORS Origins: ${ENV.CORS_ORIGIN.join(', ')}`);
    });
  } catch (error) {
    logger.error('Unable to connect to database or start VibeCore server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down VibeCore server gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await db.sequelize.close();
        logger.info('Database connections closed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing database connection:', err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
