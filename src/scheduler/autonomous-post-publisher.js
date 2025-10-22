#!/usr/bin/env node

require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright');
const PostReader = require('../content/post-reader');
const LinkedInBrowser = require('../automation/linkedin-browser');
const logger = require('../utils/logger');
const { generateRandomDelay, getRandomElement } = require('../utils/helpers');

class AutonomousPostPublisher {
  constructor() {
    this.postReader = new PostReader();
    this.browser = null;
    this.page = null;
    this.linkedinBrowser = null;
    this.publishedPostsFile = path.join(__dirname, '..', '..', 'data', 'published-posts.json');
    
    logger.info('Autonomous Post Publisher initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing browser for post publishing...');
      
      // Launch browser
      this.browser = await chromium.launch({
        headless: process.env.HEADLESS === 'true',
        slowMo: 500  // Slower for reliability
      });
      
      this.page = await this.browser.newPage();
      this.linkedinBrowser = new LinkedInBrowser();
      this.linkedinBrowser.browser = this.browser;
      this.linkedinBrowser.page = this.page;
      this.linkedinBrowser.isConnected = true;
      
      logger.info('Browser initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      return false;
    }
  }

  async getUnpublishedPosts() {
    try {
      // Get all posts from posts folder
      const allPosts = await this.postReader.getAllPostsFromPosts();
      
      // Get list of published posts
      const publishedPosts = await this.getPublishedPostsList();
      
      // Filter out already published posts
      const unpublishedPosts = allPosts.filter(post => {
        const postId = post.id || post.filename || post.foldername;
        return !publishedPosts.includes(postId);
      });
      
      logger.info(`Found ${unpublishedPosts.length} unpublished posts out of ${allPosts.length} total`);
      return unpublishedPosts;
      
    } catch (error) {
      logger.error('Failed to get unpublished posts:', error);
      return [];
    }
  }

  async getPublishedPostsList() {
    try {
      if (await fs.pathExists(this.publishedPostsFile)) {
        const data = await fs.readJson(this.publishedPostsFile);
        return data.publishedIds || [];
      }
      return [];
    } catch (error) {
      logger.error('Failed to read published posts list:', error);
      return [];
    }
  }

  async markPostAsPublished(post) {
    try {
      const publishedPosts = await this.getPublishedPostsList();
      const postId = post.id || post.filename || post.foldername;
      
      if (!publishedPosts.includes(postId)) {
        publishedPosts.push(postId);
        
        const publishedData = {
          publishedIds: publishedPosts,
          lastUpdated: new Date().toISOString(),
          posts: publishedPosts.map(id => ({
            id,
            publishedAt: new Date().toISOString()
          }))
        };
        
        await fs.ensureDir(path.dirname(this.publishedPostsFile));
        await fs.writeJson(this.publishedPostsFile, publishedData, { spaces: 2 });
        
        logger.info(`Marked post as published: ${postId}`);
      }
    } catch (error) {
      logger.error('Failed to mark post as published:', error);
    }
  }

  async publishPost(post) {
    try {
      const postId = post.id || post.filename || post.foldername;
      logger.info(`Publishing post: ${postId}`);
      
      // Navigate to LinkedIn
      await this.linkedinBrowser.navigateToLinkedIn();
      
      // Determine if post has media
      const imagePath = this.getPostImagePath(post);
      
      // Create the post with or without media
      const success = await this.linkedinBrowser.createPost(post.content, imagePath);
      
      if (success) {
        await this.markPostAsPublished(post);
        logger.info(`Successfully published post: ${postId}`);
        
        // Save to posted content tracking
        await this.savePostedContent(post);
        
        return true;
      } else {
        logger.error(`Failed to publish post: ${postId}`);
        return false;
      }
      
    } catch (error) {
      logger.error(`Error publishing post ${post.id}:`, error);
      return false;
    }
  }

