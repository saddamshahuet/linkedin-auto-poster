# LinkedIn Auto Poster with Enhanced AI Content Generation

An automated LinkedIn posting system featuring multi-LLM support, saved post management, and AI-generated content for IT solutions and innovation topics.

## 🚀 Features

- 🤖 **Multi-LLM Support**: Generate content using OpenAI GPT-4 or Ollama (local LLM)
- 📝 **Smart Content Generation**: AI-powered posts about IT solutions, cybersecurity, and digital transformation
- 🗂️ **Saved Posts Management**: Read and publish posts from saved files (JSON, TXT, MD formats)
- 🔄 **Automated LinkedIn Posting**: Browser automation for seamless post publishing
- 💾 **Content Persistence**: Save generated content for later use
- 📊 **Post Analytics**: Track and analyze your saved content
- 🎯 **Custom Prompts**: Generate content with custom prompts and domains
- � **Secure Configuration**: Environment-based credential management
- 🌐 **Automated browser interaction**: Direct LinkedIn web interface posting
- 📈 **Professional formatting**: Optimized hashtags and engaging content structure

## Prerequisites

- Node.js 18+ installed
- LinkedIn account with posting permissions
- OpenAI API key for content generation (optional if using Ollama)
- Ollama installed locally for local LLM support (optional)
- Modern web browser for automation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/linkedin-auto-poster.git
cd linkedin-auto-poster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# LLM Configuration
LLM_PROVIDER=openai                    # openai or ollama
OPENAI_API_KEY=your_openai_key_here   # Required for OpenAI
OLLAMA_API_URL=http://localhost:11434  # Ollama API endpoint
OLLAMA_MODEL=llama2                    # Ollama model name

# LinkedIn Credentials (for browser automation)
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password

# Content Configuration
DEFAULT_DOMAIN=Technology              # Default content domain
DEFAULT_PROMPT=Generate an engaging LinkedIn post about technology trends
POSTS_FOLDER=./saved-posts            # Folder for saved posts

# Browser Configuration
HEADLESS=false                        # Set to true for headless browser
```

## Usage

### 1. Generate and Publish New Content

Generate and immediately publish AI content:
```bash
npm run generate-post
```

With custom prompt:
```bash
node generate-post.js --prompt "Write about AI in healthcare" --domain "Healthcare AI"
```

Generate multiple posts:
```bash
node generate-post.js multiple --count 3 --save
```

Generate without publishing:
```bash
node generate-post.js generate-only --domain "Cybersecurity"
```

### 2. Publish Saved Posts

List saved posts:
```bash
npm run post-from-folder list
```

Publish a saved post:
```bash
npm run post-from-folder publish
```

Publish multiple saved posts:
```bash
npm run post-from-folder publish 3
```

Show post statistics:
```bash
npm run post-from-folder stats
```

### 3. Traditional Methods

Run the main automation (3 AI-generated posts):
```bash
npm start
```

Post specific AI content types:
```bash
npm run post-ai-content
```

### 4. LLM Testing

Test your LLM connection:
```bash
node generate-post.js test-llm
```

## LLM Configuration

### OpenAI Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Set `LLM_PROVIDER=openai` in your `.env` file
3. Add your API key: `OPENAI_API_KEY=your_key_here`

### Ollama Setup (Local LLM)
1. Install [Ollama](https://ollama.ai/) locally
2. Pull a model: `ollama pull llama2` or `ollama pull mistral`
3. Set `LLM_PROVIDER=ollama` in your `.env` file
4. Configure model: `OLLAMA_MODEL=llama2` (or your preferred model)
5. Ensure Ollama is running: `ollama serve`

## Saved Posts Management

The system supports reading posts from various file formats:

### Supported Formats
- **JSON**: Structured post data with metadata
- **TXT**: Plain text posts
- **MD**: Markdown formatted posts

### File Examples

**JSON Format** (`saved-posts/my-post.json`):
```json
{
  "id": "tech-trends-2024",
  "topic": "Technology Trends",
  "content": "🚀 Amazing tech trends...",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "hashtags": ["#Tech", "#Innovation"]
}
```

**Text Format** (`saved-posts/cybersecurity-post.txt`):
```text
🛡️ Cybersecurity trends are evolving rapidly...

