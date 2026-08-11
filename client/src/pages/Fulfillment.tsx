import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Pagination } from '../components/ui/Pagination';

interface Transaction {
  id: string;
  status: string;
  transaction_date: string;
}

export const Fulfillment = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const totalItems = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/transactions');
      // Filter for CONFIRMED or ACTIVE transactions needing fulfillment operations
      const filtered = (data as any).filter((tx: any) => ['CONFIRMED', 'ALLOCATED', 'FULFILLED'].includes(tx.status));
      setTransactions(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Asset Allocation & Fulfillment</h1>
        <p className="text-gray-500 mt-1">Review allocations, assign serial numbers, and complete handoff operational steps.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Pending Fulfillment Queue</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading queue...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions currently in queue for fulfillment.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id.substring(0,8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={location.pathname.startsWith('/vendor') ? `/vendor/rentals/${tx.id}` : `/rentals/${tx.id}`} 
                      className="text-brand-600 hover:text-brand-900 flex justify-end items-center"
                    >
                      Manage Handoff <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {transactions.length > 0 && !loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            className="rounded-b-lg border-t-0"
          />
        )}
      </div>
    </div>
  );
};
