#!/usr/bin/env node

require('dotenv').config();
const { chromium } = require('playwright');
const AIContentGenerator = require('./src/content/ai-generator');
const PostReader = require('./src/content/post-reader');
const LinkedInBrowser = require('./src/automation/linkedin-browser');
const logger = require('./src/utils/logger');

class GeneratePostApp {
  constructor() {
    this.aiGenerator = new AIContentGenerator();
    this.postReader = new PostReader();
    this.browser = null;
    this.page = null;
    this.linkedinBrowser = null;
  }

  async initialize() {
    try {
      logger.info('Initializing Generate Post App...');
      
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

  async generateAndPublish(prompt = null, domain = null, savePost = false) {
    try {
      logger.info('Generating new post with AI...');
      
      // Generate content using specified or default prompt/domain
      const content = await this.aiGenerator.generatePostWithPrompt(prompt, domain);
      
      console.log('\n📝 Generated Post:');
      console.log('─'.repeat(60));
      console.log(content);
      console.log('─'.repeat(60));

      // Save post if requested
      if (savePost) {
        const topic = domain || 'AI Generated Post';
        const saveResult = await this.postReader.savePost(content, topic, 'txt');
        if (saveResult.success) {
          logger.info(`Post saved to: ${saveResult.filename}`);
        }
      }

      // Navigate to LinkedIn and publish
      logger.info('Publishing to LinkedIn...');
      await this.linkedinBrowser.navigateToLinkedIn();
      await this.linkedinBrowser.createPost(content);
      
      logger.info('Post published successfully!');
      return { success: true, content, message: 'Post generated and published successfully' };
      
    } catch (error) {
      logger.error('Failed to generate and publish post:', error);
      return { success: false, content: null, message: error.message };
    }
  }

  async generateMultiplePosts(count = 3, domain = null, saveAll = false) {
    try {
      const topics = domain ? [domain] : ['AI Infrastructure', 'Cybersecurity', 'Digital Transformation'];
      const results = [];

      for (let i = 0; i < count; i++) {
        const currentDomain = domain || topics[i % topics.length];
        
        logger.info(`Generating post ${i + 1}/${count} for domain: ${currentDomain}`);
        
        const content = await this.aiGenerator.generatePostWithPrompt(null, currentDomain);
        
        console.log(`\n📝 Generated Post ${i + 1}:`);
        console.log('─'.repeat(60));
        console.log(content);
        console.log('─'.repeat(60));

        // Save post if requested
        if (saveAll) {
          const saveResult = await this.postReader.savePost(content, currentDomain, 'txt');
          if (saveResult.success) {
            logger.info(`Post ${i + 1} saved to: ${saveResult.filename}`);
          }
        }

        // Publish to LinkedIn
        try {
          if (i === 0) {
            await this.linkedinBrowser.navigateToLinkedIn();
          }
          
          await this.linkedinBrowser.createPost(content);
          
          results.push({ success: true, content, domain: currentDomain });
          logger.info(`Post ${i + 1} published successfully`);

          // Add delay between posts
          if (i < count - 1) {
            logger.info('Waiting 30 seconds before next post...');
            await this.delay(30000);
          }

        } catch (error) {
          logger.error(`Failed to publish post ${i + 1}:`, error);
          results.push({ success: false, content, domain: currentDomain, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      return {
        results,
        success: successCount,
        failed: failedCount,
        message: `Generated and published ${successCount}/${count} posts successfully`
      };

    } catch (error) {
      logger.error('Failed to generate multiple posts:', error);
      throw error;
    }
  }

  async generateOnly(prompt = null, domain = null, savePost = true) {
    try {
      logger.info('Generating post content only...');
      
      const content = await this.aiGenerator.generatePostWithPrompt(prompt, domain);
      
      console.log('\n📝 Generated Post:');
      console.log('─'.repeat(60));
      console.log(content);
      console.log('─'.repeat(60));

      if (savePost) {
        const topic = domain || 'AI Generated Post';
        const saveResult = await this.postReader.savePost(content, topic, 'txt');
        if (saveResult.success) {
          console.log(`\n💾 Post saved to: ${saveResult.filename}`);
          return { success: true, content, filename: saveResult.filename };
        }
      }

      return { success: true, content, filename: null };

    } catch (error) {
      logger.error('Failed to generate post:', error);
      return { success: false, content: null, error: error.message };
    }
  }

  async testLLMConnection() {
    try {
      console.log(`\n🔧 Testing ${this.aiGenerator.llmProvider.toUpperCase()} connection...`);
      
      const testPrompt = 'Generate a short test message about AI innovation in one sentence.';
      let testResult;

      if (this.aiGenerator.llmProvider === 'openai' && this.aiGenerator.openai) {
        testResult = await this.aiGenerator.generateWithOpenAI(testPrompt);
        console.log('✅ OpenAI connection successful');
      } else if (this.aiGenerator.llmProvider === 'ollama' && this.aiGenerator.ollama) {
        testResult = await this.aiGenerator.generateWithOllama(testPrompt);
        console.log('✅ Ollama connection successful');
      } else {
        throw new Error(`LLM provider ${this.aiGenerator.llmProvider} not configured`);
      }

      console.log(`Test response: ${testResult.substring(0, 100)}...`);
      return true;

    } catch (error) {
      console.log(`❌ ${this.aiGenerator.llmProvider.toUpperCase()} connection failed:`, error.message);
      return false;
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

  showUsage() {
    console.log(`
🚀 LinkedIn AI Post Generator

Usage:
  node generate-post.js [command] [options]

Commands:
  generate-and-publish   Generate and immediately publish to LinkedIn (default)
  generate-only         Generate post content and save locally
  test-llm             Test LLM connection
  multiple             Generate and publish multiple posts

Options:
  --prompt "Custom prompt"     Custom generation prompt
  --domain "Domain"           Content domain (e.g., "AI", "Cybersecurity")
  --count N                   Number of posts for multiple command (default: 3)
  --save                      Save generated posts locally
  --no-publish               Generate only, don't publish

Environment Variables:
  LLM_PROVIDER              openai|ollama (default: openai)
  OPENAI_API_KEY           OpenAI API key
  OLLAMA_API_URL          Ollama API URL (default: http://localhost:11434)
  OLLAMA_MODEL            Ollama model name (default: llama2)
  DEFAULT_DOMAIN          Default content domain
  POSTS_FOLDER            Folder for saved posts

Examples:
  node generate-post.js
  node generate-post.js generate-only --domain "Cybersecurity"
  node generate-post.js multiple --count 5 --save
  node generate-post.js --prompt "Write about AI in healthcare"
    `);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: 'generate-and-publish',
    prompt: null,
    domain: null,
    count: 3,
    save: false,
    publish: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === 'generate-only' || arg === 'test-llm' || arg === 'multiple' || arg === 'generate-and-publish') {
      options.command = arg;
    } else if (arg === '--prompt' && i + 1 < args.length) {
      options.prompt = args[++i];
    } else if (arg === '--domain' && i + 1 < args.length) {
      options.domain = args[++i];
    } else if (arg === '--count' && i + 1 < args.length) {
      options.count = parseInt(args[++i]) || 3;
    } else if (arg === '--save') {
      options.save = true;
    } else if (arg === '--no-publish') {
      options.publish = false;
    } else if (arg === '--help' || arg === '-h') {
      return { command: 'help' };
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  const app = new GeneratePostApp();
  
  try {
    if (options.command === 'help') {
      app.showUsage();
      return;
    }

    if (options.command === 'test-llm') {
      const success = await app.testLLMConnection();
      process.exit(success ? 0 : 1);
    }

    if (options.command === 'generate-only') {
      const result = await app.generateOnly(options.prompt, options.domain, options.save);
      if (result.success) {
        console.log('\n✅ Post generated successfully');
      } else {
        console.log('\n❌ Failed to generate post:', result.error);
      }
      return;
    }

    // Commands that need browser initialization
    await app.initialize();

    switch (options.command) {
      case 'multiple':
        const multiResult = await app.generateMultiplePosts(options.count, options.domain, options.save);
        console.log(`\n✅ ${multiResult.message}`);
        break;

      case 'generate-and-publish':
      default:
        const result = await app.generateAndPublish(options.prompt, options.domain, options.save);
        if (result.success) {
          console.log('\n✅ Post generated and published successfully!');
        } else {
          console.log('\n❌ Failed:', result.message);
        }
        break;
    }

    await app.cleanup();

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

module.exports = GeneratePostApp;