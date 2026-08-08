import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const colorMaps: Record<string, { text: string; bg: string }> = {
  indigo: { text: 'text-brand-600', bg: 'bg-brand-50' },
  blue: { text: 'text-brand-600', bg: 'bg-brand-50' },
  green: { text: 'text-green-600', bg: 'bg-green-50' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50' }
};

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
}) => {
  const styles = colorMaps[color] || { text: 'text-gray-600', bg: 'bg-gray-50' };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${styles.text}`}>{value}</p>
          {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${styles.bg} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${styles.text}`} />
        </div>
      </div>
    </div>
  );
};

export const VendorDashboard = () => {
  const { orgId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    productsCount: string;
    activeRentals: string;
    customersCount: string;
    revenue: string;
  }>({
    productsCount: '—',
    activeRentals: '—',
    customersCount: '—',
    revenue: '—'
  });

  const fetchMetrics = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch parallel APIs
      const [dashboardSummary, products, customers] = await Promise.all([
        apiClient.get('/vendor/dashboard'),
        apiClient.get('/vendor/products'),
        apiClient.get('/vendor/customers')
      ]);

      const activeRentalsCount = (dashboardSummary as any)?.activeRentals ?? 0;
      const totalRev = (dashboardSummary as any)?.revenue?.total ?? '0.00';
      const prodLen = Array.isArray(products) ? products.length : 0;
      const custLen = Array.isArray(customers) ? customers.length : 0;

      setMetrics({
        productsCount: String(prodLen),
        activeRentals: String(activeRentalsCount),
        customersCount: String(custLen),
        revenue: `$${Number(totalRev).toFixed(2)}`
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load vendor portal metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Unable to load metrics</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button 
          onClick={fetchMetrics}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Retry Request
        </button>
      </div>
    );
  }

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
        <StatCard label="Your Products" value={metrics.productsCount} icon={ArchiveBoxIcon} color="indigo" sublabel="Catalog items" />
        <StatCard label="Active Rentals" value={metrics.activeRentals} icon={DocumentDuplicateIcon} color="blue" sublabel="Currently rented" />
        <StatCard label="Total Customers" value={metrics.customersCount} icon={UsersIcon} color="green" sublabel="Rental recipients" />
        <StatCard label="Revenue (Month)" value={metrics.revenue} icon={CurrencyDollarIcon} color="amber" sublabel="This month" />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/vendor/products"
            className="group flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mr-4 group-hover:bg-brand-100 transition-colors">
              <ArchiveBoxIcon className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Manage Products</p>
              <p className="text-xs text-gray-400">Add, edit or remove your product catalog</p>
            </div>
          </Link>

          <Link
            to="/vendor/assets"
            className="group flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mr-4 group-hover:bg-brand-100 transition-colors">
              <ArrowTrendingUpIcon className="h-5 w-5 text-brand-600" />
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
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brand-800 mb-2">Your Organization</h3>
        <p className="text-xs font-mono text-brand-600">{orgId}</p>
        <p className="text-xs text-brand-500 mt-1">
          All your products, assets and rentals are scoped to this organization. Contact admin if you need to change organization details.
        </p>
      </div>
    </div>
  );
};
