const fs = require('fs-extra');
const path = require('path');
const { Ollama } = require('ollama');
const axios = require('axios');
const logger = require('../utils/logger');

// Try to load canvas, but handle gracefully if not available
let createCanvas, loadImage, registerFont;
let canvasAvailable = false;

try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
  registerFont = canvas.registerFont;
  canvasAvailable = true;
  logger.info('Canvas library loaded successfully');
} catch (error) {
  logger.warn('Canvas library not available - image generation will use fallback method');
  canvasAvailable = false;
}

class ImageGenerator {
  constructor() {
    this.llmProvider = 'ollama'; // Always use Ollama
    this.canvasWidth = parseInt(process.env.IMAGE_WIDTH) || 1200;
    this.canvasHeight = parseInt(process.env.IMAGE_HEIGHT) || 630;
    this.canvasAvailable = canvasAvailable;
    
    // Initialize Ollama for image content enhancement
    this.ollama = new Ollama({ 
      host: process.env.OLLAMA_API_URL || 'http://localhost:11434' 
    });
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    
    logger.info(`Image Generator initialized (Canvas: ${this.canvasAvailable ? 'Available' : 'Fallback Mode'})`);
  }

  async generateImageForPost(postContent, topic, outputPath) {
    try {
      logger.info(`Generating image for topic: ${topic}`);
      
      if (!this.canvasAvailable) {
        // Use fallback method without canvas
        return await this.createFallbackTextImage(topic, outputPath);
      }
      
      // Extract key themes from post content
      const imageDescription = await this.generateImageDescription(postContent, topic);
      
      // Generate the image
      const imagePath = await this.createContextualImage(imageDescription, topic, outputPath);
      
      logger.info(`Image generated successfully: ${imagePath}`);
      return imagePath;
      
    } catch (error) {
      logger.error('Failed to generate image:', error);
      
      // Fallback to simple text-based image
      return await this.createFallbackTextImage(topic, outputPath);
    }
  }

