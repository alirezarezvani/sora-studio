import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if database is already initialized
 */
async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'videos'
      ) as exists;
    `;

    const result = await pool.query(query);
    return result.rows[0].exists;
  } catch (error: any) {
    console.error('Error checking database initialization:', error.message);
    return false;
  }
}

/**
 * Run database schema from schema.sql file
 */
async function runSchema(): Promise<void> {
  try {
    console.log('Running database schema...');

    // Read schema.sql file
    const schemaPath = path.join(__dirname, '../../schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database schema created successfully');
  } catch (error: any) {
    console.error('❌ Error running schema:', error.message);
    throw error;
  }
}

/**
 * Verify all required tables exist
 */
async function verifyTables(): Promise<boolean> {
  try {
    console.log('Verifying database tables...');

    const requiredTables = ['videos', 'video_events', 'user_quotas'];

    for (const table of requiredTables) {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        ) as exists;
      `;

      const result = await pool.query(query, [table]);

      if (!result.rows[0].exists) {
        console.error(`❌ Table "${table}" does not exist`);
        return false;
      }

      console.log(`✅ Table "${table}" exists`);
    }

    return true;
  } catch (error: any) {
    console.error('Error verifying tables:', error.message);
    return false;
  }
}

/**
 * Create default admin user quota if it doesn't exist
 */
async function createDefaultQuotas(): Promise<void> {
  try {
    console.log('Creating default user quotas...');

    const query = `
      INSERT INTO user_quotas (user_id, videos_created, videos_limit)
      VALUES
        ('admin', 0, 1000),
        ('anonymous', 0, 10)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id;
    `;

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      console.log(`✅ Created default quotas for: ${result.rows.map((r) => r.user_id).join(', ')}`);
    } else {
      console.log('✅ Default quotas already exist');
    }
  } catch (error: any) {
    console.error('Error creating default quotas:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('========================================');
  console.log('Starting Database Migration');
  console.log('========================================\n');

  try {
    // Test database connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Check if database is already initialized
    const initialized = await isDatabaseInitialized();

    if (initialized) {
      console.log('⚠️  Database already initialized');
      console.log('Verifying tables...\n');

      const verified = await verifyTables();

      if (!verified) {
        throw new Error('Table verification failed');
      }

      console.log('\n✅ Database verification complete');
    } else {
      console.log('Database not initialized. Running schema...\n');

      // Run schema
      await runSchema();

      // Verify tables were created
      const verified = await verifyTables();

      if (!verified) {
        throw new Error('Table creation failed');
      }

      console.log('\n✅ Database initialized successfully');
    }

    // Create default quotas
    console.log('');
    await createDefaultQuotas();

    console.log('\n========================================');
    console.log('Migration Complete!');
    console.log('========================================');

    process.exit(0);
  } catch (error: any) {
    console.error('\n========================================');
    console.error('Migration Failed!');
    console.error('========================================');
    console.error('Error:', error.message);

    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export { migrate, isDatabaseInitialized, verifyTables };
