import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage e.g. 10 for 10%
}

const NewInvoicePage: React.FC = () => {
  const router = useRouter();

  // Mock customer list – replace with real data later
  const customers = [
    'ABC Corp',
    'XYZ Inc',
    'Tech Solutions',
    'Acme Ltd',
  ];

  const [invoiceNumber] = useState(() => `INV-${Date.now().toString().slice(-6)}`);
  const [customer, setCustomer] = useState(customers[0] || '');
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, key: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [key]: typeof value === 'string' ? value : Number(value) } : item
      )
    );
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const totalTax = useMemo(
    () => items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.taxRate) / 100, 0),
    [items]
  );
  const total = subtotal + totalTax;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    // Check required fields
    if (!customer) return 'Customer is required';
    if (!issueDate) return 'Issue date is required';
    if (!dueDate) return 'Due date is required';
    
    // Check if any items exist and have required fields
    if (items.length === 0) return 'At least one item is required';
    
    for (const item of items) {
      if (!item.description) return 'All items must have a description';
      if (item.quantity <= 0) return 'Item quantities must be greater than zero';
      if (item.unitPrice < 0) return 'Item prices cannot be negative';
      if (item.taxRate < 0 || item.taxRate > 100) return 'Tax rates must be between 0 and 100';
    }
    
    // Validate date formats
    const issueDateObj = new Date(issueDate);
    const dueDateObj = new Date(dueDate);
    
    if (isNaN(issueDateObj.getTime())) return 'Issue date is invalid';
    if (isNaN(dueDateObj.getTime())) return 'Due date is invalid';
    
    // Check if due date is after issue date
    if (dueDateObj < issueDateObj) return 'Due date must be after issue date';
    
    return null; // No validation errors
  };

  const formatDateForPostgres = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Validate form before submission
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Format dates properly for PostgreSQL
      const formattedIssueDate = formatDateForPostgres(issueDate);
      const formattedDueDate = formatDateForPostgres(dueDate);
      
      // Ensure numeric values are properly formatted
      const invoiceData = {
        invoice_number: invoiceNumber,
        customer,
        issue_date: formattedIssueDate,
        due_date: formattedDueDate,
        notes,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unitPrice),
          tax_rate: Number(item.taxRate)
        })),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(totalTax.toFixed(2)),
        amount: Number(total.toFixed(2)),
        status: 'Draft', // Default status for new invoices
      };
      
      console.log('Sending invoice data:', invoiceData);
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save invoice');
      }
      
      const result = await response.json();
      console.log('Invoice saved successfully:', result);
      router.push('/dashboard/invoices');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to save invoice: ${errorMessage}`);
      console.error('Error details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative mb-6 h-12">
          <h1 className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-900">Create Invoice</h1>
          <div className="absolute top-0 right-0">
            <button 
              type="submit"
              className="btn-primary text-sm flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
          {error && (
            <div className="absolute top-12 right-0 mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Payment terms, additional notes..."
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-outline flex items-center"
            >
              <FiPlus className="mr-2" /> Add Item
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Description</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Qty</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Tax %</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                const lineTotal = item.quantity * item.unitPrice + (item.quantity * item.unitPrice * item.taxRate) / 100;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-20 text-right border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                        className="w-28 text-right border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)}
                        className="w-20 text-right border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">${lineTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default NewInvoicePage;
