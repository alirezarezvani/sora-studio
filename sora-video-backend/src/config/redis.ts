import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

redis.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

// Initialize connection
async function initRedis() {
  try {
    await redis.connect();
  } catch (error: any) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️  Application will run without Redis cache');
  }
}

export { initRedis };
export default redis;
