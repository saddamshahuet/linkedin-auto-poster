const OpenAI = require('openai');
const logger = require('../utils/logger');
const { aiContentTemplates, hashtagSets } = require('./templates');

class AIContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateITInnovationPost(topic = 'AI Infrastructure') {
    try {
      const templates = aiContentTemplates[topic] || aiContentTemplates['AI Infrastructure'];
      const hashtags = hashtagSets.itInnovation;
      
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

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a thought leader in IT innovation and digital transformation. Create compelling LinkedIn posts that generate engagement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
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