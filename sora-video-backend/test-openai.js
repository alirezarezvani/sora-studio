import 'dotenv/config';
import OpenAI from 'openai';

console.log('🔍 Testing OpenAI API Connection...\n');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

async function testConnection() {
  try {
    console.log('📡 Connecting to OpenAI API...');

    // Test 1: List models
    const models = await openai.models.list();
    console.log('✅ Successfully connected to OpenAI API');
    console.log(`✅ Found ${models.data.length} models available\n`);

    // Test 2: Check for Sora models
    const soraModels = models.data.filter(m => m.id.includes('sora'));
    if (soraModels.length > 0) {
      console.log('🎬 Sora models found:');
      soraModels.forEach(model => {
        console.log(`   - ${model.id}`);
      });
    } else {
      console.log('⚠️  No Sora models found in available models');
      console.log('   This is normal if Sora access is not yet enabled for your account');
    }

    console.log('\n✅ OpenAI API connection test PASSED');
    return true;
  } catch (error) {
    console.error('❌ OpenAI API connection test FAILED');
    console.error('Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