Key insights:
- AI-powered threat detection
- Zero-trust architecture
- Advanced analytics

#CyberSecurity #AI #InfoSec
```

**Markdown Format** (`saved-posts/digital-transformation.md`):
```markdown
# Digital Transformation Success

💼 Companies are seeing incredible results...

**Key Benefits:**
- 45% efficiency improvement
- $8.2M cost savings
- 78% downtime reduction

#DigitalTransformation #Innovation
```

## AI Content Topics

The system generates content for these IT innovation areas:

- 🚀 AI Infrastructure Management
- 🛡️ AI-Powered Cybersecurity 
- ⚡ Digital Transformation with AI
- 🔮 Predictive Analytics
- 🤝 Machine Learning Applications
- 🌐 Cloud Computing Innovations

## Configuration

### Content Templates

Modify `src/content/templates.js` to customize post templates and topics.

### Posting Schedule

Configure posting intervals in `src/config/schedule.js`.

### Image Generation

Set up image generation parameters in `src/config/media.js`.

## Project Structure

```
linkedin-auto-poster/
├── src/
│   ├── automation/
│   │   └── linkedin-browser.js        # LinkedIn automation with Playwright
│   ├── content/
│   │   ├── ai-generator.js           # Multi-LLM AI content generation
│   │   ├── post-reader.js            # Saved posts management
│   │   └── templates.js              # Post templates and hashtags
│   └── utils/
│       ├── logger.js                 # Logging utilities
│       └── helpers.js                # Helper functions
├── saved-posts/                      # Saved post files (JSON/TXT/MD)
│   ├── ai-infrastructure-post.json
│   ├── cybersecurity-trends.txt
│   └── digital-transformation.md
├── data/
│   └── posts.json                    # Posted content tracking
├── generate-post.js                  # AI post generation script
├── post-from-folder.js              # Saved posts publishing script
├── .env.example                      # Environment configuration template
└── README.md
```

## Example Posts Generated

The system has successfully created and posted these AI-generated posts:

### Post 1: AI Infrastructure Management
```
🚀 AI is revolutionizing IT infrastructure management! From predictive maintenance to intelligent resource allocation, artificial intelligence is transforming enterprise systems. Key benefits: 60% faster incident response, predictive hardware failure detection, $2M+ savings on cloud costs, and zero-touch deployments. The future of IT is intelligent! #AI #ITInfrastructure #DigitalTransformation
```

### Post 2: AI-Powered Cybersecurity
```
🛡️ AI-Powered Cybersecurity: The Game Changer! Traditional security systems are reactive - AI makes them predictive. The latest innovations are revolutionizing how we protect digital assets: ✨ Real-time threat detection with 99.7% accuracy ✨ Zero-day attack prevention through behavioral analysis ✨ Automated incident response in under 30 seconds ✨ Advanced phishing detection using NLP models Organizations using AI cybersecurity report 85% reduction in breach incidents and $3.8M average savings per year. The future is proactive defense! #CyberSecurity #ArtificialIntelligence #ThreatDetection #InfoSec #AIInnovation
```

### Post 3: AI Digital Transformation
```
⚡ The AI-Driven Digital Transformation Wave is Here! Companies adopting AI-first strategies aren't just surviving - they're thriving with 4x faster growth rates. Here's what's trending: 🔮 Predictive Analytics driving business decisions with 95% accuracy 🔮 AI-powered customer experiences increasing satisfaction by 70% 🔮 Intelligent automation reducing operational costs by 45% 🔮 Machine learning optimizing supply chains in real-time The stats speak volumes: 89% of enterprises are already implementing AI solutions, and they're seeing ROI within 6 months. The question isn't whether to adopt AI - it's how fast you can adapt! What AI transformation initiatives is your organization pursuing? #DigitalTransformation #AI #MachineLearning #Innovation #BusinessIntelligence #FutureOfWork
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for educational and automation purposes. Please comply with LinkedIn's Terms of Service and API usage policies. Be respectful of rate limits and community guidelines.