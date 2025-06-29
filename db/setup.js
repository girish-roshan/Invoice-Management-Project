const fs = require('fs');
const path = require('path');
const { pool } = require('../lib/db');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL
    await pool.query(schemaSql);
    
    console.log('Database setup completed successfully!');
    
    // Close the connection pool
    await pool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
