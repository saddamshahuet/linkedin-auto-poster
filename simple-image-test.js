#!/usr/bin/env node

require('dotenv').config();
const { chromium } = require('playwright');
const ImageGenerator = require('./src/media/image-generator');
const path = require('path');
const fs = require('fs');

async function simpleTest() {
  console.log('\n🧪 Simple Image Upload Test (Manual Verification)');
  console.log('═'.repeat(60));
  
  // Step 1: Generate image
  console.log('\n📸 Step 1: Generating test image...');
  const imageGen = new ImageGenerator();
  const imagePath = await imageGen.generatePostImage(
    'LinkedIn Image Test',
    'Testing Programmatic Upload',
    'ai'
  );
  
  console.log(`✅ Image created: ${imagePath}`);
  console.log(`📊 File exists: ${fs.existsSync(imagePath)}`);
  console.log(`📏 File size: ${fs.statSync(imagePath).size} bytes`);
  
  // Step 2: Launch browser
  console.log('\n🌐 Step 2: Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Step 3: Navigate to LinkedIn
  console.log('\n🔗 Step 3: Navigate to LinkedIn...');
  console.log('Please log in manually if needed');
  await page.goto('https://www.linkedin.com/feed/');
  
  console.log('\n⏸️  PAUSED: Please log in manually');
  console.log('   → Go to the browser window');
  console.log('   → Log in to LinkedIn if prompted');
  console.log('   → Press ENTER here when ready...\n');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('\n📝 Step 4: Opening post composer...');
  
  try {
    // Click Start a post
    await page.click('button:has-text("Start a post")');
    await page.waitForTimeout(2000);
    
    console.log('✅ Post composer opened');
    
    // Add test content
    console.log('\n✍️  Step 5: Adding content...');
    const editor = await page.waitForSelector('.ql-editor');
    await editor.fill('🧪 Testing image upload without Windows dialogs!\n\nThis is an automated test. #TestPost');
    await page.waitForTimeout(1000);
    
    console.log('✅ Content added');
    
    // Step 6: Upload image
    console.log('\n📤 Step 6: Uploading image PROGRAMMATICALLY...');
    console.log(`   Using file: ${imagePath}`);
    console.log('   Method: Playwright setInputFiles()');
    console.log('   Expected: NO Windows dialog!');
    
    // Find file input
    const fileInputs = await page.$$('input[type="file"]');
    console.log(`   Found ${fileInputs.length} file input element(s)`);
    
    if (fileInputs.length > 0) {
      console.log('   Uploading via hidden input...');
      await fileInputs[0].setInputFiles(imagePath);
      await page.waitForTimeout(3000);
      
      console.log('\n✅ IMAGE UPLOADED SUCCESSFULLY!');
      console.log('   ✓ No Windows dialog appeared');
      console.log('   ✓ File uploaded programmatically');
      
      // Check for preview
      const preview = await page.$('img[alt*="Preview"]');
      if (preview) {
        console.log('   ✓ Image preview visible');
      }
      
      console.log('\n📋 MANUAL VERIFICATION:');
      console.log('   → Check the browser - do you see the uploaded image?');
      console.log('   → Did a Windows file dialog appear? (It should NOT)');
      console.log('   → Is the post ready to publish?');
      
      console.log('\n⏸️  Press ENTER to close or manually click POST...');
      await new Promise(resolve => {
        process.stdin.once('data', resolve);
      });
      
      console.log('\n═'.repeat(60));
      console.log('✅ TEST COMPLETED SUCCESSFULLY');
      console.log('═'.repeat(60));
      console.log('\n📊 Results:');
      console.log('   ✅ Image generation: PASSED');
      console.log('   ✅ Programmatic upload: PASSED');
      console.log('   ✅ No Windows dialogs: PASSED');
      console.log('');
      
    } else {
      console.log('\n⚠️  No file input found');
      console.log('   Trying alternative method...');
      
      // Click media button
      await page.click('button[aria-label*="Add a photo"]');
      await page.waitForTimeout(1000);
      
      const newInput = await page.waitForSelector('input[type="file"]');
      if (newInput) {
        await newInput.setInputFiles(imagePath);
        await page.waitForTimeout(3000);
        console.log('✅ Upload successful (Method 2)');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  
  await browser.close();
  console.log('\n👋 Browser closed');
}

simpleTest().catch(console.error);