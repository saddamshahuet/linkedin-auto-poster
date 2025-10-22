# 🤖 Autonomous LinkedIn Auto Poster with Task Scheduling

An advanced, fully autonomous LinkedIn posting system featuring **100% FREE and OPEN-SOURCE** AI content generation using Ollama, intelligent scheduling, media support, and Windows Task Scheduler integration for completely hands-off operation.

## 🚀 Enhanced Features

### **Autonomous Operation**
- 🔄 **Task Scheduler Integration**: Windows Task Scheduler setup for autonomous posting
- 🤖 **Smart Post Generation**: AI-powered content creation for IT, Cloud, SaaS, and tech topics  
- 📁 **Flexible Post Management**: Support for single files and folders with media
- 🎨 **Automatic Image Generation**: Context-aware professional images for posts
- ⏰ **Intelligent Scheduling**: Configurable post generation and publishing schedules
- 📊 **Queue Management**: Maintains optimal post inventory automatically

### **Free & Open Source AI**
- 🏠 **Ollama Local LLM**: 100% free, privacy-focused local content generation
- � **No API Costs**: Zero cloud dependencies for AI
- 🌐 **Offline Capable**: Run completely without internet connection
- 🎯 **Multiple Models**: Support for llama2, mistral, codellama, and more

### **Advanced Post Structure**
- 📝 **Text-Only Posts**: Simple `.txt`, `.md`, or `.json` files in posts folder
- 🖼️ **Posts with Media**: Folders containing text + images for rich content
- 📂 **Backward Compatibility**: Supports existing `saved-posts` folder structure
- 🎯 **Topic-Specific Content**: Cloud, SaaS, Microservices, Programming, and more

## 📋 Project Structure

```
linkedin-auto-poster/
├── posts/                              # NEW: Autonomous post management
│   ├── single-post.txt                 # Text-only posts
│   ├── microservices-architecture.txt  # Topic-specific content
│   └── cloud-trends/                   # Post folder with media
│       ├── post.txt                    # Post content
│       └── post-image.png              # Associated image
├── src/
│   ├── scheduler/                       # NEW: Autonomous scheduling
│   │   ├── autonomous-scheduler.js     # Main scheduler with cron jobs
│   │   ├── autonomous-post-generator.js # Intelligent post generation
│   │   ├── autonomous-post-publisher.js # Queue-based publishing
│   │   └── setup-task-scheduler.js     # Windows Task Scheduler setup
│   ├── media/                          # NEW: Image generation
│   │   └── image-generator.js          # AI-powered image creation
│   ├── automation/
│   │   └── linkedin-browser.js         # Enhanced LinkedIn automation
│   ├── content/
│   │   ├── ai-generator.js            # Multi-LLM content generation
│   │   ├── post-reader.js             # Enhanced post management
│   │   └── templates.js               # Content templates
│   └── utils/
│       ├── logger.js                  # Enhanced logging
│       └── helpers.js                 # Utility functions
├── saved-posts/                       # Backward compatibility
├── data/                              # Analytics and tracking
├── logs/                              # System logs
└── .env                               # Configuration
```

## ⚡ Quick Start - Autonomous Setup

### 1. Installation
```bash
git clone https://github.com/your-username/linkedin-auto-poster.git
cd linkedin-auto-poster
npm install
```

### 2. Configuration
```bash
cp .env.example .env
# Edit .env with your credentials and preferences
```

**Key Configuration Options:**
```env
# LinkedIn Credentials
LINKEDIN_EMAIL=your_email
LINKEDIN_PASSWORD=your_password

# LLM Provider - Ollama (Free & Open Source)
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2
# Available models: llama2, llama3, mistral, codellama, etc.

# Autonomous Scheduling
GENERATE_SCHEDULE=0 9,15,21 * * *    # Generate at 9AM, 3PM, 9PM
PUBLISH_SCHEDULE=0 10,16 * * 1-5     # Publish at 10AM, 4PM weekdays
MAX_POSTS_PER_DAY=3
MIN_QUEUE_SIZE=5
AUTO_GENERATE=true
AUTO_PUBLISH=true

# Posts Management
POSTS_FOLDER=posts
```

### 3. Install and Setup Ollama

**Download Ollama:**
1. Visit https://ollama.ai/download
2. Download and install for Windows
3. Start Ollama service

