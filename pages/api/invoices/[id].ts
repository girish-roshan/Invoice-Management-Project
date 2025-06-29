import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getInvoice(req, res, id as string);
    case 'PUT':
      return updateInvoice(req, res, id as string);
    case 'DELETE':
      return deleteInvoice(req, res, id as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getInvoice(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Get invoice details
    const invoiceResult = await pool.query(
      `SELECT 
        id, 
        invoice_number, 
        customer, 
        TO_CHAR(issue_date, 'YYYY-MM-DD') as issue_date, 
        TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, 
        notes, 
        subtotal, 
        tax, 
        amount, 
        status
      FROM invoices 
      WHERE id = $1`,
      [id]
    );
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Get invoice items
    const itemsResult = await pool.query(
      `SELECT 
        id, 
        description, 
        quantity, 
        unit_price as "unitPrice", 
        tax_rate as "taxRate"
      FROM invoice_items 
      WHERE invoice_id = $1`,
      [id]
    );
    
    const invoice = {
      ...invoiceResult.rows[0],
      items: itemsResult.rows
    };
    
    return res.status(200).json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ message: 'Failed to fetch invoice' });
  }
}

async function updateInvoice(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { 
    invoiceNumber, 
    customer, 
    issueDate, 
    dueDate, 
    items, 
    notes,
    subtotal,
    totalTax,
    total,
    status
  } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update the invoice
    const updateResult = await client.query(
      `UPDATE invoices 
      SET 
        invoice_number = $1, 
        customer = $2, 
        issue_date = $3, 
        due_date = $4, 
        notes = $5, 
        subtotal = $6, 
        tax = $7, 
        amount = $8, 
        status = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING id`,
      [
        invoiceNumber, 
        customer, 
        issueDate, 
        dueDate, 
        notes, 
        subtotal, 
        totalTax, 
        total, 
        status,
        id
      ]
    );
    
    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Delete existing items
    await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
    
    // Insert updated items
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items (
          invoice_id, 
          description, 
          quantity, 
          unit_price, 
          tax_rate
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          id, 
          item.description, 
          item.quantity, 
          item.unitPrice, 
          item.taxRate
        ]
      );
    }
    
    await client.query('COMMIT');
    
    return res.status(200).json({ message: 'Invoice updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating invoice:', error);
    return res.status(500).json({ message: 'Failed to update invoice' });
  } finally {
    client.release();
  }
}

async function deleteInvoice(req: NextApiRequest, res: NextApiResponse, id: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete invoice items first (foreign key constraint)
    await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
    
    // Delete the invoice
    const result = await client.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    await client.query('COMMIT');
    
    return res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting invoice:', error);
    return res.status(500).json({ message: 'Failed to delete invoice' });
  } finally {
    client.release();
  }
}
