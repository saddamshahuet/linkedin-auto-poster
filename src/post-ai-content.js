const LinkedInAutoPoster = require('./index');

async function postAIContent() {
  const autoPoster = new LinkedInAutoPoster();
  
  try {
    console.log('🚀 Starting AI-powered LinkedIn posting...');
    
    const initialized = await autoPoster.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize auto poster');
    }
    
    // Generate and post 3 AI-generated IT innovation posts
    const topics = [
      'AI Infrastructure', 
      'AI Cybersecurity', 
      'Digital Transformation'
    ];
    
    await autoPoster.postAIGeneratedContent(topics);
    
    console.log('✅ AI content posting completed successfully!');
    
  } catch (error) {
    console.error('❌ Error posting AI content:', error.message);
  } finally {
    await autoPoster.stop();
  }
}

// Run if called directly
if (require.main === module) {
  postAIContent().catch(console.error);
}

module.exports = postAIContent;