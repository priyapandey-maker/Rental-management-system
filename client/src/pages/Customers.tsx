import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  status: string;
}

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/customers');
      setCustomers(data as any);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      await apiClient.post('/customers', {
        customer_number: `CUST-${Date.now().toString().slice(-6)}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined
      });
      setFormSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      fetchCustomers(); // Refresh list
    } catch (err: any) {
      let errorMsg = err.message || 'Failed to create customer';
      if (errorMsg.includes("Field 'customer_number' is required")) {
        errorMsg = "Customer number could not be generated. Please try again.";
      }
      setFormError(errorMsg);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">Manage tenant customers and create new customer profiles.</p>
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
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Customer
            </button>
          </form>
        </div>

        {/* Right Side: Customers List */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">All Customers</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading customers...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No customers found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
