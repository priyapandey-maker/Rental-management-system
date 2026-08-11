import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Pagination } from '../components/ui/Pagination';

interface Transaction {
  id: string;
  status: string;
  transaction_date: string;
}

interface Adjustment {
  id: string;
  reason: string;
  amount: string;
  status: string;
}

export const Adjustments = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(0);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalItems = adjustments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedAdjustments = adjustments.slice((page - 1) * pageSize, page * pageSize);

  const fetchTransactions = async () => {
    try {
      const isAdmin = location.pathname.startsWith('/admin');
      const endpoint = isAdmin ? '/admin/transactions?limit=100' : '/transactions?limit=100';
      const data = await apiClient.get(endpoint);
      const result = data as any;
      const list = result.data ?? result;
      setTransactions(Array.isArray(list) ? list.filter((tx: any) => tx.status !== 'DRAFT') : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFetchAdjustments = async (txId: string) => {
    setSelectedTxId(txId);
    if (!txId) {
      setAdjustments([]);
      setPage(1);
      return;
    }

    try {
      setLoading(true);
      setFormSuccess(false);
      setFormError(null);
      const data = await apiClient.get(`/adjustments/transactions/${txId}`);
      setAdjustments(data as any);
      setPage(1);
    } catch (err: any) {
      setAdjustments([]);
      setFormError(err.message || 'Failed to fetch adjustments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      await apiClient.post('/adjustments', {
        transaction_id: selectedTxId,
        reason,
        amount
      });
      setFormSuccess(true);
      setReason('');
      setAmount(0);
      handleFetchAdjustments(selectedTxId); // Refresh list
    } catch (err: any) {
      setFormError(err.message || 'Failed to create adjustment');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Rental Adjustments</h1>
        <p className="text-gray-500 mt-1">Record and review commercial late fees or damage penalties separate from base rental prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Column */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit space-y-4">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Select Rental Contract</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
            <select
              value={selectedTxId}
              onChange={(e) => handleFetchAdjustments(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
            >
              <option value="">-- Choose Transaction --</option>
              {transactions.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.id.substring(0,8)}... ({tx.status})
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading adjustments...</p>}

          {selectedTxId && !loading && (
            <form className="space-y-3 border-t border-gray-100 pt-4" onSubmit={handleCreateAdjustment}>
              <p className="text-sm font-semibold text-gray-700">Add New Penalty</p>
              {formError && <div className="text-red-600 text-xs">{formError}</div>}
              {formSuccess && <div className="text-green-600 text-xs">Adjustment recorded!</div>}

              <div>
                <label className="block text-xs text-gray-500">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Clean up fee, missing adapter"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded text-xs font-medium"
              >
                Apply Penalty
              </button>
            </form>
          )}
        </div>

        {/* Adjustments List Column */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">Recorded Adjustments</h3>
          </div>
          {!selectedTxId ? (
            <div className="p-6 text-center text-gray-500">Select a transaction from the left column to view adjustments.</div>
          ) : adjustments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No adjustments recorded for this transaction.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adj.id.substring(0,8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adj.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {adj.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">${adj.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {adjustments.length > 0 && (
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
    </div>
  );
};
