/**
 * Test script for Sora Video API
 *
 * This script tests the video API endpoints by:
 * 1. Creating a test video
 * 2. Checking its status
 * 3. Listing videos
 *
 * Usage: npm run test:api
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api/videos`;

interface VideoResponse {
  success: boolean;
  data?: any;
  error?: string;
}

async function testCreateVideo() {
  console.log('\n=== Test 1: Create Video ===');

  try {
    const response = await axios.post<VideoResponse>(API_URL, {
      prompt: 'A serene lake at sunset with mountains in the background',
      model: 'sora-2',
    });

    console.log('✅ Video created successfully');
    console.log('Video ID:', response.data.data?.id);
    console.log('Status:', response.data.data?.status);
    console.log('Model:', response.data.data?.model);
    console.log('Progress:', response.data.data?.progress);

    return response.data.data?.id;
  } catch (error: any) {
    console.error('❌ Error creating video:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVideoStatus(videoId: string) {
  console.log('\n=== Test 2: Get Video Status ===');

  try {
    const response = await axios.get<VideoResponse>(`${API_URL}/${videoId}`);

    console.log('✅ Video status retrieved successfully');
    console.log('Video ID:', response.data.data?.id);
    console.log('Status:', response.data.data?.status);
    console.log('Progress:', response.data.data?.progress);
    console.log('Created at:', new Date(response.data.data?.created_at * 1000).toISOString());

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error getting video status:', error.response?.data || error.message);
    throw error;
  }
}

async function testListVideos() {
  console.log('\n=== Test 3: List Videos ===');

  try {
    const response = await axios.get<VideoResponse>(`${API_URL}?limit=5`);

    console.log('✅ Videos listed successfully');
    console.log('Number of videos:', response.data.data?.length || 0);

    if (response.data.data && response.data.data.length > 0) {
      console.log('\nFirst video:');
      console.log('  ID:', response.data.data[0].id);
      console.log('  Status:', response.data.data[0].status);
      console.log('  Model:', response.data.data[0].model);
    }

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error listing videos:', error.response?.data || error.message);
    throw error;
  }
}

async function testInvalidRequest() {
  console.log('\n=== Test 4: Invalid Request (should fail) ===');

  try {
    await axios.post<VideoResponse>(API_URL, {
      // Missing prompt - should fail validation
    });

    console.log('❌ Request should have failed but succeeded');
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid request correctly rejected');
      console.log('Error message:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testHealthCheck() {
  console.log('\n=== Test 0: Health Check ===');

  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('Status:', response.data.status);
    console.log('Uptime:', Math.floor(response.data.uptime), 'seconds');
  } catch (error: any) {
    console.error('❌ Server is not running:', error.message);
    console.error('\nPlease start the server first:');
    console.error('  npm run dev');
    process.exit(1);
  }
}

async function runTests() {
  console.log('🧪 Starting Sora Video API Tests');
  console.log('API URL:', API_URL);
  console.log('─'.repeat(50));

  try {
    // Test health check first
    await testHealthCheck();

    // Test creating a video
    const videoId = await testCreateVideo();

    if (!videoId) {
      console.error('❌ No video ID returned, cannot continue tests');
      return;
    }

    // Wait a moment before checking status
    console.log('\nWaiting 2 seconds before checking status...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test getting video status
    await testGetVideoStatus(videoId);

    // Test listing videos
    await testListVideos();

    // Test invalid request
    await testInvalidRequest();

    console.log('\n' + '─'.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Notes:');
    console.log('  - Video generation is asynchronous');
    console.log('  - Status will be "queued" initially, then "in_progress", then "completed"');
    console.log('  - You can poll the status endpoint to track progress');
    console.log('  - Once completed, you can download the video');
    console.log('\n🔗 Next steps:');
    console.log(`  - Check status: GET ${API_URL}/${videoId}`);
    console.log(`  - Download: GET ${API_URL}/${videoId}/download (when completed)`);

  } catch (error) {
    console.log('\n' + '─'.repeat(50));
    console.log('❌ Tests failed');
    process.exit(1);
  }
}

// Run tests
runTests();
