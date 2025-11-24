import { Router } from 'express';
import authRoutes from './auth';
import organizationRoutes from './organizations';
import postsRoutes from './posts';
import accountsRoutes from './accounts';
import contentRoutes from './content';
import subscriptionRoutes from './subscriptions';
import analyticsRoutes from './analytics';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/organizations/:organizationId/posts', postsRoutes);
router.use('/organizations/:organizationId/accounts', accountsRoutes);
router.use('/organizations/:organizationId/content', contentRoutes);
router.use('/organizations/:organizationId/subscriptions', subscriptionRoutes);
router.use('/organizations/:organizationId/analytics', analyticsRoutes);

export default router;
