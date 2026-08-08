import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, UsersIcon, ArchiveBoxIcon, CubeIcon,
  DocumentDuplicateIcon, TruckIcon, ArrowPathIcon,
  ClipboardDocumentCheckIcon, CurrencyDollarIcon,
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';

export const MainLayout = () => {
  const { isAuthenticated, logout, orgId } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
        }`}
      >
        <Icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
          isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600'
        }`} />
        <span className="truncate">{label}</span>
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
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h3>
            <div className="space-y-1">
              <NavItem to="/dashboard" label="Dashboard" icon={HomeIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customers</h3>
            <div className="space-y-1">
              <NavItem to="/customers" label="Customers" icon={UsersIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Catalog & Inventory</h3>
            <div className="space-y-1">
              <NavItem to="/products" label="Products" icon={ArchiveBoxIcon} />
              <NavItem to="/assets" label="Assets" icon={CubeIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rentals</h3>
            <div className="space-y-1">
              <NavItem to="/rentals" label="Rentals" icon={DocumentDuplicateIcon} />
              <NavItem to="/fulfillment" label="Fulfillment" icon={TruckIcon} />
              <NavItem to="/returns" label="Returns" icon={ArrowPathIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Operations</h3>
            <div className="space-y-1">
              <NavItem to="/inspections" label="Inspections" icon={ClipboardDocumentCheckIcon} />
              <NavItem to="/adjustments" label="Adjustments" icon={CurrencyDollarIcon} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate">Admin User</span>
              <span className="text-xs font-mono text-gray-500 truncate" title={orgId || ''}>Org: {orgId?.substring(0,8)}...</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
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
