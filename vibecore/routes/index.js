import { Router } from 'express';
import authRoutes from './auth';
import bookRoutes from './book';
import authorRoutes from './author';
import genreRoutes from './genre';
import moodRoutes from './mood';
import editorialPickRoutes from './editorial_pick';
import wishlistRoutes from './wishlist';
import readingActivityRoutes from './reading_activity';
import moderationRoutes from './moderation';
import analyticsRoutes from './analytics';
import userRoutes from './user';
import aiRoutes from './ai';
import googleBooksRoutes from './google_books';

const router = Router();

// Base status check
router.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'VibeCore API',
    version: '1.0.0',
    documentation: '/Documentations/README.md',
    originsAllowed: ['http://localhost:3350', 'http://localhost:3355'],
  });
});

// Register routes
router.use('/api/auth', authRoutes);
router.use('/api/books', bookRoutes);
router.use('/api/authors', authorRoutes);
router.use('/api/genres', genreRoutes);
router.use('/api/moods', moodRoutes);
router.use('/api/editorial-picks', editorialPickRoutes);
router.use('/api/wishlists', wishlistRoutes);
router.use('/api/reading-activities', readingActivityRoutes);
router.use('/api/moderation', moderationRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/users', userRoutes);
router.use('/api/ai', aiRoutes);
router.use('/api/integrations/google-books', googleBooksRoutes);

export default router;
