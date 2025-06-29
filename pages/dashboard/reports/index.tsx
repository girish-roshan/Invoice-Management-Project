import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiDownload } from 'react-icons/fi';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  amount: number;
  status: string; // Paid, Unpaid, Overdue
  issueDate: string; // ISO
  dueDate: string;  // ISO
}

type Period = 'monthly' | 'quarterly';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(stored);
  }, []);

  // Helpers
  const formatMonth = (date: Date) => date.toLocaleString('default', { month: 'short', year: 'numeric' });
  const getQuarter = (date: Date) => {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  };

  // Revenue grouped by period
  const revenueData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status !== 'Paid') return; // consider paid revenue only
      const d = new Date(inv.issueDate);
      const key = period === 'monthly' ? formatMonth(d) : getQuarter(d);
      map[key] = (map[key] || 0) + inv.amount;
    });
    // convert to array sorted chronologically
    return Object.entries(map).sort((a, b) => {
      const [ka, kb] = [a[0], b[0]];
      return new Date(ka).getTime() - new Date(kb).getTime(); // rough sort
    });
  }, [invoices, period]);

  // Outstanding dues (unpaid+overdue)
  const outstanding = useMemo(() => {
    return invoices.filter((i) => i.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  // Customer-wise revenue
  const customerRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status !== 'Paid') return;
      const name = inv.customerName || inv.customerId;
      map[name] = (map[name] || 0) + inv.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [invoices]);

  const exportCSV = () => {
    const rows = [
      ['Period', 'Revenue'],
      ...revenueData.map(([p, v]) => [p, v.toFixed(2)]),
      [],
      ['Outstanding Dues', outstanding.toFixed(2)],
      [],
      ['Customer', 'Revenue'],
      ...customerRevenue.map(([c, v]) => [c, v.toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button onClick={exportCSV} className="btn-primary flex items-center px-4 py-2 rounded-lg text-white">
          <FiDownload className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Period selector */}
      <div className="mb-6">
        <label className="mr-4 font-medium">View revenue by:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {/* Revenue table */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 overflow-x-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Total Revenue ({period === 'monthly' ? 'Monthly' : 'Quarterly'})</h2>
        {revenueData.length === 0 ? (
          <p>No revenue data.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{period === 'monthly' ? 'Month' : 'Quarter'}</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueData.map(([p, v]) => (
                <tr key={p}>
                  <td className="px-6 py-4 whitespace-nowrap">{p}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">${Number(v).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Outstanding */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Outstanding Dues</h2>
        <p className="text-3xl font-semibold text-red-600">${outstanding.toFixed(2)}</p>
      </div>

      {/* Customer-wise revenue */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer-wise Revenue</h2>
        {customerRevenue.length === 0 ? (
          <p>No paid invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerRevenue.map(([c, v]) => (
                  <tr key={c}>
                    <td className="px-6 py-4 whitespace-nowrap">{c}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">${Number(v).toFixed(2)}</td>
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

export default Reports;
