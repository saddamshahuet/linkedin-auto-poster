const { Ollama } = require('ollama');
const logger = require('../utils/logger');
const { aiContentTemplates, hashtagSets } = require('./templates');

class AIContentGenerator {
  constructor() {
    this.llmProvider = 'ollama'; // Always use Ollama
    
    // Initialize Ollama
    this.ollama = new Ollama({ 
      host: process.env.OLLAMA_API_URL || 'http://localhost:11434' 
    });
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    
    logger.info(`AI Content Generator initialized with Ollama (model: ${this.ollamaModel})`);
  }

  async generatePostWithPrompt(customPrompt = null, domain = null) {
    try {
      const prompt = customPrompt || process.env.DEFAULT_PROMPT || 'Generate an engaging LinkedIn post about the latest trends in technology';
      const contentDomain = domain || process.env.DEFAULT_DOMAIN || 'Technology';
      
      logger.info(`Generating post with prompt for domain: ${contentDomain}`);
      
      const enhancedPrompt = `Create an engaging LinkedIn post about ${contentDomain}.

Prompt: ${prompt}

Requirements:
- 150-300 words
- Professional yet engaging tone
- Include 2-4 relevant emojis
- Add specific data points or statistics if relevant
- Include a call-to-action question at the end
- Focus on business value and insights
- Make it shareable and discussion-worthy

Structure:
- Hook with an interesting opening
- 2-3 key points or insights
- Business impact or value
- Engaging question for comments

Make it authentic and valuable for professional audiences.`;

      let content;
      
      if (this.ollama) {
        content = await this.generateWithOllama(enhancedPrompt);
      } else {
        throw new Error('Ollama is not configured properly');
      }
      
      // Add relevant hashtags based on domain
      const hashtags = this.getHashtagsForDomain(contentDomain);
      const postContent = `${content}\n\n${hashtags.join(' ')}`;
      
      logger.info(`Generated post content for domain: ${contentDomain}`);
      return postContent;
      
    } catch (error) {
      logger.error('Failed to generate post with prompt:', error);
      return this.getFallbackContent(domain || 'Technology');
    }
  }

  async generateWithOllama(prompt) {
    const response = await this.ollama.chat({
      model: this.ollamaModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional LinkedIn content creator who generates engaging, valuable posts for business audiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    return response.message.content;
  }

  getHashtagsForDomain(domain) {
    const domainLower = domain.toLowerCase();
    
    if (domainLower.includes('ai') || domainLower.includes('artificial intelligence')) {
      return hashtagSets.itInnovation;
    } else if (domainLower.includes('cyber') || domainLower.includes('security')) {
      return hashtagSets.cybersecurity;
    } else if (domainLower.includes('cloud')) {
      return hashtagSets.cloudComputing;
    } else if (domainLower.includes('machine learning') || domainLower.includes('ml')) {
      return hashtagSets.machineLearning;
    } else if (domainLower.includes('digital') || domainLower.includes('transformation')) {
      return hashtagSets.digitalTransformation;
    } else {
      // Default tech hashtags
      return ['#Technology', '#Innovation', '#Business', '#Leadership', '#Future', '#Growth', '#Insights', '#TechTrends'];
    }
  }

  async generateITInnovationPost(topic = 'AI Infrastructure') {
    try {
      logger.info(`Generating IT Innovation post for topic: ${topic}`);
      
      const prompt = `Create an engaging LinkedIn post about ${topic} in IT innovation. 
      
Requirements:
- 150-300 words
- Professional tone but engaging
- Include specific statistics or data points
- Use emojis strategically (2-4 total)
- Focus on business value and ROI
- End with a question to drive engagement
- Include trending technology concepts

Topics to potentially cover:
- AI and Machine Learning applications
- Digital transformation strategies
- Cybersecurity innovations
- Cloud computing advances
- Automation and efficiency gains
- Predictive analytics
- Customer experience improvements

Make it sound authoritative but accessible. Avoid overly technical jargon.`;

      let content;
      
      if (this.ollama) {
        content = await this.generateWithOllama(prompt);
      } else {
        content = this.getFallbackContent(topic);
      }
      
      const hashtags = hashtagSets.itInnovation;
      const postContent = `${content}\n\n${hashtags.join(' ')}`;
      
      logger.info(`Generated AI content for topic: ${topic}`);
      return postContent;
      
    } catch (error) {
      logger.error('Failed to generate AI content:', error);
      return this.getFallbackContent(topic);
    }
  }

  async generateMultiplePosts(topics, count = 3) {
    const posts = [];
    
    for (let i = 0; i < count; i++) {
      const topic = topics[i % topics.length];
      const content = await this.generateITInnovationPost(topic);
      posts.push({
        topic,
        content,
        timestamp: new Date(),
        id: `post_${Date.now()}_${i}`
      });
      
      // Add delay between API calls
      await this.delay(2000);
    }
    
    return posts;
  }

  getFallbackContent(topic) {
    const fallbackPosts = {
      'AI Infrastructure': `🚀 AI is revolutionizing IT infrastructure management! From predictive maintenance to intelligent resource allocation, artificial intelligence is transforming enterprise systems. 

Key benefits:
✅ 60% faster incident response
✅ Predictive hardware failure detection  
✅ $2M+ savings on cloud costs
✅ Zero-touch deployments

The future of IT is intelligent! What AI infrastructure initiatives is your organization pursuing?

#AI #ITInfrastructure #DigitalTransformation #TechInnovation #ArtificialIntelligence`,

      'AI Cybersecurity': `🛡️ AI-Powered Cybersecurity: The Game Changer!

Traditional security systems are reactive - AI makes them predictive. Latest innovations:

✨ Real-time threat detection (99.7% accuracy)
✨ Zero-day attack prevention  
✨ 30-second automated incident response
✨ Advanced phishing detection using NLP

Organizations report 85% reduction in breach incidents and $3.8M average savings per year.

The future is proactive defense! How is your organization leveraging AI for cybersecurity?

#CyberSecurity #ArtificialIntelligence #ThreatDetection #InfoSec #AIInnovation`,

      'Digital Transformation': `⚡ The AI-Driven Digital Transformation Wave is Here!

Companies adopting AI-first strategies are thriving with 4x faster growth rates.

Trending innovations:
🔮 Predictive Analytics (95% decision accuracy)
🔮 AI customer experiences (+70% satisfaction)
🔮 Intelligent automation (-45% costs)
🔮 Real-time supply chain optimization

89% of enterprises are implementing AI solutions with ROI in 6 months.

The question isn't whether to adopt AI - it's how fast you can adapt!

#DigitalTransformation #AI #MachineLearning #Innovation #BusinessIntelligence #FutureOfWork`
    };

    return fallbackPosts[topic] || fallbackPosts['AI Infrastructure'];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AIContentGenerator;