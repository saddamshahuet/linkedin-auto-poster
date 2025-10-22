#!/usr/bin/env node

require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const AIContentGenerator = require('../content/ai-generator');
const ImageGenerator = require('../media/image-generator');
const PostReader = require('../content/post-reader');
const logger = require('../utils/logger');
const { getRandomElement, generateRandomDelay } = require('../utils/helpers');

class AutonomousPostGenerator {
  constructor() {
    this.aiGenerator = new AIContentGenerator();
    this.imageGenerator = new ImageGenerator();
    this.postReader = new PostReader();
    
    // Content domains related to user requirements
    this.contentDomains = [
      'Cloud Computing Solutions',
      'IT Services and Infrastructure',
      'Programming and Development',
      'SaaS Applications',
      'Microservices Architecture',
      'Client-Service Packages',
      'Enterprise Software Solutions',
      'DevOps and Automation',
      'API Design and Integration',
      'Database Management Systems',
      'Cybersecurity for Enterprises',
      'AI and Machine Learning',
      'Digital Transformation',
      'Software Development Lifecycle',
      'System Architecture Design'
    ];
    
    // Post types to randomly select
    this.postTypes = ['text-only', 'text-with-image'];
    
    logger.info('Autonomous Post Generator initialized');
  }

  async generateRandomPost() {
    try {
      logger.info('Starting autonomous post generation...');
      
      // Randomly select domain and post type
      const domain = getRandomElement(this.contentDomains);
      const postType = getRandomElement(this.postTypes);
      const shouldGenerateImage = postType === 'text-with-image';
      
      logger.info(`Generating ${postType} post for domain: ${domain}`);
      
      // Generate content
      const content = await this.aiGenerator.generatePostWithPrompt(null, domain);
      
      // Create post folder
      const saveResult = await this.postReader.savePostToFolder(content, domain, 'txt', shouldGenerateImage);
      
      if (!saveResult.success) {
        throw new Error(`Failed to save post: ${saveResult.error}`);
      }
      
      let imagePath = null;
      
      // Generate image if required
      if (shouldGenerateImage) {
        imagePath = await this.generateImageForPost(content, domain, saveResult.folderPath);
      }
      
      logger.info(`Post generated successfully: ${saveResult.folderPath}`);
      
      return {
        success: true,
        folderPath: saveResult.folderPath,
        folderName: saveResult.folderName,
        content,
        domain,
        postType,
        imagePath,
        hasMedia: shouldGenerateImage
      };
      
    } catch (error) {
      logger.error('Failed to generate autonomous post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateImageForPost(content, domain, folderPath) {
    try {
      const imageName = 'post-image.png';
      const imagePath = path.join(folderPath, imageName);
      
      logger.info(`Generating image for post: ${imageName}`);
      
      return await this.imageGenerator.generateImageForPost(content, domain, imagePath);
      
    } catch (error) {
      logger.error('Failed to generate image for post:', error);
      return null;
    }
  }

  async generateMultiplePosts(count = 1) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      logger.info(`Generating post ${i + 1}/${count}`);
      
      const result = await this.generateRandomPost();
      results.push(result);
      
      // Add random delay between generations (1-5 seconds)
      if (i < count - 1) {
        const delay = generateRandomDelay(1000, 5000);
        logger.info(`Waiting ${delay}ms before next generation...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    logger.info(`Generated ${successCount}/${count} posts successfully, ${failedCount} failed`);
    
    return {
      results,
      successCount,
      failedCount,
      total: count
    };
  }

  async generateDailyBatch() {
    try {
      // Generate 1-3 posts for daily batch
      const count = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 posts
      
      logger.info(`Starting daily batch generation: ${count} posts`);
      
      const result = await this.generateMultiplePosts(count);
      
      // Log summary
      logger.info(`Daily batch completed: ${result.successCount}/${result.total} posts generated`);
      
      return result;
      
    } catch (error) {
      logger.error('Failed to generate daily batch:', error);
      return {
        results: [],
        successCount: 0,
        failedCount: 1,
        total: 1,
        error: error.message
      };
    }
  }

  async showGenerationStats() {
    try {
      const posts = await this.postReader.getAllPostsFromPosts();
      
      const stats = {
        totalPosts: posts.length,
        textOnlyPosts: posts.filter(p => !p.hasMedia).length,
        postsWithMedia: posts.filter(p => p.hasMedia).length,
        domainBreakdown: {},
        recentPosts: posts
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
      };
      
      // Count posts by domain
      posts.forEach(post => {
        const domain = post.topic || 'Unknown';
        stats.domainBreakdown[domain] = (stats.domainBreakdown[domain] || 0) + 1;
      });
      
      console.log('\n📊 Post Generation Statistics:');
      console.log(`Total Posts Generated: ${stats.totalPosts}`);
      console.log(`Text-Only Posts: ${stats.textOnlyPosts}`);
      console.log(`Posts with Media: ${stats.postsWithMedia}`);
      
      console.log('\n📈 Domain Breakdown:');
      Object.entries(stats.domainBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([domain, count]) => {
          console.log(`  ${domain}: ${count}`);
        });
      
      console.log('\n🕒 Recent Posts:');
      stats.recentPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.topic} (${post.hasMedia ? 'with media' : 'text only'})`);
      });
      
      return stats;
      
    } catch (error) {
      logger.error('Failed to show generation stats:', error);
    }
  }

  // Enhanced prompts for different domains
  getDomainSpecificPrompt(domain) {
    const prompts = {
      'Cloud Computing Solutions': 'Write about the latest trends in cloud computing, focusing on cost optimization, scalability, and enterprise adoption. Include specific benefits and real-world use cases.',
      
      'IT Services and Infrastructure': 'Discuss modern IT infrastructure management, including automation, monitoring, and optimization strategies. Focus on business value and operational efficiency.',
      
      'Programming and Development': 'Share insights about modern software development practices, programming languages, frameworks, or development methodologies that are gaining traction.',
      
      'SaaS Applications': 'Explore the SaaS landscape, discussing emerging applications, integration strategies, or how SaaS is transforming business operations.',
      
      'Microservices Architecture': 'Explain microservices architecture benefits, implementation strategies, or lessons learned from microservices adoption in enterprise environments.',
      
      'Client-Service Packages': 'Discuss service delivery models, client engagement strategies, or how to structure technology service packages for maximum value.',
      
      'Enterprise Software Solutions': 'Cover enterprise software trends, implementation best practices, or how enterprise solutions are evolving to meet modern business needs.',
      
      'DevOps and Automation': 'Share insights about DevOps culture, automation tools, CI/CD pipelines, or how DevOps is transforming software delivery.',
      
      'API Design and Integration': 'Discuss API design best practices, integration strategies, or how APIs are enabling digital transformation and system connectivity.',
      
      'Database Management Systems': 'Explore database technologies, data management strategies, performance optimization, or emerging trends in data storage and retrieval.'
    };
    
    return prompts[domain] || `Generate an engaging professional post about ${domain}, focusing on business value, industry trends, and practical insights.`;
  }
}

