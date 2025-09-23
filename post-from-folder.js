#!/usr/bin/env node

require('dotenv').config();
const { chromium } = require('playwright');
const PostReader = require('./src/content/post-reader');
const LinkedInBrowser = require('./src/automation/linkedin-browser');
const logger = require('./src/utils/logger');

class PostFromFolderApp {
  constructor() {
    this.postReader = new PostReader();
    this.browser = null;
    this.page = null;
    this.linkedinBrowser = null;
  }

  async initialize() {
    try {
      logger.info('Initializing Post From Folder App...');
      
      // Launch browser
      this.browser = await chromium.launch({
        headless: process.env.HEADLESS === 'true',
        slowMo: 100
      });
      
      this.page = await this.browser.newPage();
      this.linkedinBrowser = new LinkedInBrowser(this.page);
      
      logger.info('Browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async selectPostToPublish(posts) {
    if (posts.length === 0) {
      throw new Error('No saved posts found to publish');
    }

    console.log('\n📝 Available Posts:');
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.topic} (${post.type}) - ${post.filename}`);
      console.log(`   Preview: ${post.content.substring(0, 100)}...`);
      console.log('');
    });

    // For automation, we'll select the first post
    // In a real implementation, you could add interactive selection
    const selectedPost = posts[0];
    logger.info(`Selected post: ${selectedPost.topic}`);
    
    return selectedPost;
  }

  async publishPost(post) {
    try {
      logger.info(`Publishing post: ${post.topic}`);
      
      // Navigate to LinkedIn
      await this.linkedinBrowser.navigateToLinkedIn();
      
      // Create the post
      await this.linkedinBrowser.createPost(post.content);
      
      logger.info('Post published successfully!');
      return true;
      
    } catch (error) {
      logger.error('Failed to publish post:', error);
      return false;
    }
  }

  async publishMultiplePosts(maxPosts = 3) {
    try {
      const posts = await this.postReader.getAllSavedPosts();
      
      if (posts.length === 0) {
        logger.warn('No saved posts found');
        return { success: 0, failed: 0, message: 'No posts to publish' };
      }

      const postsToPublish = posts.slice(0, maxPosts);
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < postsToPublish.length; i++) {
        const post = postsToPublish[i];
        
        logger.info(`Publishing post ${i + 1}/${postsToPublish.length}: ${post.topic}`);
        
        const success = await this.publishPost(post);
        
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }

        // Add delay between posts to avoid rate limiting
        if (i < postsToPublish.length - 1) {
          logger.info('Waiting 30 seconds before next post...');
          await this.delay(30000);
        }
      }

      return {
        success: successCount,
        failed: failedCount,
        message: `Published ${successCount} posts successfully, ${failedCount} failed`
      };

    } catch (error) {
      logger.error('Failed to publish multiple posts:', error);
      throw error;
    }
  }

  async showPostStats() {
    try {
      const stats = await this.postReader.getPostStats();
      
      if (!stats) {
        console.log('No post statistics available');
        return;
      }

      console.log('\n📊 Saved Posts Statistics:');
      console.log(`Total Posts: ${stats.total}`);
      
      console.log('\nBy File Type:');
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

      console.log('\nBy Topic:');
      Object.entries(stats.byTopic).forEach(([topic, count]) => {
        console.log(`  ${topic}: ${count}`);
      });

      if (stats.newestPost) {
        console.log(`\nNewest Post: ${stats.newestPost.topic} (${stats.newestPost.filename})`);
      }
      
      if (stats.oldestPost) {
        console.log(`Oldest Post: ${stats.oldestPost.topic} (${stats.oldestPost.filename})`);
      }

    } catch (error) {
      logger.error('Failed to show post stats:', error);
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const app = new PostFromFolderApp();
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'publish';
    const maxPosts = parseInt(args[1]) || 1;

    switch (command) {
      case 'stats':
        await app.showPostStats();
        break;
        
      case 'list':
        const posts = await app.postReader.getAllSavedPosts();
        console.log('\n📝 Saved Posts:');
        posts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.topic}`);
          console.log(`   File: ${post.filename}`);
          console.log(`   Preview: ${post.content.substring(0, 150)}...`);
          console.log('');
        });
        break;

      case 'publish':
      default:
        await app.initialize();
        
        if (maxPosts > 1) {
          const result = await app.publishMultiplePosts(maxPosts);
          console.log(`\n✅ ${result.message}`);
        } else {
          const posts = await app.postReader.getAllSavedPosts();
          if (posts.length === 0) {
            console.log('❌ No saved posts found to publish');
            return;
          }
          
          const selectedPost = await app.selectPostToPublish(posts);
          const success = await app.publishPost(selectedPost);
          
          if (success) {
            console.log(`\n✅ Successfully published: ${selectedPost.topic}`);
          } else {
            console.log(`\n❌ Failed to publish: ${selectedPost.topic}`);
          }
        }
        
        await app.cleanup();
        break;
    }

  } catch (error) {
    logger.error('Application error:', error);
    console.error('❌ Error:', error.message);
    
    await app.cleanup();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = PostFromFolderApp;