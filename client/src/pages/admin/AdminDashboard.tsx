import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon, CurrencyDollarIcon,
  CubeIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../api/client';

interface DashboardStats {
  revenue: { total: string; pending: string };
  activeRentals: number;
  assetAvailability: { available: number; total: number; rented: number };
  outstandingPayments: number;
}

interface Transaction {
  id: string;
  status: string;
  transaction_date: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, txsData] = await Promise.all([
          apiClient.get('/admin/dashboard'),
          apiClient.get('/admin/transactions')
        ]);
        setStats(statsData as any);
        setTransactions((txsData as any).slice(0, 8)); // show recent 8
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading platform dashboard...</div>;
  if (error) return <div className="p-8 text-red-600 text-center font-semibold">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Platform Control Center</h1>
        <p className="text-gray-500 mt-1">Real-time overview of all organizations and rental operations platform-wide.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Platform Active Rentals</p>
              <div className="p-2 bg-brand-50 text-brand-600 rounded-md"><BriefcaseIcon className="h-5 w-5"/></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeRentals}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Global Asset Pool</p>
              <div className="p-2 bg-green-50 text-green-600 rounded-md"><CubeIcon className="h-5 w-5"/></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{stats.assetAvailability.available}</p>
              <p className="text-sm font-medium text-gray-500">/ {stats.assetAvailability.total}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{stats.assetAvailability.rented} currently rented</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gross Platform Revenue</p>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-md"><CurrencyDollarIcon className="h-5 w-5"/></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats.revenue.total}</p>
            <p className="text-xs text-orange-600 mt-2 font-medium">${stats.revenue.pending} pending collection</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Global Outstanding Inv</p>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-md"><DocumentTextIcon className="h-5 w-5"/></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.outstandingPayments}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Recent Platform Transactions</h3>
          <Link to="/rentals" className="text-sm font-medium text-brand-600 hover:text-brand-500">View all</Link>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No transactions recorded across the platform.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor (Tenant)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id.substring(0,8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-700">{tx.organization_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.first_name} {tx.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(tx.status) ? 'bg-green-100 text-green-800' :
                        tx.status === 'CONFIRMED' ? 'bg-brand-100 text-brand-800' :
                        tx.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/rentals/${tx.id}`} className="text-brand-600 hover:text-brand-900">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
