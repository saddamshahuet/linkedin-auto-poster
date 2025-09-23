# LinkedIn Auto Poster with AI Content Generation

An automated LinkedIn posting system using BrowserMCP and AI-generated content for IT solutions and innovation trending topics.

## Features

- 🤖 AI-powered content generation for IT and innovation topics
- 🌐 Automated LinkedIn posting using BrowserMCP (Playwright fork)
- 🎯 Targeted hashtag optimization
- 📊 Support for posts with images and media
- 🔄 Batch posting capabilities
- 📈 Analytics and engagement tracking

## Prerequisites

- Node.js 18+ installed
- LinkedIn account with posting permissions
- OpenAI API key for content generation
- Browser MCP extension installed and configured

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

Edit `.env` with your credentials:
```
OPENAI_API_KEY=your_openai_api_key_here
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password
```

## Usage

### Basic Usage

Run the automated poster:
```bash
npm start
```

### Generate and Post AI Content

Post AI-generated IT content:
```bash
npm run post-ai-content
```

### Development Mode

Run with hot reload:
```bash
npm run dev
```

## BrowserMCP Integration

This project uses BrowserMCP (a fork of Playwright) to interact with LinkedIn's web interface. The automation steps include:

1. **Navigation**: Navigate to LinkedIn.com
2. **Authentication**: Handle login flow
3. **Post Creation**: Click "Start a post" button
4. **Content Input**: Type AI-generated content
5. **Media Upload**: Add images and media files
6. **Publishing**: Submit posts and handle success dialogs

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
│   │   ├── linkedin-browser.js    # BrowserMCP LinkedIn automation
│   │   └── post-handler.js        # Post creation and management
│   ├── content/
│   │   ├── ai-generator.js        # AI content generation
│   │   ├── templates.js           # Post templates
│   │   └── hashtags.js           # Hashtag optimization
│   ├── media/
│   │   ├── image-generator.js     # AI image generation
│   │   └── poster-images/         # Generated poster images
│   ├── config/
│   │   ├── browser.js            # Browser configuration
│   │   ├── schedule.js           # Posting schedule
│   │   └── media.js              # Media settings
│   ├── utils/
│   │   ├── logger.js             # Logging utilities
│   │   └── helpers.js            # Helper functions
│   └── index.js                  # Main application entry
├── data/
│   ├── posts.json                # Posted content tracking
│   └── analytics.json            # Engagement analytics
├── logs/                         # Application logs
├── .env                         # Environment variables
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