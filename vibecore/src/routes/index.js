import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import bookRoutes from '../modules/books/book.routes';
import recommendationRoutes from '../modules/recommendations/recommendation.routes';
import readingRoutes from '../modules/reading/reading.routes';
import wishlistRoutes from '../modules/wishlists/wishlist.routes';
import reviewRoutes from '../modules/reviews/review.routes';
import moodRoutes from '../modules/moods/mood.routes';
import editorialRoutes from '../modules/editorial/editorial.routes';
import authorRoutes from '../modules/authors/author.routes';
import categoryRoutes from '../modules/categories/category.routes';
import memberRoutes from '../modules/members/member.routes';
import moderationRoutes from '../modules/moderation/moderation.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import staffRoutes from '../modules/staff/staff.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import googleBooksRoutes from '../integrations/google-books/google-books.routes';

const router = Router();

// Base status check
router.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'VibeCore API',
    version: '1.0.0',
    documentation: '/Documentations/README.md',
    originsAllowed: ['http://localhost:3350', 'http://localhost:3355'],
    port: 3360,
  });
});

// Module routes
router.use('/api/auth', authRoutes);
router.use('/api/books', bookRoutes);
router.use('/api/recommendations', recommendationRoutes);
router.use('/api/ai', recommendationRoutes); // Alias
router.use('/api/reading', readingRoutes);
router.use('/api/reading-activities', readingRoutes); // Alias
router.use('/api/wishlists', wishlistRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/moods', moodRoutes);
router.use('/api/editorial', editorialRoutes);
router.use('/api/editorial-picks', editorialRoutes); // Alias
router.use('/api/authors', authorRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/genres', categoryRoutes); // Alias
router.use('/api/members', memberRoutes);
router.use('/api/users', memberRoutes); // Alias
router.use('/api/moderation', moderationRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/staff', staffRoutes);
router.use('/api/settings', settingsRoutes);
router.use('/api/integrations/google-books', googleBooksRoutes);

export default router;
