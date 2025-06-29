import React from 'react';
import { FiFileText, FiDollarSign, FiAlertCircle, FiSend, FiCheckCircle, FiUser } from 'react-icons/fi';

interface ActivityItemProps {
  type: 'invoice_created' | 'payment_received' | 'invoice_sent' | 'invoice_overdue' | 'customer_added';
  message: string;
  timestamp: string;
  invoiceId?: string;
  amount?: string;
  customer?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, message, timestamp, invoiceId, amount, customer }) => {
  const getIcon = () => {
    switch (type) {
      case 'invoice_created':
        return <FiFileText className="h-5 w-5 text-blue-500" />;
      case 'payment_received':
        return <FiDollarSign className="h-5 w-5 text-green-500" />;
      case 'invoice_sent':
        return <FiSend className="h-5 w-5 text-purple-500" />;
      case 'invoice_overdue':
        return <FiAlertCircle className="h-5 w-5 text-red-500" />;
      case 'customer_added':
        return <FiUser className="h-5 w-5 text-indigo-500" />;
      default:
        return <FiCheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'invoice_created':
        return 'bg-blue-100';
      case 'payment_received':
        return 'bg-green-100';
      case 'invoice_sent':
        return 'bg-purple-100';
      case 'invoice_overdue':
        return 'bg-red-100';
      case 'customer_added':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className={`${getBgColor()} p-2 rounded-md mr-3`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {message}
        </p>
        {(invoiceId || amount || customer) && (
          <div className="mt-1 flex flex-wrap gap-2">
            {invoiceId && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Invoice #{invoiceId}
              </span>
            )}
            {amount && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                {amount}
              </span>
            )}
            {customer && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {customer}
              </span>
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
