import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiSearch, FiUser, FiMail, FiPhone, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Temporary mock data – replace with API call later
const mockCustomers: Customer[] = [
  {
    id: 1001,
    name: 'ABC Corporation',
    email: 'john@abccorp.com',
    phone: '(555) 123-4567',
    created_at: '2025-06-15T00:00:00.000Z',
    updated_at: '2025-06-15T00:00:00.000Z',
  },
  {
    id: 1002,
    name: 'XYZ Inc',
    email: 'sarah@xyzinc.com',
    phone: '(555) 234-5678',
    created_at: '2025-06-10T00:00:00.000Z',
    updated_at: '2025-06-10T00:00:00.000Z',
  },
];

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      // fallback to mock when API unavailable (dev only)
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term))
    );
  });

  const handleRefresh = () => {
    fetchCustomers();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>

            <Link
              href="/dashboard/customers/new"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Add Customer
            </Link>
          </div>
        </div>

        {/* Table / States */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading customers…</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50">
                    {/* Name column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" />
                        <span className="font-medium text-gray-900">{cust.name}</span>
                      </div>
                    </td>
                    {/* Email column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span>{cust.email ?? '-'}</span>
                      </div>
                    </td>
                    {/* Phone column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        <span>{cust.phone ?? '-'}</span>
                      </div>
                    </td>
                    {/* Created date column */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {cust.created_at ? new Date(cust.created_at).toLocaleDateString() : '-'}
                    </td>
                    {/* Actions column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-3">
                        <Link
                          href={`/dashboard/customers/${cust.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/customers/${cust.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </div>
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

export default CustomersPage;
 
 