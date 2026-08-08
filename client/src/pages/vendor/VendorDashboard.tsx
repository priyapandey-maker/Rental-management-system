import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  sublabel?: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-3xl font-bold mt-1 text-${color}-600`}>{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export const VendorDashboard = () => {
  const { orgId } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to your vendor portal. Manage your products, inventory and rental operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Your Products" value="—" icon={ArchiveBoxIcon} color="indigo" sublabel="Catalog items" />
        <StatCard label="Active Rentals" value="—" icon={DocumentDuplicateIcon} color="blue" sublabel="Currently rented" />
        <StatCard label="Total Customers" value="—" icon={UsersIcon} color="green" sublabel="Rental recipients" />
        <StatCard label="Revenue (Month)" value="—" icon={CurrencyDollarIcon} color="amber" sublabel="This month" />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/vendor/products"
            className="group flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4 group-hover:bg-indigo-100 transition-colors">
              <ArchiveBoxIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Manage Products</p>
              <p className="text-xs text-gray-400">Add, edit or remove your product catalog</p>
            </div>
          </Link>

          <Link
            to="/vendor/assets"
            className="group flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">View Inventory</p>
              <p className="text-xs text-gray-400">Track your physical asset inventory</p>
            </div>
          </Link>

          <Link
            to="/vendor/rentals"
            className="group flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
              <DocumentDuplicateIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Rental Operations</p>
              <p className="text-xs text-gray-400">Manage active and completed rentals</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Organization Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-indigo-800 mb-2">Your Organization</h3>
        <p className="text-xs font-mono text-indigo-600">{orgId}</p>
        <p className="text-xs text-indigo-500 mt-1">
          All your products, assets and rentals are scoped to this organization. Contact admin if you need to change organization details.
        </p>
      </div>
    </div>
  );
};
