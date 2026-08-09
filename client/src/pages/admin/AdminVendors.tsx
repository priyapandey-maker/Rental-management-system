import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../components/ui/usePagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Vendor {
  id: string;
  name: string;
  slug?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export const AdminVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const pagination = usePagination(20);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search ? { search } : {}),
      });
      const data = await apiClient.get(`/admin/vendors?${params}`);
      const result = data as any;
      setVendors(result.data || []);
      pagination.setPaginationFromResponse(
        result.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 1 }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pagination.resetPage();
    setSearch(searchInput);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/admin/vendors/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update vendor status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Vendors (Tenants)</h1>
        <p className="text-gray-500 mt-1">Platform-wide organization management.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">All Registered Vendors</h3>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 w-44"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-brand-600 text-white text-sm rounded-md hover:bg-brand-700 transition-colors"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch(''); pagination.resetPage(); }}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading vendors…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : vendors.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No vendors found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {v.name}
                        <div className="text-xs text-gray-400 font-mono mt-0.5">#{v.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{v.slug || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          v.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : v.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {v.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'active')}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Activate
                          </button>
                        )}
                        {v.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'suspended')}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.limit}
              onPageChange={pagination.setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
