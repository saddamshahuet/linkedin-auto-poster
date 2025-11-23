import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Post } from '../models/Post';

export class PostsController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { organizationId } = req.params;
      const { linkedinAccountId, content, scheduledFor, timezone } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const post = await Post.create({
        organizationId,
        linkedinAccountId,
        status: scheduledFor ? 'scheduled' : 'draft',
        content: {
          text: content.text || '',
          hashtags: content.hashtags || [],
          mentions: content.mentions || [],
          mediaUrls: content.mediaUrls || [],
        },
        generatedBy: {
          method: content.generatedBy?.method || 'manual',
          modelName: content.generatedBy?.modelName,
          prompt: content.generatedBy?.prompt,
          templateId: content.generatedBy?.templateId,
        },
        scheduling: {
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          timezone: timezone || 'UTC',
        },
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Failed to create post', message: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { organizationId } = req.params;
      const { status, linkedinAccountId, limit = 50, offset = 0 } = req.query;

      const filter: any = { organizationId };

      if (status) filter.status = status;
      if (linkedinAccountId) filter.linkedinAccountId = linkedinAccountId;

      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      const total = await Post.countDocuments(filter);

      res.json({
        success: true,
        data: {
          posts,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: total > Number(offset) + Number(limit),
          },
        },
      });
    } catch (error: any) {
      console.error('List posts error:', error);
      res.status(500).json({ error: 'Failed to list posts', message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Failed to get post', message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const updates = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          ...updates,
          updatedBy: req.user.id,
        },
        { new: true }
      );

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Failed to update post', message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await Post.findByIdAndDelete(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post', message: error.message });
    }
  }

  static async publish(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Queue for immediate publishing
      const { publishQueue } = require('../jobs/queues');
      await publishQueue.add('publish-post', { postId: post._id.toString() });

      await Post.findByIdAndUpdate(postId, { status: 'scheduled' });

      res.json({
        success: true,
        message: 'Post queued for publishing',
      });
    } catch (error: any) {
      console.error('Publish post error:', error);
      res.status(500).json({ error: 'Failed to publish post', message: error.message });
    }
  }

  static async getScheduled(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate } = req.query;

      const filter: any = {
        organizationId,
        status: 'scheduled',
      };

      if (startDate || endDate) {
        filter['scheduling.scheduledFor'] = {};
        if (startDate) filter['scheduling.scheduledFor'].$gte = new Date(startDate as string);
        if (endDate) filter['scheduling.scheduledFor'].$lte = new Date(endDate as string);
      }

      const posts = await Post.find(filter).sort({ 'scheduling.scheduledFor': 1 });

      res.json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      console.error('Get scheduled posts error:', error);
      res.status(500).json({ error: 'Failed to get scheduled posts', message: error.message });
    }
  }
}
