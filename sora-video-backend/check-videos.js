import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkVideos() {
  try {
    // Count total videos
    const countResult = await pool.query('SELECT COUNT(*) as total FROM videos');
    console.log('Total videos in database:', countResult.rows[0].total);

    // Get all videos with details
    const videosResult = await pool.query(`
      SELECT id, prompt, model, status, cost, created_at
      FROM videos
      ORDER BY created_at DESC
    `);

    if (videosResult.rows.length > 0) {
      console.log('\nVideos found:');
      videosResult.rows.forEach((video, i) => {
        console.log(`\n${i + 1}. Video ID: ${video.id}`);
        console.log(`   Prompt: ${video.prompt?.substring(0, 60)}...`);
        console.log(`   Model: ${video.model}`);
        console.log(`   Status: ${video.status}`);
        console.log(`   Cost: $${video.cost || 0}`);
        console.log(`   Created: ${video.created_at}`);
      });

      // Calculate total cost
      const totalCost = videosResult.rows.reduce((sum, v) => sum + (parseFloat(v.cost) || 0), 0);
      console.log(`\n\nTOTAL COST IN DATABASE: $${totalCost.toFixed(2)}`);
    } else {
      console.log('\n✅ NO VIDEOS FOUND IN DATABASE');
      console.log('No videos were successfully created through this backend.');
    }

  } catch (error) {
    console.error('Error checking videos:', error.message);
  } finally {
    await pool.end();
  }
}

checkVideos();
