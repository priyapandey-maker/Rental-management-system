import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  product_variant_id: string;
  asset_tag: string;
  serial_number: string | null;
  qr_code: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  condition_status: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
  lifecycle_status: 'AVAILABLE' | 'RESERVED' | 'ALLOCATED' | 'RENTED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED';
  location: string | null;
}

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
}

export const Assets = () => {
  const { orgId } = useAuth();

  // Data States
  const [assets, setAssets] = useState<Asset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variantsMap, setVariantsMap] = useState<Record<string, { variantName: string; productName: string }>>({});
  const [flatVariants, setFlatVariants] = useState<Array<{ id: string; displayName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [productVariantId, setProductVariantId] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [conditionStatus, setConditionStatus] = useState<'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL'>('GOOD');
  const [lifecycleStatus, setLifecycleStatus] = useState<'AVAILABLE' | 'RESERVED' | 'ALLOCATED' | 'RENTED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED'>('AVAILABLE');
  const [locationField, setLocationField] = useState('');

  // Delete Modal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssetsAndRelations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assets and products
      const [assetsData, productsData] = await Promise.all([
        apiClient.get('/assets'),
        apiClient.get('/products')
      ]);

      const activeAssets = Array.isArray(assetsData) ? assetsData : [];
      const activeProducts = Array.isArray(productsData) ? productsData : [];

      setAssets(activeAssets);
      setProducts(activeProducts);

      // Load variants for all products to construct display name maps
      const vMaps: Record<string, { variantName: string; productName: string }> = {};
      const fVariants: Array<{ id: string; displayName: string }> = [];

      await Promise.all(
        activeProducts.map(async (p: any) => {
          try {
            const productVariants = await apiClient.get(`/products/${p.id}/variants`);
            if (Array.isArray(productVariants)) {
              productVariants.forEach((v: any) => {
                vMaps[v.id] = { variantName: v.name, productName: p.name };
                fVariants.push({
                  id: v.id,
                  displayName: `${p.name} — ${v.name} (${v.sku})`
                });
              });
            }
          } catch (vErr) {
            console.error(`Failed to load variants for product ${p.id}`, vErr);
          }
        })
      );

      setVariantsMap(vMaps);
      setFlatVariants(fVariants);
    } catch (err: any) {
      setError(err.message || 'Failed to load assets inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndRelations();
  }, []);

  // Form Operations
  const openCreateModal = () => {
    setFormType('create');
    setCurrentAssetId(null);
    setProductVariantId(flatVariants[0]?.id || '');
    setAssetTag('');
    setSerialNumber('');
    setQrCode('');
    setAcquisitionDate('');
    setAcquisitionCost('');
    setConditionStatus('GOOD');
    setLifecycleStatus('AVAILABLE');
    setLocationField('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setFormType('edit');
    setCurrentAssetId(asset.id);
    setProductVariantId(asset.product_variant_id);
    setAssetTag(asset.asset_tag);
    setSerialNumber(asset.serial_number || '');
    setQrCode(asset.qr_code || '');
    setAcquisitionDate(asset.acquisition_date ? asset.acquisition_date.split('T')[0] : '');
    setAcquisitionCost(asset.acquisition_cost !== null ? String(asset.acquisition_cost) : '');
    setConditionStatus(asset.condition_status);
    setLifecycleStatus(asset.lifecycle_status);
    setLocationField(asset.location || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productVariantId || !assetTag) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setFormSaving(true);
      setFormError(null);

      const payload = {
        product_variant_id: productVariantId,
        asset_tag: assetTag,
        serial_number: serialNumber || null,
        qr_code: qrCode || null,
        acquisition_date: acquisitionDate || null,
        acquisition_cost: acquisitionCost ? Number(acquisitionCost) : null,
        condition_status: conditionStatus,
        lifecycle_status: lifecycleStatus,
        location: locationField || null
      };

      if (formType === 'create') {
        await apiClient.post('/assets', payload);
      } else {
        await apiClient.put(`/assets/${currentAssetId}`, payload);
      }

      setIsFormOpen(false);
      fetchAssetsAndRelations();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save physical asset');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Operations
  const triggerDelete = (asset: Asset) => {
    if (asset.lifecycle_status === 'RENTED') {
      alert("This asset is currently rented and cannot be deleted or retired from active operations.");
      return;
    }
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/assets/${assetToDelete.id}`);
      setDeleteConfirmOpen(false);
      setAssetToDelete(null);
      fetchAssetsAndRelations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset. Ensure it is not referenced in active rental transactions.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Physical Assets & Inventory</h1>
          <p className="text-gray-500 mt-1">Track serial numbers, conditions, availability, and active rental allocations.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors animate-in fade-in"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Asset Item
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-950">Inventory Ledger</h3>
          <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full uppercase">Real Data only</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Loading asset items...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 font-medium mb-4">Error: {error}</p>
            <button 
              onClick={fetchAssetsAndRelations}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-4">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="text-base font-medium">No assets registered in inventory.</p>
            <p className="text-sm">Click "Add Asset Item" above to add physical pieces to your variants.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Variant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifecycle Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((a) => {
                  const rel = variantsMap[a.product_variant_id] || { productName: 'Unknown Product', variantName: 'Unknown Variant' };
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{a.asset_tag}</div>
                        <div className="text-xs font-mono text-gray-500">S/N: {a.serial_number || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{rel.productName}</div>
                        <div className="text-xs text-indigo-600 font-medium">{rel.variantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded uppercase border ${
                          a.condition_status === 'NEW' || a.condition_status === 'GOOD' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : a.condition_status === 'FAIR' 
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {a.condition_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded uppercase border ${
                          a.lifecycle_status === 'AVAILABLE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : a.lifecycle_status === 'RENTED' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : a.lifecycle_status === 'UNDER_MAINTENANCE' 
                                ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                : 'bg-gray-50 text-gray-750 border-gray-250'
                        }`}>
                          {a.lifecycle_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {a.location || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(a)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDelete(a)}
                          className="text-red-600 hover:text-red-900"
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

      {/* CREATE/EDIT MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {formType === 'create' ? 'Register New Inventory Asset' : 'Edit Asset details'}
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Variant *</label>
                <select 
                  value={productVariantId} 
                  onChange={(e) => setProductVariantId(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  required
                  disabled={formType === 'edit'}
                >
                  {flatVariants.length === 0 ? (
                    <option value="" disabled>No variants available. Create a variant first.</option>
                  ) : (
                    flatVariants.map(fv => (
                      <option key={fv.id} value={fv.id}>{fv.displayName}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Asset Tag Code *</label>
                  <input 
                    type="text" 
                    value={assetTag} 
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="e.g. CAM-RIG-001" 
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Serial Number</label>
                  <input 
                    type="text" 
                    value={serialNumber} 
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-871629831" 
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">QR Code Tag</label>
                  <input 
                    type="text" 
                    value={qrCode} 
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="e.g. QR-CAM-RIG-01" 
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Storage Location</label>
                  <input 
                    type="text" 
                    value={locationField} 
                    onChange={(e) => setLocationField(e.target.value)}
                    placeholder="e.g. Warehouse 1, Shelf B2" 
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Acquisition Date</label>
                  <input 
                    type="date" 
                    value={acquisitionDate} 
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Acquisition Cost ($)</label>
                  <input 
                    type="number" 
                    value={acquisitionCost} 
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Condition Status</label>
                  <select 
                    value={conditionStatus} 
                    onChange={(e) => setConditionStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Lifecycle Status</label>
                  <select 
                    value={lifecycleStatus} 
                    onChange={(e) => setLifecycleStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="ALLOCATED">Allocated</option>
                    <option value="RENTED">Rented</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="LOST">Lost</option>
                    <option value="RETIRED">Retired</option>
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
      {deleteConfirmOpen && assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in fade-in zoom-in duration-100 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <h3 className="text-lg font-bold">Retire / Delete Asset?</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to permanently delete the physical asset <strong className="text-gray-900">"{assetToDelete.asset_tag}"</strong>? This will remove it from active inventory tracking.
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