  async generateImageDescription(postContent, topic) {
    try {
      const prompt = `Based on this LinkedIn post content about "${topic}", generate a detailed description for a professional business image.

Post content: ${postContent.substring(0, 500)}

Create an image description for professional business/technology theme with appropriate colors and modern design.

Return only the image description, nothing else.`;

      let description;
      
      if (this.ollama) {
        const response = await this.ollama.chat({
          model: this.ollamaModel,
          messages: [
            {
              role: 'system',
              content: 'You are a professional graphic designer who creates descriptions for business and technology images.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
        });
        description = response.message.content;
      } else {
        description = this.getFallbackImageDescription(topic);
      }
      
      return description;
      
    } catch (error) {
      logger.error('Failed to generate image description:', error);
      return this.getFallbackImageDescription(topic);
    }
  }

  async createFallbackTextImage(topic, outputPath) {
    try {
      logger.info('Creating fallback text-based image');
      
      // Create a simple SVG image as fallback
      const title = this.extractTitleFromTopic(topic);
      const subtitle = this.generateSubtitle(topic);
      const colors = this.getTopicColors(topic);
      
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.canvasWidth}" height="${this.canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad1)" />
  
  <!-- Pattern overlay -->
  <g opacity="0.1">
    <circle cx="100" cy="100" r="50" fill="white"/>
    <circle cx="300" cy="200" r="30" fill="white"/>
    <circle cx="500" cy="150" r="40" fill="white"/>
    <circle cx="700" cy="300" r="25" fill="white"/>
    <circle cx="900" cy="250" r="35" fill="white"/>
    <circle cx="1100" cy="400" r="45" fill="white"/>
  </g>
  
  <!-- Main title -->
  <text x="${this.canvasWidth / 2}" y="${this.canvasHeight / 2 - 40}" 
        font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
        text-anchor="middle" fill="white">${title}</text>
  
  <!-- Subtitle -->
  <text x="${this.canvasWidth / 2}" y="${this.canvasHeight / 2 + 40}" 
        font-family="Arial, sans-serif" font-size="32" 
        text-anchor="middle" fill="rgba(255,255,255,0.8)">${subtitle}</text>
  
  <!-- LinkedIn branding -->
  <text x="${this.canvasWidth / 2}" y="${this.canvasHeight - 40}" 
        font-family="Arial, sans-serif" font-size="24" 
        text-anchor="middle" fill="rgba(255,255,255,0.7)">LinkedIn Professional Content</text>
  
  <!-- Border -->
  <rect x="50" y="50" width="${this.canvasWidth - 100}" height="${this.canvasHeight - 100}" 
        fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
</svg>`;

      await fs.ensureDir(path.dirname(outputPath));
      
      // Change extension to .svg
      const svgPath = outputPath.replace(/\.[^.]+$/, '.svg');
      await fs.writeFile(svgPath, svgContent);
      
      logger.info(`Fallback SVG image created: ${svgPath}`);
      return svgPath;
      
    } catch (error) {
      logger.error('Failed to create fallback text image:', error);
      throw error;
    }
  }

  getTopicColors(topic) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
      return { primary: '#1e3a8a', secondary: '#3b82f6' }; // Blue
    } else if (topicLower.includes('cyber') || topicLower.includes('security')) {
      return { primary: '#991b1b', secondary: '#dc2626' }; // Red
    } else if (topicLower.includes('cloud')) {
      return { primary: '#0f766e', secondary: '#14b8a6' }; // Teal
    } else if (topicLower.includes('saas') || topicLower.includes('software')) {
      return { primary: '#7c3aed', secondary: '#a855f7' }; // Purple
    } else {
      return { primary: '#1f2937', secondary: '#4b5563' }; // Gray
    }
  }

  extractTitleFromTopic(topic) {
    // Extract meaningful title from topic
    if (topic.includes('AI')) return 'AI Innovation';
    if (topic.includes('Cyber')) return 'Cybersecurity';
    if (topic.includes('Cloud')) return 'Cloud Solutions';
    if (topic.includes('SaaS')) return 'SaaS Solutions';
    if (topic.includes('Digital')) return 'Digital Transform';
    if (topic.includes('Programming')) return 'Programming';
    if (topic.includes('Microservices')) return 'Microservices';
    
    return 'Technology';
  }

  generateSubtitle(topic) {
    const subtitles = {
      'AI': 'Artificial Intelligence Innovation',
      'Cyber': 'Advanced Security Solutions',
      'Cloud': 'Cloud Computing Excellence',
      'SaaS': 'Software as a Service',
      'Digital': 'Digital Transformation',
      'Programming': 'Software Development',
      'Microservices': 'Modern Architecture'
    };
    
    for (const [key, subtitle] of Object.entries(subtitles)) {
      if (topic.includes(key)) return subtitle;
    }
    
    return 'Professional Technology Content';
  }

  getFallbackImageDescription(topic) {
    return `Professional business image featuring modern technology themes related to ${topic}. Clean design with blue and gray colors, suitable for LinkedIn professional audience.`;
  }

  async generatePostImage(title, subtitle = '', theme = 'tech') {
    try {
      logger.info(`Generating post image: ${title} (${theme})`);
      
      const timestamp = Date.now();
      const filename = `post-${timestamp}.svg`;
      const outputPath = path.join(process.cwd(), 'generated-images', filename);
      
      await fs.ensureDir(path.join(process.cwd(), 'generated-images'));
      
      // Use Ollama to enhance the image content
      let enhancedContent = { title, subtitle, theme };
      
      if (this.ollama) {
        enhancedContent = await this.enhanceImageWithOllama(title, subtitle, theme);
      }
      
      const colors = this.getThemeColors(enhancedContent.theme || theme);
      
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.canvasWidth}" height="${this.canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad1)" />
  
  <!-- Decorative circles -->
  <g opacity="0.15">
    <circle cx="1000" cy="100" r="150" fill="white"/>
    <circle cx="200" cy="500" r="100" fill="white"/>
    <circle cx="800" cy="400" r="80" fill="white"/>
  </g>
  
  <!-- Main title -->
  <text x="${this.canvasWidth / 2}" y="${this.canvasHeight / 2 - 50}" 
        font-family="Arial, sans-serif" font-size="64" font-weight="bold" 
        text-anchor="middle" fill="white">${this.escapeXml(enhancedContent.title || title)}</text>
  
  <!-- Subtitle -->
  ${(enhancedContent.subtitle || subtitle) ? `<text x="${this.canvasWidth / 2}" y="${this.canvasHeight / 2 + 30}" 
        font-family="Arial, sans-serif" font-size="32" 
        text-anchor="middle" fill="rgba(255,255,255,0.9)">${this.escapeXml(enhancedContent.subtitle || subtitle)}</text>` : ''}
  
  <!-- Footer branding -->
  <text x="${this.canvasWidth - 50}" y="${this.canvasHeight - 40}" 
        font-family="Arial, sans-serif" font-size="20" 
        text-anchor="end" fill="rgba(255,255,255,0.6)">${this.escapeXml(enhancedContent.hashtags || '#TechInnovation #AI')}</text>
  
  <!-- Border accent -->
  <rect x="40" y="40" width="${this.canvasWidth - 80}" height="${this.canvasHeight - 80}" 
        fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
</svg>`;

      await fs.writeFile(outputPath, svgContent);
      logger.info(`Post image created: ${outputPath}`);
      
      return outputPath;
      
    } catch (error) {
      logger.error('Failed to generate post image:', error);
      throw error;
    }
  }

  getThemeColors(theme) {
    const themes = {
      'ai': { primary: '#667eea', secondary: '#764ba2' },
      'cybersecurity': { primary: '#f093fb', secondary: '#f5576c' },
      'tech': { primary: '#4facfe', secondary: '#00f2fe' },
      'business': { primary: '#43e97b', secondary: '#38f9d7' },
      'cloud': { primary: '#fa709a', secondary: '#fee140' }
    };
    
    return themes[theme] || themes.tech;
  }

  async enhanceImageWithOllama(title, subtitle, theme) {
    try {
      logger.info('Using Ollama to enhance image content...');
      
      const prompt = `You are a creative designer for LinkedIn posts. Given this information:
      
Title: "${title}"
Subtitle: "${subtitle}"
Theme: ${theme}

Please suggest:
1. An improved, more engaging title (max 5 words, professional)
2. A catchy subtitle (max 7 words)
3. Relevant hashtags (2-3 hashtags)
4. Best color theme (choose from: ai, cybersecurity, tech, business, cloud)

Respond in this exact JSON format:
{
  "title": "improved title here",
  "subtitle": "catchy subtitle here",
  "hashtags": "#Hashtag1 #Hashtag2",
  "theme": "theme_name"
}`;

      const response = await this.ollama.chat({
        model: this.ollamaModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional LinkedIn content designer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        format: 'json'
      });

      try {
        const enhanced = JSON.parse(response.message.content);
        logger.info('Ollama enhanced image content successfully');
        return {
          title: enhanced.title || title,
          subtitle: enhanced.subtitle || subtitle,
          hashtags: enhanced.hashtags || '#TechInnovation #AI',
          theme: enhanced.theme || theme
        };
      } catch (parseError) {
        logger.warn('Failed to parse Ollama response, using original content');
        return { title, subtitle, theme, hashtags: '#TechInnovation #AI' };
      }
      
    } catch (error) {
      logger.warn('Ollama enhancement failed, using original content:', error.message);
      return { title, subtitle, theme, hashtags: '#TechInnovation #AI' };
    }
  }

  escapeXml(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
  }
}

module.exports = ImageGenerator;