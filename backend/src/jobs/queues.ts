import { Queue, Worker } from 'bullmq';
import { redis } from '../config/database';
import { Post } from '../models/Post';
import { LinkedInPublisherService } from '../services/linkedinPublisher';

// Create queues
export const publishQueue = new Queue('publish-posts', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 50,
    },
  },
});

export const contentGenerationQueue = new Queue('content-generation', {
  connection: redis,
});

export const analyticsQueue = new Queue('analytics-update', {
  connection: redis,
});

// Publish Worker
const publishWorker = new Worker(
  'publish-posts',
  async (job) => {
    const { postId } = job.data;
    console.log(`Processing publish job for post: ${postId}`);

    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const publisher = new LinkedInPublisherService();
      const result = await publisher.publish({
        text: post.content.text,
        mediaUrls: post.content.mediaUrls,
        accountId: post.linkedinAccountId,
      });

      await publisher.close();

      if (result.success) {
        await Post.findByIdAndUpdate(postId, {
          status: 'published',
          'scheduling.publishedAt': new Date(),
          'linkedinData.postUrl': result.postUrl,
          'linkedinData.postId': result.postId,
          'linkedinData.screenshotUrl': result.screenshotUrl,
        });

        console.log(`✅ Post ${postId} published successfully`);
        return { success: true, postUrl: result.postUrl };
      } else {
        await Post.findByIdAndUpdate(postId, {
          status: 'failed',
        });

        throw new Error(result.error || 'Publishing failed');
      }
    } catch (error: any) {
      console.error(`❌ Failed to publish post ${postId}:`, error.message);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3, // Process up to 3 posts simultaneously
  }
);

// Content Generation Worker
const contentGenerationWorker = new Worker(
  'content-generation',
  async (job) => {
    const { organizationId, prompt, count } = job.data;
    console.log(`Generating ${count} posts for organization: ${organizationId}`);

    const { ContentGeneratorService } = require('../services/contentGenerator');
    const generator = new ContentGeneratorService();

    const prompts = Array(count).fill(prompt);
    const results = await generator.bulkGenerate(prompts, {
      tone: 'professional',
      length: 'medium',
    });

    // Save generated posts as drafts
    for (const content of results) {
      await Post.create({
        organizationId,
        linkedinAccountId: job.data.linkedinAccountId,
        status: 'draft',
        content: {
          text: content.text,
          hashtags: content.hashtags,
          mentions: [],
          mediaUrls: [],
        },
        generatedBy: {
          method: 'ai',
          modelName: 'llama3',
          prompt,
        },
        scheduling: {
          timezone: 'UTC',
        },
        createdBy: job.data.userId,
      });
    }

    console.log(`✅ Generated ${count} posts for organization ${organizationId}`);
    return { success: true, count: results.length };
  },
  {
    connection: redis,
  }
);

// Analytics Worker
const analyticsWorker = new Worker(
  'analytics-update',
  async (job) => {
    const { postId } = job.data;
    console.log(`Updating analytics for post: ${postId}`);

    // This is a placeholder - in production, you would:
    // 1. Scrape LinkedIn for updated metrics
    // 2. Use LinkedIn API if available
    // 3. Update the post's metrics in the database

    const post = await Post.findById(postId);
    if (!post) return;

    // Simulate metrics update (replace with actual scraping)
    const updatedMetrics = {
      impressions: (post.metrics?.impressions || 0) + Math.floor(Math.random() * 100),
      likes: (post.metrics?.likes || 0) + Math.floor(Math.random() * 10),
      comments: (post.metrics?.comments || 0) + Math.floor(Math.random() * 5),
      shares: (post.metrics?.shares || 0) + Math.floor(Math.random() * 3),
      lastUpdated: new Date(),
    };

    updatedMetrics.engagements =
      updatedMetrics.likes + updatedMetrics.comments + updatedMetrics.shares;

    await Post.findByIdAndUpdate(postId, { metrics: updatedMetrics });

    console.log(`✅ Updated analytics for post ${postId}`);
    return { success: true };
  },
  {
    connection: redis,
  }
);

// Scheduled post checker
export async function schedulePostChecker() {
  const { default: cron } = await import('node-cron');

  // Check every minute for posts that need to be published
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const postsToPublish = await Post.find({
        status: 'scheduled',
        'scheduling.scheduledFor': { $lte: now },
      });

      for (const post of postsToPublish) {
        await publishQueue.add('publish-post', {
          postId: post._id.toString(),
        });

        console.log(`📅 Queued scheduled post ${post._id} for publishing`);
      }
    } catch (error) {
      console.error('Error in scheduled post checker:', error);
    }
  });

  console.log('✅ Scheduled post checker started');
}

// Event listeners
publishWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

publishWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

export default {
  publishQueue,
  contentGenerationQueue,
  analyticsQueue,
  schedulePostChecker,
};
