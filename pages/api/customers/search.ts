import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term } = req.query;

  if (!term || typeof term !== 'string') {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    // Create the customers table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        gstin VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Search for customers that match the term in name, email, or phone
    const searchTerm = `%${term}%`;
    const { rows } = await pool.query(
      `SELECT * FROM customers 
       WHERE name ILIKE $1 
       OR email ILIKE $1 
       OR phone ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to search customers' });
  }
}
