import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface ReturnRecord {
  id: string;
  transaction_id: string;
  returned_at: string;
}

interface ReturnLine {
  id: string;
  asset_allocation_id: string;
}

interface Inspection {
  id: string;
  return_line_id: string;
  condition_status: string;
  notes: string | null;
  inspector_id: string;
}

export const Inspections = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [returnRecord, setReturnRecord] = useState<ReturnRecord | null>(null);
  const [returnLines, setReturnLines] = useState<ReturnLine[]>([]);
  const [loading, setLoading] = useState(false);

  // Inspection form state
  const [selectedLineId, setSelectedLineId] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [classification, setClassification] = useState('');
  const [notes, setNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const data = await apiClient.get('/transactions');
      setTransactions((data as any).filter((tx: any) => tx.status === 'COMPLETED' || tx.status === 'ACTIVE'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFetchReturn = async (txId: string) => {
    setSelectedTxId(txId);
    if (!txId) {
      setReturnRecord(null);
      setReturnLines([]);
      return;
    }

    try {
      setLoading(true);
      setFormSuccess(false);
      setFormError(null);
      const ret = await apiClient.get(`/returns/transaction/${txId}`);
      if (ret) {
        setReturnRecord(ret as any);
        const lines = await apiClient.get(`/returns/${(ret as any).id}/lines`);
        setReturnLines(lines as any);
      } else {
        setReturnRecord(null);
        setReturnLines([]);
      }
    } catch (err: any) {
      setReturnRecord(null);
      setReturnLines([]);
      setFormError(err.message || 'No return record found for this transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      await apiClient.post('/inspections', {
        return_line_id: selectedLineId,
        condition_status: condition,
        damage_classification: classification || undefined,
        notes: notes || undefined
      });
      setFormSuccess(true);
      setSelectedLineId('');
      setClassification('');
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to record inspection');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Asset Inspections</h1>
        <p className="text-gray-500 mt-1">Audit returned items, record damage classification, and update physical asset condition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Transaction & Return Line */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit space-y-4">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Select Returned Rental</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rental Transaction</label>
            <select
              value={selectedTxId}
              onChange={(e) => handleFetchReturn(e.target.value)}
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

          {loading && <p className="text-sm text-gray-500">Fetching return lines...</p>}

          {returnRecord && (
            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md">
              <p className="font-semibold text-gray-700">Return ID: {returnRecord.id.substring(0,8)}...</p>
              <p>Returned At: {new Date(returnRecord.returned_at).toLocaleString()}</p>
            </div>
          )}

          {returnLines.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Choose Return Line</label>
              {returnLines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLineId(line.id)}
                  className={`w-full text-left p-2 border rounded-md text-xs font-semibold ${
                    selectedLineId === line.id ? 'bg-brand-50 border-brand-500 text-brand-800' : 'bg-white border-gray-200'
                  }`}
                >
                  Return Line ID: {line.id.substring(0,8)}...
                  <p className="text-[10px] text-gray-400 font-normal">Alloc ID: {line.asset_allocation_id.substring(0,8)}...</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Inspection Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Record Inspection details</h3>
          {!selectedLineId ? (
            <p className="text-gray-500 text-sm">Please select a return line from the left column to begin.</p>
          ) : (
            <form className="space-y-4" onSubmit={handleRecordInspection}>
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                  Inspection recorded successfully!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Condition Status</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
                >
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="DAMAGED">Damaged (Under Maintenance)</option>
                  <option value="CRITICAL">Critical (Salvaged/Scrapped)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Damage Classification (Optional)</label>
                <input
                  type="text"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  placeholder="e.g. Scratched screen, cracked frame"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Inspection Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the asset condition in detail..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Submit Inspection Report
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
