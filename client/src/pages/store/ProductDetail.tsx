import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { VariantConfigureModal } from '../../components/store/VariantConfigureModal';
import { ProductImage, ProductCardImage } from '../../components/store/ProductImage';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { MOCK_PRODUCTS, MOCK_VARIANTS, Product as MockProduct } from '../../components/store/MockProductData';

interface Product {
  id: string;
  name: string;
  type: string;
  sku?: string;
  description?: string | null;
  image_url?: string;
  in_stock?: boolean;
  price?: number;
  rating?: number;
}

interface Variant {
  id: string;
  name: string;
  sku: string;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // View states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'success'>('idle');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  // Selection States
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const autoConfigure = searchParams.get('configure') === 'true';

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

        const isAvailable = pData.available !== undefined ? pData.available : true;
        setProduct({ 
          id: pData.id,
          name: pData.name,
          type: pData.category_id ? pData.category_id : 'Equipment',
          sku: pData.sku,
          description: pData.description,
          image_url: pData.image_url,
          in_stock: isAvailable,
          price: pData.price || 150,
          rating: pData.rating || 4.7
        });

        try {
          const vData = await apiClient.get(`/storefront/products/${id}/variants`);
          setVariants(vData as any);
        } catch {
          // If variants fail, load mock variants
          setVariants(MOCK_VARIANTS[id || ''] || []);
        }

        // Check wishlist from API or local storage
        let wIds: string[] = [];
        try {
          const wData = await apiClient.get('/storefront/wishlist');
          if (Array.isArray(wData)) {
            wIds = wData;
          } else if (wData && Array.isArray((wData as any).data)) {
            wIds = (wData as any).data;
          }
        } catch {
          wIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        }
        setIsWishlisted(Boolean(id && wIds.includes(id)));

      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Handle auto-configuration trigger
  useEffect(() => {
    if (!loading && autoConfigure && variants.length > 0 && !selectedVariantId && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [loading, autoConfigure, variants, selectedVariantId]);

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

  const toggleWishlist = async () => {
    if (isWishlistLoading) return;
    setIsWishlistLoading(true);
    const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const nextWishlist = new Set(localWishlist);

    try {
      if (isWishlisted) {
        await apiClient.delete(`/storefront/wishlist/${id}`);
        setIsWishlisted(false);
        if (id) nextWishlist.delete(id);
      } else {
        await apiClient.post('/storefront/wishlist', { product_id: id });
        setIsWishlisted(true);
        if (id) nextWishlist.add(id);
      }
      localStorage.setItem('wishlist', JSON.stringify(Array.from(nextWishlist)));
    } catch (err) {
      console.warn('Backend API offline, persisting wishlist in local storage simulation', err);
      if (isWishlisted) {
        setIsWishlisted(false);
        if (id) nextWishlist.delete(id);
      } else {
        setIsWishlisted(true);
        if (id) nextWishlist.add(id);
      }
      localStorage.setItem('wishlist', JSON.stringify(Array.from(nextWishlist)));
    } finally {
      setIsWishlistLoading(false);
      window.dispatchEvent(new Event('wishlist_updated'));
    }
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
        unitPrice: product?.price || 150,
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
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <svg className="animate-spin h-10 w-10 mb-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="bg-white border border-red-900/50 p-8 rounded-2xl max-w-md text-center shadow-xl">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-8">{error || 'The requested equipment could not be found in our catalog.'}</p>
          <Link to="/store" className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900 pb-12">
      {/* Breadcrumb */}
      <nav className="text-sm font-medium flex items-center space-x-3 mb-8">
        <Link to="/store" className="text-gray-500 hover:text-gray-900 transition-colors">All Products</Link>
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Large Product Image (Left) */}
        <div className="lg:w-[55%] p-10 bg-gray-50 flex flex-col items-center justify-center min-h-[500px] relative border-b lg:border-b-0 lg:border-r border-gray-200">
          {!product.in_stock && (
            <div className="absolute top-6 left-6 z-10 bg-red-900/80 text-red-100 text-sm font-bold px-4 py-1.5 rounded backdrop-blur-md border border-red-800/50">
              RENTED / OUT OF STOCK
            </div>
          )}
          <div className="w-80 h-80 flex items-center justify-center">
            <ProductCardImage imageUrl={product.image_url} sku={product.sku || ''} alt={product.name} />
          </div>
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlistLoading ? (
                <svg className="animate-spin w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isWishlisted ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-500 hover:text-red-500" />
              )}
            </button>
          </div>
          <div className="absolute bottom-6 flex gap-3">
             <div className="w-16 h-16 rounded-lg bg-white border-2 border-brand-500 cursor-pointer overflow-hidden flex items-center justify-center">
               <ProductImage sku={product.sku || ''} className="w-10 h-10 object-contain" />
             </div>
          </div>
        </div>

        {/* Product Details & Selection (Right) */}
        <div className="lg:w-[45%] p-10 flex flex-col">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{product.name}</h1>
          <p className="text-base text-gray-500 mb-8 flex items-center">
            <span className="font-mono text-sm uppercase">{product.sku || 'SKU-BASE-001'}</span>
          </p>
          
          <div className="mb-10 bg-gray-100 p-6 rounded-xl border border-gray-300">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1 font-semibold">Rental Rate</p>
            <p className="text-5xl font-bold text-brand-600">
              ${product.price}<span className="text-xl font-medium text-gray-500"> / day</span>
            </p>
          </div>

          <div className="space-y-8 flex-1">
            {/* Rental Period */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Rental Period</h3>
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
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg shadow-inner py-2.5 px-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
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
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg shadow-inner py-2.5 px-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
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
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Quantity</h3>
              <div className="flex items-center border border-gray-300 w-36 rounded-lg overflow-hidden bg-gray-50">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  readOnly
                  className="flex-1 w-full text-center bg-white border-gray-300 p-0 focus:ring-0 text-base font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
            
            {variants.length > 0 && !selectedVariantId && (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 text-sm flex items-start">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">This product requires configuration. You will select your specific variant in the next step before adding to cart.</span>
              </div>
            )}

            {selectedVariantId && (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 text-sm flex justify-between items-center">
                <span>Selected Configuration: <strong className="text-gray-900">{variants.find(v => v.id === selectedVariantId)?.name}</strong></span>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-bold underline"
                >
                  Change Option
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <button 
              onClick={handleAddToCart}
              disabled={!product.in_stock || cartStatus !== 'idle'}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-base font-bold rounded-xl transition-colors shadow-lg shadow-brand-100 flex items-center justify-center"
            >
              {cartStatus === 'adding' ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Configuring and adding...
                </>
              ) : cartStatus === 'success' ? (
                'Added to Rental Cart! ✓'
              ) : (
                'Configure & Book Rental'
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Description & Technical Specs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Product Overview</h2>
        <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
          {product.description || 'No detailed specifications are currently listed for this equipment kit. Please contact the platform vendor support desk for specialized configuration queries.'}
        </p>
      </div>

      <VariantConfigureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.name}
        variants={variants}
        onConfirm={handleConfigureConfirm}
      />
    </div>
  );
};
