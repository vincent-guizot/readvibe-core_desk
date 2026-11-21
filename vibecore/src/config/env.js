import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3360,
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3350,http://localhost:3355')
    .split(',')
    .map((o) => o.trim()),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  READVIBE_URL: process.env.READVIBE_URL || 'http://localhost:3350',
  SMTP: {
    HOST: process.env.SMTP_HOST || '',
    PORT: Number(process.env.SMTP_PORT || 587),
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER || '',
    PASSWORD: process.env.SMTP_PASSWORD || '',
    FROM: process.env.SMTP_FROM || '',
  },
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || '',
  DB: {
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'admin',
    NAME: process.env.DB_NAME || 'readvibe',
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT, 10) || 1000,
  },
};
