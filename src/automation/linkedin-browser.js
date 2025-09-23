const { chromium } = require('playwright');
const logger = require('../utils/logger');

class LinkedInBrowser {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isConnected = false;
  }

  async init() {
    try {
      // Launch browser (similar to BrowserMCP setup)
      this.browser = await chromium.launch({
        headless: process.env.HEADLESS_MODE === 'true',
        slowMo: 1000, // Add delay between actions for reliability
      });

      this.page = await this.browser.newPage();
      this.isConnected = true;
      logger.info('Browser initialized successfully');
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToLinkedIn() {
    if (!this.isConnected) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info('Navigating to LinkedIn...');
      await this.page.goto('https://www.linkedin.com');
      await this.page.waitForLoadState('networkidle');
      
      // Check if already logged in
      const isLoggedIn = await this.page.isVisible('[data-test-id="nav-profile-image"]');
      
      if (!isLoggedIn) {
        await this.login();
      }
      
      logger.info('Successfully navigated to LinkedIn');
      return true;
    } catch (error) {
      logger.error('Failed to navigate to LinkedIn:', error);
      return false;
    }
  }

  async login() {
    try {
      logger.info('Attempting to login to LinkedIn...');
      
      // Click sign in button
      await this.page.click('a[href*="/login"]');
      await this.page.waitForSelector('#username');
      
      // Fill credentials
      await this.page.fill('#username', process.env.LINKEDIN_EMAIL);
      await this.page.fill('#password', process.env.LINKEDIN_PASSWORD);
      
      // Submit login
      await this.page.click('button[type="submit"]');
      await this.page.waitForLoadState('networkidle');
      
      // Wait for feed to load (indicates successful login)
      await this.page.waitForSelector('[data-test-id="nav-profile-image"]', { timeout: 10000 });
      
      logger.info('Successfully logged in to LinkedIn');
    } catch (error) {
      logger.error('Failed to login to LinkedIn:', error);
      throw error;
    }
  }

  async createPost(content, imagePath = null) {
    try {
      logger.info('Starting post creation...');
      
      // Navigate to feed if not already there
      if (!this.page.url().includes('/feed/')) {
        await this.page.goto('https://www.linkedin.com/feed/');
        await this.page.waitForLoadState('networkidle');
      }

      // Click "Start a post" button - equivalent to BrowserMCP step
      await this.page.click('button[data-test-id="share-box-open"]', { timeout: 5000 });
      
      // Wait for post dialog to appear
      await this.page.waitForSelector('[data-test-id="share-form-text-editor"]');
      
      // Type content - equivalent to BrowserMCP type action
      await this.page.fill('[data-test-id="share-form-text-editor"]', content);
      
      // Add image if provided
      if (imagePath) {
        await this.addMedia(imagePath);
      }
      
      // Post the content - equivalent to BrowserMCP click on Post button
      await this.page.click('[data-test-id="share-post-button"]');
      
      // Wait for success confirmation
      await this.page.waitForSelector('[data-test-id="share-success-banner"]', { timeout: 10000 });
      
      logger.info('Post created successfully');
      return true;
    } catch (error) {
      logger.error('Failed to create post:', error);
      return false;
    }
  }

  async addMedia(imagePath) {
    try {
      // Click add media button
      await this.page.click('[data-test-id="share-media-button"]');
      
      // Upload file
      const fileInput = await this.page.locator('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      
      // Wait for upload to complete
      await this.page.waitForSelector('[data-test-id="media-upload-complete"]', { timeout: 15000 });
      
      logger.info(`Media uploaded: ${imagePath}`);
    } catch (error) {
      logger.error('Failed to upload media:', error);
      throw error;
    }
  }

  async takeScreenshot(name = 'screenshot') {
    if (!this.page) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `logs/${name}_${timestamp}.png`;
    
    await this.page.screenshot({ path: filename, fullPage: true });
    logger.info(`Screenshot saved: ${filename}`);
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.isConnected = false;
        logger.info('Browser closed successfully');
      }
    } catch (error) {
      logger.error('Error closing browser:', error);
    }
  }
}

module.exports = LinkedInBrowser;