import { chromium, Browser, Page } from 'playwright';
import { LinkedInAccountModel } from '../models/LinkedInAccount';

export interface PublishOptions {
  text: string;
  mediaUrls?: string[];
  accountId: string;
}

export interface PublishResult {
  success: boolean;
  postUrl?: string;
  postId?: string;
  screenshotUrl?: string;
  error?: string;
}

export class LinkedInPublisherService {
  private browser?: Browser;
  private page?: Page;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.browser || !this.page) {
        await this.initialize();
      }

      const account = await LinkedInAccountModel.findById(options.accountId);
      if (!account) {
        throw new Error('LinkedIn account not found');
      }

      // Get credentials
      const credentials = await LinkedInAccountModel.getCredentials(account);
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('Invalid credentials');
      }

      // Login to LinkedIn
      await this.login(credentials.email, credentials.password);

      // Navigate to home/feed
      await this.page!.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'networkidle',
      });

      await this.page!.waitForTimeout(2000);

      // Click on "Start a post" button
      const startPostSelector = 'button.share-box-feed-entry__trigger';
      await this.page!.waitForSelector(startPostSelector, { timeout: 10000 });
      await this.page!.click(startPostSelector);

      await this.page!.waitForTimeout(1000);

      // Type the post content
      const editorSelector = '.ql-editor';
      await this.page!.waitForSelector(editorSelector, { timeout: 10000 });
      await this.page!.click(editorSelector);
      await this.page!.fill(editorSelector, options.text);

      await this.page!.waitForTimeout(1000);

      // Handle media uploads if present
      if (options.mediaUrls && options.mediaUrls.length > 0) {
        await this.uploadMedia(options.mediaUrls);
      }

      // Click Post button
      const postButtonSelector = 'button.share-actions__primary-action';
      await this.page!.waitForSelector(postButtonSelector, { timeout: 10000 });
      await this.page!.click(postButtonSelector);

      // Wait for post to be published
      await this.page!.waitForTimeout(3000);

      // Capture screenshot
      const screenshotPath = `/tmp/linkedin-post-${Date.now()}.png`;
      await this.page!.screenshot({ path: screenshotPath, fullPage: false });

      // Try to get post URL from the feed
      const postUrl = await this.getLatestPostUrl();

      return {
        success: true,
        postUrl,
        postId: this.extractPostIdFromUrl(postUrl),
        screenshotUrl: screenshotPath,
      };
    } catch (error: any) {
      console.error('LinkedIn publish error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async login(email: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle',
    });

    // Fill login form
    await this.page.fill('#username', email);
    await this.page.fill('#password', password);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for navigation
    await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

    // Check if login was successful
    const currentUrl = this.page.url();
    if (currentUrl.includes('/checkpoint/') || currentUrl.includes('/login')) {
      throw new Error('Login failed - possible 2FA or security check required');
    }
  }

  private async uploadMedia(mediaUrls: string[]): Promise<void> {
    // Implementation for media upload
    // This would involve clicking the media button and uploading files
    console.log('Media upload not yet implemented');
  }

  private async getLatestPostUrl(): Promise<string | undefined> {
    if (!this.page) return undefined;

    try {
      // Wait for the feed to update
      await this.page.waitForTimeout(2000);

      // Try to find the latest post link
      const postLinks = await this.page.$$eval(
        'a[href*="/feed/update/"]',
        (links) => links.map((l) => (l as HTMLAnchorElement).href)
      );

      return postLinks[0];
    } catch (error) {
      console.error('Failed to get post URL:', error);
      return undefined;
    }
  }

  private extractPostIdFromUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const match = url.match(/urn:li:activity:(\d+)/);
    return match ? match[1] : undefined;
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async verifyAccount(accountId: string): Promise<boolean> {
    try {
      if (!this.browser || !this.page) {
        await this.initialize();
      }

      const account = await LinkedInAccountModel.findById(accountId);
      if (!account) return false;

      const credentials = await LinkedInAccountModel.getCredentials(account);
      if (!credentials) return false;

      await this.login(credentials.email, credentials.password);

      await LinkedInAccountModel.updateConnectionStatus(accountId, 'active');
      return true;
    } catch (error) {
      await LinkedInAccountModel.updateConnectionStatus(accountId, 'error');
      return false;
    } finally {
      await this.close();
    }
  }
}
