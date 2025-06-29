import { Pool, PoolClient } from 'pg';
import getConfig from 'next/config';

/**
 * Re-use a single instance of Pool across hot-reloads in dev.
 * DATABASE_URL should be set in .env or .env.local.
 */
let globalPool: Pool | undefined;

// Get server-side runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Get DATABASE_URL from Next.js config or environment variable
const DATABASE_URL = serverRuntimeConfig.DATABASE_URL || process.env.DATABASE_URL;

// Check if DATABASE_URL is available
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set!');
  console.error('Please make sure your .env or .env.local file contains DATABASE_URL');
}

const connectionConfig = {
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true } // Strict SSL in production
    : { rejectUnauthorized: false }, // Allow self-signed certs in development
  // Add connection timeout
  connectionTimeoutMillis: 10000, // 10 seconds
  // Add idle timeout
  idleTimeoutMillis: 30000, // 30 seconds
  // Maximum number of clients the pool should contain
  max: 20,
};

// Create the pool with error handling
try {
  if (!globalPool) {
    globalPool = new Pool(connectionConfig);
    
    // Add error handler to the pool
    globalPool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
    
    // Log successful pool creation
    console.log('Database connection pool initialized');
  }
} catch (error) {
  console.error('Failed to initialize database connection pool:', error);
}

export const pool = globalPool as Pool;

// Helper function to get a client with error handling
export async function getClient(): Promise<PoolClient> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error acquiring client from pool:', error);
    throw error;
  }
}

// Test the database connection on startup
async function testConnection() {
  let client: PoolClient | undefined;
  try {
    client = await getClient();
    const result = await client.query('SELECT NOW() as now');
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Run the test if not in production
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}
