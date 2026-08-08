import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const { isAuthenticated, logout, orgId } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const NavItem = ({ to, label }: { to: string; label: string }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="text-xl font-bold text-blue-700 leading-tight">
            Rental Management<br/><span className="text-sm font-semibold text-gray-500">Admin Console</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</h3>
            <div className="space-y-1">
              <NavItem to="/dashboard" label="Dashboard" />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Master Data</h3>
            <div className="space-y-1">
              <NavItem to="/customers" label="Customers" />
              <NavItem to="/products" label="Products" />
              <NavItem to="/assets" label="Assets" />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rental Operations</h3>
            <div className="space-y-1">
              <NavItem to="/rentals" label="Rentals" />
              <NavItem to="/fulfillment" label="Fulfillment" />
              <NavItem to="/returns" label="Returns" />
              <NavItem to="/inspections" label="Inspections" />
              <NavItem to="/adjustments" label="Adjustments" />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 truncate" title={orgId || ''}>Org: {orgId?.substring(0,8)}...</span>
            <button 
              onClick={logout}
              className="text-xs font-medium text-gray-600 hover:text-red-600 px-2 py-1 bg-gray-100 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
