import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../components/ui/usePagination';

interface Transaction {
  id: string;
  status: string;
  transaction_date: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-brand-100 text-brand-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const AdminRentals = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const pagination = usePagination(20);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const data = await apiClient.get(`/admin/transactions?${params}`);
      const result = data as any;
      setTransactions(result.data || []);
      pagination.setPaginationFromResponse(
        result.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 1 }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    pagination.resetPage();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Platform Rentals</h1>
        <p className="text-gray-500 mt-1">Oversight of all rental lifecycles globally.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">All Rental Transactions</h3>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading rentals…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No rentals found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {tx.id.substring(0, 8)}…
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-700 font-medium">{tx.organization_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.first_name} {tx.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-700'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/rentals/${tx.id}`} className="text-brand-600 hover:text-brand-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.limit}
              onPageChange={pagination.setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
