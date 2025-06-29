import { NextApiRequest, NextApiResponse } from 'next';
import { pool, getClient } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getInvoices(req, res);
    case 'POST':
      return createInvoice(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getInvoices(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query(`
      SELECT * FROM invoices
      ORDER BY created_at DESC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ message: 'Error fetching invoices' });
  }
}

async function createInvoice(req: NextApiRequest, res: NextApiResponse) {
  const { 
    invoice_number, 
    customer, 
    issue_date, 
    due_date, 
    notes, 
    items, 
    subtotal, 
    tax, 
    amount, 
    status 
  } = req.body;

  // Validate required fields
  if (!invoice_number) {
    return res.status(400).json({ message: 'Invoice number is required' });
  }
  if (!customer) {
    return res.status(400).json({ message: 'Customer is required' });
  }
  if (!issue_date) {
    return res.status(400).json({ message: 'Issue date is required' });
  }
  if (!due_date) {
    return res.status(400).json({ message: 'Due date is required' });
  }
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' });
  }

  // Validate numeric fields
  if (isNaN(Number(subtotal)) || isNaN(Number(tax)) || isNaN(Number(amount))) {
    return res.status(400).json({ message: 'Subtotal, tax, and amount must be valid numbers' });
  }

  // Validate date formats
  try {
    const issueDate = new Date(issue_date);
    const dueDate = new Date(due_date);
    
    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
  }

  let client;
  
  try {
    // Get client from the pool with error handling
    client = await getClient();
    
    // Debug connection status
    console.log('Database connection established, starting transaction');
    await client.query('BEGIN');
    
    // Log the data being inserted for debugging
    console.log('Inserting invoice with data:', { 
      invoice_number, 
      customer, 
      issue_date, 
      due_date, 
      notes, 
      subtotal: typeof subtotal, 
      tax: typeof tax, 
      amount: typeof amount, 
      status 
    });
    
    // Insert the invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (
        invoice_number, customer, issue_date, due_date, notes, 
        subtotal, tax, amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [invoice_number, customer, issue_date, due_date, notes, subtotal, tax, amount, status || 'Draft']
    );
    
    const invoice = invoiceResult.rows[0];
    
    // Insert invoice items
    if (items && items.length > 0) {
      for (const item of items) {
        // Validate item fields
        if (!item.description) {
          throw new Error('Item description is required');
        }
        if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
          throw new Error('Item quantity must be a positive number');
        }
        if (isNaN(Number(item.unit_price))) {
          throw new Error('Item unit price must be a valid number');
        }
        
        await client.query(
          `INSERT INTO invoice_items (
            invoice_id, description, quantity, unit_price, tax_rate
          ) VALUES ($1, $2, $3, $4, $5)`,
          [invoice.id, item.description, Number(item.quantity), Number(item.unit_price), Number(item.tax_rate) || 0]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return res.status(201).json(invoice);
  } catch (error) {
    try {
      if (client) {
        await client.query('ROLLBACK');
        console.log('Transaction rolled back successfully');
      }
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('Error creating invoice:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Check for specific database errors
    const err = error as any;
    if (err.code === '23505') {
      return res.status(409).json({ 
        message: 'Invoice number already exists', 
        error: 'Duplicate invoice number'
      });
    } else if (err.code === '23502') {
      return res.status(400).json({ 
        message: 'Missing required field', 
        error: err.message
      });
    } else if (err.code === '22P02') {
      return res.status(400).json({ 
        message: 'Invalid data type', 
        error: err.message
      });
    } else if (err.code === '3D000') {
      return res.status(500).json({ 
        message: 'Database does not exist', 
        error: err.message
      });
    } else if (err.code === '28P01') {
      return res.status(500).json({ 
        message: 'Invalid database credentials', 
        error: 'Authentication failed'
      });
    } else if (err.code === '08006' || err.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        message: 'Cannot connect to database server', 
        error: 'Connection refused'
      });
    }
    
    return res.status(500).json({ 
      message: 'Error creating invoice', 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
