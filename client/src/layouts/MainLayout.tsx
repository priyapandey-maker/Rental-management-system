import React, { useState } from 'react';
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
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

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
  const isActive =
    location.pathname === to ||
    (to !== '/admin/dashboard' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-brand-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon
        className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
};

const AdminSidebar = ({ onClose }: { onClose?: () => void }) => {
  const { orgId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <Logo size="sm" isLink={true} linkTo="/admin/dashboard" theme="dark" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-1 rounded uppercase tracking-wider">
            Admin
          </span>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white md:hidden ml-1">
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Overview
          </h3>
          <div className="space-y-1">
            <NavItem to="/admin/dashboard" label="Admin Dashboard" icon={HomeIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Users &amp; Partners
          </h3>
          <div className="space-y-1">
            <NavItem to="/admin/customers" label="Customers" icon={UsersIcon} onClick={onClose} />
            <NavItem to="/admin/vendors" label="Vendors / Tenants" icon={BuildingStorefrontIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Catalog &amp; Inventory
          </h3>
          <div className="space-y-1">
            <NavItem to="/admin/products" label="Products" icon={ArchiveBoxIcon} onClick={onClose} />
            <NavItem to="/admin/assets" label="Assets" icon={CubeIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Rentals
          </h3>
          <div className="space-y-1">
            <NavItem to="/admin/rentals" label="Rentals / Orders" icon={DocumentDuplicateIcon} onClick={onClose} />
            <NavItem to="/admin/returns" label="Returns" icon={ArrowPathIcon} onClick={onClose} />
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Operations &amp; Finance
          </h3>
          <div className="space-y-1">
            <NavItem to="/admin/inspections" label="Inspections" icon={ClipboardDocumentCheckIcon} onClick={onClose} />
            <NavItem to="/admin/adjustments" label="Adjustments" icon={CurrencyDollarIcon} onClick={onClose} />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-950 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white truncate">Admin User</span>
            <span
              className="text-xs font-mono text-gray-400 truncate"
              title={orgId || ''}
            >
              Org: {orgId?.substring(0, 8)}...
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MainLayout = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log('MainLayout rendered for path:', location.pathname);

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

  if (role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  if (role === 'customer') {
    return <Navigate to="/store" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop Sidebar — fixed to viewport ── */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <AdminSidebar />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-64 flex-col bg-gray-900 z-50">
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content — offset by sidebar width ── */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 z-10 flex h-14 items-center bg-gray-900 border-b border-gray-800 px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="ml-3 text-sm font-semibold text-white">Admin Portal</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
