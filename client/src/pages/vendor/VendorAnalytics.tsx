import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
  InboxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TransactionLine {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  rental_start_date: string;
  rental_end_date: string;
  snapshot?: {
    unit_price: string;
    deposit_amount: string;
    late_fee_rate: string;
  };
}

interface Transaction {
  id: string;
  customer_id: string;
  status: 'DRAFT' | 'CONFIRMED' | 'ALLOCATED' | 'FULFILLED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_RECEIVED' | 'INSPECTED' | 'RESOLVED' | 'COMPLETED' | 'CANCELLED';
  transaction_date: string;
  lines: TransactionLine[];
  allocations?: any[];
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  asset_tag: string;
  product_variant_id: string;
}

export const VendorAnalytics = () => {
  const { orgId } = useAuth();

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [invoicesMap, setInvoicesMap] = useState<Record<string, string>>({});
  const [variantsMap, setVariantsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Export Progress State
  const [exporting, setExporting] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lists in parallel (use limit=100 for analytics/reporting view)
      const [txs, custs, prods, assetsData, invoicesData] = await Promise.all([
        apiClient.get('/transactions?page=1&limit=100'),
        apiClient.get('/customers?page=1&limit=100'),
        apiClient.get('/products?page=1&limit=100'),
        apiClient.get('/assets?page=1&limit=100'),
        apiClient.get('/reads/invoices')
      ]);

      const unwrap = (d: any) => d ? (Array.isArray(d) ? d : (d.data || [])) : [];
      const txList = unwrap(txs);
      setCustomers(unwrap(custs));
      setProducts(unwrap(prods));
      setAllAssets(unwrap(assetsData));

      // Map Invoice status by transaction ID
      const invList = invoicesData && Array.isArray((invoicesData as any).data) ? (invoicesData as any).data : [];
      const invMap: Record<string, string> = {};
      invList.forEach((inv: any) => {
        if (inv.transaction_id) {
          invMap[inv.transaction_id] = inv.status;
        }
      });
      setInvoicesMap(invMap);

      // Load all product variants to resolve SKU names
      const activeProducts = unwrap(prods);
      const vMap: Record<string, string> = {};
      await Promise.all(
        activeProducts.map(async (p: any) => {
          try {
            const productVariants = await apiClient.get(`/products/${p.id}/variants`);
            if (Array.isArray(productVariants)) {
              productVariants.forEach((v: any) => {
                vMap[v.id] = v.name;
              });
            }
          } catch (vErr) {
            console.error(vErr);
          }
        })
      );
      setVariantsMap(vMap);

      // Hydrate transaction lines and allocations for details list
      const hydratedTxs = await Promise.all(
        txList.map(async (tx: any) => {
          try {
            const detail = (await apiClient.get(`/transactions/${tx.id}`)) as Transaction;
            let lineAllocations: any[] = [];
            if (detail.status !== 'DRAFT' && detail.lines && detail.lines.length > 0) {
              try {
                const allocs = await apiClient.get(`/allocations/transaction-lines/${detail.lines[0].id}`);
                lineAllocations = Array.isArray(allocs) ? allocs : [];
              } catch {
                // Ignore allocations load error
              }
            }
            return { ...detail, allocations: lineAllocations } as any as Transaction;
          } catch {
            return { ...tx, lines: [], allocations: [] } as any as Transaction;
          }
        })
      );

      setTransactions(hydratedTxs);
    } catch (err: any) {
      setError(err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Filter evaluation logic
  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      // 1. Status Filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // 2. Product Filter
      if (productFilter !== 'all') {
        const hasProduct = tx.lines?.some(line => line.product_id === productFilter);
        if (!hasProduct) return false;
      }

      // 3. Date Filter
      const txDate = new Date(tx.transaction_date);
      const now = new Date();

      if (dateFilter === 'today') {
        return txDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        if (customStart) {
          const start = new Date(customStart);
          if (txDate < start) return false;
        }
        if (customEnd) {
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) return false;
        }
      }

      return true;
    });
  };

  const filtered = getFilteredTransactions();

  // Metrics Calculations (calculated strictly from filtered dataset)
  const totalContracts = filtered.length;
  const activeContracts = filtered.filter(t => ['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(t.status)).length;
  const completedContracts = filtered.filter(t => t.status === 'COMPLETED').length;
  const cancelledContracts = filtered.filter(t => t.status === 'CANCELLED').length;
  
  // Calculate dynamic revenue based on snapshot details
  let totalRevenue = 0;
  filtered.forEach(tx => {
    if (tx.status !== 'CANCELLED') {
      tx.lines?.forEach(line => {
        if (line.snapshot) {
          const price = Number(line.snapshot.unit_price) || 0;
          const qty = line.quantity || 1;
          const start = new Date(line.rental_start_date);
          const end = new Date(line.rental_end_date);
          const diffTime = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          totalRevenue += price * qty * diffTime;
        }
      });
    }
  });

  // Calculate status counts for SVG visual distribution chart
  const statusCounts: Record<string, number> = { DRAFT: 0, CONFIRMED: 0, ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
  filtered.forEach(tx => {
    if (['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(tx.status)) {
      statusCounts['ACTIVE']++;
    } else if (statusCounts[tx.status] !== undefined) {
      statusCounts[tx.status]++;
    }
  });

  // Monthly breakdown for SVG bar chart
  const monthlyRevenue: Record<string, number> = {};
  filtered.forEach(tx => {
    if (tx.status !== 'CANCELLED') {
      const date = new Date(tx.transaction_date);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      let txPrice = 0;
      tx.lines?.forEach(line => {
        if (line.snapshot) {
          const price = Number(line.snapshot.unit_price) || 0;
          const qty = line.quantity || 1;
          const start = new Date(line.rental_start_date);
          const end = new Date(line.rental_end_date);
          const diffTime = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          txPrice += price * qty * diffTime;
        }
      });
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + txPrice;
    }
  });

  const monthKeys = Object.keys(monthlyRevenue).sort();
  const maxMonthValue = Math.max(...Object.values(monthlyRevenue), 1);

  // Client-side CSV generation & Download
  const handleExportCSV = async () => {
    if (filtered.length === 0) return;
    try {
      setExporting(true);

      const headers = [
        "Date",
        "Rental/Order ID",
        "Customer",
        "Product",
        "Variant",
        "Asset Tag",
        "Rental Status",
        "Start Date",
        "End Date",
        "Amount",
        "Payment Status"
      ];

      const rows = filtered.map(tx => {
        const cust = customers.find(c => c.id === tx.customer_id);
        const customerName = cust ? `${cust.first_name} ${cust.last_name}` : "Unknown Customer";

        const firstLine = tx.lines?.[0];
        const prodName = firstLine ? products.find(p => p.id === firstLine.product_id)?.name || "Unknown Product" : "";
        const varName = firstLine?.variant_id ? variantsMap[firstLine.variant_id] || "" : "";

        // Resolve allocated asset tag
        let assetTag = "";
        if (tx.allocations && tx.allocations.length > 0) {
          const matchedAsset = allAssets.find(a => a.id === tx.allocations?.[0].asset_id);
          assetTag = matchedAsset ? matchedAsset.asset_tag : "";
        }

        // Calculate amount
        let txPrice = 0;
        tx.lines?.forEach(line => {
          if (line.snapshot) {
            const price = Number(line.snapshot.unit_price) || 0;
            const qty = line.quantity || 1;
            const start = new Date(line.rental_start_date);
            const end = new Date(line.rental_end_date);
            const diffTime = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            txPrice += price * qty * diffTime;
          }
        });

        // Resolve payment status
        const payStatus = invoicesMap[tx.id] || (tx.status === 'DRAFT' ? "—" : "UNPAID");

        return [
          new Date(tx.transaction_date).toLocaleDateString(),
          tx.id,
          customerName,
          prodName,
          varName,
          assetTag,
          tx.status,
          firstLine ? new Date(firstLine.rental_start_date).toLocaleDateString() : "",
          firstLine ? new Date(firstLine.rental_end_date).toLocaleDateString() : "",
          `$${txPrice.toFixed(2)}`,
          payStatus
        ];
      });

      // Escape CSV text helpers
      const escapeCSV = (val: string) => {
        if (val === null || val === undefined) return "";
        let str = String(val);
        if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        }
        return str;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
      ].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];

      link.setAttribute("href", url);
      link.setAttribute("download", `vendor-rental-report-${today}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to prepare CSV download.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">
            Real performance stats, transaction distributions, and revenue calculations.
          </p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-brand-600 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-700 flex items-center">
          <FunnelIcon className="h-4.5 w-4.5 mr-2 text-brand-500" />
          Filter Report Metrics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-gray-500 mb-1.5 uppercase tracking-wide">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500 mb-1.5 uppercase tracking-wide">Contract Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500 mb-1.5 uppercase tracking-wide">Filter by Catalog Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2"
            >
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0 || exporting}
              className="w-full py-2 bg-brand-650 text-brand-600 border border-brand-250 rounded-lg font-bold hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center shadow-xs flex items-center justify-center"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Preparing...
                </>
              ) : filtered.length === 0 ? (
                'No Data to Export'
              ) : (
                'Export CSV'
              )}
            </button>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-4 max-w-md text-xs font-semibold animate-in slide-in-from-top-2 duration-100">
            <div>
              <label className="block text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="font-semibold">Compiling real analytics reports...</span>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-650 font-bold mb-4">Error loading reports: {error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-colors shadow"
          >
            Retry Request
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtered Contracts</p>
              <p className="text-3xl font-extrabold text-brand-600 mt-2">{totalContracts}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total in filtered range</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Rentals</p>
              <p className="text-3xl font-extrabold text-brand-600 mt-2">{activeContracts}</p>
              <p className="text-[10px] text-gray-400 mt-1">Fulfilled and active</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed / Cancelled</p>
              <p className="text-3xl font-extrabold text-green-600 mt-2">{completedContracts} <span className="text-gray-300 font-normal">/</span> <span className="text-red-500">{cancelledContracts}</span></p>
              <p className="text-[10px] text-gray-400 mt-1">Historical summaries</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Calculated Revenue</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">${totalRevenue.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Aggregated commercial snapshot rates</p>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Revenue Bar Chart (SVG-based) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-brand-500 mr-2" />
                  Monthly Calculated Revenue
                </h3>
                <p className="text-[10px] text-gray-450 mt-0.5">Calculated billing rates across active/completed rentals.</p>
              </div>

              {monthKeys.length === 0 ? (
                <div className="h-48 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 italic">
                  No monthly revenue data available.
                </div>
              ) : (
                <div className="h-48 flex items-end justify-between px-4 pt-6 pb-2">
                  {monthKeys.map(key => {
                    const val = monthlyRevenue[key];
                    const heightPercent = Math.max(10, Math.min(100, (val / maxMonthValue) * 100));
                    return (
                      <div key={key} className="flex flex-col items-center flex-1 group">
                        <span className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">${val.toFixed(0)}</span>
                        <div className="w-8 bg-brand-500 group-hover:bg-brand-600 rounded-t-sm transition-all duration-300" style={{ height: `${heightPercent}px` }} />
                        <span className="text-[9px] font-mono text-gray-400 mt-2">{key}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Distribution Donut Progress (CSS/SVG-based) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-brand-500 mr-2" />
                  Rental Lifecycle Status Distribution
                </h3>
                <p className="text-[10px] text-gray-450 mt-0.5">Distribution breakdown of contracts in the filtered range.</p>
              </div>

              {totalContracts === 0 ? (
                <div className="h-48 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 italic">
                  No contracts to display status distribution.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-around h-48 gap-4">
                  {/* Progress Indicators */}
                  <div className="w-full space-y-2.5 text-xs">
                    {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map(st => {
                      const count = statusCounts[st];
                      const pct = ((count / totalContracts) * 100).toFixed(0);
                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex justify-between font-bold text-gray-700 text-[10px]">
                            <span>{st}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                ['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(st) ? 'bg-purple-500' :
                                st === 'CONFIRMED' ? 'bg-brand-500' :
                                st === 'COMPLETED' ? 'bg-green-500' :
                                st === 'CANCELLED' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scoped Contracts List */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-950">Filtered Operational Records ({filtered.length})</h3>
            </div>
            
            {filtered.length === 0 ? (
              <div className="p-16 text-center text-gray-400 space-y-3">
                <InboxIcon className="mx-auto h-10 w-10 text-gray-300" />
                <p className="text-sm font-semibold">No operational records match selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((tx) => {
                      const cust = customers.find(c => c.id === tx.customer_id);
                      const customerName = cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown Customer';
                      
                      let txPrice = 0;
                      tx.lines?.forEach(line => {
                        if (line.snapshot) {
                          const price = Number(line.snapshot.unit_price) || 0;
                          const qty = line.quantity || 1;
                          const start = new Date(line.rental_start_date);
                          const end = new Date(line.rental_end_date);
                          const diffTime = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          txPrice += price * qty * diffTime;
                        }
                      });

                      const detailLink = `/vendor/rentals/${tx.id}`;

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={detailLink} className="text-sm font-bold text-brand-600 hover:text-brand-900">
                              {tx.id.substring(0,8)}...
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{customerName}</div>
                            <div className="text-[10px] text-gray-400">{cust?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${
                              ['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(tx.status)
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-gray-800">
                            ${txPrice.toFixed(2)}
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
      )}
    </div>
  );
};