  getPostImagePath(post) {
    try {
      if (!post.hasMedia && (!post.mediaFiles || post.mediaFiles.length === 0)) {
        return null;
      }
      
      // If it's a folder post with media files
      if (post.mediaFiles && post.mediaFiles.length > 0) {
        return post.mediaFiles[0]; // Use first media file
      }
      
      // If it's a folder post, look for image files
      if (post.folderPath || post.folderpath) {
        const folderPath = post.folderPath || post.folderpath;
        const supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        // Check if folder has any image files
        const files = fs.readdirSync(folderPath);
        const imageFile = files.find(file => 
          supportedImageFormats.some(ext => file.toLowerCase().endsWith(ext))
        );
        
        if (imageFile) {
          return path.join(folderPath, imageFile);
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting post image path:', error);
      return null;
    }
  }

  async savePostedContent(post) {
    try {
      const dataDir = path.join(__dirname, '..', '..', 'data');
      await fs.ensureDir(dataDir);
      
      const postsFile = path.join(dataDir, 'posts.json');
      
      let posts = [];
      if (await fs.pathExists(postsFile)) {
        posts = await fs.readJson(postsFile);
      }
      
      posts.push({
        id: post.id || post.filename || post.foldername,
        content: post.content,
        topic: post.topic,
        posted_at: new Date().toISOString(),
        status: 'posted',
        hasMedia: !!this.getPostImagePath(post),
        source: 'autonomous-publisher'
      });
      
      await fs.writeJson(postsFile, posts, { spaces: 2 });
      logger.info('Post data saved to posts.json');
      
    } catch (error) {
      logger.error('Failed to save post data:', error);
    }
  }

  async publishNextPost() {
    try {
      const unpublishedPosts = await this.getUnpublishedPosts();
      
      if (unpublishedPosts.length === 0) {
        logger.info('No unpublished posts found');
        return {
          success: false,
          message: 'No unpublished posts available'
        };
      }
      
      // Select random post to avoid predictable order
      const selectedPost = getRandomElement(unpublishedPosts);
      
      const success = await this.publishPost(selectedPost);
      
      return {
        success,
        post: selectedPost,
        message: success ? 'Post published successfully' : 'Failed to publish post'
      };
      
    } catch (error) {
      logger.error('Failed to publish next post:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async publishMultiplePosts(maxPosts = 3) {
    try {
      const unpublishedPosts = await this.getUnpublishedPosts();
      
      if (unpublishedPosts.length === 0) {
        return {
          published: 0,
          failed: 0,
          message: 'No unpublished posts available'
        };
      }
      
      const postsToPublish = unpublishedPosts.slice(0, maxPosts);
      let publishedCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < postsToPublish.length; i++) {
        const post = postsToPublish[i];
        
        logger.info(`Publishing post ${i + 1}/${postsToPublish.length}`);
        
        const success = await this.publishPost(post);
        
        if (success) {
          publishedCount++;
        } else {
          failedCount++;
        }
        
        // Add random delay between posts (30-120 seconds)
        if (i < postsToPublish.length - 1) {
          const delay = generateRandomDelay(30000, 120000);
          logger.info(`Waiting ${Math.round(delay/1000)} seconds before next post...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return {
        published: publishedCount,
        failed: failedCount,
        total: postsToPublish.length,
        message: `Published ${publishedCount}/${postsToPublish.length} posts successfully`
      };
      
    } catch (error) {
      logger.error('Failed to publish multiple posts:', error);
      return {
        published: 0,
        failed: 1,
        message: error.message
      };
    }
  }

  async showPublishingStats() {
    try {
      const allPosts = await this.postReader.getAllPostsFromPosts();
      const unpublishedPosts = await this.getUnpublishedPosts();
      const publishedCount = allPosts.length - unpublishedPosts.length;
      
      const textOnlyUnpublished = unpublishedPosts.filter(p => !p.hasMedia).length;
      const mediaUnpublished = unpublishedPosts.filter(p => p.hasMedia).length;
      
      console.log('\n📊 Publishing Statistics:');
      console.log(`Total Posts: ${allPosts.length}`);
      console.log(`Published: ${publishedCount}`);
      console.log(`Unpublished: ${unpublishedPosts.length}`);
      console.log(`  - Text Only: ${textOnlyUnpublished}`);
      console.log(`  - With Media: ${mediaUnpublished}`);
      
      if (unpublishedPosts.length > 0) {
        console.log('\n📋 Next 5 Unpublished Posts:');
        unpublishedPosts.slice(0, 5).forEach((post, index) => {
          const postId = post.id || post.filename || post.foldername;
          console.log(`  ${index + 1}. ${postId} (${post.hasMedia ? 'with media' : 'text only'})`);
        });
      }
      
    } catch (error) {
      logger.error('Failed to show publishing stats:', error);
    }
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.info('Browser closed');
      }
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

// Command-line interface
async function main() {
  const publisher = new AutonomousPostPublisher();
  
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'publish-next';
    const count = parseInt(args[1]) || 1;
    
    switch (command) {
      case 'publish-next':
        console.log('📤 Publishing next post...');
        
        const initialized = await publisher.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize browser');
        }
        
        const result = await publisher.publishNextPost();
        
        if (result.success) {
          const postId = result.post.id || result.post.filename || result.post.foldername;
          console.log(`\n✅ Published post: ${postId}`);
          console.log(`📝 Topic: ${result.post.topic}`);
          console.log(`🖼️  Has Media: ${result.post.hasMedia ? 'Yes' : 'No'}`);
        } else {
          console.log(`\n❌ ${result.message}`);
        }
        
        await publisher.cleanup();
        break;
        
      case 'publish-multiple':
        console.log(`📤 Publishing up to ${count} posts...`);
        
        const initResult = await publisher.initialize();
        if (!initResult) {
          throw new Error('Failed to initialize browser');
        }
        
        const multiResult = await publisher.publishMultiplePosts(count);
        
        console.log(`\n✅ ${multiResult.message}`);
        if (multiResult.failed > 0) {
          console.log(`❌ ${multiResult.failed} posts failed to publish`);
        }
        
        await publisher.cleanup();
        break;
        
      case 'stats':
        await publisher.showPublishingStats();
        break;
        
      default:
        console.log(`
📤 Autonomous Post Publisher

Usage:
  node autonomous-post-publisher.js [command] [options]

Commands:
  publish-next              Publish next available post (default)
  publish-multiple [count]  Publish multiple posts (default: 1)
  stats                    Show publishing statistics

Examples:
  node autonomous-post-publisher.js
  node autonomous-post-publisher.js publish-multiple 3
  node autonomous-post-publisher.js stats
        `);
        break;
    }
    
  } catch (error) {
    logger.error('Application error:', error);
    console.error('❌ Error:', error.message);
    
    await publisher.cleanup();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = AutonomousPostPublisher;