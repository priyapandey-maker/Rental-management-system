import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

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
  status: string;
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

export const RentalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Line creation state
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [lateFee, setLateFee] = useState(0);

  // Payment creation state
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('CASH');

  // Adjustment creation state
  const [adjReason, setAdjReason] = useState('');
  const [adjAmount, setAdjAmount] = useState(0);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get('/products');
      setProducts(data as any);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVariants = async (prodId: string) => {
    try {
      const data = await apiClient.get(`/products/${prodId}/variants`);
      setVariants(data as any);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRentalData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const txData = await apiClient.get(`/transactions/${id}`);
      setTransaction(txData as any);

      // Load allocations if not draft
      if ((txData as any).status !== 'DRAFT') {
        const allocData = await apiClient.get(`/allocations/transaction-lines/${(txData as any).lines[0]?.id}`);
        setAllocations(allocData as any);
      }

      // Load invoice if stored in localStorage
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
      if ((txData as any).status !== 'DRAFT') {
        const adjData = await apiClient.get(`/adjustments/transactions/${id}`);
        setAdjustments(adjData as any);
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
      alert(err.message || 'Failed to add line');
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    try {
      await apiClient.post(`/transactions/${id}/confirm`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Confirmation failed');
    }
  };

  const handleAllocate = async () => {
    if (!id) return;
    try {
      await apiClient.post(`/transactions/${id}/allocate`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Allocation failed');
    }
  };

  const handleFulfill = async () => {
    if (!id) return;
    try {
      await apiClient.post(`/transactions/${id}/fulfill`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Fulfillment failed');
    }
  };

  const handleReturn = async () => {
    if (!id) return;
    try {
      await apiClient.post(`/transactions/${id}/return`);
      loadRentalData();
    } catch (err: any) {
      alert(err.message || 'Return failed');
    }
  };

  const handleCreateInvoice = async () => {
    if (!id) return;
    try {
      const inv = await apiClient.post('/invoices', {
        transaction_id: id
      });
      setInvoice(inv as any);
      localStorage.setItem(`invoice_for_${id}`, (inv as any).id);
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    }
  };

  const handleIssueInvoice = async () => {
    if (!invoice) return;
    try {
      await apiClient.post(`/invoices/${invoice.id}/issue`);
      const invData = await apiClient.get(`/invoices/${invoice.id}`);
      setInvoice(invData as any);
    } catch (err: any) {
      alert(err.message || 'Failed to issue invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    try {
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
    }
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
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
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading details...</div>;
  if (error || !transaction) return <div className="p-8 text-red-600 text-center font-semibold">Error: {error || 'Rental not found'}</div>;

  return (
    <div className="space-y-8">
      {/* Detail Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental: {transaction.id.substring(0,8)}...</h1>
          <p className="text-sm text-gray-500 mt-1">Date: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
            {transaction.status}
          </span>
          {/* Action buttons matching ASIS */}
          {transaction.status === 'DRAFT' && (
            <button 
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium shadow-sm"
            >
              Confirm Rental
            </button>
          )}
          {transaction.status === 'CONFIRMED' && (
            <button 
              onClick={handleAllocate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium shadow-sm"
            >
              Allocate Assets
            </button>
          )}
          {transaction.status === 'ACTIVE' && (
            <div className="flex space-x-2">
              <button 
                onClick={handleFulfill}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium shadow-sm"
              >
                Fulfill Items
              </button>
              <button 
                onClick={handleReturn}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium shadow-sm"
              >
                Receive Return
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details and Lines */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Line Form */}
          {transaction.status === 'DRAFT' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Add Rental Item</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddLine}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Variant</label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  >
                    <option value="">-- Base Variant --</option>
                    {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Late Fee Rate ($/day)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={lateFee}
                    onChange={(e) => setLateFee(Number(e.target.value))}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rental Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rental End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md sm:text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm"
                  >
                    Add Rental Item
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rental Lines Display */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">Rental items</h3>
            </div>
            <div className="p-6 divide-y divide-gray-200 space-y-4">
              {transaction.lines.length === 0 ? (
                <p className="text-gray-500 text-sm">No items added to this rental contract.</p>
              ) : (
                transaction.lines.map((line) => (
                  <div key={line.id} className="pt-4 first:pt-0 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Line ID: {line.id.substring(0,8)}...</p>
                      <p className="text-xs text-gray-500 mt-1">Quantity: {line.quantity}</p>
                      <p className="text-xs text-gray-400">
                        Dates: {new Date(line.rental_start_date).toLocaleDateString()} to {new Date(line.rental_end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {line.snapshot && (
                      <div className="text-right text-xs text-gray-600">
                        <p>Rate: ${line.snapshot.unit_price}</p>
                        <p>Deposit: ${line.snapshot.deposit_amount}</p>
                        <p>Late Fee: ${line.snapshot.late_fee_rate}/day</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Allocations, Invoices, Adjustments */}
        <div className="space-y-8">
          {/* Allocations Card */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Allocated Assets</h3>
              {allocations.length === 0 ? (
                <p className="text-sm text-gray-500">No physical assets allocated yet.</p>
              ) : (
                <div className="space-y-3">
                  {allocations.map((a) => (
                    <div key={a.id} className="p-2 border border-gray-100 rounded-md bg-gray-50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-gray-700">Asset: {a.asset_id.substring(0,8)}...</p>
                        <p className="text-gray-400">Qty: {a.quantity}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoicing Card */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Billing & Payments</h3>
              {!invoice ? (
                <button
                  onClick={handleCreateInvoice}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium shadow-sm"
                >
                  Generate Invoice
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-800">Invoice: {invoice.invoice_number}</p>
                    <p className="text-gray-600">Total: ${invoice.total_amount}</p>
                    <p className="text-gray-500">Status: <span className="font-semibold">{invoice.status}</span></p>
                  </div>

                  {invoice.status === 'DRAFT' && (
                    <button
                      onClick={handleIssueInvoice}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium shadow-sm"
                    >
                      Issue Invoice
                    </button>
                  )}

                  {invoice.status === 'ISSUED' && (
                    <form className="space-y-2 border-t border-gray-100 pt-3" onSubmit={handleRecordPayment}>
                      <p className="text-xs font-semibold text-gray-700">Record Payment</p>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={payAmount || ''}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-xs"
                        placeholder="Amount"
                      />
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-xs"
                      >
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="UPI">UPI</option>
                      </select>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-medium"
                      >
                        Record Payment
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Adjustments Card */}
          {transaction.status !== 'DRAFT' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Rental Adjustments</h3>
              <div className="space-y-3 mb-4">
                {adjustments.length === 0 ? (
                  <p className="text-xs text-gray-500">No damage/late fee adjustments.</p>
                ) : (
                  adjustments.map(adj => (
                    <div key={adj.id} className="p-2 border border-gray-100 rounded-md bg-gray-50 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{adj.reason}</p>
                        <p className="text-gray-400">Status: {adj.status}</p>
                      </div>
                      <span className="font-bold text-red-600">${adj.amount}</span>
                    </div>
                  ))
                )}
              </div>

              <form className="space-y-2 border-t border-gray-100 pt-3" onSubmit={handleAddAdjustment}>
                <p className="text-xs font-semibold text-gray-700">Add Penalty/Late Fee</p>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                  placeholder="Reason (e.g. Broken screen, 2 days late)"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={adjAmount || ''}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                  placeholder="Adjustment Amount"
                />
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-medium"
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
