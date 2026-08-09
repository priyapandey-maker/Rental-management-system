import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  UserIcon,
  CreditCardIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
}

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
  status: 'DRAFT' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  transaction_date: string;
  customer_id: string;
  lines: TransactionLine[];
}

interface Allocation {
  id: string;
  asset_id: string;
  status: string;
  quantity: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: string;
  due_date: string | null;
}

interface Adjustment {
  id: string;
  reason: string;
  amount: string;
  status: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Asset {
  id: string;
  asset_tag: string;
  product_variant_id: string;
  lifecycle_status: string;
}

export const RentalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgId } = useAuth();
  const isVendor = window.location.pathname.startsWith('/vendor');

  // Core States
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lists for forms
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  // Add line fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [lateFee, setLateFee] = useState(0);

  // Manual Allocation selections (lineId -> assetId)
  const [manualAllocations, setManualAllocations] = useState<Record<string, string>>({});

  // Payment creation fields
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('CASH');

  // Adjustment creation fields
  const [adjReason, setAdjReason] = useState('');
  const [adjAmount, setAdjAmount] = useState(0);

  // Action status loader
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVariants = async (prodId: string) => {
    try {
      const data = await apiClient.get(`/products/${prodId}/variants`);
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVariants([]);
    }
  };

  const fetchAllAssets = async () => {
    try {
      const data = await apiClient.get('/assets');
      setAllAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRentalData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch transaction
      const txData = (await apiClient.get(`/transactions/${id}`)) as Transaction;
      setTransaction(txData);

      // Fetch customer
      try {
        const custData = (await apiClient.get(`/customers/${txData.customer_id}`)) as Customer;
        setCustomer(custData);
      } catch (custErr) {
        console.error('Failed to load customer details', custErr);
      }

      // Load allocations if not draft
      if (txData.status !== 'DRAFT') {
        try {
          const allocData = await apiClient.get(`/allocations/transaction-lines/${txData.lines[0]?.id}`);
          setAllocations(Array.isArray(allocData) ? allocData : []);
        } catch {
          setAllocations([]);
        }
      }

      // Load invoice if stored in cache
      const cachedInvoiceId = localStorage.getItem(`invoice_for_${id}`);
      if (cachedInvoiceId) {
        try {
          const invData = await apiClient.get(`/invoices/${cachedInvoiceId}`);
          setInvoice(invData as any);
        } catch {
          localStorage.removeItem(`invoice_for_${id}`);
        }
      }

      // Load adjustments if not draft
      if (txData.status !== 'DRAFT') {
        try {
          const adjData = await apiClient.get(`/adjustments/transactions/${id}`);
          setAdjustments(Array.isArray(adjData) ? adjData : []);
        } catch {
          setAdjustments([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentalData();
    fetchProducts();
    fetchAllAssets();
  }, [id]);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    } else {
      setVariants([]);
    }
  }, [selectedProductId]);

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/lines`, {
        product_id: selectedProductId,
        variant_id: selectedVariantId || undefined,
        quantity,
        rental_start_date: new Date(startDate).toISOString(),
        rental_end_date: new Date(endDate).toISOString(),
        unit_price: unitPrice,
        deposit_amount: deposit,
        late_fee_rate: lateFee
      });
      setSelectedProductId('');
      setSelectedVariantId('');
      setQuantity(1);
      setStartDate('');
      setEndDate('');
      setUnitPrice(0);
      setDeposit(0);
      setLateFee(0);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to add line item');
    } finally {
      setActionLoading(false);
    }
  };

  // Operations
  const handleConfirm = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/confirm`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/allocate`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Allocation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfill = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/fulfill`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Fulfillment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/return`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Receive Return failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to cancel this contract? This will retire active allocations.")) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/cancel`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual asset assignment
  const handleManualAllocate = async (lineId: string) => {
    const assetId = manualAllocations[lineId];
    if (!assetId) {
      alert('Please select an available physical asset to allocate.');
      return;
    }
    try {
      setActionLoading(true);
      await apiClient.post('/allocations', {
        transaction_line_id: lineId,
        asset_id: assetId,
        quantity: 1
      });
      loadRentalData();
      fetchAllAssets(); // Refresh active asset status
    } catch (err: any) {
      alert(err.message || 'Failed to allocate asset manually.');
    } finally {
      setActionLoading(false);
    }
  };

  // Invoicing & Payments
  const handleCreateInvoice = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const inv = await apiClient.post('/invoices', {
        transaction_id: id
      });
      setInvoice(inv as any);
      localStorage.setItem(`invoice_for_${id}`, (inv as any).id);
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!invoice) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/invoices/${invoice.id}/issue`);
      const invData = await apiClient.get(`/invoices/${invoice.id}`);
      setInvoice(invData as any);
    } catch (err: any) {
      alert(err.message || 'Failed to issue invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    try {
      setActionLoading(true);
      await apiClient.post('/payments', {
        invoice_id: invoice.id,
        amount: payAmount,
        payment_method: payMethod
      });
      setPayAmount(0);
      const invData = await apiClient.get(`/invoices/${invoice.id}`);
      setInvoice(invData as any);
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post('/adjustments', {
        transaction_id: id,
        reason: adjReason,
        amount: adjAmount
      });
      setAdjReason('');
      setAdjAmount(0);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to add adjustment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-base font-semibold">Loading rental details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to load details</h3>
        <p className="text-sm text-gray-500 mb-6">{error || 'Rental contract not found'}</p>
        <Link to={isVendor ? '/vendor/rentals' : '/rentals'} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-sm transition-colors shadow">
          Back to list
        </Link>
      </div>
    );
  }

  const listLink = isVendor ? '/vendor/rentals' : '/rentals';

  return (
    <div className="space-y-8">
      {/* Back to list navigation */}
      <Link to={listLink} className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-brand-600 transition-colors uppercase tracking-wider">
        <ArrowLeftIcon className="h-4.5 w-4.5 mr-2" />
        Back to operations list
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-gray-900">Contract: {transaction.id.substring(0,8)}...</h1>
            <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase ${
              transaction.status === 'ACTIVE' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : transaction.status === 'CONFIRMED' 
                  ? 'bg-brand-50 text-brand-700 border-brand-200' 
                  : transaction.status === 'COMPLETED' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : transaction.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {transaction.status}
            </span>
          </div>
          <p className="text-xs text-gray-450 mt-1">Authorized Contract Ledger • Scoped Access</p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap gap-2.5">
          {actionLoading && (
            <div className="flex items-center text-xs text-gray-400 font-semibold mr-2">
              <svg className="animate-spin h-4 w-4 mr-1 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Updating...
            </div>
          )}

          {transaction.status === 'DRAFT' && (
            <button 
              onClick={handleConfirm}
              disabled={actionLoading || transaction.lines.length === 0}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              Confirm Rental
            </button>
          )}

          {transaction.status === 'CONFIRMED' && (
            <>
              <button 
                onClick={handleAllocate}
                disabled={actionLoading}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                Auto-Allocate Assets
              </button>
              <button 
                onClick={handleFulfill}
                disabled={actionLoading || allocations.length === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                Fulfill Items
              </button>
            </>
          )}

          {transaction.status === 'ACTIVE' && (
            <button 
              onClick={handleReturn}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              Receive Return
            </button>
          )}

          {transaction.status !== 'CANCELLED' && transaction.status !== 'COMPLETED' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel Contract
            </button>
          )}
        </div>
      </div>

      {/* AssetFlow Lifecycle Progress Stepper */}
      {transaction.status === 'CANCELLED' ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Contract Cancelled</h3>
            <p className="text-xs text-red-600 mt-0.5">This rental contract has been terminated. Associated allocations and operations are retired.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            AssetFlow Lifecycle Progress
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-gray-100 z-0"></div>
            
            {/* Steps loop */}
            {[
              { label: 'Draft', desc: 'Configure items', active: transaction.status === 'DRAFT', completed: transaction.status !== 'DRAFT' },
              { label: 'Booked', desc: 'Confirmed contract', active: transaction.status === 'CONFIRMED' && allocations.length === 0, completed: transaction.status !== 'DRAFT' && transaction.status !== 'CONFIRMED' },
              { label: 'Allocated', desc: 'Assets assigned', active: transaction.status === 'CONFIRMED' && allocations.length > 0, completed: transaction.status === 'ACTIVE' || transaction.status === 'COMPLETED' },
              { label: 'Fulfilling', desc: 'Out with customer', active: transaction.status === 'ACTIVE', completed: transaction.status === 'COMPLETED' },
              { label: 'Returned', desc: 'Intake & Inspect', active: transaction.status === 'COMPLETED' && invoice?.status !== 'PAID', completed: transaction.status === 'COMPLETED' && invoice?.status === 'PAID' },
              { label: 'Completed', desc: 'Setted & resolved', active: transaction.status === 'COMPLETED' && invoice?.status === 'PAID', completed: false }
            ].map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.active;
              const isFuture = !isCompleted && !isActive;

              return (
                <div key={step.label} className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-brand-600 text-white border-brand-600 shadow'
                      : isActive
                        ? 'bg-white text-brand-600 border-brand-500 ring-4 ring-brand-100 font-extrabold scale-110 shadow-sm'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="flex flex-col md:items-center text-left md:text-center">
                    <span className={`text-xs font-bold tracking-wide uppercase ${isActive ? 'text-brand-600 font-extrabold' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {step.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Columns: Details, Add Item, Items */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in">
          {/* Customer Info Card */}
          {customer && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 text-brand-500 mr-2" />
                Customer Account
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Full Name</p>
                  <p className="font-bold text-gray-800 mt-1">{customer.first_name} {customer.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Email Address</p>
                  <p className="text-gray-700 mt-1">{customer.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Rental Item (Only in Draft mode) */}
          {transaction.status === 'DRAFT' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Add Rental Item</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddLine}>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product</label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Variant</label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  >
                    <option value="">-- Base Variant --</option>
                    {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deposit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Late Fee Rate ($/day)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={lateFee}
                    onChange={(e) => setLateFee(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rental Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rental End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-inner"
                    disabled={actionLoading}
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-bold text-sm shadow transition-colors"
                    disabled={actionLoading}
                  >
                    Add Contract Item Line
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rental Lines ledger list */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-950">Rental items & Commercials</h3>
            </div>
            <div className="p-6 divide-y divide-gray-150 space-y-4">
              {transaction.lines.length === 0 ? (
                <p className="text-gray-400 text-xs italic">No items added to this rental contract.</p>
              ) : (
                transaction.lines.map((line) => {
                  const prod = products.find(p => p.id === line.product_id);
                  // Find eligible available physical assets for this variant
                  const eligibleAssets = allAssets.filter(
                    a => a.product_variant_id === line.variant_id && a.lifecycle_status === 'AVAILABLE'
                  );

                  return (
                    <div key={line.id} className="pt-4 first:pt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Line: {line.id.substring(0,8)}...</p>
                        <p className="text-xs text-gray-500 mt-1">Product: <span className="font-semibold">{prod?.name || 'Unknown Item'}</span></p>
                        <p className="text-xs text-gray-500">Qty: {line.quantity}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Dates: {new Date(line.rental_start_date).toLocaleDateString()} to {new Date(line.rental_end_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Manual Asset Allocation block when CONFIRMED */}
                      {transaction.status === 'CONFIRMED' && (
                        <div className="flex items-center space-x-2 border border-gray-150 p-2.5 rounded-lg bg-gray-50">
                          <select
                            value={manualAllocations[line.id] || ''}
                            onChange={(e) => setManualAllocations({ ...manualAllocations, [line.id]: e.target.value })}
                            className="bg-white border border-gray-300 text-gray-900 rounded-lg py-1 px-2.5 text-xs focus:ring-brand-500 focus:border-brand-500"
                            disabled={actionLoading}
                          >
                            <option value="">-- Select Physical Asset --</option>
                            {eligibleAssets.map(a => (
                              <option key={a.id} value={a.id}>{a.asset_tag}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleManualAllocate(line.id)}
                            disabled={actionLoading || eligibleAssets.length === 0}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                          >
                            Assign Serial
                          </button>
                        </div>
                      )}

                      {line.snapshot && (
                        <div className="text-right text-xs text-gray-500 border-l border-gray-100 pl-4">
                          <p>Rate: <strong className="text-gray-800">${line.snapshot.unit_price}</strong></p>
                          <p>Deposit: <strong className="text-gray-800">${line.snapshot.deposit_amount}</strong></p>
                          <p>Late Fee: <strong className="text-gray-800">${line.snapshot.late_fee_rate}/day</strong></p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column: Allocations, Billing, adjustments */}
        <div className="space-y-8">
          {/* Allocations Ledger */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TagIcon className="h-5 w-5 text-brand-500 mr-2" />
                Allocated Assets
              </h3>
              {allocations.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No physical assets allocated yet.</p>
              ) : (
                <div className="space-y-2">
                  {allocations.map((a) => {
                    const mappedAsset = allAssets.find(as => as.id === a.asset_id);
                    return (
                      <div key={a.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-700">Tag: {mappedAsset?.asset_tag || a.asset_id.substring(0,8)}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">ID: {a.asset_id.substring(0,8)}...</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[9px] font-bold uppercase border border-brand-150">
                          {a.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Billing & Invoice panel */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <CreditCardIcon className="h-5 w-5 text-brand-500 mr-2" />
                Billing & Invoice
              </h3>
              {!invoice ? (
                <button
                  onClick={handleCreateInvoice}
                  disabled={actionLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold shadow transition-colors"
                >
                  Generate Invoice
                </button>
              ) : (
                <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-gray-800">Invoice: <span className="font-mono">{invoice.invoice_number}</span></p>
                    <p className="text-gray-600">Total Charged: <strong className="text-gray-900">${invoice.total_amount}</strong></p>
                    <p className="text-gray-500">Status: <span className="font-bold text-brand-600">{invoice.status}</span></p>
                  </div>

                  {invoice.status === 'DRAFT' && (
                    <button
                      onClick={handleIssueInvoice}
                      disabled={actionLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Issue Invoice
                    </button>
                  )}

                  {invoice.status === 'ISSUED' && (
                    <form className="space-y-3 border-t border-gray-200 pt-3" onSubmit={handleRecordPayment}>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Record Payment</p>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={payAmount || ''}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 text-xs shadow-inner"
                        placeholder="Amount ($)"
                        disabled={actionLoading}
                      />
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 text-xs"
                        disabled={actionLoading}
                      >
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="UPI">UPI</option>
                      </select>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Record Payment
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Adjustments & Penalty charges */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Rental Adjustments</h3>
              <div className="space-y-2 mb-2">
                {adjustments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No adjustments applied.</p>
                ) : (
                  adjustments.map(adj => (
                    <div key={adj.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex justify-between text-xs items-center">
                      <div>
                        <p className="font-bold text-gray-800">{adj.reason}</p>
                        <p className="text-[10px] text-gray-400">Status: {adj.status}</p>
                      </div>
                      <span className="font-bold text-red-650">${adj.amount}</span>
                    </div>
                  ))
                )}
              </div>

              <form className="space-y-3 border-t border-gray-150 pt-3" onSubmit={handleAddAdjustment}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Add Penalty Charge</p>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 text-xs shadow-inner"
                  placeholder="Reason (e.g. Damage, Late Return)"
                  disabled={actionLoading}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={adjAmount || ''}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 text-xs shadow-inner"
                  placeholder="Amount ($)"
                  disabled={actionLoading}
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Apply Penalty
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
