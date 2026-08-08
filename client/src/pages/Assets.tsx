import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface Asset {
  id: string;
  product_variant_id: string;
  asset_tag: string;
  serial_number: string | null;
  qr_code: string | null;
  condition_status: string;
  lifecycle_status: string;
}

export const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/assets');
      setAssets(data as any);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Physical Assets</h1>
        <p className="text-gray-500 mt-1">Track physical items, condition audits, and rental availability.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">Inventory Status</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading assets...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : assets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No assets in inventory.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{a.asset_tag}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.serial_number || <span className="text-gray-300 italic">No Serial</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{a.product_variant_id.substring(0,8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      a.condition_status === 'NEW' || a.condition_status === 'GOOD' ? 'bg-green-100 text-green-800' :
                      a.condition_status === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {a.condition_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      a.lifecycle_status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      a.lifecycle_status === 'ALLOCATED' ? 'bg-blue-100 text-blue-800' :
                      a.lifecycle_status === 'RENTED' ? 'bg-purple-100 text-purple-800' :
                      a.lifecycle_status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {a.lifecycle_status}
                    </span>
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
