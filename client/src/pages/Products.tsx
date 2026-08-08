import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface Product {
  id: string;
  name: string;
  type: string;
  category_id: string;
}

interface Variant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/products');
      setProducts(data as any);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (productId: string) => {
    try {
      setVariantsLoading(true);
      const data = await apiClient.get(`/products/${productId}/variants`);
      setVariants(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setVariantsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    fetchVariants(productId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Products & Variants</h1>
        <p className="text-gray-500 mt-1">Browse catalog products and click to inspect product variants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Products List */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">Product Catalog</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading products...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No products found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr 
                    key={p.id} 
                    className={`cursor-pointer hover:bg-gray-50 ${selectedProductId === p.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectProduct(p.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(p.id);
                        }} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column: Variants list */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Product Variants</h3>
          {!selectedProductId ? (
            <p className="text-gray-500 text-sm">Select a product from the list to view its variants.</p>
          ) : variantsLoading ? (
            <p className="text-gray-500 text-sm">Loading variants...</p>
          ) : variants.length === 0 ? (
            <p className="text-gray-500 text-sm">No variants found for this product.</p>
          ) : (
            <div className="space-y-4">
              {variants.map((v) => (
                <div key={v.id} className="p-3 border border-gray-200 rounded-md">
                  <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {v.sku}</p>
                  <p className="text-xs text-gray-400">ID: {v.id.substring(0,8)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
