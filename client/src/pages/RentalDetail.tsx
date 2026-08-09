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
import { MOCK_PRODUCTS, MOCK_VARIANTS } from '../components/store/MockProductData';

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
  status: 'DRAFT' | 'CONFIRMED' | 'ALLOCATED' | 'FULFILLED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_RECEIVED' | 'INSPECTED' | 'RESOLVED' | 'COMPLETED' | 'CANCELLED';
  transaction_date: string;
  customer_id: string;
  lines: TransactionLine[];
}

interface Allocation {
  id: string;
  asset_id: string;
  status: string;
  quantity: number;
  transaction_line_id?: string;
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
  asset_id?: string;
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
  condition?: string;
}

export const RentalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgId, role } = useAuth();
  const isVendor = window.location.pathname.startsWith('/vendor');
  const isCustomer = role === 'customer';

  // Core States
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnRecord, setReturnRecord] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedLineForInspection, setSelectedLineForInspection] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState({
    condition_status: 'GOOD',
    damage_classification: '',
    damage_severity: 'NONE',
    chargeable_damage: false,
    notes: ''
  });

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
      console.warn('API /products failed, using offline mock catalog products list:', err);
      const prodsList = MOCK_PRODUCTS.map(p => ({ id: p.id, name: p.name }));
      setProducts(prodsList);
    }
  };

  const fetchVariants = async (prodId: string) => {
    try {
      const data = await apiClient.get(`/products/${prodId}/variants`);
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('API /variants failed, using offline mock variants details:', err);
      const vars = MOCK_VARIANTS[prodId] || [];
      setVariants(vars);
    }
  };

  const fetchAllAssets = async () => {
    try {
      const data = await apiClient.get('/assets');
      setAllAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('API /assets failed, using offline mock physical assets list:', err);
      const mockAssets: Asset[] = [];
      MOCK_PRODUCTS.forEach(p => {
        const variantsList = MOCK_VARIANTS[p.id] || [];
        variantsList.forEach((v, vIdx) => {
          const conditions = ['Excellent', 'Good', 'Fair'];
          mockAssets.push({
            id: `asset-${v.id}-1`,
            asset_tag: `TAG-${p.name.toUpperCase().substring(0,3)}-${v.name.toUpperCase().substring(0,3)}-01`,
            product_variant_id: v.id,
            lifecycle_status: 'AVAILABLE',
            condition: conditions[vIdx % conditions.length]
          });
        });
      });
      setAllAssets(mockAssets);
    }
  };

  const loadRentalData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch transaction
      let txData: Transaction;
      try {
        txData = (await apiClient.get(`/transactions/${id}`)) as Transaction;
      } catch (txErr) {
        console.warn('API transaction details failed, loading offline simulated transaction:', txErr);
        const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
        const localTx = localTxs.find((t: any) => t.id === id);
        if (!localTx) throw new Error('Transaction details not found');
        txData = localTx as Transaction;
      }
      setTransaction(txData);

      // Fetch customer
      try {
        const custData = (await apiClient.get(`/customers/${txData.customer_id}`)) as Customer;
        setCustomer(custData);
      } catch (custErr) {
        console.warn('Failed to load customer details, simulating offline client details:', custErr);
        setCustomer({
          id: txData.customer_id,
          first_name: 'Demo',
          last_name: 'Customer',
          email: 'cust-demo-01@assetflow.local',
          status: 'active'
        });
      }

      // Load allocations if not draft
      if (txData.status !== 'DRAFT') {
        try {
          const allocData = await apiClient.get(`/allocations/transaction-lines/${txData.lines[0]?.id}`);
          setAllocations(Array.isArray(allocData) ? allocData : []);
        } catch {
          // Fallback to local storage allocations
          const allLocalAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
          const txLineIds = txData.lines.map(line => line.id);
          const localAllocations = allLocalAllocations.filter((a: any) => txLineIds.includes(a.transaction_line_id));
          setAllocations(localAllocations);
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

      // Load return details
      let currentReturn = null;
      try {
        const retData = await apiClient.get(`/returns/transactions/${id}`);
        setReturnRecord(retData);
        currentReturn = retData;
      } catch {
        const localReturns = JSON.parse(localStorage.getItem('demo_returns') || '[]');
        const ret = localReturns.find((r: any) => r.transaction_id === id);
        setReturnRecord(ret || null);
        currentReturn = ret;
      }

      // Load inspections
      try {
        if (currentReturn) {
          const inspData = await apiClient.get(`/returns/${currentReturn.id}/inspections`);
          setInspections(Array.isArray(inspData) ? inspData : []);
        } else {
          setInspections([]);
        }
      } catch {
        const localInspections = JSON.parse(localStorage.getItem('demo_inspections') || '[]');
        const txLineIds = txData.lines.map(line => `line-${line.id}`);
        const filteredInsps = localInspections.filter((i: any) => txLineIds.includes(i.return_line_id));
        setInspections(filteredInsps);
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
      console.warn('API auto-allocation failed, simulating offline auto-allocation:', err);
      
      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      const tx = localTxs.find((t: any) => t.id === id);
      if (tx) {
        const allLocalAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
        
        tx.lines.forEach((line: any, idx: number) => {
          const exists = allLocalAllocations.some((a: any) => a.transaction_line_id === line.id);
          if (!exists) {
            const eligibleAsset = allAssets.find(
              a => a.product_variant_id === line.variant_id && 
              !allLocalAllocations.some((la: any) => la.asset_id === a.id)
            );
            
            const assetId = eligibleAsset?.id || `asset-${line.variant_id || line.product_id}-${idx}`;
            
            allLocalAllocations.push({
              id: `alloc-auto-${line.id}-${idx}`,
              transaction_line_id: line.id,
              asset_id: assetId,
              status: 'ALLOCATED',
              quantity: line.quantity
            });
          }
        });
        localStorage.setItem('demo_allocations', JSON.stringify(allLocalAllocations));
      }
      
      loadRentalData();
      fetchAllAssets();
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
      console.warn('API fulfillment failed, simulating offline fulfillment:', err);
      
      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      const tx = localTxs.find((t: any) => t.id === id);
      if (tx) {
        tx.status = 'ACTIVE';
        localStorage.setItem('demo_transactions', JSON.stringify(localTxs));
      }
      
      loadRentalData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/return-request`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to request return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReturn = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/return-approve`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveReturn = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/return-receive`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to receive return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/resolve`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedLineForInspection) return;
    try {
      setActionLoading(true);
      // We pass the transaction line ID in frontend, and let backend resolve it to return_line_id
      await apiClient.post(`/transactions/${id}/inspect`, {
        transaction_line_id: selectedLineForInspection.id,
        ...inspectionData
      });
      setShowInspectionModal(false);
      setInspectionData({
        condition_status: 'GOOD',
        damage_classification: '',
        damage_severity: 'NONE',
        chargeable_damage: false,
        notes: ''
      });
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await apiClient.post(`/transactions/${id}/complete`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete transaction');
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
      console.warn('API manual allocations failed, simulating offline manual allocation:', err);
      
      const allLocalAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
      const filteredAllocations = allLocalAllocations.filter((a: any) => a.transaction_line_id !== lineId);
      filteredAllocations.push({
        id: `alloc-manual-${lineId}`,
        transaction_line_id: lineId,
        asset_id: assetId,
        status: 'ALLOCATED',
        quantity: 1
      });
      localStorage.setItem('demo_allocations', JSON.stringify(filteredAllocations));
      
      loadRentalData();
      fetchAllAssets();
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

  const listLink = isCustomer ? '/store/rentals' : (isVendor ? '/vendor/rentals' : '/rentals');

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
              ['ALLOCATED', 'FULFILLED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'INSPECTED', 'RESOLVED'].includes(transaction.status) 
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
        {!isCustomer && (
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
              <button 
                onClick={handleAllocate}
                disabled={actionLoading}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                Auto-Allocate Assets
              </button>
            )}

            {transaction.status === 'ALLOCATED' && (
              <button 
                onClick={handleFulfill}
                disabled={actionLoading || allocations.length === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                Mark as Fulfilled
              </button>
            )}

            {transaction.status === 'RETURN_REQUESTED' && (
               <button 
                 onClick={handleApproveReturn}
                 disabled={actionLoading}
                 className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
               >
                 Approve Return
               </button>
             )}

            {transaction.status === 'RETURN_APPROVED' && (
               <button 
                 onClick={handleReceiveReturn}
                 disabled={actionLoading}
                 className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
               >
                 Receive Return
               </button>
             )}

            {transaction.status === 'INSPECTED' && (
               <button 
                 onClick={handleResolve}
                 disabled={actionLoading}
                 className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
               >
                 Resolve Contract
               </button>
             )}

            {transaction.status === 'RESOLVED' && (
               <button 
                 onClick={handleComplete}
                 disabled={actionLoading}
                 className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
               >
                 Complete Contract
               </button>
             )}
          </div>
        )}

        {isCustomer && (
          <div className="flex flex-wrap gap-2.5">
            {transaction.status === 'FULFILLED' && (
               <button
                 onClick={handleRequestReturn}
                 disabled={actionLoading}
                 className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
               >
                 Request Return
               </button>
             )}
          </div>
        )}

        {(isCustomer || !isCustomer) && transaction.status !== 'CANCELLED' && transaction.status !== 'COMPLETED' && (
          <div className="flex flex-wrap gap-2.5 mt-3 border-t border-gray-100 pt-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Cancel Contract
              </button>
          </div>
        )}
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
            {(isCustomer ? [
              { label: 'Booked', desc: 'Request initiated', active: ['DRAFT', 'CONFIRMED'].includes(transaction.status), completed: !['DRAFT', 'CONFIRMED'].includes(transaction.status) },
              { label: 'Allocated', desc: 'Serials assigned', active: transaction.status === 'ALLOCATED', completed: !['DRAFT', 'CONFIRMED', 'ALLOCATED'].includes(transaction.status) },
              { label: 'Fulfilled', desc: 'Out with customer', active: transaction.status === 'FULFILLED', completed: !['DRAFT', 'CONFIRMED', 'ALLOCATED', 'FULFILLED'].includes(transaction.status) },
              { label: 'Returned', desc: 'Awaiting intake', active: ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED'].includes(transaction.status), completed: ['INSPECTED', 'RESOLVED', 'COMPLETED'].includes(transaction.status) },
              { label: 'Inspected', desc: 'Audit completed', active: ['INSPECTED', 'RESOLVED'].includes(transaction.status), completed: transaction.status === 'COMPLETED' },
              { label: 'Completed', desc: 'Closed lease', active: transaction.status === 'COMPLETED', completed: false }
            ] : [
              { label: 'Draft', desc: 'Configure items', active: transaction.status === 'DRAFT', completed: transaction.status !== 'DRAFT' },
              { label: 'Booked', desc: 'Confirmed contract', active: transaction.status === 'CONFIRMED', completed: !['DRAFT', 'CONFIRMED'].includes(transaction.status) },
              { label: 'Allocated', desc: 'Assets assigned', active: transaction.status === 'ALLOCATED', completed: !['DRAFT', 'CONFIRMED', 'ALLOCATED'].includes(transaction.status) },
              { label: 'Fulfilling', desc: 'Out with customer', active: transaction.status === 'FULFILLED', completed: !['DRAFT', 'CONFIRMED', 'ALLOCATED', 'FULFILLED'].includes(transaction.status) },
              { label: 'Returned', desc: 'Intake & Inspect', active: ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED'].includes(transaction.status), completed: ['INSPECTED', 'RESOLVED', 'COMPLETED'].includes(transaction.status) },
              { label: 'Inspected', desc: 'Settle charges', active: ['INSPECTED', 'RESOLVED'].includes(transaction.status), completed: transaction.status === 'COMPLETED' },
              { label: 'Completed', desc: 'Closed lease', active: transaction.status === 'COMPLETED', completed: false }
            ]).map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.active;
              const isFuture = !isCompleted && !isActive;

              return (
                <div key={step.label} className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto relative animate-in fade-in duration-200">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-600 text-white border-green-600 shadow'
                      : isActive
                        ? 'bg-white text-brand-600 border-brand-500 ring-4 ring-brand-100 font-extrabold scale-110 shadow-sm animate-pulse'
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

      {/* Return Handoff & Inspection Tracker */}
      {returnRecord && !isCustomer && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Return Handoff & Inspection Tracker
              </h3>
              <p className="text-xs text-gray-505 mt-1">Return ID: <span className="font-mono font-bold text-gray-700">{returnRecord.id.substring(0,8)}...</span></p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded bg-brand-50 text-brand-700 uppercase border border-brand-200">
              Return Status: {returnRecord.status}
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-gray-100 z-0"></div>
            
            {[
              { 
                label: 'Requested', 
                desc: 'Return initiated', 
                active: returnRecord.status === 'PENDING', 
                completed: returnRecord.status !== 'PENDING' 
              },
              { 
                label: 'Accepted', 
                desc: 'Awaiting intake', 
                active: returnRecord.status === 'PROCESSING', 
                completed: returnRecord.status !== 'PENDING' && returnRecord.status !== 'PROCESSING' 
              },
              { 
                label: 'Returned', 
                desc: 'Received by vendor', 
                active: returnRecord.status === 'RECEIVED' && adjustments.length === 0, 
                completed: returnRecord.status === 'RECEIVED' && (adjustments.length > 0 || transaction?.status === 'COMPLETED')
              },
              { 
                label: 'Inspecting', 
                desc: 'Condition review', 
                active: returnRecord.status === 'RECEIVED' && adjustments.length > 0 && adjustments.some(a => a.status === 'PENDING' || a.status === 'DRAFT'), 
                completed: returnRecord.status === 'RECEIVED' && adjustments.length > 0 && adjustments.every(a => a.status !== 'PENDING' && a.status !== 'DRAFT')
              },
              { 
                label: 'Inspected', 
                desc: 'Damage assessed', 
                active: returnRecord.status === 'RECEIVED' && adjustments.length > 0 && adjustments.every(a => a.status !== 'PENDING' && a.status !== 'DRAFT') && transaction?.status !== 'COMPLETED', 
                completed: transaction?.status === 'COMPLETED'
              },
              { 
                label: 'Resolved', 
                desc: 'Commercials settled', 
                active: transaction?.status === 'COMPLETED' && invoice?.status !== 'PAID', 
                completed: transaction?.status === 'COMPLETED' && invoice?.status === 'PAID' 
              },
              { 
                label: 'Completed', 
                desc: 'Closed contract', 
                active: transaction?.status === 'COMPLETED' && invoice?.status === 'PAID', 
                completed: false 
              }
            ].map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.active;

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
                    <span className={`text-xs font-bold tracking-wide uppercase ${isActive ? 'text-brand-650 font-extrabold' : isCompleted ? 'text-gray-850' : 'text-gray-450'}`}>
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
          {transaction.status === 'DRAFT' && !isCustomer && (
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
                  const lineAllocations = allocations.filter(a => a.transaction_line_id === line.id);
                  
                  if (isCustomer) {
                    return (
                      <div key={line.id} className="pt-4 first:pt-0 border-b border-gray-100 pb-4 last:border-0 last:pb-0 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-gray-950">{prod?.name || 'Equipment Package'}</p>
                            <p className="text-xs text-gray-505">Variant: <span className="font-semibold">{(line.snapshot as any)?.variant_name || 'Standard'}</span></p>
                          </div>
                          <span className="text-xs font-mono bg-gray-100 text-gray-650 px-2 py-0.5 rounded">
                            Line: {line.id.substring(0,8)}...
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/60 text-xs">
                          <div>
                            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Rental Dates</span>
                            <span className="font-bold text-gray-800">
                              {new Date(line.rental_start_date).toLocaleDateString()} - {new Date(line.rental_end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Return Due Date</span>
                            <span className="font-bold text-brand-600">
                              {new Date(line.rental_end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Quantity</span>
                            <span className="font-bold text-gray-800">{line.quantity}</span>
                          </div>
                          {lineAllocations.length === 0 ? (
                            <div>
                              <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Physical Asset</span>
                              <span className="font-semibold text-amber-600">Awaiting Allocation</span>
                            </div>
                          ) : (
                            lineAllocations.map(a => {
                              const asset = allAssets.find(as => as.id === a.asset_id);
                              const insp = inspections.find(i => i.return_line_id === line.id || i.return_line_id === `line-${line.id}`);
                              const assetAdjustments = adjustments.filter(adj => adj.asset_id === a.asset_id);

                              return (
                                <React.Fragment key={a.id}>
                                  <div>
                                    <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Physical Asset Code</span>
                                    <span className="font-mono font-bold text-gray-800">{asset?.asset_tag || 'Allocated'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Current Condition</span>
                                    <span className={`font-bold ${
                                      asset?.condition === 'Excellent' 
                                        ? 'text-green-600' 
                                        : asset?.condition === 'Fair' 
                                          ? 'text-yellow-600' 
                                          : 'text-gray-650'
                                    }`}>
                                      {asset?.condition || 'Excellent'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block font-medium uppercase tracking-wider text-[10px]">Asset Status</span>
                                    <span className="font-bold text-gray-800 uppercase text-[10px]">{a.status}</span>
                                  </div>

                                  {insp && (
                                    <div className="col-span-2 sm:col-span-3 bg-brand-50/25 border border-brand-100 p-3 rounded-lg mt-2">
                                      <p className="font-bold text-brand-800 text-[11px] mb-1 uppercase">Inspection Audit Log</p>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <p><span className="text-gray-450 block text-[9px] uppercase">Inspection Result</span> <strong className="text-gray-700">{insp.condition_status === 'DAMAGED' || insp.condition_status === 'CRITICAL' ? 'DAMAGE / ISSUE DETECTED' : 'PASSED / GOOD CONDITION'}</strong></p>
                                        <p><span className="text-gray-455 block text-[9px] uppercase">Condition Result</span> <strong className="text-gray-700">{insp.condition_status}</strong></p>
                                        {insp.damage_classification && (
                                          <p className="col-span-2"><span className="text-gray-455 block text-[9px] uppercase">Classification</span> <strong className="text-gray-700">{insp.damage_classification}</strong></p>
                                        )}
                                        {insp.notes && (
                                          <p className="col-span-2 text-gray-500 italic mt-0.5 font-normal">&ldquo;{insp.notes}&rdquo;</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {assetAdjustments.map((adj) => (
                                    <div key={adj.id} className="col-span-2 sm:col-span-3 bg-red-50/20 border border-red-100 p-3 rounded-lg mt-2 flex justify-between items-center">
                                      <div>
                                        <span className="text-red-800 text-[11px] font-bold uppercase block">Damage Adjustment Fee</span>
                                        <p className="text-gray-750 font-semibold">{adj.reason}</p>
                                        <p className="text-[10px] text-gray-450 mt-0.5">Status: <span className="font-bold text-amber-600">{adj.status}</span></p>
                                      </div>
                                      <span className="text-base font-extrabold text-red-650">${adj.amount}</span>
                                    </div>
                                  ))}
                                </React.Fragment>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  }

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
                      {transaction.status === 'CONFIRMED' && !isCustomer && (
                        <div className="flex items-center space-x-2 border border-gray-150 p-2.5 rounded-lg bg-gray-50">
                          <select
                            value={manualAllocations[line.id] || ''}
                            onChange={(e) => setManualAllocations({ ...manualAllocations, [line.id]: e.target.value })}
                            className="bg-white border border-gray-300 text-gray-900 rounded-lg py-1 px-2.5 text-xs focus:ring-brand-500 focus:border-brand-500 max-w-[200px]"
                            disabled={actionLoading}
                          >
                            <option value="">-- Select Physical Asset --</option>
                            {eligibleAssets.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.asset_tag} — Condition: {a.condition || 'Excellent'} ({a.lifecycle_status})
                              </option>
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

                      {transaction.status === 'RETURN_RECEIVED' && !isCustomer && (
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLineForInspection(line);
                              setShowInspectionModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                          >
                            Start Inspection
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
                    !isCustomer ? (
                      <button
                        onClick={handleCreateInvoice}
                        disabled={actionLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold shadow transition-colors"
                      >
                        Generate Invoice
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No invoice issued yet.</p>
                    )
                  ) : (
                    <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50">
                      <div className="text-xs space-y-2">
                        <div>
                          <p className="font-bold text-gray-800">Invoice: <span className="font-mono">{invoice.invoice_number}</span></p>
                          <p className="text-gray-600">Total Charged: <strong className="text-gray-900">${invoice.total_amount}</strong></p>
                          <p className="text-gray-500">Status: <span className="font-bold text-brand-600">{invoice.status}</span></p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowInvoiceModal(true)}
                          className="w-full bg-white hover:bg-gray-50 text-brand-600 font-bold py-2 border border-brand-200 rounded-lg text-xs transition-colors shadow-xs"
                        >
                          View Lease Invoice
                        </button>
                      </div>

                      {invoice.status === 'DRAFT' && !isCustomer && (
                        <button
                          onClick={handleIssueInvoice}
                          disabled={actionLoading}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Issue Invoice
                        </button>
                      )}

                      {invoice.status === 'ISSUED' && !isCustomer && (
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

                  {!isCustomer && (
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
                  )}
                </div>
              )}
        </div>
      </div>
      {showInvoiceModal && invoice && (() => {
        const baseTotal = transaction.lines.reduce((sum: number, line: any) => {
          const start = new Date(line.rental_start_date).getTime();
          const end = new Date(line.rental_end_date).getTime();
          const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
          const rate = Number(line.snapshot?.unit_price || line.unit_price || 0);
          return sum + (rate * line.quantity * days);
        }, 0);
        const adjustmentsTotal = adjustments.reduce((sum: number, adj: any) => sum + Number(adj.amount), 0);
        const grandTotal = baseTotal + adjustmentsTotal + 15.00;

        return (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-150 overflow-hidden text-gray-900 max-h-[90vh] flex flex-col">
              <div className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider">Commercial Lease Invoice</h3>
                  <p className="text-[10px] text-brand-200">AssetFlow Rental Lifecycle Platform</p>
                </div>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-white hover:text-brand-200 font-extrabold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-650">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Billing From:</h4>
                    <p className="font-semibold text-gray-800">AssetFlow Operations</p>
                    <p>100 LifeCycle Ave, Ste 400</p>
                    <p>San Francisco, CA 94107</p>
                    <p className="text-[10px] mt-1 text-gray-400">support@assetflow.platform</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Lease Invoice</h4>
                    <p className="font-mono text-gray-900 font-semibold">{invoice.invoice_number}</p>
                    <p className="mt-2"><span className="text-gray-400 font-bold uppercase text-[9px] block">Invoice Date</span> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                    <p><span className="text-gray-400 font-bold uppercase text-[9px] block">Payment Status</span> <span className={`font-bold uppercase ${invoice.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{invoice.status}</span></p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Customer Billing To:</h4>
                    <p className="font-semibold text-gray-850">{customer ? `${customer.first_name} ${customer.last_name}` : 'Demo Customer'}</p>
                    <p>{customer?.email || 'customer@assetflow.local'}</p>
                    <p>San Francisco, CA</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Contract ID:</h4>
                    <p className="font-mono text-gray-900">{transaction.id}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase font-bold text-gray-450 tracking-wider mb-2">Leased Equipment Details</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                      <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                        <tr>
                          <th className="px-4 py-2">Item Description</th>
                          <th className="px-4 py-2">Variant</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Daily Rate</th>
                          <th className="px-4 py-2 text-right">Base Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-150">
                        {transaction.lines.map((line: any) => {
                          const prod = products.find(p => p.id === line.product_id);
                          const start = new Date(line.rental_start_date).getTime();
                          const end = new Date(line.rental_end_date).getTime();
                          const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                          const rate = Number(line.snapshot?.unit_price || line.unit_price || 0);
                          const rowTotal = rate * line.quantity * days;
                          return (
                            <tr key={line.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3">
                                <p className="font-bold text-gray-900">{prod?.name || 'Equipment Package'}</p>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{new Date(line.rental_start_date).toLocaleDateString()} to {new Date(line.rental_end_date).toLocaleDateString()} ({days} days)</p>
                              </td>
                              <td className="px-4 py-3 font-semibold">{(line.snapshot as any)?.variant_name || 'Standard'}</td>
                              <td className="px-4 py-3 text-center font-semibold">{line.quantity}</td>
                              <td className="px-4 py-3 text-right font-semibold">${rate.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-800">${rowTotal.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {adjustments.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-450 tracking-wider mb-2">Adjustments & Penalty Charges</h4>
                    <div className="border border-red-100 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-red-50 text-left">
                        <thead className="bg-red-50/30 text-[10px] uppercase font-bold text-red-800">
                          <tr>
                            <th className="px-4 py-2">Fee Reason</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-150">
                          {adjustments.map((adj: any) => (
                            <tr key={adj.id} className="bg-red-50/10">
                              <td className="px-4 py-2.5 font-bold text-gray-900">{adj.reason}</td>
                              <td className="px-4 py-2.5">
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold uppercase text-[9px] border border-amber-150">
                                  {adj.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-extrabold text-red-650">${Number(adj.amount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-150 pt-4 flex flex-col items-end space-y-1.5 text-xs text-gray-650">
                  <div className="flex justify-between w-64">
                    <span>Base Lease Subtotal:</span>
                    <span className="font-bold text-gray-800">${baseTotal.toFixed(2)}</span>
                  </div>
                  {adjustments.length > 0 && (
                    <div className="flex justify-between w-64">
                      <span>Adjustments Total:</span>
                      <span className="font-bold text-red-600">${adjustmentsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64">
                    <span>Processing & Delivery:</span>
                    <span className="font-bold text-gray-800">$15.00</span>
                  </div>
                  <div className="flex justify-between w-64 border-t border-gray-200 pt-2 text-sm font-extrabold text-gray-900">
                    <span>Grand Total:</span>
                    <span className="text-brand-700">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 border border-gray-200 rounded-lg text-xs transition-colors flex items-center"
                >
                  🖨 Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow transition-colors"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Inspection Modal */}
      {showInspectionModal && selectedLineForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Start Inspection</h2>
              <button 
                onClick={() => setShowInspectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                Inspecting asset for line: <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-200">{selectedLineForInspection.id}</span>
              </div>
              
              <form id="inspectionForm" onSubmit={handleSubmitInspection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Condition</label>
                  <select
                    required
                    value={inspectionData.condition_status}
                    onChange={e => setInspectionData({...inspectionData, condition_status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="GOOD">Good / Passed</option>
                    <option value="FAIR">Fair / Minor Wear</option>
                    <option value="DAMAGED">Damaged / Issue</option>
                    <option value="CRITICAL">Critical / Total Loss</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Classification</label>
                  <input
                    type="text"
                    value={inspectionData.damage_classification}
                    onChange={e => setInspectionData({...inspectionData, damage_classification: e.target.value})}
                    placeholder="e.g. Scratched Screen, Water Damage"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Severity</label>
                  <select
                    value={inspectionData.damage_severity}
                    onChange={e => setInspectionData({...inspectionData, damage_severity: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="NONE">None</option>
                    <option value="COSMETIC">Cosmetic</option>
                    <option value="FUNCTIONAL">Functional</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="chargeable_damage"
                    checked={inspectionData.chargeable_damage}
                    onChange={e => setInspectionData({...inspectionData, chargeable_damage: e.target.checked})}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <label htmlFor="chargeable_damage" className="text-sm font-medium text-gray-800">
                    Chargeable Damage (Requires Customer Payment)
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={inspectionData.notes}
                    onChange={e => setInspectionData({...inspectionData, notes: e.target.value})}
                    rows={3}
                    placeholder="Detailed inspection notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="inspectionForm"
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Submit Inspection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
