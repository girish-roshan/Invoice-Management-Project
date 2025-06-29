import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityItem from '@/components/dashboard/ActivityItem';
import { 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiAlertCircle,
  FiSearch,
  FiCalendar,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import Link from 'next/link';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('This Month');
  
  // Mock data for demonstration
  const recentActivity = [
    {
      id: 1,
      type: 'payment_received' as const,
      message: 'Payment received from ABC Corp',
      timestamp: '2 hours ago',
      invoiceId: '1234',
      amount: '$1,200.00',
      customer: 'ABC Corp'
    },
    {
      id: 2,
      type: 'invoice_sent' as const,
      message: 'Invoice sent to XYZ Inc',
      timestamp: '5 hours ago',
      invoiceId: '1235',
      amount: '$3,500.00',
      customer: 'XYZ Inc'
    },
    {
      id: 3,
      type: 'invoice_overdue' as const,
      message: 'Invoice #1230 is now overdue',
      timestamp: '1 day ago',
      invoiceId: '1230',
      amount: '$850.00',
      customer: 'Acme Ltd'
    },
    {
      id: 4,
      type: 'invoice_created' as const,
      message: 'New invoice created',
      timestamp: '2 days ago',
      invoiceId: '1233',
      amount: '$1,750.00',
      customer: '123 Solutions'
    },
    {
      id: 5,
      type: 'customer_added' as const,
      message: 'New customer added',
      timestamp: '3 days ago',
      customer: 'Johnson & Co'
    }
  ];
  
  // Mock data for recent invoices
  const recentInvoices = [
    { id: '1234', customer: 'ABC Corp', amount: '$1,200.00', status: 'Paid', dueDate: 'Jun 15, 2025' },
    { id: '1235', customer: 'XYZ Inc', amount: '$3,500.00', status: 'Sent', dueDate: 'Jun 30, 2025' },
    { id: '1236', customer: 'Tech Solutions', amount: '$2,750.00', status: 'Draft', dueDate: 'Jul 10, 2025' },
    { id: '1230', customer: 'Acme Ltd', amount: '$850.00', status: 'Overdue', dueDate: 'Jun 05, 2025' },
  ];
  
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

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center">
              <FiCalendar className="mr-2 text-gray-500" />
              {dateRange}
              <FiClock className="ml-2 text-gray-500" />
            </button>
          </div>
          <Link
            href="/dashboard/invoices/new"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-150"
          >
            <FiPlus className="mr-2" /> New Invoice
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Invoices" 
          value="125" 
          icon={<FiFileText className="h-5 w-5" />} 
          change="+8.2%" 
          isPositive={true}
          color="blue"
        />
        <StatCard 
          title="Pending" 
          value="18" 
          icon={<FiClock className="h-5 w-5" />} 
          change="+2.5%" 
          isPositive={false}
          color="amber"
        />
        <StatCard 
          title="Paid" 
          value="$48,295.70" 
          icon={<FiDollarSign className="h-5 w-5" />} 
          change="+10.3%" 
          isPositive={true}
          color="green"
        />
        <StatCard 
          title="Overdue" 
          value="$5,750.00" 
          icon={<FiAlertCircle className="h-5 w-5" />} 
          change="-4.3%" 
          isPositive={true}
          color="red"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                <Link href="/dashboard/invoices" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{invoice.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {invoice.customer}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {invoice.amount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {invoice.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Invoice Search</h2>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by invoice #, customer name, or amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-md transition duration-150">
                  Overdue
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-md transition duration-150">
                  Last 30 days
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-md transition duration-150">
                  High value (&gt;$1000)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-md transition duration-150">
                  Needs attention
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    type={activity.type}
                    message={activity.message}
                    timestamp={activity.timestamp}
                    invoiceId={activity.invoiceId}
                    amount={activity.amount}
                    customer={activity.customer}
                  />
                ))}
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all activity
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
