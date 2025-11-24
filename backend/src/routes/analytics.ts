import { Router } from 'express';
import { authenticate, requireOrganization } from '../middleware/auth';
import { Post } from '../models/Post';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrganization);

// Get overview analytics
router.get('/overview', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    const filter: any = { organizationId, status: 'published' };

    if (startDate || endDate) {
      filter['scheduling.publishedAt'] = {};
      if (startDate) filter['scheduling.publishedAt'].$gte = new Date(startDate as string);
      if (endDate) filter['scheduling.publishedAt'].$lte = new Date(endDate as string);
    }

    const posts = await Post.find(filter);

    const metrics = {
      totalPosts: posts.length,
      totalImpressions: posts.reduce((sum, p) => sum + (p.metrics?.impressions || 0), 0),
      totalEngagements: posts.reduce((sum, p) => sum + (p.metrics?.engagements || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.metrics?.comments || 0), 0),
      totalShares: posts.reduce((sum, p) => sum + (p.metrics?.shares || 0), 0),
      averageEngagementRate:
        posts.length > 0
          ? posts.reduce((sum, p) => {
              const impressions = p.metrics?.impressions || 0;
              const engagements = p.metrics?.engagements || 0;
              return sum + (impressions > 0 ? (engagements / impressions) * 100 : 0);
            }, 0) / posts.length
          : 0,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
  }
});

// Get post performance
router.get('/posts/:postId', async (req: any, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        postId: post._id,
        metrics: post.metrics,
        content: post.content,
        publishedAt: post.scheduling.publishedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch post analytics', message: error.message });
  }
});

export default router;
