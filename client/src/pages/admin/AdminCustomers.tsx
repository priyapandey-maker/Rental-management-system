import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../components/ui/usePagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  organization_name: string;
  organization_id: string;
}

interface Vendor {
  id: string;
  name: string;
}

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const pagination = usePagination(20);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search ? { search } : {}),
      });
      const [custData, vendorData] = await Promise.all([
        apiClient.get(`/admin/customers?${params}`),
        apiClient.get('/admin/vendors?page=1&limit=100'),
      ]);
      const custResult = custData as any;
      setCustomers(custResult.data || []);
      pagination.setPaginationFromResponse(custResult.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 1 });
      const vendorResult = vendorData as any;
      const vendorList = vendorResult.data || vendorResult || [];
      setVendors(vendorList);
      if (vendorList.length > 0 && !selectedVendorId) {
        setSelectedVendorId(vendorList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!selectedVendorId) {
      setFormError('Please select an organization');
      return;
    }

    try {
      await apiClient.post('/admin/customers', {
        organization_id: selectedVendorId,
        customer_number: `CUST-${Date.now().toString().slice(-6)}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined,
      });
      setFormSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      fetchData();
    } catch (err: any) {
      let errorMsg = err.message || 'Failed to create customer';
      if (errorMsg.toLowerCase().includes('duplicate')) {
        errorMsg = 'A customer with this email already exists for this vendor.';
      }
      setFormError(errorMsg);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Platform Customers</h1>
        <p className="text-gray-500 mt-1">Manage customers across all vendors globally.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create Customer Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Create Customer</h3>
          <form className="space-y-4" onSubmit={handleCreateCustomer}>
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                Customer created successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to Vendor</label>
              <select
                required
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Add Customer
            </button>
          </form>
        </div>

        {/* Right Side: Customers List */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-lg flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">All Customers</h3>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 w-48"
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
            <div className="p-6 text-center text-gray-500">Loading customers…</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {search ? `No customers found for "${search}".` : 'No customers found.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {c.first_name} {c.last_name}
                          <div className="text-xs text-gray-400 font-mono mt-0.5">#{c.id.substring(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-700 font-medium">
                          {c.organization_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              c.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {c.status}
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
    </div>
  );
};
