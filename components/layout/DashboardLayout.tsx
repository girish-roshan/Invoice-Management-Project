import React, { useState } from 'react';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiBarChart2, 
  FiSettings, 
  FiMenu, 
  FiX, 
  FiBell, 
  FiSearch,
  FiChevronDown,
  FiLogOut
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  const router = useRouter();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string) => {
    // For dashboard, only highlight when exactly on the dashboard page
    if (path === '/dashboard') {
      return router.pathname === '/dashboard';
    }
    // For other sections, highlight when in that section
    return router.pathname.startsWith(`${path}`);
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: React.ElementType; label: string }) => (
    <Link 
      href={path} 
      className={`flex items-center py-3 px-4 rounded-lg mb-1 transition-colors ${
        isActive(path) 
          ? 'bg-primary-700 text-white' 
          : 'text-gray-300 hover:bg-primary-800 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      {sidebarOpen && <span>{label}</span>}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800">Invoice Management</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none"
              >
                <FiBell size={20} />
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              </button>
              
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-semibold text-gray-700">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">New invoice paid</p>
                      <p className="text-xs text-gray-500">Invoice #1234 was paid by Client A</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">Invoice overdue</p>
                      <p className="text-xs text-gray-500">Invoice #5678 is now overdue</p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <a href="#" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <span className="font-medium text-sm">JD</span>
                </div>
                <span className="hidden md:inline-block text-sm font-medium text-gray-700">John Doe</span>
                <FiChevronDown className="text-gray-500" />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FiLogOut className="mr-2" />
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-secondary-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
        >
          <div className="p-4">
            <div className="flex items-center justify-center mb-8 mt-2">
              {sidebarOpen ? (
                <h2 className="text-xl font-bold text-white">InvoiceApp</h2>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                  <FiFileText className="text-white" />
                </div>
              )}
            </div>
            
            <nav className="space-y-1">
              <NavItem path="/dashboard" icon={FiHome} label="Dashboard" />
              <NavItem path="/dashboard/invoices" icon={FiFileText} label="Invoices" />
              <NavItem path="/dashboard/customers" icon={FiUsers} label="Customers" />
              <NavItem path="/dashboard/reports" icon={FiBarChart2} label="Reports" />
              <NavItem path="/dashboard/settings" icon={FiSettings} label="Settings" />
            </nav>
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-700">
            <div className={`flex ${sidebarOpen ? 'items-start' : 'justify-center'}`}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="font-medium text-white">JD</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">John Doe</p>
                  <p className="text-xs text-gray-400">john@example.com</p>
                </div>
              )}
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
