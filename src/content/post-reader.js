const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class PostReader {
  constructor() {
    this.postsFolder = process.env.POSTS_FOLDER || './posts';
    this.savedPostsFolder = './saved-posts'; // Keep backward compatibility
    this.supportedFormats = ['.txt', '.md', '.json'];
    this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  }

  async ensurePostsFolder() {
    try {
      await fs.access(this.postsFolder);
    } catch (error) {
      logger.info(`Creating posts folder: ${this.postsFolder}`);
      await fs.mkdir(this.postsFolder, { recursive: true });
    }
  }

  // NEW: Get all posts from the main posts folder (files and folders)
  async getAllPostsFromPosts() {
    try {
      await this.ensurePostsFolder();
      
      const items = await fs.readdir(this.postsFolder);
      const posts = [];

      for (const item of items) {
        const itemPath = path.join(this.postsFolder, item);
        const itemStats = await fs.stat(itemPath);

        if (itemStats.isDirectory()) {
          // Post folder with potential media
          const post = await this.readPostFolder(itemPath);
          if (post) {
            posts.push({
              ...post,
              foldername: item,
              folderpath: itemPath,
              hasMedia: post.mediaFiles && post.mediaFiles.length > 0,
              type: 'folder'
            });
          }
        } else if (itemStats.isFile() && this.supportedFormats.some(ext => item.toLowerCase().endsWith(ext))) {
          // Single text post file
          const post = await this.readPostFile(itemPath);
          if (post) {
            posts.push({
              ...post,
              filename: item,
              filepath: itemPath,
              hasMedia: false,
              type: 'file'
            });
          }
        }
      }

      logger.info(`Found ${posts.length} posts in posts folder`);
      return posts;
    } catch (error) {
      logger.error('Failed to get posts from posts folder:', error);
      return [];
    }
  }

  async readPostFolder(folderPath) {
    try {
      const files = await fs.readdir(folderPath);
      
      // Find the main post content file
      const contentFiles = files.filter(file => 
        this.supportedFormats.some(ext => file.toLowerCase().endsWith(ext))
      );

      if (contentFiles.length === 0) {
        logger.warn(`No content file found in folder: ${folderPath}`);
        return null;
      }

      // Use the first content file found
      const contentFile = contentFiles[0];
      const contentPath = path.join(folderPath, contentFile);
      const post = await this.readPostFile(contentPath);

      if (!post) return null;

      // Find media files
      const mediaFiles = files.filter(file => 
        this.supportedImageFormats.some(ext => file.toLowerCase().endsWith(ext))
      ).map(file => path.join(folderPath, file));

      return {
        ...post,
        id: path.basename(folderPath),
        contentFile,
        mediaFiles,
        folderPath
      };
    } catch (error) {
      logger.error(`Failed to read post folder ${folderPath}:`, error);
      return null;
    }
  }

  // BACKWARD COMPATIBILITY: Get posts from saved-posts folder
  async getAllSavedPosts() {
    try {
      // Check if saved-posts folder exists
      try {
        await fs.access(this.savedPostsFolder);
      } catch (error) {
        logger.info('No saved-posts folder found, using posts folder');
        return await this.getAllPostsFromPosts();
      }
      
      const files = await fs.readdir(this.savedPostsFolder);
      const postFiles = files.filter(file => 
        this.supportedFormats.some(ext => file.toLowerCase().endsWith(ext))
      );

      if (postFiles.length === 0) {
        logger.info('No saved posts found in saved-posts folder');
        return [];
      }

      const posts = [];
      for (const file of postFiles) {
        try {
          const post = await this.readPostFile(path.join(this.savedPostsFolder, file));
          if (post) {
            posts.push({
              ...post,
              filename: file,
              filepath: path.join(this.savedPostsFolder, file),
              hasMedia: false,
              type: 'file'
            });
          }
        } catch (error) {
          logger.error(`Failed to read post file ${file}:`, error);
        }
      }

      logger.info(`Found ${posts.length} saved posts`);
      return posts;
    } catch (error) {
      logger.error('Failed to get saved posts:', error);
      return [];
    }
  }

  async readPostFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const ext = path.extname(filepath).toLowerCase();
      
      switch (ext) {
        case '.json':
          return this.parseJsonPost(content, filepath);
        case '.md':
        case '.txt':
          return this.parseTextPost(content, filepath);
        default:
          throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      logger.error(`Failed to read post file ${filepath}:`, error);
      return null;
    }
  }

  parseJsonPost(content, filepath) {
    try {
      const data = JSON.parse(content);
      
      // Handle different JSON structures
      if (Array.isArray(data)) {
        // Array of posts - return first one
        const post = data[0];
        return {
          id: post.id || path.basename(filepath, path.extname(filepath)),
          content: post.content || post.text || post.post,
          topic: post.topic || post.title || 'Saved Post',
          timestamp: post.timestamp || post.created_at || new Date(),
          hashtags: post.hashtags || [],
          type: 'json'
        };
      } else if (data.content || data.text || data.post) {
        // Single post object
        return {
          id: data.id || path.basename(filepath, path.extname(filepath)),
          content: data.content || data.text || data.post,
          topic: data.topic || data.title || 'Saved Post',
          timestamp: data.timestamp || data.created_at || new Date(),
          hashtags: data.hashtags || [],
          type: 'json'
        };
      } else {
        throw new Error('JSON file does not contain valid post structure');
      }
    } catch (error) {
      logger.error(`Failed to parse JSON post ${filepath}:`, error);
      return null;
    }
  }

  parseTextPost(content, filepath) {
    try {
      // Clean up the content
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        return null;
      }

      // Extract hashtags from content
      const hashtags = [];
      const contentLines = [];
      
      for (const line of lines) {
        const hashtagMatches = line.match(/#[\w\d_]+/g);
        if (hashtagMatches) {
          hashtags.push(...hashtagMatches);
        }
        contentLines.push(line);
      }

      const fullContent = contentLines.join('\n').trim();
      
      // Try to extract title from filename or first line
      const filename = path.basename(filepath, path.extname(filepath));
      let topic = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // If filename is generic, try to use first line as topic
      if (topic.length < 10 || /post|saved|content/i.test(topic)) {
        const firstLine = lines[0];
        if (firstLine && firstLine.length < 100) {
          topic = firstLine.replace(/[^\w\s]/g, '').trim() || topic;
        }
      }

      return {
        id: path.basename(filepath, path.extname(filepath)),
        content: fullContent,
        topic: topic,
        timestamp: new Date(),
        hashtags: [...new Set(hashtags)], // Remove duplicates
        type: path.extname(filepath).slice(1) // Remove the dot
      };
    } catch (error) {
      logger.error(`Failed to parse text post ${filepath}:`, error);
      return null;
    }
  }

  async getPostById(id) {
    const posts = await this.getAllSavedPosts();
    return posts.find(post => post.id === id);
  }

  async getRandomPost() {
    const posts = await this.getAllSavedPosts();
    if (posts.length === 0) {
      return null;
    }
    return posts[Math.floor(Math.random() * posts.length)];
  }

  
  async savePostToFolder(content, topic = 'Generated Post', format = 'txt', hasMedia = false) {
    try {
      await this.ensurePostsFolder();
      
      const timestamp = new Date();
      const folderName = this.generateFolderName(topic, timestamp);
      const folderPath = path.join(this.postsFolder, folderName);
      
      // Create post folder
      await fs.mkdir(folderPath, { recursive: true });
      
      // Save content file
      const filename = `post.${format}`;
      const filepath = path.join(folderPath, filename);
      
      let fileContent;
      if (format === 'json') {
        const postData = {
          id: folderName,
          content,
          topic,
          timestamp: timestamp.toISOString(),
          created_at: timestamp.toISOString(),
          hasMedia
        };
        fileContent = JSON.stringify(postData, null, 2);
      } else {
        fileContent = content;
      }
      
      await fs.writeFile(filepath, fileContent, 'utf8');
      logger.info(`Saved post to folder: ${folderPath}`);
      
      return {
        folderPath,
        folderName,
        success: true,
        hasMedia
      };
    } catch (error) {
      logger.error('Failed to save post to folder:', error);
      return {
        folderPath: null,
        folderName: null,
        success: false,
        error: error.message
      };
    }
  }

  generateFolderName(topic, timestamp) {
    // Clean topic for folder name
    const cleanTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    const dateStr = timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = timestamp.toISOString().slice(11, 19).replace(/:/g, '-'); // HH-MM-SS
    
    return `${dateStr}_${timeStr}_${cleanTopic}`;
  }

  async savePost(content, topic = 'Generated Post', format = 'json') {
    try {
      await this.ensurePostsFolder();
      
      // Save to saved-posts folder for backward compatibility
      const timestamp = new Date();
      const filename = this.generateFilename(topic, timestamp, format);
      const filepath = path.join(this.savedPostsFolder, filename);
      
      // Ensure saved-posts directory exists
      try {
        await fs.access(this.savedPostsFolder);
      } catch (error) {
        await fs.mkdir(this.savedPostsFolder, { recursive: true });
      }
      
      let fileContent;
      
      if (format === 'json') {
        const postData = {
          id: path.basename(filename, path.extname(filename)),
          content,
          topic,
          timestamp: timestamp.toISOString(),
          created_at: timestamp.toISOString()
        };
        fileContent = JSON.stringify(postData, null, 2);
      } else {
        fileContent = content;
      }
      
      await fs.writeFile(filepath, fileContent, 'utf8');
      logger.info(`Saved post to: ${filepath}`);
      
      return {
        filepath,
        filename,
        success: true
      };
    } catch (error) {
      logger.error('Failed to save post:', error);
      return {
        filepath: null,
        filename: null,
        success: false,
        error: error.message
      };
    }
  }

  generateFilename(topic, timestamp, format) {
    // Clean topic for filename
    const cleanTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    const dateStr = timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = timestamp.toISOString().slice(11, 19).replace(/:/g, '-'); // HH-MM-SS
    
    return `${dateStr}_${timeStr}_${cleanTopic}.${format}`;
  }

  async getPostStats() {
    try {
      const posts = await this.getAllSavedPosts();
      const stats = {
        total: posts.length,
        byType: {},
        byTopic: {},
        oldestPost: null,
        newestPost: null
      };

      posts.forEach(post => {
        // Count by file type
        stats.byType[post.type] = (stats.byType[post.type] || 0) + 1;
        
        // Count by topic (simplified)
        const topicKey = post.topic.substring(0, 20);
        stats.byTopic[topicKey] = (stats.byTopic[topicKey] || 0) + 1;
        
        // Track oldest and newest
        const postDate = new Date(post.timestamp);
        if (!stats.oldestPost || postDate < new Date(stats.oldestPost.timestamp)) {
          stats.oldestPost = post;
        }
        if (!stats.newestPost || postDate > new Date(stats.newestPost.timestamp)) {
          stats.newestPost = post;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get post stats:', error);
      return null;
    }
  }
}

module.exports = PostReader;