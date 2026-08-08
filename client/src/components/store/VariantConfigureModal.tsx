import React, { useState } from 'react';
import { ProductImage } from '../../pages/store/StoreHome';

interface Variant {
  id: string;
  name: string;
  sku: string;
  // Simulating stock availability for demo purposes since backend lacks it natively
  in_stock?: boolean; 
}

interface VariantConfigureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variantId: string) => void;
  variants: Variant[];
  productName: string;
}

export const VariantConfigureModal: React.FC<VariantConfigureModalProps> = ({ isOpen, onClose, onConfirm, variants, productName }) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!isOpen) return null;

  // Augment variants with fake in_stock data if not provided (for demo UX)
  const displayVariants = variants.map((v, idx) => ({
    ...v,
    in_stock: v.in_stock !== undefined ? v.in_stock : true // Always true for smooth offline demo walkthrough
  }));

  const selectedData = displayVariants.find(v => v.id === selectedVariant);
  const isValidSelection = selectedData && selectedData.in_stock;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-bold text-white tracking-tight">Configure Options</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors focus:outline-none bg-gray-800 hover:bg-gray-700 p-1.5 rounded-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-sm font-medium text-gray-400 mb-6">
            Select an available configuration for <span className="text-white font-semibold">{productName}</span>
          </p>
          
          <div className="space-y-4">
            {displayVariants.map(variant => {
              const isSelected = selectedVariant === variant.id;
              const isAvailable = variant.in_stock;

              return (
                <label 
                  key={variant.id} 
                  className={`flex items-start p-4 border rounded-xl transition-all duration-200 ${
                    !isAvailable 
                      ? 'border-gray-800 bg-gray-900/50 opacity-60 cursor-not-allowed' 
                      : isSelected 
                        ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer' 
                        : 'border-gray-800 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center h-5 mt-1">
                    <input 
                      type="radio" 
                      name="variant" 
                      value={variant.id}
                      checked={isSelected}
                      disabled={!isAvailable}
                      onChange={() => setSelectedVariant(variant.id)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 bg-gray-900 border-gray-700 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex items-center">
                    {/* Visual Representation */}
                    <div className="w-16 h-16 bg-gray-950 border border-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center mr-4 overflow-hidden">
                       <ProductImage sku={variant.sku} className="w-10 h-10 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`block text-base font-bold ${!isAvailable ? 'text-gray-500' : 'text-gray-100'}`}>
                          {variant.name}
                        </span>
                        {!isAvailable && (
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <span className="block text-sm text-gray-500 mt-1 font-mono">SKU: {variant.sku}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-800 bg-gray-900/80 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => isValidSelection && onConfirm(selectedVariant)}
            disabled={!isValidSelection}
            className={`px-6 py-2.5 rounded-lg shadow text-sm font-bold transition-all ${
              isValidSelection 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            Configure & Add
          </button>
        </div>
      </div>
    </div>
  );
};
