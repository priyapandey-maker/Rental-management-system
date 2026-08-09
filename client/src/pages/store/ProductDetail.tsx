import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ProductCardImage } from '../../components/store/ProductImage';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid';
import { MOCK_PRODUCTS, MOCK_VARIANTS, MOCK_CATEGORIES } from '../../components/store/MockProductData';

interface Product {
  id: string;
  name: string;
  category_id: string;
  sku: string;
  description: string | null;
  image_url?: string;
  available: boolean;
  price: number;
  rating: number;
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
  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'success'>('idle');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  // Gallery State
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const GALLERY_ANGLES = ['Front View', 'Side Angle', 'Detail Closeup', 'Carry Case'];

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
          category_id: pData.category_id || 'Equipment',
          sku: pData.sku,
          description: pData.description,
          image_url: pData.image_url,
          available: isAvailable,
          price: pData.price || 150,
          rating: pData.rating || 4.7
        });

        // Load variants
        let variantList: Variant[] = [];
        try {
          const vData = await apiClient.get(`/storefront/products/${id}/variants`);
          variantList = vData as unknown as Variant[];
        } catch {
          variantList = MOCK_VARIANTS[id || ''] || [];
        }
        setVariants(variantList);

        // Pre-select first variant if available
        if (variantList.length > 0) {
          setSelectedVariantId(variantList[0].id);
        }

        // Check wishlist
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

  // Duration & Cost Calculations
  const getDurationInDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    // Round up to nearest full day
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const durationDays = getDurationInDays();
  const dailyPrice = product?.price || 150;
  const estimatedTotal = durationDays * dailyPrice * quantity;

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
    if (!product?.available) return;
    if (!validateDates()) return;
    
    setCartStatus('adding');
    setTimeout(() => {
      const cartItem = {
        productId: id,
        productName: product?.name,
        variantId: selectedVariantId,
        variantName: selectedVariantId ? variants.find(v => v.id === selectedVariantId)?.name : null,
        quantity,
        startDate,
        endDate,
        unitPrice: dailyPrice,
        sku: selectedVariantId ? variants.find(v => v.id === selectedVariantId)?.sku : product?.sku
      };
      
      const existing = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      existing.push(cartItem);
      localStorage.setItem('demo_cart', JSON.stringify(existing));
      window.dispatchEvent(new Event('cart_updated'));
      
      setCartStatus('success');
      setTimeout(() => setCartStatus('idle'), 3000);
    }, 450);
  };

  const getCategoryName = (catId: string) => {
    const categories = MOCK_CATEGORIES;
    const cat = categories.find((c: any) => c.id === catId);
    return cat ? cat.name : 'Equipment';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <svg className="animate-spin h-10 w-10 mb-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading product configuration...</p>
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
      <nav className="text-sm font-medium flex items-center space-x-3 mb-6">
        <Link to="/store" className="text-gray-500 hover:text-gray-900 transition-colors">All Products</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Gallery Section (Left) */}
        <div className="lg:w-[50%] p-8 bg-gray-50 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-gray-200">
          
          {/* Availability Alert Badge */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            {!product.available && (
              <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md tracking-wider">
                RENTED / OUT OF STOCK
              </span>
            )}
            {product.available && (
              <span className="bg-green-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md tracking-wider">
                IN STOCK & ALLOCATABLE
              </span>
            )}
          </div>

          {/* Wishlist Toggle Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              className="p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-500 hover:text-red-500" />
              )}
            </button>
          </div>

          {/* Active Image Box */}
          <div className="flex-1 min-h-[350px] flex items-center justify-center py-8">
            <div className="w-72 h-72 flex items-center justify-center relative transition-all duration-300">
              <ProductCardImage imageUrl={product.image_url} sku={product.sku} alt={product.name} />
              
              {/* Overlay with active gallery angle name */}
              <div className="absolute bottom-0 bg-gray-950/70 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                {GALLERY_ANGLES[activeGalleryIndex]}
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails List */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Image Gallery Angles</h4>
            <div className="grid grid-cols-4 gap-3">
              {GALLERY_ANGLES.map((angle, idx) => {
                const isActive = idx === activeGalleryIndex;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`aspect-video rounded-lg border-2 bg-white p-1 overflow-hidden transition-all flex items-center justify-center hover:opacity-100 ${
                      isActive 
                        ? 'border-brand-600 opacity-100' 
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="h-full w-full object-scale-down filter saturate-50 hover:saturate-100 transition-all flex items-center justify-center">
                      <span className="text-[9px] font-bold text-gray-500 text-center line-clamp-1">{angle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuration Panel (Right) */}
        <div className="lg:w-[50%] p-8 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header Details */}
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] font-black bg-gray-150 text-brand-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {getCategoryName(product.category_id)}
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  {product.sku}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">{product.name}</h1>
              
              {/* Star quality indicator */}
              <div className="flex items-center text-amber-500 font-bold text-sm mt-2">
                <StarIcon className="w-4 h-4 mr-1 fill-amber-500" />
                <span>{product.rating.toFixed(1)} / 5.0</span>
                <span className="text-gray-300 mx-2">•</span>
                <span className="text-gray-500 text-xs font-normal">Quality Certified</span>
              </div>
            </div>

            {/* Daily Pricing Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Starting Daily Rate</span>
                <span className="text-3xl font-extrabold text-brand-600">
                  ${product.price}<span className="text-sm font-medium text-gray-400"> / day</span>
                </span>
              </div>
              <div className="text-right text-xs text-gray-500">
                <span className="block font-bold">Standard 24-hr cycle</span>
                <span>Includes basic maintenance</span>
              </div>
            </div>

            {/* Variant Selector */}
            {variants.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Configuration Option</h3>
                <div className="grid grid-cols-1 gap-2">
                  {variants.map(v => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                          isSelected 
                            ? 'bg-brand-50/50 border-brand-500 ring-2 ring-brand-500/5' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <span className="block text-sm font-bold text-gray-900">{v.name}</span>
                          <span className="block text-[9px] font-mono text-gray-400 mt-0.5 uppercase">{v.sku}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <span className="text-[8px] font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-xs">
                Standard single-variant kit. No custom parameters required.
              </div>
            )}

            {/* Rental Period Picker */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Rental Duration Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (validationError) validateDates();
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (validationError) validateDates();
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs shadow-inner"
                  />
                </div>
              </div>
              {validationError && (
                <p className="text-xs text-red-500 font-bold flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  {validationError}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Quantity</h3>
              <div className="flex items-center border border-gray-300 w-32 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gray-150 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  readOnly
                  className="flex-1 w-full text-center bg-white border-0 p-0 text-sm font-black text-gray-900"
                />
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-150 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

          </div>

          {/* Configuration Summary & Action Area */}
          <div className="pt-6 border-t border-gray-200 mt-6 space-y-4">
            
            {/* Real-time Summary Box */}
            <div className="bg-brand-50/20 border border-brand-100/50 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-wider">Configuration Summary</h4>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <span className="text-gray-400">Variant Option:</span>
                <span className="text-gray-900 font-bold text-right truncate">
                  {selectedVariantId ? variants.find(v => v.id === selectedVariantId)?.name : 'Standard'}
                </span>

                <span className="text-gray-400">Rental Duration:</span>
                <span className="text-gray-900 font-bold text-right">
                  {durationDays > 0 ? `${durationDays} ${durationDays === 1 ? 'day' : 'days'}` : 'Dates not specified'}
                </span>

                <span className="text-gray-400">Daily Rental:</span>
                <span className="text-gray-900 font-bold text-right">${dailyPrice}/day</span>

                <span className="text-gray-400">Quantity Selection:</span>
                <span className="text-gray-900 font-bold text-right">{quantity} {quantity === 1 ? 'unit' : 'units'}</span>

                <div className="col-span-2 border-t border-dashed border-gray-200 pt-2.5 mt-1 flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 text-sm">Estimated Total:</span>
                  <span className="font-black text-brand-600 text-lg">
                    {durationDays > 0 ? `$${estimatedTotal.toLocaleString()}` : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={!product.available || cartStatus !== 'idle'}
                className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                {cartStatus === 'adding' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Validating configuration...
                  </>
                ) : cartStatus === 'success' ? (
                  'Kit Configured & Booked! ✓'
                ) : (
                  'Configure & Book Rental'
                )}
              </button>
              
              <button
                type="button"
                onClick={toggleWishlist}
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isWishlisted ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            
            {!product.available && (
              <p className="text-[10px] text-red-600 font-bold text-center">
                This item is currently unavailable and cannot be configured.
              </p>
            )}
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
    </div>
  );
};
