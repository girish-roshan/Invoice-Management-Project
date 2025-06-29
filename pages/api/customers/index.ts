import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

// Ensure table exists lazily
async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensureTable();

  switch (req.method) {
    case 'GET': {
      try {
        const { rows } = await pool.query('SELECT * FROM customers ORDER BY id DESC');
        return res.status(200).json(rows);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }
    }

    case 'POST': {
      const { name, email, phone } = req.body as { name?: string; email?: string; phone?: string };
      if (!name) return res.status(400).json({ error: 'Name is required' });
      try {
        const { rows } = await pool.query(
          'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
          [name, email, phone]
        );
        return res.status(201).json(rows[0]);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create customer' });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
