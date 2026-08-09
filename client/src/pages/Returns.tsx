import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';

interface Transaction {
  id: string;
  status: string;
  transaction_date: string;
}

export const Returns = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const isAdmin = location.pathname.startsWith('/admin');
      const endpoint = isAdmin ? '/admin/transactions?limit=100&status=ACTIVE' : '/transactions?limit=100';
      const data = await apiClient.get(endpoint);
      // Unwrap paginated response { data, pagination } or plain array
      const result = data as any;
      const list = Array.isArray(result) ? result : (result.data || []);
      // Filter for ACTIVE transactions eligible for returns
      const filtered = list.filter((tx: any) => tx.status === 'ACTIVE');
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
        <h1 className="text-3xl font-extrabold text-gray-900">Returns Intake</h1>
        <p className="text-gray-500 mt-1">Receive returned physical items and update transaction status.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Checked-out Rentals</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading rentals...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No active checked-out rentals to return.</div>
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id.substring(0,8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={location.pathname.startsWith('/admin') ? `/admin/rentals/${tx.id}` : location.pathname.startsWith('/vendor') ? `/vendor/rentals/${tx.id}` : `/rentals/${tx.id}`} 
                      className="text-brand-600 hover:text-brand-900 flex justify-end items-center"
                    >
                      Process Return <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
