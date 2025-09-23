const fs = require('fs-extra');
const path = require('path');

class Logger {
  constructor() {
    this.logFile = path.join(__dirname, '..', '..', 'logs', 'app.log');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    await fs.ensureDir(logDir);
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    
    return JSON.stringify(logEntry);
  }

  async writeToFile(logEntry) {
    try {
      await fs.appendFile(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, data = null) {
    const logEntry = this.formatMessage('INFO', message, data);
    console.log(`ℹ️  ${message}`);
    this.writeToFile(logEntry);
  }

  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    } : null;
    
    const logEntry = this.formatMessage('ERROR', message, errorData);
    console.error(`❌ ${message}`, error ? error.message : '');
    this.writeToFile(logEntry);
  }

  warn(message, data = null) {
    const logEntry = this.formatMessage('WARN', message, data);
    console.warn(`⚠️  ${message}`);
    this.writeToFile(logEntry);
  }

  debug(message, data = null) {
    if (process.env.LOG_LEVEL === 'debug') {
      const logEntry = this.formatMessage('DEBUG', message, data);
      console.log(`🐛 ${message}`);
      this.writeToFile(logEntry);
    }
  }

  success(message, data = null) {
    const logEntry = this.formatMessage('SUCCESS', message, data);
    console.log(`✅ ${message}`);
    this.writeToFile(logEntry);
  }
}

module.exports = new Logger();