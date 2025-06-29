// CommonJS version of the database connection for use with setup scripts
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for connecting to Neon from local dev
  },
});

// Add error handler to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

console.log('Database connection pool initialized');

module.exports = { pool };
