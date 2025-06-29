import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  FiPlus, 
  FiDownload, 
  FiFilter, 
  FiSearch,
  FiChevronLeft, 
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiSend
} from 'react-icons/fi';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  amount: string;
  status: string;
  issue_date: string;
  due_date: string;
  created_at?: string;
}

const Invoices = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch invoices from the API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/invoices');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch invoices');
        }
        
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case 'Sent':
        return <FiSend className="h-4 w-4 text-blue-500" />;
      case 'Draft':
        return <FiClock className="h-4 w-4 text-gray-500" />;
      case 'Overdue':
        return <FiAlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedItems.length === invoices.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(invoices.map(invoice => invoice.id));
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white border border-gray-300 rounded-lg p-2 text-gray-500 hover:bg-gray-50 focus:outline-none"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <FiFilter className="h-5 w-5" />
          </button>
          <button className="bg-white border border-gray-300 rounded-lg p-2 text-gray-500 hover:bg-gray-50 focus:outline-none">
            <FiDownload className="h-5 w-5" />
          </button>
          <Link
            href="/dashboard/invoices/new"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-150"
          >
            <FiPlus className="mr-2" /> New Invoice
          </Link>
        </div>
      </div>
      
      {filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Invoices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All Customers</option>
                <option value="abc">ABC Corp</option>
                <option value="xyz">XYZ Inc</option>
                <option value="tech">Tech Solutions</option>
                <option value="acme">Acme Ltd</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Select date range" 
                  className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Select date range" 
                  className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-3">
            <button className="text-gray-600 font-medium hover:text-gray-800">Reset</button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150">
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{selectedItems.length} selected</span>
                <div className="flex space-x-2">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-1 px-3 rounded">
                    Send reminder
                  </button>
                  <button className="bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium py-1 px-3 rounded">
                    Mark as paid
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-10 rounded text-center">
              <p className="text-lg font-medium">Error loading invoices</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded transition duration-150"
              >
                Try Again
              </button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-16 rounded text-center">
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first invoice to get started</p>
              <Link
                href="/dashboard/invoices/new"
                className="mt-4 inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition duration-150"
              >
                <FiPlus className="inline mr-2" /> New Invoice
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedItems.length === invoices.length && invoices.length > 0}
                        onChange={toggleSelectAll}
                        disabled={invoices.length === 0}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-10">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedItems.includes(invoice.id)}
                          onChange={() => toggleSelect(invoice.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{invoice.invoice_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.issue_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.due_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(invoice.amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </Link>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {invoices.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={loading}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{invoices.length}</span> of{' '}
                  <span className="font-medium">{invoices.length}</span> invoices
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100">
                    1
                  </button>
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={loading}
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
