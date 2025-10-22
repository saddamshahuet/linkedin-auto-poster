#!/usr/bin/env node

require('dotenv').config();
const schedule = require('node-schedule');
const AutonomousPostGenerator = require('./autonomous-post-generator');
const AutonomousPostPublisher = require('./autonomous-post-publisher');
const logger = require('../utils/logger');

class AutonomousScheduler {
  constructor() {
    this.postGenerator = new AutonomousPostGenerator();
    this.postPublisher = new AutonomousPostPublisher();
    
    // Configuration from environment variables or defaults
    this.config = {
      // Post generation schedule
      generateSchedule: process.env.GENERATE_SCHEDULE || '0 9,15,21 * * *', // 9 AM, 3 PM, 9 PM daily
      
      // Post publishing schedule  
      publishSchedule: process.env.PUBLISH_SCHEDULE || '0 10,16 * * 1-5', // 10 AM, 4 PM weekdays
      
      // Maximum posts per day
      maxPostsPerDay: parseInt(process.env.MAX_POSTS_PER_DAY) || 3,
      
      // Minimum posts to maintain in queue
      minQueueSize: parseInt(process.env.MIN_QUEUE_SIZE) || 5,
      
      // Enable/disable features
      autoGenerate: process.env.AUTO_GENERATE !== 'false',
      autoPublish: process.env.AUTO_PUBLISH !== 'false'
    };
    
    this.jobs = [];
    this.isRunning = false;
    
    logger.info('Autonomous Scheduler initialized');
    logger.info(`Configuration: ${JSON.stringify(this.config, null, 2)}`);
  }

  start() {
    try {
      logger.info('Starting Autonomous Scheduler...');
      
      // Schedule post generation
      if (this.config.autoGenerate) {
        const generateJob = schedule.scheduleJob('generate-posts', this.config.generateSchedule, () => {
          this.executePostGeneration();
        });
        this.jobs.push(generateJob);
        logger.info(`Post generation scheduled: ${this.config.generateSchedule}`);
      }
      
      // Schedule post publishing
      if (this.config.autoPublish) {
        const publishJob = schedule.scheduleJob('publish-posts', this.config.publishSchedule, () => {
          this.executePostPublishing();
        });
        this.jobs.push(publishJob);
        logger.info(`Post publishing scheduled: ${this.config.publishSchedule}`);
      }
      
      // Schedule daily maintenance
      const maintenanceJob = schedule.scheduleJob('daily-maintenance', '0 2 * * *', () => {
        this.executeDailyMaintenance();
      });
      this.jobs.push(maintenanceJob);
      logger.info('Daily maintenance scheduled: 2 AM daily');
      
      this.isRunning = true;
      logger.info('✅ Autonomous Scheduler started successfully');
      
      // Show next scheduled executions
      this.showNextExecutions();
      
    } catch (error) {
      logger.error('Failed to start scheduler:', error);
      throw error;
    }
  }

  stop() {
    try {
      logger.info('Stopping Autonomous Scheduler...');
      
      // Cancel all scheduled jobs
      this.jobs.forEach(job => {
        if (job) {
          job.cancel();
        }
      });
      
      this.jobs = [];
      this.isRunning = false;
      
      logger.info('✅ Autonomous Scheduler stopped');
      
    } catch (error) {
      logger.error('Error stopping scheduler:', error);
    }
  }

  async executePostGeneration() {
    try {
      logger.info('🤖 Executing scheduled post generation...');
      
      // Check current queue size
      const queueSize = await this.getQueueSize();
      logger.info(`Current queue size: ${queueSize}`);
      
      if (queueSize < this.config.minQueueSize) {
        // Generate posts to maintain minimum queue size
        const postsToGenerate = this.config.minQueueSize - queueSize;
        logger.info(`Generating ${postsToGenerate} posts to maintain queue`);
        
        const result = await this.postGenerator.generateMultiplePosts(postsToGenerate);
        
        logger.info(`Generation completed: ${result.successCount}/${result.total} posts generated`);
      } else {
        logger.info('Queue size sufficient, skipping generation');
      }
      
    } catch (error) {
      logger.error('Error in scheduled post generation:', error);
    }
  }

