import dotenv from 'dotenv';
import pool from '../config/database.js';
import openai from '../config/openai.js';
import redis from '../config/redis.js';

dotenv.config();

async function testConnections() {
  console.log('🔍 Testing all connections...\n');

  // Test Database
  console.log('1️⃣  Testing PostgreSQL connection...');
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ PostgreSQL connected');
    console.log(`   Time: ${result.rows[0].time}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}\n`);
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message, '\n');
  }

  // Test Redis
  console.log('2️⃣  Testing Redis connection...');
  try {
    await redis.connect();
    await redis.ping();
    console.log('✅ Redis connected');
    const info = await redis.info('server');
    const version = info.match(/redis_version:(\S+)/)?.[1];
    console.log(`   Version: ${version}\n`);
    await redis.disconnect();
  } catch (error: any) {
    console.error('❌ Redis connection failed:', error.message, '\n');
  }

  // Test OpenAI API
  console.log('3️⃣  Testing OpenAI API connection...');
  try {
    const models = await openai.models.list();
    console.log('✅ OpenAI API connected');
    console.log(`   Models available: ${models.data.length}`);

    // Check if Sora models are available
    const soraModels = models.data.filter(m => m.id.includes('sora'));
    if (soraModels.length > 0) {
      console.log(`   Sora models found: ${soraModels.map(m => m.id).join(', ')}`);
    } else {
      console.log('   ⚠️  No Sora models found - check API access');
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ OpenAI API connection failed:', error.message, '\n');
  }

  console.log('✅ Connection tests complete!\n');
  process.exit(0);
}

testConnections();
