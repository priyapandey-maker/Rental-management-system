import {
  HomeIcon,
  ArchiveBoxIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Logo } from '../components/Logo';

export const MainLayout = () => {
  const { isAuthenticated, isLoading, logout, orgId, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("MainLayout rendered for path:", location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Vendors should NOT be in the admin layout
  if (role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  if (role === 'customer') {
    return <Navigate to="/store" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = location.pathname === to || (to !== '/admin/dashboard' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
        }`}
      >
        <Icon
          className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
            isActive ? 'text-brand-700' : 'text-gray-400 group-hover:text-brand-600'
          }`}
        />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Logo size="sm" isLink={true} linkTo="/admin/dashboard" />
          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wider">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Overview
            </h3>
            <div className="space-y-1">
              <NavItem to="/admin/dashboard" label="Admin Dashboard" icon={HomeIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Users &amp; Partners
            </h3>
            <div className="space-y-1">
              <NavItem to="/admin/customers" label="Customers" icon={UsersIcon} />
              <NavItem to="/admin/vendors" label="Vendors / Tenants" icon={BuildingStorefrontIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Catalog &amp; Inventory
            </h3>
            <div className="space-y-1">
              <NavItem to="/admin/products" label="Products" icon={ArchiveBoxIcon} />
              <NavItem to="/admin/assets" label="Assets" icon={CubeIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Rentals
            </h3>
            <div className="space-y-1">
              <NavItem to="/admin/rentals" label="Rentals / Orders" icon={DocumentDuplicateIcon} />
              <NavItem to="/admin/returns" label="Returns" icon={ArrowPathIcon} />
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Operations &amp; Finance
            </h3>
            <div className="space-y-1">
              <NavItem to="/admin/inspections" label="Inspections" icon={ClipboardDocumentCheckIcon} />
              <NavItem to="/admin/adjustments" label="Adjustments" icon={CurrencyDollarIcon} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate">Admin User</span>
              <span
                className="text-xs font-mono text-gray-500 truncate"
                title={orgId || ''}
              >
                Org: {orgId?.substring(0, 8)}...
              </span>
            </div>
            <button
              onClick={handleLogout}
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
