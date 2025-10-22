import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// Test connection on startup
async function testConnection() {
  try {
    await openai.models.list();
    console.log('✅ OpenAI API connected successfully');
  } catch (error: any) {
    console.error('❌ OpenAI API connection failed:', error.message);
    throw error;
  }
}

export { testConnection };
export default openai;
