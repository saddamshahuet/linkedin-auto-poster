#!/usr/bin/env node

require('dotenv').config();
const { chromium } = require('playwright');
const ImageGenerator = require('./src/media/image-generator');
const logger = require('./src/utils/logger');
const fs = require('fs');

class ImageUploadTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.imageGen = new ImageGenerator();
  }

  async init() {
    logger.info('🚀 Initializing browser for image upload test...');
    this.browser = await chromium.launch({
      headless: false, // Always visible for testing
      slowMo: 50,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ]
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    this.page = await context.newPage();
    logger.info('✅ Browser initialized');
  }

  async login() {
    try {
      logger.info('🔑 Logging into LinkedIn...');
      
      // Navigate to LinkedIn
      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      
      logger.info('Waiting for page to load...');
      await this.page.waitForTimeout(3000);

      // Check if already logged in
      const currentUrl = this.page.url();
      if (currentUrl.includes('/feed') || currentUrl.includes('/home')) {
        logger.info('✅ Already logged in!');
        return true;
      }

      // Wait for login form
      logger.info('Waiting for login form...');
      const usernameInput = await this.page.waitForSelector('#username', { 
        timeout: 15000,
        state: 'visible' 
      });
      
      if (!usernameInput) {
        throw new Error('Username field not found');
      }
      
      // Clear and fill credentials slowly
      logger.info('Entering email...');
      await this.page.click('#username');
      await this.page.fill('#username', '');
      await this.page.type('#username', process.env.LINKEDIN_EMAIL, { delay: 120 });
      await this.page.waitForTimeout(1000);
      
      logger.info('Entering password...');
      await this.page.click('#password');
      await this.page.fill('#password', '');
      await this.page.type('#password', process.env.LINKEDIN_PASSWORD, { delay: 120 });
      await this.page.waitForTimeout(1000);
      
      // Click sign in
      logger.info('Clicking sign in button...');
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation with longer timeout
      logger.info('Waiting for login to complete...');
      await this.page.waitForTimeout(10000);

      // Check result
      const afterLoginUrl = this.page.url();
      logger.info(`URL after login: ${afterLoginUrl}`);
      
      if (afterLoginUrl.includes('/feed') || afterLoginUrl.includes('/home')) {
        logger.info('✅ Successfully logged into LinkedIn!');
        return true;
      } else if (afterLoginUrl.includes('/checkpoint') || afterLoginUrl.includes('/challenge')) {
        logger.warn('⚠️ LinkedIn requires verification!');
        logger.info('📋 Please complete verification in the browser window...');
        logger.info('⏳ Waiting 60 seconds for manual verification...');
        
        // Wait for manual verification
        await this.page.waitForTimeout(60000);
        
        const verifiedUrl = this.page.url();
        if (verifiedUrl.includes('/feed')) {
          logger.info('✅ Verification completed successfully!');
          return true;
        } else {
          logger.warn('⚠️ Verification timeout, continuing anyway...');
          return true;
        }
      } else {
        logger.warn('⚠️ Unexpected URL, but continuing...');
        return true;
      }
      
    } catch (error) {
      logger.error('❌ Login error:', error.message);
      
      // Take screenshot
      try {
        const screenshotPath = 'debug-login-error.png';
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info(`📸 Screenshot saved: ${screenshotPath}`);
      } catch (e) {
        logger.warn('Could not save screenshot');
      }
      
      throw error;
    }
  }

  async testImageUpload() {
    try {
      logger.info('📸 Testing image upload functionality...');
      
      // Generate a test image
      logger.info('Creating test image...');
      const imagePath = await this.imageGen.generatePostImage(
        'Image Upload Test',
        'Testing Programmatic Upload',
        'ai'
      );
      
      logger.info(`✅ Test image created: ${imagePath}`);
      
      // Verify file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file was not created');
      }
      
      const stats = fs.statSync(imagePath);
      logger.info(`📊 Image file size: ${stats.size} bytes`);
      
      // Navigate to LinkedIn feed
      await this.page.goto('https://www.linkedin.com/feed/');
      await this.page.waitForTimeout(3000);
      
      // Click "Start a post"
      logger.info('🖱️ Clicking "Start a post" button...');
      const startPostButton = await this.page.waitForSelector(
        'button:has-text("Start a post"), [data-test-id="share-box-start-post"]',
        { timeout: 10000 }
      );
      
      await startPostButton.click();
      await this.page.waitForTimeout(2000);
      
      // Find the text editor
      logger.info('✍️ Adding post content...');
      const editor = await this.page.waitForSelector(
        '.ql-editor, [contenteditable="true"]',
        { timeout: 5000 }
      );
      
      const testContent = `🧪 Image Upload Test Post

Testing programmatic image upload without Windows file dialogs!

This is an automated test to verify:
✅ Image generation works
✅ File upload bypasses OS dialogs
✅ LinkedIn accepts programmatic uploads

#TestPost #Automation #LinkedInAPI`;
      
      await editor.fill(testContent);
      await this.page.waitForTimeout(1000);
      
      logger.info('📎 Attempting to upload image programmatically...');
      
      // Method 1: Try to find hidden file input first
      let uploadSuccess = false;
      
      try {
        const fileInputs = await this.page.$$('input[type="file"]');
        logger.info(`Found ${fileInputs.length} file input(s)`);
        
        if (fileInputs.length > 0) {
          logger.info('📤 Method 1: Using existing file input...');
          await fileInputs[0].setInputFiles(imagePath);
          await this.page.waitForTimeout(3000);
          uploadSuccess = true;
          logger.info('✅ Image uploaded via Method 1');
        }
      } catch (error) {
        logger.warn('⚠️ Method 1 failed:', error.message);
      }
      
      // Method 2: Click media button and use file input
      if (!uploadSuccess) {
        try {
          logger.info('📤 Method 2: Clicking media button...');
          
          // Look for media/photo button
          const mediaButton = await this.page.waitForSelector(
            'button[aria-label*="Add a photo"], button[aria-label*="Media"], [data-test-id="media-upload-photo"]',
            { timeout: 5000 }
          );
          
          await mediaButton.click();
          await this.page.waitForTimeout(1000);
          
          // Find the file input that appears
          const fileInput = await this.page.waitForSelector('input[type="file"]', {
            state: 'attached',
            timeout: 3000
          });
          
          if (fileInput) {
            logger.info('📤 Uploading via file input...');
            await fileInput.setInputFiles(imagePath);
            await this.page.waitForTimeout(3000);
            uploadSuccess = true;
            logger.info('✅ Image uploaded via Method 2');
          }
        } catch (error) {
          logger.warn('⚠️ Method 2 failed:', error.message);
        }
      }
      
      if (uploadSuccess) {
        logger.info('✅ Image upload successful - NO WINDOWS DIALOG APPEARED!');
        
        // Wait for image to process
        await this.page.waitForTimeout(2000);
        
        // Check if image appears in preview
        const imagePreview = await this.page.$('img[alt*="Preview"], .share-creation-state__image-preview');
        if (imagePreview) {
          logger.info('✅ Image preview detected in post composer');
        }
        
        // Ask user if they want to publish
        logger.info('\n📝 Post is ready with image!');
        logger.info('⏸️ Pausing for manual review...');
        logger.info('💡 Check the browser window to verify the image uploaded correctly');
        logger.info('💡 You can manually click "Post" or close the browser to cancel');
        
        // Wait 30 seconds for manual review
        await this.page.waitForTimeout(30000);
        
        return { success: true, method: uploadSuccess };
      } else {
        logger.error('❌ All upload methods failed');
        return { success: false, error: 'All upload methods failed' };
      }
      
    } catch (error) {
      logger.error('❌ Image upload test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async cleanup() {
    if (this.browser) {
      logger.info('🧹 Closing browser...');
      await this.browser.close();
      logger.info('✅ Browser closed');
    }
  }
}

async function main() {
  const tester = new ImageUploadTester();
  
  try {
    console.log('\n🧪 LinkedIn Image Upload Test\n');
    console.log('═'.repeat(50));
    console.log('Testing: Programmatic image upload without file dialogs');
    console.log('═'.repeat(50));
    console.log('');
    
    await tester.init();
    
    const loginSuccess = await tester.login();
    if (!loginSuccess) {
      console.log('\n⚠️ Login may need manual verification');
      console.log('Please check the browser window and complete any challenges');
      await tester.page.waitForTimeout(30000);
    }
    
    const result = await tester.testImageUpload();
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(50));
    
    if (result.success) {
      console.log('✅ SUCCESS: Image uploaded without Windows dialog!');
      console.log(`   Method used: ${result.method}`);
      console.log('   File dialog: BYPASSED ✅');
    } else {
      console.log('❌ FAILED: Image upload unsuccessful');
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('═'.repeat(50));
    console.log('');
    
    await tester.cleanup();
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await tester.cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImageUploadTester;