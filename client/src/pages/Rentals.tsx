import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  DocumentTextIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { MOCK_PRODUCTS, MOCK_VARIANTS } from '../components/store/MockProductData';

interface TransactionLine {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  rental_start_date: string;
  rental_end_date: string;
}

interface Transaction {
  id: string;
  customer_id: string;
  status: 'DRAFT' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  transaction_date: string;
  lines?: TransactionLine[];
}

interface Customer {
  id: string;
  first_name: string;
  lastName?: string;
  last_name: string;
  status: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
}

export const Rentals = () => {
  const { orgId, role, userId } = useAuth();
  const isVendor = window.location.pathname.startsWith('/vendor');
  const isCustomer = role === 'customer';

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variantsMap, setVariantsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<'active' | 'completed'>('active');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State (Create Draft Rental)
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch flat collections
      const [txs, custs, prods] = await Promise.all([
        apiClient.get('/transactions'),
        apiClient.get('/customers'),
        apiClient.get('/products')
      ]);

      const txList = Array.isArray(txs) ? txs : [];
      const customerList = Array.isArray(custs) ? custs : [];
      const productList = Array.isArray(prods) ? prods : [];

      setCustomers(customerList.filter((c: any) => c.status === 'active'));
      setProducts(productList);

      // Load transaction lines in parallel to show product details in the list
      const txsWithLines = await Promise.all(
        txList.map(async (tx: any) => {
          try {
            const detail = await apiClient.get(`/transactions/${tx.id}`);
            return detail as any as Transaction;
          } catch {
            return tx as any as Transaction;
          }
        })
      );

      // Merge backend transactions with offline local storage transactions
      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      const combinedTxs = [...localTxs, ...txsWithLines];

      // Remove duplicates based on ID
      const uniqueTxs = combinedTxs.filter((tx, idx, self) => 
        self.findIndex(t => t.id === tx.id) === idx
      );

      setTransactions(uniqueTxs);

      // Build product variant names cache
      const vMap: Record<string, string> = {};
      await Promise.all(
        productList.map(async (p: any) => {
          try {
            const vars = await apiClient.get(`/products/${p.id}/variants`);
            if (Array.isArray(vars)) {
              vars.forEach((v: any) => {
                vMap[v.id] = v.name;
              });
            }
          } catch (e) {
            console.error(e);
          }
        })
      );
      setVariantsMap(vMap);
    } catch (err: any) {
      console.warn("Backend API offline. Loading simulated rentals from local storage.");
      setError(null);
      
      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      setTransactions(localTxs);
      
      setCustomers([
        { id: 'cust-demo-01', first_name: 'Demo', last_name: 'Customer', status: 'active', email: 'cust-demo-01@rentalms.local' }
      ]);
      
      const prodsList = MOCK_PRODUCTS.map(p => ({ id: p.id, name: p.name }));
      setProducts(prodsList);

      const vMap: Record<string, string> = {};
      Object.keys(MOCK_VARIANTS).forEach(pid => {
        MOCK_VARIANTS[pid].forEach(v => {
          vMap[v.id] = v.name;
        });
      });
      setVariantsMap(vMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!selectedCustomerId) {
      setFormError('Please select a customer');
      return;
    }

    try {
      setCreating(true);
      await apiClient.post('/transactions', {
        customer_id: selectedCustomerId
      });
      setFormSuccess(true);
      setSelectedCustomerId('');
      fetchData(); // Refresh list
    } catch (err: any) {
      setFormError(err.message || 'Failed to create rental transaction');
    } finally {
      setCreating(false);
    }
  };

  // Filter rentals
  const filteredRentals = transactions.filter((tx) => {
    // Customers only see their own rentals
    if (isCustomer) {
      if (tx.customer_id !== userId) {
        return false;
      }
      const isTxCompleted = tx.status === 'COMPLETED' || tx.status === 'CANCELLED';
      if (historyTab === 'active' && isTxCompleted) return false;
      if (historyTab === 'completed' && !isTxCompleted) return false;
    }

    const cust = customers.find(c => c.id === tx.customer_id);
    const customerName = cust ? `${cust.first_name} ${cust.last_name}`.toLowerCase() : '';
    const matchSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter ? tx.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isCustomer ? 'AssetFlow Rentals & History' : 'Rental Operations'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isCustomer 
              ? 'Track your active rental lifecycle, request returns, and review completed order details.' 
              : 'Manage rental lifecycles, assign active serials, and coordinate fulfillments.'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-brand-600 rounded-lg border border-gray-200 bg-white shadow-sm"
          title="Refresh operations"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Customer Tab Toggles */}
      {isCustomer && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setHistoryTab('active')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
              historyTab === 'active' 
                ? 'border-brand-600 text-brand-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Rentals
          </button>
          <button
            onClick={() => setHistoryTab('completed')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
              historyTab === 'completed' 
                ? 'border-brand-600 text-brand-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rental History
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Draft Rental Form */}
        {!isCustomer && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Start New Rental</h3>
              <p className="text-xs text-gray-400 mt-0.5">Initialize a blank draft contract for an active customer.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleCreateRental}>
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg">
                  Rental transaction created successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Active Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                  disabled={creating}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.email || 'No email'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex justify-center items-center shadow"
                disabled={creating}
              >
                {creating ? 'Starting...' : 'Create Draft Contract'}
              </button>
            </form>
          </div>
        )}

        {/* Rentals List */}
        <div className={`${isCustomer ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex flex-col`}>
          {/* Filters Bar */}
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer or contract ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 rounded-lg py-1.5 px-3 text-xs w-full sm:w-64 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg py-1.5 px-3 text-xs w-full sm:w-40 focus:ring-brand-500 focus:border-brand-500"
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
            <div className="p-12 text-center text-gray-500">
              <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Loading rentals operational queue...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-medium mb-4">Error: {error}</p>
              <button 
                onClick={fetchData}
                className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-500 transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-4">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-base font-medium">No rentals found matching current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rental details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRentals.map((tx) => {
                    const cust = customers.find(c => c.id === tx.customer_id);
                    const customerName = cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown Customer';
                    const firstLine = tx.lines?.[0];
                    const prodName = firstLine ? products.find(p => p.id === firstLine.product_id)?.name || 'Unknown Item' : null;
                    const varName = firstLine?.variant_id ? variantsMap[firstLine.variant_id] || '' : '';
                    
                    const detailsLink = isCustomer 
                      ? `/store/rentals/${tx.id}` 
                      : (isVendor ? `/vendor/rentals/${tx.id}` : `/rentals/${tx.id}`);

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{tx.id.substring(0, 8)}...</div>
                          <div className="text-xs text-gray-400 mt-0.5">{new Date(tx.transaction_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{customerName}</div>
                          <div className="text-xs text-gray-450">{cust?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prodName ? (
                            <>
                              <div className="text-sm font-semibold text-gray-900">{prodName}</div>
                              <div className="text-xs text-brand-600 font-medium">
                                {varName} {tx.lines && tx.lines.length > 1 ? `(+${tx.lines.length - 1} other)` : ''}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No items added</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] leading-5 font-bold rounded uppercase border ${
                            tx.status === 'ACTIVE' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : tx.status === 'CONFIRMED' 
                                ? 'bg-brand-50 text-brand-700 border-brand-200' 
                                : tx.status === 'COMPLETED' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : tx.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <Link 
                            to={detailsLink} 
                            className="inline-flex items-center text-brand-600 hover:text-brand-900 transition-colors"
                          >
                            {isCustomer ? 'View Details' : 'Manage'} &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