  async executePostPublishing() {
    try {
      logger.info('📤 Executing scheduled post publishing...');
      
      // Check if we've reached daily post limit
      const todayPostCount = await this.getTodayPostCount();
      
      if (todayPostCount >= this.config.maxPostsPerDay) {
        logger.info(`Daily post limit reached (${todayPostCount}/${this.config.maxPostsPerDay})`);
        return;
      }
      
      // Initialize publisher
      const initialized = await this.postPublisher.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize post publisher');
      }
      
      try {
        // Publish 1 post
        const result = await this.postPublisher.publishNextPost();
        
        if (result.success) {
          logger.info('✅ Scheduled post published successfully');
        } else {
          logger.warn(`⚠️  Failed to publish scheduled post: ${result.message}`);
        }
      } finally {
        await this.postPublisher.cleanup();
      }
      
    } catch (error) {
      logger.error('Error in scheduled post publishing:', error);
    }
  }

  async executeDailyMaintenance() {
    try {
      logger.info('🔧 Executing daily maintenance...');
      
      // Generate daily stats
      await this.generateDailyReport();
      
      // Clean up old logs if needed
      await this.cleanupOldLogs();
      
      // Verify system health
      await this.verifySystemHealth();
      
      logger.info('✅ Daily maintenance completed');
      
    } catch (error) {
      logger.error('Error in daily maintenance:', error);
    }
  }

  async getQueueSize() {
    try {
      const unpublishedPosts = await this.postPublisher.getUnpublishedPosts();
      return unpublishedPosts.length;
    } catch (error) {
      logger.error('Error getting queue size:', error);
      return 0;
    }
  }

  async getTodayPostCount() {
    try {
      const fs = require('fs-extra');
      const path = require('path');
      
      const postsFile = path.join(__dirname, '..', '..', 'data', 'posts.json');
      
      if (!(await fs.pathExists(postsFile))) {
        return 0;
      }
      
      const posts = await fs.readJson(postsFile);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      const todayPosts = posts.filter(post => {
        const postDate = new Date(post.posted_at).toISOString().slice(0, 10);
        return postDate === today;
      });
      
      return todayPosts.length;
      
    } catch (error) {
      logger.error('Error getting today post count:', error);
      return 0;
    }
  }

  async generateDailyReport() {
    try {
      const queueSize = await this.getQueueSize();
      const todayPostCount = await this.getTodayPostCount();
      
      const report = {
        date: new Date().toISOString().slice(0, 10),
        queueSize,
        todayPostCount,
        maxPostsPerDay: this.config.maxPostsPerDay,
        schedulerStatus: this.isRunning ? 'running' : 'stopped',
        nextGeneration: this.getNextExecutionTime('generate-posts'),
        nextPublishing: this.getNextExecutionTime('publish-posts')
      };
      
      logger.info('📊 Daily Report:', report);
      
      // Save report to file
      const fs = require('fs-extra');
      const path = require('path');
      const reportsDir = path.join(__dirname, '..', '..', 'data', 'reports');
      await fs.ensureDir(reportsDir);
      
      const reportFile = path.join(reportsDir, `daily-report-${report.date}.json`);
      await fs.writeJson(reportFile, report, { spaces: 2 });
      
    } catch (error) {
      logger.error('Error generating daily report:', error);
    }
  }

  async cleanupOldLogs() {
    try {
      // Keep logs for last 30 days
      const fs = require('fs-extra');
      const path = require('path');
      
      const logsDir = path.join(__dirname, '..', '..', 'logs');
      if (!(await fs.pathExists(logsDir))) {
        return;
      }
      
      const files = await fs.readdir(logsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          logger.info(`Cleaned up old log file: ${file}`);
        }
      }
      
    } catch (error) {
      logger.error('Error cleaning up old logs:', error);
    }
  }

  async verifySystemHealth() {
    try {
      // Check if Ollama is running (if using ollama)
      if (process.env.LLM_PROVIDER === 'ollama') {
        const axios = require('axios');
        try {
          await axios.get(process.env.OLLAMA_API_URL || 'http://localhost:11434');
          logger.info('✅ Ollama API is accessible');
        } catch (error) {
          logger.warn('⚠️  Ollama API not accessible');
        }
      }
      
      // Check posts folder
      const fs = require('fs-extra');
      const postsFolder = process.env.POSTS_FOLDER || './posts';
      if (await fs.pathExists(postsFolder)) {
        logger.info('✅ Posts folder accessible');
      } else {
        logger.warn('⚠️  Posts folder not found');
      }
      
      // Check LinkedIn credentials
      if (process.env.LINKEDIN_EMAIL && process.env.LINKEDIN_PASSWORD) {
        logger.info('✅ LinkedIn credentials configured');
      } else {
        logger.warn('⚠️  LinkedIn credentials not configured');
      }
      
    } catch (error) {
      logger.error('Error verifying system health:', error);
    }
  }

  getNextExecutionTime(jobName) {
    const job = schedule.scheduledJobs[jobName];
    if (job && job.nextInvocation) {
      return job.nextInvocation();
    }
    return null;
  }

  showNextExecutions() {
    console.log('\n📅 Next Scheduled Executions:');
    
    Object.keys(schedule.scheduledJobs).forEach(jobName => {
      const nextExecution = this.getNextExecutionTime(jobName);
      if (nextExecution) {
        console.log(`  ${jobName}: ${nextExecution.toLocaleString()}`);
      }
    });
  }

  showStatus() {
    console.log('\n📊 Scheduler Status:');
    console.log(`  Running: ${this.isRunning ? 'Yes' : 'No'}`);
    console.log(`  Active Jobs: ${this.jobs.length}`);
    console.log(`  Auto Generate: ${this.config.autoGenerate ? 'Enabled' : 'Disabled'}`);
    console.log(`  Auto Publish: ${this.config.autoPublish ? 'Enabled' : 'Disabled'}`);
    console.log(`  Max Posts/Day: ${this.config.maxPostsPerDay}`);
    console.log(`  Min Queue Size: ${this.config.minQueueSize}`);
    
    if (this.isRunning) {
      this.showNextExecutions();
    }
  }
}