**Pull a model:**
```bash
ollama pull llama2
# or
ollama pull mistral
# or
ollama pull llama3
```

**Verify installation:**
```bash
ollama list
```

### 4. Setup Windows Task Scheduler (Run as Administrator)
```bash
node src/scheduler/setup-task-scheduler.js setup
```

This creates three automated tasks:
- **Post Generator**: Creates content every 6 hours
- **Post Publisher**: Publishes posts on weekdays  
- **Main Scheduler**: Coordinates everything automatically

### 4. Start Immediate Operation
```bash
# Test post generation
npm run post-generator daily-batch

# Test post publishing  
npm run post-publisher publish-next

# Start autonomous scheduler
npm run scheduler start
```

## 🎯 Usage Modes

### **1. Fully Autonomous Mode**
Set up once and forget - the system manages everything:
```bash
# Setup (run once as Administrator)
node src/scheduler/setup-task-scheduler.js setup

# System runs automatically via Windows Task Scheduler
# - Generates posts 3x daily
# - Publishes posts on weekdays
# - Maintains queue of 5+ posts
# - Creates both text-only and posts with images
```

### **2. Semi-Autonomous Mode**
Manual control with automated assistance:
```bash
# Generate posts on demand
npm run post-generator multiple 3

# Publish when ready
npm run post-publisher publish-multiple 2

# Monitor queue status
npm run post-publisher stats
```

### **3. Manual Mode**
Traditional operation with enhanced features:
```bash
# Generate and publish immediately
npm run generate-post

# Publish from existing posts folder
npm run post-from-folder publish

# Create posts only (no publishing)
node generate-post.js generate-only --domain "Cloud Computing"
```

## 📁 Post Management System

### **Text-Only Posts**
Simple files in the `posts/` folder:
```
posts/
├── ai-innovations.txt
├── cybersecurity-trends.md
└── saas-solutions.json
```

### **Posts with Media**
Folders containing content and images:
```
posts/
└── cloud-computing-revolution/
    ├── post.txt              # Post content
    ├── cloud-diagram.png     # Main image
    └── infographic.jpg       # Additional media
```

### **Automatic Post Generation**
The system automatically creates both types:
- **60% Text-Only**: Pure content posts optimized for engagement
- **40% With Media**: Professional images generated to match content

## 🎨 Content Domains

The autonomous system generates content across these professional areas:

**Technology Focus:**
- ☁️ Cloud Computing Solutions
- 🛡️ Cybersecurity and InfoSec
- 🔧 DevOps and Automation
- 🏗️ Microservices Architecture
- 💾 Database Management

**Business Focus:**
- 📊 SaaS Applications and Strategy
- 🤝 Client-Service Packages
- 📈 Digital Transformation
- 💼 IT Services and Infrastructure
- 🔗 API Design and Integration

**Development Focus:**
- 💻 Programming and Development
- 🤖 AI and Machine Learning
- 📱 Software Development Lifecycle
- 🏛️ System Architecture Design
- 🔄 Enterprise Software Solutions

## ⚙️ Advanced Configuration

### **Scheduling Customization**
```env
# Custom cron schedules
GENERATE_SCHEDULE=0 8,14,20 * * *     # 8AM, 2PM, 8PM
PUBLISH_SCHEDULE=0 9,15 * * 1-5       # 9AM, 3PM weekdays only
PUBLISH_SCHEDULE=0 */4 * * *          # Every 4 hours

# Content limits
MAX_POSTS_PER_DAY=5                   # Maximum daily posts
MIN_QUEUE_SIZE=10                     # Minimum posts in queue
```

### **Image Generation**
```env
GENERATE_IMAGES=true
IMAGE_WIDTH=1200                      # LinkedIn optimal width
IMAGE_HEIGHT=630                      # LinkedIn optimal height
```

### **Ollama Configuration**
```env
# Ollama (100% Free & Open Source)
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Available models (download with: ollama pull <model>)
# - llama2: General purpose, balanced
# - llama3: Latest Meta LLM, high quality
# - mistral: Fast and efficient
# - codellama: Programming-focused
# - neural-chat: Conversational
```

## 📊 Monitoring and Analytics

### **Real-Time Status**
```bash
# Scheduler status
npm run scheduler status

# Queue analytics
npm run post-publisher stats

# Generation statistics  
npm run post-generator stats
```

