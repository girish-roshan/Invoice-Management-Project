import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    switch (req.method) {
      case 'GET': {
        const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
        return res.status(200).json(rows[0]);
      }
      case 'PUT': {
        const { name, email, phone } = req.body as { name?: string; email?: string; phone?: string };
        const { rows } = await pool.query(
          'UPDATE customers SET name=$1, email=$2, phone=$3, updated_at=now() WHERE id=$4 RETURNING *',
          [name, email, phone, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
        return res.status(200).json(rows[0]);
      }
      case 'DELETE': {
        await pool.query('DELETE FROM customers WHERE id=$1', [id]);
        return res.status(204).end();
      }
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
