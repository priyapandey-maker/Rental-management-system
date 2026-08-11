import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MOCK_PRODUCTS } from '../components/store/MockProductData';
import { Pagination } from '../components/ui/Pagination';
import { 
  ClipboardDocumentCheckIcon,
  UserIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface ReturnRecord {
  id: string;
  transaction_id: string;
  returned_at: string;
  status: string;
}

interface Allocation {
  id: string;
  asset_id: string;
  status: string;
  quantity: number;
  transaction_line_id?: string;
}

interface Inspection {
  id: string;
  return_line_id: string;
  asset_id: string;
  condition_status: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
  damage_classification?: string | null;
  damage_severity?: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';
  chargeable_damage?: number;
  notes?: string | null;
  inspected_at: string;
  inspector_id?: string | null;
}

export const Inspections = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data Lists
  const [transactions, setTransactions] = useState<any[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Selected returned line for active inspection form
  const [selectedLine, setSelectedLine] = useState<any | null>(null);

  // Form State
  const [condition, setCondition] = useState<'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL'>('GOOD');
  const [severity, setSeverity] = useState<'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE'>('NONE');
  const [classification, setClassification] = useState('');
  const [isChargeable, setIsChargeable] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('0');
  const [notes, setNotes] = useState('');

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products, customers, transactions, returns, and allocations in parallel
      const isAdmin = location.pathname.startsWith('/admin');
      const [prodsData, custsData, txData, retData, allocsData] = await Promise.all([
        apiClient.get(isAdmin ? '/admin/products?limit=100' : '/products?limit=100').catch(() => null),
        apiClient.get(isAdmin ? '/admin/customers?limit=100' : '/customers?limit=100').catch(() => null),
        apiClient.get(isAdmin ? '/admin/transactions?limit=100' : '/transactions?limit=100').catch(() => null),
        apiClient.get('/returns').catch(() => null),
        apiClient.get('/allocations').catch(() => null)
      ]);

      const unwrap = (d: any) => d ? (Array.isArray(d) ? d : (d.data || [])) : null;
      const prodList = unwrap(prodsData) || MOCK_PRODUCTS;
      const customerList = unwrap(custsData) || [
        { id: 'cust-demo-01', first_name: 'Demo', last_name: 'Customer', email: 'cust-demo-01@assetflow.local' }
      ];
      setProducts(prodList);
      setCustomers(customerList);

      // Merge transaction data
      const localTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
      const backendTxs = unwrap(txData) || [];
      const combinedTxs = [...localTxs, ...backendTxs];
      const uniqueTxs = combinedTxs.filter((tx, idx, self) =>
        self.findIndex(t => t.id === tx.id) === idx
      );
      setTransactions(uniqueTxs);

      // Merge return records
      const localReturns = JSON.parse(localStorage.getItem('demo_returns') || '[]');
      const returnList = Array.isArray(retData) ? retData : [];
      const combinedReturns = [...localReturns, ...returnList];
      const uniqueReturns = combinedReturns.filter((r, idx, self) => 
        self.findIndex(t => t.id === r.id) === idx
      );
      setReturns(uniqueReturns);

      // Merge allocations
      const localAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
      const backendAllocations = Array.isArray(allocsData) ? allocsData : [];
      const combinedAllocations = [...localAllocations, ...backendAllocations];
      setAllocations(combinedAllocations);

      // Merge inspections
      const localInspections = JSON.parse(localStorage.getItem('demo_inspections') || '[]');
      setInspections(localInspections);

    } catch (err: any) {
      setError(err.message || 'Failed to load return inspection lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process return line queue
  const returnedQueue: any[] = [];
  returns.forEach(ret => {
    const tx = transactions.find(t => t.id === ret.transaction_id);
    if (!tx || !tx.lines) return;

    tx.lines.forEach((line: any) => {
      const alloc = allocations.find(a => a.transaction_line_id === line.id);
      if (!alloc) return;

      const inspectionRecord = inspections.find(
        i => i.return_line_id === line.id || i.return_line_id === `line-${line.id}`
      );

      const cust = customers.find(c => c.id === tx.customer_id) || {
        first_name: 'Demo',
        last_name: 'Customer',
        email: 'customer@assetflow.local'
      };

      const prod = products.find(p => p.id === line.product_id) || { name: 'Unknown Asset' };

      returnedQueue.push({
        id: `line-${line.id}`, // Return line ID representation
        transaction_line_id: line.id,
        transaction_id: tx.id,
        return_id: ret.id,
        customerName: `${cust.first_name} ${cust.last_name}`,
        customerEmail: cust.email,
        productName: prod.name,
        variantName: line.snapshot?.variant_name || 'Standard',
        asset_id: alloc.asset_id,
        returned_at: ret.returned_at,
        previous_condition: 'Excellent',
        inspection: inspectionRecord,
        status: inspectionRecord ? 'INSPECTED' : 'AWAITING_INSPECTION'
      });
    });
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const totalItems = returnedQueue.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedQueue = returnedQueue.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectLine = (line: any) => {
    setSelectedLine(line);
    setFormSuccess(false);
    setFormError(null);
    if (line.inspection) {
      setCondition(line.inspection.condition_status);
      setSeverity(line.inspection.damage_severity || 'NONE');
      setClassification(line.inspection.damage_classification || '');
      setIsChargeable(line.inspection.chargeable_damage === 1);
      setNotes(line.inspection.notes || '');
    } else {
      setCondition('GOOD');
      setSeverity('NONE');
      setClassification('');
      setIsChargeable(false);
      setChargeAmount('0');
      setNotes('');
    }
  };

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLine) return;
    
    setFormError(null);
    setFormSuccess(false);

    try {
      setActionLoading(true);
      // 1. Post to backend
      const res = await apiClient.post('/inspections', {
        return_line_id: selectedLine.id,
        condition_status: condition,
        damage_classification: classification || undefined,
        damage_severity: severity,
        chargeable_damage: isChargeable,
        notes: notes || undefined
      });

      // 2. If chargeable adjustment, post adjustment
      if (isChargeable && Number(chargeAmount) > 0) {
        await apiClient.post('/adjustments', {
          transaction_id: selectedLine.transaction_id,
          asset_id: selectedLine.asset_id,
          reason: `Damage Fee: ${classification || 'Asset damage recorded'}`,
          amount: Number(chargeAmount),
          status: 'PENDING'
        });
      }

      setFormSuccess(true);
      fetchData();
      setSelectedLine(null);
    } catch (err: any) {
      console.warn('API inspection record failed, applying offline local simulation:', err);

      // Create simulated inspection entry
      const localInspections = JSON.parse(localStorage.getItem('demo_inspections') || '[]');
      const newInsp: Inspection = {
        id: `insp-demo-${Date.now()}`,
        return_line_id: selectedLine.id,
        asset_id: selectedLine.asset_id,
        condition_status: condition,
        damage_classification: classification || null,
        damage_severity: severity,
        chargeable_damage: isChargeable ? 1 : 0,
        notes: notes || null,
        inspected_at: new Date().toISOString()
      };
      localInspections.push(newInsp);
      localStorage.setItem('demo_inspections', JSON.stringify(localInspections));

      // Handle adjustments if damage fee applies
      if (isChargeable && Number(chargeAmount) > 0) {
        const localAdjustments = JSON.parse(localStorage.getItem('demo_adjustments') || '[]');
        localAdjustments.push({
          id: `adj-demo-${Date.now()}`,
          transaction_id: selectedLine.transaction_id,
          asset_id: selectedLine.asset_id,
          reason: `Damage Fee: ${classification || 'Asset damage recorded'}`,
          amount: Number(chargeAmount),
          status: 'PENDING'
        });
        localStorage.setItem('demo_adjustments', JSON.stringify(localAdjustments));
      }

      // Update asset condition to UNDER_MAINTENANCE if Damaged or Critical
      if (condition === 'DAMAGED' || condition === 'CRITICAL') {
        const localAllocations = JSON.parse(localStorage.getItem('demo_allocations') || '[]');
        localAllocations.forEach((a: any) => {
          if (a.asset_id === selectedLine.asset_id) {
            a.status = 'UNDER_MAINTENANCE';
          }
        });
        localStorage.setItem('demo_allocations', JSON.stringify(localAllocations));
      }

      setFormSuccess(true);
      fetchData();
      setSelectedLine(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-brand-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading returned assets queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClipboardDocumentCheckIcon className="h-7 w-7 text-brand-600 mr-2" />
          Returned Asset Inspections
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Perform audits, record condition statuses, and log chargeable damage adjustments for returns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Returned Asset Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-gray-950">Returns Audit Queue</h3>
                <p className="text-xs text-gray-500 mt-0.5">Asset returns waiting for inspection.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                {returnedQueue.length} Total items
              </span>
            </div>

            {returnedQueue.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-2">
                <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="text-base font-semibold">No assets awaiting inspections.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase">Equipment</th>
                      <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase">Customer</th>
                      <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase">Return Date</th>
                      <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-150">
                    {paginatedQueue.map((line) => {
                      const isSelected = selectedLine?.id === line.id;
                      return (
                        <tr 
                          key={line.id} 
                          className={`transition-colors hover:bg-gray-50/50 ${
                            isSelected ? 'bg-brand-50/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-950">{line.productName}</p>
                            <p className="text-xs text-gray-450 font-mono mt-0.5">Tag: {line.asset_id.substring(0,10)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">{line.customerName}</p>
                            <p className="text-xs text-gray-450">{line.customerEmail}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-600">
                            {line.returned_at ? new Date(line.returned_at).toLocaleDateString() : 'Awaiting Intake'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${
                              line.status === 'INSPECTED' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse'
                            }`}>
                              {line.status === 'INSPECTED' ? 'Audited' : 'Awaiting Audit'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                            <button
                              onClick={() => handleSelectLine(line)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${
                                isSelected 
                                  ? 'bg-brand-600 text-white border-brand-600 shadow'
                                  : 'bg-white text-brand-600 border-brand-200 hover:bg-brand-50/50'
                              }`}
                            >
                              {line.status === 'INSPECTED' ? 'View Report' : 'Record Audit'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {returnedQueue.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                className="rounded-b-xl border-t-0"
              />
            )}
          </div>
        </div>

        {/* Right Column: Record Inspection Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <WrenchScrewdriverIcon className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-gray-900">Audit & Damage Logs</h3>
          </div>

          {!selectedLine ? (
            <p className="text-xs text-gray-400 italic text-center py-12">
              Select a return line from the list to begin recording or viewing the inspection.
            </p>
          ) : (
            <form className="space-y-4 text-xs font-medium text-gray-700" onSubmit={handleRecordInspection}>
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start space-x-1.5">
                  <ExclamationCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-start space-x-1.5 animate-in fade-in">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Inspection logged successfully!</span>
                </div>
              )}

              {/* Readonly details */}
              <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg space-y-1.5 text-xs text-gray-650">
                <p><span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block">Returned Item</span> <span className="font-bold text-gray-900">{selectedLine.productName}</span></p>
                <p><span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block">Serial Tag</span> <span className="font-mono text-gray-800">{selectedLine.asset_id}</span></p>
                <p><span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block">Previous Condition</span> <span className="font-bold text-green-600">{selectedLine.previous_condition}</span></p>
              </div>

              {selectedLine.inspection ? (
                /* VIEW ONLY MODE */
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-brand-50/20 border border-brand-100 rounded-lg space-y-2">
                    <p className="font-bold text-brand-800 text-xs">AUDIT REPORT COMPLETED</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Condition Result</span>
                        <span className="font-bold text-gray-800">{selectedLine.inspection.condition_status}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Severity</span>
                        <span className="font-bold text-gray-800">{selectedLine.inspection.damage_severity || 'NONE'}</span>
                      </div>
                    </div>
                    {selectedLine.inspection.damage_classification && (
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Classification</span>
                        <span className="font-semibold text-gray-800">{selectedLine.inspection.damage_classification}</span>
                      </div>
                    )}
                    {selectedLine.inspection.notes && (
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Inspector Notes</span>
                        <span className="text-gray-650 font-normal italic">{selectedLine.inspection.notes}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Chargeable Damage</span>
                      <span className={`font-bold ${selectedLine.inspection.chargeable_damage === 1 ? 'text-red-650' : 'text-green-650'}`}>
                        {selectedLine.inspection.chargeable_damage === 1 ? 'YES (Adjustment created)' : 'NO (Passed condition)'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLine(null)}
                    className="w-full text-center py-2 px-4 border border-gray-200 rounded-lg font-bold text-xs text-gray-500 hover:bg-gray-50 transition-colors mt-2"
                  >
                    Close Report
                  </button>
                </div>
              ) : (
                /* RECORD MODE */
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Audit Condition Status</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-lg text-xs"
                      disabled={actionLoading}
                    >
                      <option value="GOOD">Good Condition (Passed)</option>
                      <option value="NEW">Brand New / Unused (Passed)</option>
                      <option value="FAIR">Fair (Minor Scratches, Passed)</option>
                      <option value="DAMAGED">Damaged (Requires Maintenance)</option>
                      <option value="CRITICAL">Critical Status (Salvaged/Scrapped)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Damage Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-lg text-xs"
                      disabled={actionLoading}
                    >
                      <option value="NONE">None</option>
                      <option value="MINOR">Minor Damage</option>
                      <option value="MODERATE">Moderate Damage</option>
                      <option value="SEVERE">Severe Damage / Unusable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Damage Classification</label>
                    <input
                      type="text"
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      placeholder="e.g. Scratched lens, missing strap"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-xs shadow-xs"
                      disabled={actionLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Inspection Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Audit log observations..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-xs shadow-xs"
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Chargeable adjustment details */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={isChargeable}
                        onChange={(e) => setIsChargeable(e.target.checked)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        disabled={actionLoading}
                      />
                      <span className="text-xs font-bold text-gray-800">Apply Chargeable Damage Fee</span>
                    </label>

                    {isChargeable && (
                      <div className="animate-in slide-in-from-top duration-200">
                        <label className="block text-[10px] uppercase font-bold text-red-600">Fee Amount ($)</label>
                        <input
                          type="number"
                          value={chargeAmount}
                          onChange={(e) => setChargeAmount(e.target.value)}
                          min="0"
                          className="mt-1 block w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-xs bg-red-50/20 text-red-800"
                          placeholder="0.00"
                          disabled={actionLoading}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">This will automatically create a PENDING damage adjustment for resolution.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedLine(null)}
                      className="w-1/3 py-2 border border-gray-200 rounded-lg text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                      disabled={actionLoading}
                    >
                      Submit Audit Logs
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
