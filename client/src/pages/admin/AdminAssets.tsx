import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

interface Asset {
  id: string;
  serial_number: string;
  lifecycle_status: string;
  condition_status: string;
  organization_name: string;
  product_name: string;
}

export const AdminAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/admin/assets');
      setAssets(data as any);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Platform Assets</h1>
        <p className="text-gray-500 mt-1">Global inventory across all vendors.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">All Physical Assets</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading assets...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : assets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No assets found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset / S.N.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {a.serial_number || 'N/A'}
                    <div className="text-xs text-gray-400 font-mono mt-0.5">#{a.id.substring(0,8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-700 font-medium">{a.organization_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      a.lifecycle_status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                      a.lifecycle_status === 'RENTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {a.lifecycle_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      a.condition_status === 'GOOD' ? 'bg-green-100 text-green-800' : 
                      a.condition_status === 'DAMAGED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {a.condition_status}
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