// Command-line interface
async function main() {
  const generator = new AutonomousPostGenerator();
  
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'generate';
    const count = parseInt(args[1]) || 1;
    
    switch (command) {
      case 'generate':
        console.log('🤖 Generating autonomous post...');
        const result = await generator.generateRandomPost();
        
        if (result.success) {
          console.log(`\n✅ Post generated successfully!`);
          console.log(`📁 Location: ${result.folderPath}`);
          console.log(`📝 Domain: ${result.domain}`);
          console.log(`🎨 Type: ${result.postType}`);
          console.log(`🖼️  Has Media: ${result.hasMedia ? 'Yes' : 'No'}`);
          console.log('\n📄 Content Preview:');
          console.log(result.content.substring(0, 200) + '...');
        } else {
          console.log(`\n❌ Failed to generate post: ${result.error}`);
        }
        break;
        
      case 'multiple':
        console.log(`🤖 Generating ${count} autonomous posts...`);
        const multiResult = await generator.generateMultiplePosts(count);
        
        console.log(`\n✅ Generated ${multiResult.successCount}/${multiResult.total} posts successfully`);
        if (multiResult.failedCount > 0) {
          console.log(`❌ ${multiResult.failedCount} posts failed`);
        }
        break;
        
      case 'daily-batch':
        console.log('🗓️  Generating daily batch...');
        const dailyResult = await generator.generateDailyBatch();
        
        console.log(`\n✅ Daily batch completed: ${dailyResult.successCount}/${dailyResult.total} posts`);
        break;
        
      case 'stats':
        await generator.showGenerationStats();
        break;
        
      default:
        console.log(`
🤖 Autonomous Post Generator

Usage:
  node autonomous-post-generator.js [command] [options]

Commands:
  generate          Generate a single random post (default)
  multiple [count]  Generate multiple posts (default: 1)
  daily-batch       Generate daily batch (1-3 random posts)
  stats            Show generation statistics

Examples:
  node autonomous-post-generator.js
  node autonomous-post-generator.js multiple 3
  node autonomous-post-generator.js daily-batch
  node autonomous-post-generator.js stats
        `);
        break;
    }
    
  } catch (error) {
    logger.error('Application error:', error);
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = AutonomousPostGenerator;