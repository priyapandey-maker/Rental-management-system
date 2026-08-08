import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ArchiveBoxIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { RoleGuard } from '../components/RoleGuard';

const NavItem = ({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: any;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-brand-700 text-white'
          : 'text-brand-100 hover:bg-brand-700/60 hover:text-white'
      }`}
    >
      <Icon className="flex-shrink-0 mr-3 h-5 w-5 opacity-80" />
      <span className="truncate">{label}</span>
    </Link>
  );
};

const VendorSidebar = ({ onClose }: { onClose?: () => void }) => {
  const { logout, userId, orgId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col bg-brand-900">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-brand-800">
        <div>
          <div className="text-lg font-bold text-white leading-tight">RentalStore</div>
          <div className="text-xs text-brand-300 font-medium">Vendor Portal</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-brand-300 hover:text-white md:hidden">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            Overview
          </h3>
          <div className="space-y-1">
            <NavItem to="/vendor/dashboard" label="Dashboard" icon={HomeIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            Catalog
          </h3>
          <div className="space-y-1">
            <NavItem to="/vendor/products" label="Products" icon={ArchiveBoxIcon} onClick={onClose} />
            <NavItem to="/vendor/assets" label="Assets / Inventory" icon={CubeIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            Operations
          </h3>
          <div className="space-y-1">
            <NavItem to="/vendor/rentals" label="Rentals" icon={DocumentDuplicateIcon} onClick={onClose} />
            <NavItem to="/vendor/customers" label="Customers" icon={UsersIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            Reports
          </h3>
          <div className="space-y-1">
            <NavItem to="/vendor/reports" label="Analytics" icon={ChartBarIcon} onClick={onClose} />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-brand-800">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">Vendor Account</span>
            <span className="text-xs text-brand-400 truncate font-mono" title={orgId || ''}>
              {orgId?.substring(0, 12)}...
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-brand-300 hover:text-red-300 rounded-lg hover:bg-brand-800 transition-colors"
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const VendorLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={['vendor', 'admin']}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
          <VendorSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex w-60 flex-col bg-brand-900 z-50">
              <VendorSidebar onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1 md:pl-60">
          {/* Mobile Top Bar */}
          <div className="sticky top-0 z-10 flex h-14 items-center bg-white border-b border-gray-200 px-4 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <span className="ml-3 text-sm font-semibold text-gray-800">Vendor Portal</span>
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
};
