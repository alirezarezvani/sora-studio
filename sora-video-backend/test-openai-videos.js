import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

console.log('OpenAI client properties:');
console.log('Has videos:', !!openai.videos);
console.log('Has beta:', !!openai.beta);
console.log('Type of videos:', typeof openai.videos);

// Try to see all available properties
console.log('\nAll properties on openai:');
console.log(Object.keys(openai));

// Check if videos is in beta namespace
if (openai.beta) {
  console.log('\nBeta properties:');
  console.log(Object.keys(openai.beta));
}
