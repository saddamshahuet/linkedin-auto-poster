// Helper functions for the LinkedIn Auto Poster

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const formatHashtags = (tags) => {
  return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
};

const generatePostId = () => {
  return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const truncateContent = (content, maxLength = 3000) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
};

const extractHashtags = (content) => {
  const hashtagRegex = /#[\w\-]+/g;
  return content.match(hashtagRegex) || [];
};

const removeHashtags = (content) => {
  return content.replace(/#[\w\-]+/g, '').trim().replace(/\s+/g, ' ');
};

const formatTimestamp = (date = new Date()) => {
  return date.toISOString().replace(/[:.]/g, '-').split('.')[0];
};

const parseEnvironmentBool = (envVar, defaultValue = false) => {
  if (!process.env[envVar]) return defaultValue;
  return process.env[envVar].toLowerCase() === 'true';
};

const parseEnvironmentInt = (envVar, defaultValue = 0) => {
  const value = parseInt(process.env[envVar]);
  return isNaN(value) ? defaultValue : value;
};

const validatePostContent = (content) => {
  const errors = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }
  
  if (content.length > 3000) {
    errors.push('Content exceeds 3000 character limit');
  }
  
  // Check for minimum content length
  if (content.trim().length < 10) {
    errors.push('Content too short (minimum 10 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay *= 2;
    }
  }
};

const generateRandomDelay = (min = 1000, max = 5000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const unescapeHtml = (text) => {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#039;)/g, (m) => map[m]);
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

module.exports = {
  delay,
  formatHashtags,
  validateEmail,
  sanitizeFilename,
  generatePostId,
  truncateContent,
  extractHashtags,
  removeHashtags,
  formatTimestamp,
  parseEnvironmentBool,
  parseEnvironmentInt,
  validatePostContent,
  retryOperation,
  generateRandomDelay,
  escapeHtml,
  unescapeHtml,
  isValidUrl,
  getRandomElement,
  shuffleArray,
  chunkArray
};