// Command-line interface
async function main() {
  const scheduler = new AutonomousScheduler();
  
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    switch (command) {
      case 'start':
        console.log('🚀 Starting Autonomous LinkedIn Scheduler...');
        scheduler.start();
        
        // Keep process running
        console.log('✅ Scheduler is running. Press Ctrl+C to stop.');
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log('\n⏹️  Stopping scheduler...');
          scheduler.stop();
          process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {
          // Heartbeat - do nothing, just keep process alive
        }, 60000);
        
        break;
        
      case 'status':
        scheduler.showStatus();
        break;
        
      case 'generate-now':
        console.log('🤖 Executing immediate post generation...');
        await scheduler.executePostGeneration();
        console.log('✅ Generation completed');
        break;
        
      case 'publish-now':
        console.log('📤 Executing immediate post publishing...');
        await scheduler.executePostPublishing();
        console.log('✅ Publishing completed');
        break;
        
      case 'maintenance-now':
        console.log('🔧 Executing immediate maintenance...');
        await scheduler.executeDailyMaintenance();
        console.log('✅ Maintenance completed');
        break;
        
      default:
        console.log(`
🤖 Autonomous LinkedIn Scheduler

Usage:
  node autonomous-scheduler.js [command]

Commands:
  start           Start the scheduler (default)
  status          Show scheduler status
  generate-now    Execute post generation immediately
  publish-now     Execute post publishing immediately
  maintenance-now Execute maintenance immediately

Environment Variables:
  GENERATE_SCHEDULE    Cron schedule for post generation (default: 0 9,15,21 * * *)
  PUBLISH_SCHEDULE     Cron schedule for post publishing (default: 0 10,16 * * 1-5)
  MAX_POSTS_PER_DAY    Maximum posts per day (default: 3)
  MIN_QUEUE_SIZE       Minimum posts to maintain in queue (default: 5)
  AUTO_GENERATE        Enable auto generation (default: true)
  AUTO_PUBLISH         Enable auto publishing (default: true)

Examples:
  node autonomous-scheduler.js start
  node autonomous-scheduler.js status
  node autonomous-scheduler.js generate-now
        `);
        break;
    }
    
  } catch (error) {
    logger.error('Application error:', error);
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutonomousScheduler;