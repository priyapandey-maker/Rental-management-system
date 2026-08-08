import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const { isAuthenticated, logout, orgId } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">RMS Demo</Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/customers" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Customers</Link>
                <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Products</Link>
                <Link to="/assets" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Assets</Link>
                <Link to="/rentals" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Rentals</Link>
                <Link to="/fulfillment" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Fulfillment</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Org: {orgId?.substring(0,8)}...</span>
              <button 
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
