import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FiDownload } from 'react-icons/fi';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
}

const CustomerDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [customer, setCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!id) return;

    // Fetch customer from localStorage mock
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const found = customers.find((c: any) => c.id === id);
    setCustomer(found);

    // Fetch invoices from localStorage mock
    const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const custInvoices = allInvoices.filter((inv: any) => inv.customerId === id);
    setInvoices(custInvoices);
  }, [id]);

  const exportStatement = () => {
    if (!customer) return;

    const rows = [
      ['Invoice Number', 'Amount', 'Status', 'Due Date'],
      ...invoices.map((inv) => [inv.invoiceNumber, inv.amount, inv.status, inv.dueDate]),
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${customer.name}_statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!customer) {
    return (
      <DashboardLayout>
        <p className="text-center py-20">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        <button onClick={exportStatement} className="btn-primary flex items-center px-4 py-2 text-white rounded-lg">
          <FiDownload className="mr-2" /> Export Statement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Email:</span> {customer.email || '-'}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {customer.phone || '-'}
          </div>
          <div>
            <span className="font-medium">Address:</span> {customer.address || '-'}
          </div>
          <div>
            <span className="font-medium">GSTIN:</span> {customer.gstin || '-'}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium">Notes:</span> {customer.notes || '-'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Invoices</h2>
        {invoices.length === 0 ? (
          <p>No invoices for this customer.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">${inv.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{inv.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{inv.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
