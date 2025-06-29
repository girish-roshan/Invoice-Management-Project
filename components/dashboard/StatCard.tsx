import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  color: 'blue' | 'green' | 'red' | 'amber';
}

const getBgColor = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-500';
    case 'green':
      return 'bg-green-500';
    case 'red':
      return 'bg-red-500';
    case 'amber':
      return 'bg-amber-500';
    default:
      return 'bg-blue-500';
  }
};

const getIconBgColor = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-100 text-blue-600';
    case 'green':
      return 'bg-green-100 text-green-600';
    case 'red':
      return 'bg-red-100 text-red-600';
    case 'amber':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-blue-100 text-blue-600';
  }
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, isPositive = true, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-full p-3 mr-4 ${getIconBgColor(color)}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            <div className={`text-xs font-medium rounded-full px-2 py-1 flex items-center ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span>{change}</span>
            </div>
            <span className="ml-2 text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>
      <div className={`h-1 ${getBgColor(color)}`}></div>
    </div>
  );
};

export default StatCard;
