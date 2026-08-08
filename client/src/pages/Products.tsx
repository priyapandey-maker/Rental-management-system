import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ArchiveBoxIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ProductImage } from '../components/store/ProductImage';

interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  rental_type: 'rentable' | 'consumable' | 'service';
  status: 'active' | 'archived' | 'draft';
}

interface Category {
  id: string;
  name: string;
  code: string;
}

interface Variant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
}

export const Products = () => {
  const { orgId } = useAuth();
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variant States
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [rentalType, setRentalType] = useState<'rentable' | 'consumable' | 'service'>('rentable');
  const [status, setStatus] = useState<'active' | 'archived' | 'draft'>('active');

  // Delete Modal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (productId: string) => {
    try {
      setVariantsLoading(true);
      const data = await apiClient.get(`/products/${productId}/variants`);
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    fetchVariants(productId);
  };

  // Open Form modal
  const openCreateModal = () => {
    setFormType('create');
    setCurrentProductId(null);
    setName('');
    setSku('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setRentalType('rentable');
    setStatus('active');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormType('edit');
    setCurrentProductId(product.id);
    setName(product.name);
    setSku(product.sku);
    setDescription(product.description || '');
    setCategoryId(product.category_id);
    setRentalType(product.rental_type);
    setStatus(product.status);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Submit Form modal
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !categoryId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setFormSaving(true);
      setFormError(null);

      const payload = {
        category_id: categoryId,
        name,
        sku,
        description: description || null,
        rental_type: rentalType,
        status
      };

      if (formType === 'create') {
        await apiClient.post('/products', payload);
      } else {
        await apiClient.put(`/products/${currentProductId}`, payload);
      }

      setIsFormOpen(false);
      fetchProducts();
      if (selectedProductId && selectedProductId === currentProductId) {
        fetchVariants(selectedProductId);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product details.');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Action
  const triggerDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/products/${productToDelete.id}`);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      if (selectedProductId === productToDelete.id) {
        setSelectedProductId(null);
        setVariants([]);
      }
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Products & Catalog</h1>
          <p className="text-gray-500 mt-1">Manage catalog products, pricing types, and inspect physical asset variations.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product List */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-950">Product Catalog</h3>
            <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full uppercase">Scoped Context</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Loading products catalog...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-medium mb-4">Error: {error}</p>
              <button 
                onClick={fetchProducts}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-4">
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-base font-medium">No products found in this organization catalog.</p>
              <p className="text-sm">Click "Add Product" above to create your first catalog item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU & Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Type</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => {
                    const catName = categories.find(c => c.id === p.category_id)?.name || 'Unknown';
                    const isSelected = selectedProductId === p.id;
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''}`}
                        onClick={() => handleSelectProduct(p.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center mr-3 border border-gray-200 overflow-hidden">
                              <ProductImage sku={p.sku} className="w-6 h-6 object-contain" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]" title={p.description || ''}>{p.description || 'No description provided'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-700">{p.sku}</div>
                          <div className="text-xs text-indigo-600 font-medium">{catName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            p.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : p.status === 'draft' 
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {p.status}
                          </span>
                          <div className="text-xs text-gray-400 mt-1 capitalize font-medium">{p.rental_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(p);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDelete(p);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Variants List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
            <p className="text-xs text-gray-400 mt-0.5">Physical inventory configurations for the selected product catalog item.</p>
          </div>
          
          {!selectedProductId ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <ArchiveBoxIcon className="mx-auto h-8 w-8 text-gray-350 mb-2" />
              <p className="text-xs font-semibold">Select a product catalog row to view variations</p>
            </div>
          ) : variantsLoading ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-xs">Loading physical variants...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
              <p className="text-xs font-semibold">No variant items found for this product.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((v) => (
                <div key={v.id} className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl hover:border-gray-200 transition-colors">
                  <p className="text-sm font-bold text-gray-900">{v.name}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">SKU: {v.sku}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {v.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {formType === 'create' ? 'Create New Catalog Product' : 'Edit Product Details'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center">
                  <ExclamationTriangleIcon className="w-4.5 h-4.5 mr-2 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Professional Cinema Rig" 
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SKU Code *</label>
                  <input 
                    type="text" 
                    value={sku} 
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-CAM-09" 
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detail description about this rental package..." 
                  rows={3}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rental Type</label>
                  <select 
                    value={rentalType} 
                    onChange={(e) => setRentalType(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="rentable">Rentable</option>
                    <option value="consumable">Consumable</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 p-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                  disabled={formSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow"
                  disabled={formSaving}
                >
                  {formSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Saving...
                    </>
                  ) : (
                    'Save Details'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in fade-in zoom-in duration-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Catalog Product?</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to permanently delete the product <strong className="text-gray-900">"{productToDelete.name}"</strong>? This action cannot be undone and will remove it from this organization catalog.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
