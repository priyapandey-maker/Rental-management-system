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
import { MOCK_PRODUCTS } from '../../components/store/MockProductData';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'allocated' | 'active' | 'inspections' | 'adjustments'>('confirmed');
  
  // Metrics State
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

  // Detailed operational queue states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch collections
      const [dashboardSummary, prodsData, custsData, txData] = await Promise.all([
        apiClient.get('/vendor/dashboard').catch(() => null),
        apiClient.get('/products').catch(() => null),
        apiClient.get('/customers').catch(() => null),
        apiClient.get('/transactions').catch(() => null)
      ]);

      const prodList = Array.isArray(prodsData) ? prodsData : MOCK_PRODUCTS;
      const customerList = Array.isArray(custsData) ? custsData : [
        { id: 'cust-demo-01', first_name: 'Demo', last_name: 'Customer', email: 'cust-demo-01@assetflow.local' }
      ];
      
      setProducts(prodList);
      setCustomers(customerList);

      // Load transactions (merge backend + offline localStorage)
      let txList = Array.isArray(txData) ? txData : [];
      
      // Load detailed lines for each backend transaction
      const detailedTxs = await Promise.all(
        txList.map(async (tx: any) => {
          try {
            const detail = await apiClient.get(`/transactions/${tx.id}`);
            return detail;
          } catch {
            return tx;
          }
        })
      );

      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      const combinedTxs = [...localTxs, ...detailedTxs];
      const uniqueTxs = combinedTxs.filter((tx, idx, self) => 
        self.findIndex(t => t.id === tx.id) === idx
      );
      setTransactions(uniqueTxs);

      // Load allocations
      let localAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
      setAllocations(localAllocations);

      // Load adjustments
      let localAdjustments = JSON.parse(localStorage.getItem('demo_adjustments') || '[]');
      setAdjustments(localAdjustments);

      // Load returns
      let localReturns = JSON.parse(localStorage.getItem('demo_returns') || '[]');
      setReturns(localReturns);

      // Update counts
      const activeRentalsCount = uniqueTxs.filter(tx => tx.status === 'ACTIVE').length;
      const totalRev = uniqueTxs.reduce((sum, tx) => {
        if (tx.status === 'ACTIVE' || tx.status === 'COMPLETED') {
          const txTotal = tx.lines?.reduce((lineSum: number, line: any) => {
            const start = new Date(line.rental_start_date).getTime();
            const end = new Date(line.rental_end_date).getTime();
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            const rate = Number(line.snapshot?.unit_price || line.unit_price || 0);
            return lineSum + (rate * line.quantity * days);
          }, 0) || 0;
          return sum + txTotal;
        }
        return sum;
      }, 0);

      setMetrics({
        productsCount: String(prodList.length),
        activeRentals: String(activeRentalsCount),
        customersCount: String(customerList.length),
        revenue: `$${totalRev.toFixed(2)}`
      });

    } catch (err: any) {
      setError(err.message || 'Failed to load vendor portal metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  // Operational Queues classification
  const pendingRentals = transactions.filter(tx => tx.status === 'DRAFT');
  
  const confirmedAwaitingAllocation = transactions.filter(tx => {
    if (tx.status !== 'CONFIRMED') return false;
    const lineIds = tx.lines?.map((l: any) => l.id) || [];
    const hasAllocations = allocations.some((a: any) => lineIds.includes(a.transaction_line_id));
    return !hasAllocations;
  });

  const fulfillmentQueue = transactions.filter(tx => {
    if (tx.status !== 'CONFIRMED') return false;
    const lineIds = tx.lines?.map((l: any) => l.id) || [];
    const hasAllocations = allocations.some((a: any) => lineIds.includes(a.transaction_line_id));
    return hasAllocations;
  });

  const activeReturnsQueue = transactions.filter(tx => tx.status === 'ACTIVE');
  const completedRentals = transactions.filter(tx => tx.status === 'COMPLETED');
  const pendingAdjustments = adjustments.filter(adj => adj.status === 'PENDING' || adj.status === 'DRAFT');

  const renderActiveTabList = () => {
    let list: any[] = [];
    if (activeTab === 'pending') list = pendingRentals;
    else if (activeTab === 'confirmed') list = confirmedAwaitingAllocation;
    else if (activeTab === 'allocated') list = fulfillmentQueue;
    else if (activeTab === 'active') list = activeReturnsQueue;
    else if (activeTab === 'inspections') list = completedRentals;
    else if (activeTab === 'adjustments') {
      if (pendingAdjustments.length === 0) {
        return (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base font-semibold">No adjustments awaiting processing.</p>
          </div>
        );
      }
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Adjustment ID</th>
                <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {pendingAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-800">{adj.id.substring(0,8)}...</td>
                  <td className="px-6 py-4">{adj.reason}</td>
                  <td className="px-6 py-4 font-bold text-red-650">${adj.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-750 uppercase border border-yellow-250">
                      {adj.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                    <Link to={`/vendor/rentals/${adj.transaction_id}`} className="text-brand-600 hover:text-brand-900 transition-colors">
                      Manage Rental &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400 space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base font-semibold">No contracts in this stage.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contract ID</th>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Primary Equipment</th>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Rental Period</th>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-150">
            {list.map((tx) => {
              const cust = customers.find(c => c.id === tx.customer_id);
              const customerName = cust ? `${cust.first_name} ${cust.last_name}` : 'Demo Customer';
              const firstLine = tx.lines?.[0];
              const prodName = firstLine ? products.find(p => p.id === firstLine.product_id)?.name || 'Equipment Package' : 'No items';
              
              const start = firstLine ? new Date(firstLine.rental_start_date).toLocaleDateString() : '';
              const end = firstLine ? new Date(firstLine.rental_end_date).toLocaleDateString() : '';

              return (
                <tr key={tx.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{tx.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-950">{customerName}</p>
                    <p className="text-xs text-gray-400 font-medium">{cust?.email || 'cust-demo-01@assetflow.local'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{prodName}</p>
                    {tx.lines && tx.lines.length > 1 && (
                      <p className="text-xs text-brand-600 font-medium">+{tx.lines.length - 1} other item(s)</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-650 font-medium">
                    {start} &rarr; {end}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const ret = returns.find(r => r.transaction_id === tx.id);
                      if (ret) {
                        return (
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                            ret.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {ret.status === 'PENDING' ? 'Return Requested' : 'Returned'}
                          </span>
                        );
                      }
                      return (
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
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
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                    <Link to={`/vendor/rentals/${tx.id}`} className="text-brand-600 hover:text-brand-900 transition-colors">
                      {activeTab === 'confirmed' ? 'Allocate Serials' : activeTab === 'allocated' ? 'Mark Fulfilled' : 'Manage'} &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

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
        <p className="text-sm text-gray-550 mb-6">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Retry Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Operations Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to your vendor portal. Manage product lines, serial allocations, and fulfillment statuses.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Catalog Products" value={metrics.productsCount} icon={ArchiveBoxIcon} color="indigo" sublabel="Managed entries" />
        <StatCard label="Active Rentals" value={metrics.activeRentals} icon={DocumentDuplicateIcon} color="blue" sublabel="Out with customers" />
        <StatCard label="Total Customers" value={metrics.customersCount} icon={UsersIcon} color="green" sublabel="Unique accounts" />
        <StatCard label="Est. Total Value" value={metrics.revenue} icon={CurrencyDollarIcon} color="amber" sublabel="Calculated revenue" />
      </div>

      {/* Operational Queues */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/50 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AssetFlow Operations Queue</h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time status tracking across the rental lifecycle stages.</p>
          </div>
          <button 
            onClick={fetchData} 
            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-150 transition-colors shadow-xs"
          >
            Refresh Queue
          </button>
        </div>

        {/* Queue Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap bg-gray-50/30">
          {[
            { id: 'confirmed', label: '1. Awaiting Allocation', count: confirmedAwaitingAllocation.length },
            { id: 'allocated', label: '2. Fulfillment Queue', count: fulfillmentQueue.length },
            { id: 'active', label: '3. Returns Pending', count: activeReturnsQueue.length },
            { id: 'pending', label: 'Draft Requests', count: pendingRentals.length },
            { id: 'inspections', label: 'Completed Inspections', count: completedRentals.length },
            { id: 'adjustments', label: 'Adjustments Queue', count: pendingAdjustments.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-brand-500 text-brand-600 bg-white shadow-xs' 
                  : 'border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-100/50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === tab.id 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'bg-gray-200 text-gray-650'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content List */}
        <div className="p-6">
          {renderActiveTabList()}
        </div>
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
        <h3 className="text-sm font-semibold text-brand-800 mb-2">Your Organization Scope</h3>
        <p className="text-xs font-mono text-brand-600">{orgId}</p>
        <p className="text-xs text-brand-500 mt-1">
          All your products, assets and rentals are scoped to this organization. Contact admin if you need to change organization details.
        </p>
      </div>
    </div>
  );
};
