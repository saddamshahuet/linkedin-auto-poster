const LinkedInBrowser = require('./automation/linkedin-browser');
const AIContentGenerator = require('./content/ai-generator');
const logger = require('./utils/logger');
require('dotenv').config();

class LinkedInAutoPoster {
  constructor() {
    this.browser = new LinkedInBrowser();
    this.contentGenerator = new AIContentGenerator();
    this.isRunning = false;
  }

  async initialize() {
    try {
      logger.info('Initializing LinkedIn Auto Poster...');
      
      const browserInitialized = await this.browser.init();
      if (!browserInitialized) {
        throw new Error('Failed to initialize browser');
      }
      
      const linkedinReady = await this.browser.navigateToLinkedIn();
      if (!linkedinReady) {
        throw new Error('Failed to navigate to LinkedIn');
      }
      
      logger.info('LinkedIn Auto Poster initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize:', error);
      return false;
    }
  }

  async postAIGeneratedContent(topics = ['AI Infrastructure', 'AI Cybersecurity', 'Digital Transformation']) {
    try {
      logger.info('Starting AI content generation and posting...');
      
      if (!this.browser.isConnected) {
        await this.initialize();
      }

      const posts = await this.contentGenerator.generateMultiplePosts(topics, 3);
      
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        logger.info(`Posting content ${i + 1}/3: ${post.topic}`);
        
        const success = await this.browser.createPost(post.content);
        
        if (success) {
          logger.info(`Successfully posted: ${post.topic}`);
          
          // Save posted content for tracking
          await this.savePostedContent(post);
          
          // Wait between posts to avoid rate limiting (if posting multiple)
          if (i < posts.length - 1) {
            logger.info('Waiting 30 seconds before next post...');
            await this.delay(30000);
          }
        } else {
          logger.error(`Failed to post: ${post.topic}`);
        }
      }
      
      logger.info('Completed AI content posting session');
      
    } catch (error) {
      logger.error('Error in posting AI content:', error);
    }
  }

  async savePostedContent(post) {
    const fs = require('fs-extra');
    const path = require('path');
    
    try {
      const dataDir = path.join(__dirname, '..', 'data');
      await fs.ensureDir(dataDir);
      
      const postsFile = path.join(dataDir, 'posts.json');
      
      let posts = [];
      if (await fs.pathExists(postsFile)) {
        posts = await fs.readJson(postsFile);
      }
      
      posts.push({
        ...post,
        posted_at: new Date().toISOString(),
        status: 'posted'
      });
      
      await fs.writeJson(postsFile, posts, { spaces: 2 });
      logger.info('Post data saved to posts.json');
      
    } catch (error) {
      logger.error('Failed to save post data:', error);
    }
  }

  async runScheduledPosting() {
    this.isRunning = true;
    logger.info('Starting scheduled posting mode...');
    
    try {
      while (this.isRunning) {
        await this.postAIGeneratedContent();
        
        // Wait for next posting interval (default: 4 hours)
        const intervalHours = parseInt(process.env.POST_INTERVAL_HOURS) || 4;
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        logger.info(`Waiting ${intervalHours} hours until next posting session...`);
        await this.delay(intervalMs);
      }
    } catch (error) {
      logger.error('Error in scheduled posting:', error);
      this.isRunning = false;
    }
  }

  async stop() {
    this.isRunning = false;
    await this.browser.close();
    logger.info('LinkedIn Auto Poster stopped');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  if (global.autoPoster) {
    await global.autoPoster.stop();
  }
  process.exit(0);
});

module.exports = LinkedInAutoPoster;