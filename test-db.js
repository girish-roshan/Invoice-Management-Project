// Test database connection directly
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    return;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for connecting to Neon from local dev
    },
  });
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW() as now');
    console.log('Database time:', result.rows[0].now);
    
    // Test schema existence
    console.log('Checking database schema...');
    const schemaResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Available tables:');
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testDatabaseConnection();
