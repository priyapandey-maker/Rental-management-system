import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { VariantConfigureModal } from '../../components/store/VariantConfigureModal';
import { ProductImage, ProductCardImage } from '../../components/store/ProductImage';

interface Product {
  id: string;
  name: string;
  type: string;
  sku?: string;
  description?: string | null;
  image_url?: string;
  in_stock?: boolean; 
}

interface Variant {
  id: string;
  name: string;
  sku: string;
}

const MOCK_PRODUCTS = [
  {
    id: 'prod-camera-111',
    name: 'Professional Camera Kit',
    type: 'Cameras',
    sku: 'PROD-CAM-01',
    description: 'High-end cinema camera package with prime lenses and stabiliser.'
  },
  {
    id: 'prod-audio-222',
    name: 'Wireless Lavalier Microphone',
    type: 'Audio',
    sku: 'PROD-AUD-01',
    description: 'Dual-channel wireless mic kit with noise-canceling technology.'
  },
  {
    id: 'prod-lighting-333',
    name: 'LED Studio Panel Light',
    type: 'Lighting',
    sku: 'PROD-LGT-01',
    description: 'Bi-color dimmable LED light panel for studio and field production.'
  },
  {
    id: 'prod-lenses-444',
    name: 'Cinema Prime Lens Kit',
    type: 'Lenses',
    sku: 'PROD-LNS-01',
    description: 'F1.4 prime lens set (24mm, 35mm, 50mm, 85mm) with focus gears.'
  },
  {
    id: 'prod-tripods-555',
    name: 'Carbon Fiber Tripod System',
    type: 'Tripods & Supports',
    sku: 'PROD-TRP-01',
    description: 'Ultra-lightweight carbon fiber legs with professional fluid head.'
  },
  {
    id: 'prod-video-666',
    name: 'HDMI Wireless Transmitter',
    type: 'Video Equipment',
    sku: 'PROD-VID-01',
    description: 'HDMI/SDI wireless video transmitter with 500ft range and low latency.'
  },
  {
    id: 'prod-drones-777',
    name: 'GPS 4K Camera Drone',
    type: 'Drones',
    sku: 'PROD-DRN-01',
    description: 'Foldable quadcopter drone with 3-axis gimbal camera and safety sensors.'
  },
  {
    id: 'prod-projectors-888',
    name: '4K Ultra Short Throw Projector',
    type: 'Projectors',
    sku: 'PROD-PRJ-01',
    description: 'High-brightness laser projector for indoor cinema screens.'
  }
];

