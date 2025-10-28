import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// Debug logging
console.log('[OpenAI Config] Client initialized:', !!openai);
console.log('[OpenAI Config] Has videos API:', !!(openai as any)?.videos);

// Test connection on startup
async function testConnection() {
  try {
    await openai.models.list();
    console.log('✅ OpenAI API connected successfully');
  } catch (error: any) {
    console.error('❌ OpenAI API connection failed:', error.message);

    // In development, warn but don't fail (allows mock mode / development without real API)
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_OPENAI_CHECK === 'true') {
      console.warn('⚠️  Running in development mode without OpenAI API connection');
      console.warn('⚠️  Video generation will fail unless using mock mode');
      return; // Don't throw, just warn
    }

    throw error;
  }
}

export { openai, testConnection };
