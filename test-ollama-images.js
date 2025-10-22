#!/usr/bin/env node

require('dotenv').config();
const ImageGenerator = require('./src/media/image-generator');
const logger = require('./src/utils/logger');

async function testOllamaImageGeneration() {
  console.log('\n� Testing 100% Free & Open-Source Image Generation\n');
  console.log('═'.repeat(60));
  
  const imageGen = new ImageGenerator();
  
  // Check configuration
  console.log(`\n📋 Configuration:`);
  console.log(`   AI Provider: Ollama (100% Free & Local)`);
  console.log(`   Ollama URL: ${process.env.OLLAMA_API_URL || 'http://localhost:11434'}`);
  console.log(`   Ollama Model: ${process.env.OLLAMA_MODEL || 'llama2'}`);
  
  // Test cases
  const tests = [
    {
      title: 'AI Revolution',
      subtitle: 'Transform Your Business',
      theme: 'ai',
      description: 'Basic AI theme image'
    },
    {
      title: 'Cybersecurity Alert',
      subtitle: 'Protect Your Data',
      theme: 'cybersecurity',
      description: 'Security-focused image'
    },
    {
      title: 'Cloud Computing',
      subtitle: 'Scale Infinitely',
      theme: 'cloud',
      description: 'Cloud technology image'
    }
  ];
  
  const results = [];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    
    console.log(`\n🎨 Test ${i + 1}/${tests.length}: ${test.description}`);
    console.log('─'.repeat(60));
    console.log(`   Input Title: "${test.title}"`);
    console.log(`   Input Subtitle: "${test.subtitle}"`);
    console.log(`   Input Theme: ${test.theme}`);
    
    try {
      const startTime = Date.now();
      
      // Generate image (will use Ollama if configured)
      const imagePath = await imageGen.generatePostImage(
        test.title,
        test.subtitle,
        test.theme
      );
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Generated in ${duration}ms`);
      console.log(`   📁 Path: ${imagePath}`);
      
      results.push({
        test: test.description,
        success: true,
        path: imagePath,
        duration
      });
      
      // Small delay between requests
      if (i < tests.length - 1) {
        console.log('   ⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        test: test.description,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Successful: ${successful}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (successful > 0) {
    console.log('\n📁 Generated Images:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.path}`);
      console.log(`      Duration: ${r.duration}ms`);
    });
  }
  
  if (failed > 0) {
    console.log('\n❌ Errors:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.test}: ${r.error}`);
    });
  }
  
  console.log('\n' + '═'.repeat(60));
  
  if (process.env.LLM_PROVIDER === 'ollama') {
    console.log('\n💡 How It Works with Ollama:');
    console.log('   1. You provide: title, subtitle, theme');
    console.log('   2. Ollama analyzes and suggests improvements');
    console.log('   3. System generates enhanced SVG image');
    console.log('   4. Image includes AI-optimized content');
  } else {
    console.log('\n💡 To Enable Ollama Enhancement:');
    console.log('   1. Install Ollama: https://ollama.ai');
    console.log('   2. Pull a model: ollama pull llama2');
    console.log('   3. Start Ollama: ollama serve');
    console.log('   4. Set in .env: LLM_PROVIDER=ollama');
    console.log('   5. Run this test again!');
  }
  
  console.log('\n');
}

// Check if Ollama is available
async function checkOllama() {
  if (process.env.LLM_PROVIDER !== 'ollama') {
    return false;
  }
  
  try {
    const { Ollama } = require('ollama');
    const ollama = new Ollama({ 
      host: process.env.OLLAMA_API_URL || 'http://localhost:11434' 
    });
    
    console.log('\n🔍 Checking Ollama connection...');
    
    // Try to list models
    const response = await ollama.list();
    
    if (response && response.models) {
      console.log(`✅ Ollama is running!`);
      console.log(`   Available models: ${response.models.map(m => m.name).join(', ')}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️  Ollama connection failed: ${error.message}`);
    console.log(`   Make sure Ollama is running: ollama serve`);
    return false;
  }
}

async function main() {
  try {
    await checkOllama();
    await testOllamaImageGeneration();
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testOllamaImageGeneration, checkOllama };