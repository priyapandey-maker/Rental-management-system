import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../components/ui/usePagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  organization_name: string;
  category_name: string;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const pagination = usePagination(20);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const data = await apiClient.get(`/admin/products?${params}`);
      const result = data as any;
      setProducts(result.data || []);
      pagination.setPaginationFromResponse(
        result.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 1 }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pagination.resetPage();
    setSearch(searchInput);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    pagination.resetPage();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Platform Products</h1>
        <p className="text-gray-500 mt-1">Global catalog across all vendors.</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg flex flex-col">
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">All Products</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
            </select>
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products…"
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
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading products…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.name}
                        <div className="text-xs text-gray-400 font-mono mt-0.5">#{p.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-700 font-medium">{p.organization_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.status}
                        </span>
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