const MOCK_VARIANTS: Record<string, any[]> = {
  'prod-camera-111': [
    { id: 'var-camera-std-111', name: 'Camera Kit — Standard', sku: 'VAR-CAM-STD' }
  ],
  'prod-audio-222': [
    { id: 'var-audio-std-222', name: 'Lavalier Mic — Dual Channel', sku: 'VAR-AUD-STD' }
  ],
  'prod-lighting-333': [
    { id: 'var-lighting-std-333', name: 'LED Studio Panel — 100W', sku: 'VAR-LGT-STD' }
  ],
  'prod-lenses-444': [
    { id: 'var-lenses-std-444', name: 'Prime Lens Set — Full Frame', sku: 'VAR-LNS-STD' }
  ],
  'prod-tripods-555': [
    { id: 'var-tripods-std-555', name: 'Carbon Tripod — 75mm Bowl', sku: 'VAR-TRP-STD' }
  ],
  'prod-video-666': [
    { id: 'var-video-std-666', name: 'Wireless Video Link — SDI/HDMI', sku: 'VAR-VID-STD' }
  ],
  'prod-drones-777': [
    { id: 'var-drones-std-777', name: '4K Video Drone — Pro Bundle', sku: 'VAR-DRN-STD' }
  ],
  'prod-projectors-888': [
    { id: 'var-projectors-std-888', name: '4K Laser Projector — 3000 Lumens', sku: 'VAR-PRJ-STD' }
  ]
};

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // View states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'success'>('idle');
  
  // Selection States
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let pData: any = null;
        try {
           pData = await apiClient.get(`/storefront/products/${id}`);
        } catch {
           try {
              const pList = await apiClient.get('/storefront/products');
              pData = (pList as unknown as any[]).find(p => p.id === id);
           } catch {
              pData = MOCK_PRODUCTS.find(p => p.id === id);
           }
           if (!pData) throw new Error('Product not found in catalog');
        }

        // Hardcode some demo availability to show out of stock states
        const isOutOfStock = false;
        setProduct({ ...pData, in_stock: !isOutOfStock });

        try {
          const vData = await apiClient.get(`/storefront/products/${id}/variants`);
          setVariants(vData as any);
        } catch {
          // If variants fail, load mock variants
          setVariants(MOCK_VARIANTS[id || ''] || []);
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const validateDates = () => {
    if (!startDate || !endDate) {
      setValidationError("Please select both start and end dates.");
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setValidationError("Please enter valid dates.");
      return false;
    }
    
    if (start >= end) {
      setValidationError("Rental end date must be after the start date.");
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!product?.in_stock) return;
    
    if (!validateDates()) {
      return;
    }
    
    if (variants.length > 0 && !selectedVariantId) {
      setIsModalOpen(true);
    } else {
      addToCartDirectly(selectedVariantId);
    }
  };

  const addToCartDirectly = (variantId: string | null) => {
    setCartStatus('adding');

    setTimeout(() => {
      const cartItem = {
        productId: id,
        productName: product?.name,
        variantId,
        variantName: variantId ? variants.find(v => v.id === variantId)?.name : null,
        quantity,
        startDate,
        endDate,
        unitPrice: 150, // Standard rate
        sku: product?.sku
      };
      
      const existing = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      existing.push(cartItem);
      localStorage.setItem('demo_cart', JSON.stringify(existing));
      window.dispatchEvent(new Event('cart_updated'));
      
      setIsModalOpen(false);
      setCartStatus('success');
    }, 400);
  };

  const handleConfigureConfirm = (variantId: string) => {
    setSelectedVariantId(variantId);
    addToCartDirectly(variantId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="bg-gray-900 border border-red-900/50 p-8 rounded-2xl max-w-md text-center shadow-xl">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-8">{error || 'The requested equipment could not be found in our catalog.'}</p>
          <Link to="/store" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-100 pb-12">
      {/* Breadcrumb */}
      <nav className="text-sm font-medium flex items-center space-x-3 mb-8">
        <Link to="/store" className="text-gray-500 hover:text-white transition-colors">All Products</Link>
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-100">{product.name}</span>
      </nav>

      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Large Product Image (Left) */}
        <div className="lg:w-[55%] p-10 bg-gray-950 flex flex-col items-center justify-center min-h-[500px] relative border-b lg:border-b-0 lg:border-r border-gray-800">
          {!product.in_stock && (
            <div className="absolute top-6 left-6 z-10 bg-red-900/80 text-red-100 text-sm font-bold px-4 py-1.5 rounded backdrop-blur-md border border-red-800/50">
              OUT OF STOCK
            </div>
          )}
          <div className="w-80 h-80 flex items-center justify-center">
            <ProductCardImage imageUrl={product.image_url} sku={product.sku || ''} alt={product.name} />
          </div>
          <div className="absolute bottom-6 flex gap-3">
             <div className="w-16 h-16 rounded-lg bg-gray-900 border-2 border-blue-500 cursor-pointer overflow-hidden flex items-center justify-center">
               <ProductImage sku={product.sku || ''} className="w-10 h-10 object-contain" />
             </div>
          </div>
        </div>

        {/* Product Details & Selection (Right) */}
        <div className="lg:w-[45%] p-10 flex flex-col">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">{product.name}</h1>
          <p className="text-base text-gray-400 mb-8 flex items-center">
            {product.type} 
            <span className="mx-3 text-gray-700">•</span> 
            <span className="font-mono text-sm">{product.sku || 'SKU-BASE-001'}</span>
          </p>
          
          <div className="mb-10 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1 font-semibold">Rental Rate</p>
            <p className="text-5xl font-bold text-blue-400">
              $150.00<span className="text-xl font-medium text-gray-500"> / day</span>
            </p>
          </div>

          <div className="space-y-8 flex-1">
            {/* Rental Period */}
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Rental Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (validationError) validateDates();
                    }}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg shadow-inner py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (validationError) validateDates();
                    }}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg shadow-inner py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              {validationError && (
                <p className="mt-3 text-sm text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {validationError}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Quantity</h3>
              <div className="flex items-center border border-gray-700 w-36 rounded-lg overflow-hidden bg-gray-950">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors"
                >-</button>
                <input 
                  type="number" 
                  value={quantity}
                  readOnly
                  className="flex-1 text-center bg-transparent border-none p-0 focus:ring-0 text-base font-bold text-white"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors"
                >+</button>
              </div>
            </div>
            
            {variants.length > 0 && !selectedVariantId && (
              <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl text-blue-300 text-sm flex items-start">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">This product requires configuration. You will select your specific variant in the next step before adding to cart.</span>
              </div>
            )}

            {selectedVariantId && (
              <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl text-blue-300 text-sm flex justify-between items-center">
                <span>Selected Configuration: <strong className="text-white">{variants.find(v => v.id === selectedVariantId)?.name}</strong></span>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
                >
                  Change Option
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-800">
            <button 
              onClick={handleAddToCart}
              disabled={!product.in_stock || cartStatus !== 'idle'}
              className={`w-full font-bold py-4 rounded-xl shadow-lg flex justify-center items-center text-lg transition-all ${
                !product.in_stock
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : cartStatus === 'success'
                    ? 'bg-emerald-600 text-white shadow-emerald-950/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
              }`}
            >
              {cartStatus === 'adding' ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Adding...
                </>
              ) : cartStatus === 'success' ? (
                <>
                  <svg className="w-6 h-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart!
                </>
              ) : product.in_stock ? (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              ) : (
                'Currently Unavailable'
              )}
            </button>

            {cartStatus === 'success' && (
              <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-emerald-300 font-medium">✓ Equipment successfully reserved in your cart.</span>
                <div className="flex gap-3">
                  <Link to="/store" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors border border-gray-700">
                    Continue Shopping
                  </Link>
                  <Link to="/cart" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow">
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <VariantConfigureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfigureConfirm}
        variants={variants}
        productName={product.name}
      />
    </div>
  );
};