### **Logs and Reports**
- 📝 **Daily Reports**: Automated generation and publishing summaries
- 📊 **Queue Analytics**: Track post inventory and publishing rates
- 🔍 **System Health**: Monitor LLM connectivity and LinkedIn access
- 📈 **Performance Metrics**: Success rates and timing analytics

## 🛠️ Management Commands

### **Post Generation**
```bash
# Generate single random post
node src/scheduler/autonomous-post-generator.js

# Generate multiple posts
node src/scheduler/autonomous-post-generator.js multiple 5

# Generate daily batch (1-3 posts)
node src/scheduler/autonomous-post-generator.js daily-batch

# Show generation statistics
node src/scheduler/autonomous-post-generator.js stats
```

### **Post Publishing**
```bash
# Publish next post from queue
node src/scheduler/autonomous-post-publisher.js

# Publish multiple posts
node src/scheduler/autonomous-post-publisher.js publish-multiple 3

# Show publishing statistics
node src/scheduler/autonomous-post-publisher.js stats
```

### **Task Scheduler Management**
```bash
# Setup all tasks (as Administrator)
node src/scheduler/setup-task-scheduler.js setup

# Remove all tasks
node src/scheduler/setup-task-scheduler.js remove

# List existing tasks
node src/scheduler/setup-task-scheduler.js list

# Generate batch files for manual testing
node src/scheduler/setup-task-scheduler.js batch
```

## 🔧 Troubleshooting

### **Common Issues**

**Task Scheduler Setup:**
- Must run as Administrator
- Ensure Node.js path is correct
- Check Windows Event Logs for task execution

**Ollama Connection:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# List installed models
ollama list

# Pull a model if needed
ollama pull llama2

# Test Ollama chat
ollama run llama2 "Hello"
```

**LinkedIn Authentication:**
- Update credentials in .env
- Check for 2FA requirements  
- Verify browser automation settings

### **Log Files**
- 📝 **Application Logs**: `logs/app.log`
- 📊 **Daily Reports**: `data/reports/daily-report-YYYY-MM-DD.json`
- 📈 **Posted Content**: `data/posts.json`
- 🔄 **Published Tracking**: `data/published-posts.json`

## 🚀 Deployment Scenarios

### **Personal Professional Branding**
- Generate 1-2 posts daily
- Focus on your expertise areas
- Automatic posting during business hours

### **Business Account Management**
- Generate 3-5 posts daily
- Cover multiple service areas
- Schedule for optimal engagement times

### **Agency/Multi-Client Setup**
- Multiple project instances
- Client-specific content domains
- Coordinated publishing schedules

## 📈 Performance Optimizations

- **Smart Queue Management**: Maintains optimal post inventory
- **Rate Limiting**: Respects LinkedIn's posting guidelines
- **Content Deduplication**: Prevents similar posts
- **Peak Hour Scheduling**: Posts during high-engagement times
- **Weekend Scheduling**: Reduced posting on weekends

## 🔒 Security and Privacy

- **100% Local AI**: Ollama runs entirely on your machine - no data sent to cloud
- **Zero API Costs**: No subscription fees or usage charges
- **Complete Privacy**: Your content never leaves your computer
- **Credential Security**: Environment-based configuration
- **Browser Isolation**: Secure automated browsing sessions
- **Log Privacy**: Sensitive data excluded from logs
- **Offline Capable**: Works without internet (except LinkedIn posting)

## 📚 API Documentation

### **Autonomous Post Generator**
```javascript
const generator = new AutonomousPostGenerator();

// Generate random post
const result = await generator.generateRandomPost();

// Generate multiple posts
const batch = await generator.generateMultiplePosts(3);

// Generate daily batch
const daily = await generator.generateDailyBatch();
```

### **Autonomous Post Publisher**  
```javascript
const publisher = new AutonomousPostPublisher();

// Publish next post
const result = await publisher.publishNextPost();

// Get unpublished posts
const posts = await publisher.getUnpublishedPosts();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and professional content automation. Please:
- ✅ Comply with LinkedIn's Terms of Service
- ✅ Respect rate limits and community guidelines  
- ✅ Use responsibly for authentic professional content
- ✅ Monitor automated posts for quality and relevance

---

**Transform your LinkedIn presence with intelligent automation that works while you sleep! 🌙✨**