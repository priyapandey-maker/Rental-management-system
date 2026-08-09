import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ProductCardImage } from '../../components/store/ProductImage';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, Product, Category } from '../../components/store/MockProductData';

export const StoreHome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes, wishlistRes] = await Promise.all([
        apiClient.get('/storefront/products'),
        apiClient.get('/storefront/categories'),
        apiClient.get('/storefront/wishlist').catch(() => [])
      ]);

      const productsData = (Array.isArray(productsRes) ? productsRes : (productsRes as any)?.data || []) as Product[];
      const categoriesData = (Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any)?.data || []) as Category[];

      const activeProducts = productsData.filter(
        p => p.status === 'active' || (p as any).status === 'ACTIVE'
      );

      // Map backend products if they exist, otherwise fall back to large mock list
      if (activeProducts.length > 0) {
        setProducts(activeProducts.map(p => ({
          ...p,
          price: p.price || 150,
          available: p.available !== undefined ? p.available : true,
          rating: p.rating || 4.7
        })));
      } else {
        setProducts(MOCK_PRODUCTS);
      }

      setCategories(categoriesData.length > 0 ? categoriesData : MOCK_CATEGORIES);
      
      let wishlistData: string[] = [];
      if (Array.isArray(wishlistRes)) {
        wishlistData = wishlistRes;
      } else if (wishlistRes && Array.isArray((wishlistRes as any).data)) {
        wishlistData = (wishlistRes as any).data;
      }
      
      // Merge backend wishlist with offline localStorage wishlist
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const combinedWishlist = new Set([...wishlistData, ...localWishlist]);
      setWishlistIds(combinedWishlist);
    } catch (err: any) {
      console.warn("Backend API offline. Falling back to storefront simulation data.");
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
      
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistIds(new Set(localWishlist));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSortBy('recommended');
    setMaxPrice(500);
    setAvailabilityFilter('all');
  };

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (wishlistLoadingIds.has(productId)) return;

    setWishlistLoadingIds(prev => new Set(prev).add(productId));
    const nextWishlistIds = new Set(wishlistIds);
    const exists = nextWishlistIds.has(productId);

    try {
      if (exists) {
        await apiClient.delete(`/storefront/wishlist/${productId}`);
        nextWishlistIds.delete(productId);
      } else {
        await apiClient.post('/storefront/wishlist', { product_id: productId });
        nextWishlistIds.add(productId);
      }
      setWishlistIds(nextWishlistIds);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(nextWishlistIds)));
    } catch (err) {
      console.warn('Backend API offline, persisting wishlist state in local storage simulation', err);
      if (exists) {
        nextWishlistIds.delete(productId);
      } else {
        nextWishlistIds.add(productId);
      }
      setWishlistIds(nextWishlistIds);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(nextWishlistIds)));
    } finally {
      setWishlistLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      // Fire event to update counts in headers/navigation
      window.dispatchEvent(new Event('wishlist_updated'));
    }
  };

  // Filter and sort computation
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const productPrice = product.price !== undefined ? product.price : 150;
    const isAvailable = product.available !== undefined ? product.available : true;

    const matchesPrice = productPrice <= maxPrice;
    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && isAvailable) ||
      (availabilityFilter === 'out-of-stock' && !isAvailable);

    return matchesCategory && matchesSearch && matchesPrice && matchesAvailability;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    const priceA = a.price !== undefined ? a.price : 150;
    const priceB = b.price !== undefined ? b.price : 150;
    if (sortBy === 'price-asc') {
      return priceA - priceB;
    }
    if (sortBy === 'price-desc') {
      return priceB - priceA;
    }
    return 0;
  });

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Equipment';
  };

  return (
    <div className="space-y-10 text-gray-900 pb-16">
      
      {/* Compact Hero Banner */}
      <section className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Discover Experience
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Rent Premium Equipment Instantly
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            High-quality gear, tools, and accessories. Flexible terms, secure checkouts, and dynamic operations tracking.
          </p>
        </div>
        
        {/* Search Input Widget */}
        <div className="w-full md:w-80 relative flex-shrink-0">
          <input 
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm placeholder-gray-500 shadow-inner"
          />
          <span className="absolute right-3.5 top-3.5 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Filters Panel */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-1">
              <button 
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-2 rounded-lg text-left text-sm font-medium transition-all w-full ${
                  selectedCategoryId === 'all' 
                    ? 'bg-brand-600 text-white font-bold' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                All Equipment
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-3 py-2 rounded-lg text-left text-sm font-medium transition-all w-full ${
                    selectedCategoryId === category.id 
                      ? 'bg-brand-600 text-white font-bold' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Availability</h3>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'All Inventory' },
                { id: 'available', label: 'Available Now' },
                { id: 'out-of-stock', label: 'Rented / Maintenance' }
              ].map(opt => (
                <label key={opt.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availabilityFilter === opt.id}
                    onChange={() => setAvailabilityFilter(opt.id)}
                    className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Max Price</h3>
              <span className="text-xs font-bold text-brand-600">${maxPrice}/day</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>$10</span>
              <span>$500</span>
            </div>
          </div>

          {/* Sort By */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Sort By</h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="recommended">Recommended</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
              <option value="price-asc">Price (Low - High)</option>
              <option value="price-desc">Price (High - Low)</option>
            </select>
          </div>

          {(searchQuery || selectedCategoryId !== 'all' || sortBy !== 'recommended' || maxPrice !== 500 || availabilityFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-300"
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Right Product Grid Area */}
        <div className="flex-1 w-full">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="aspect-video bg-gray-100 rounded-xl"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-100 rounded w-full pt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error Display State */
            <div className="bg-white border border-red-900/50 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl">
              <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load products</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button 
                onClick={fetchData}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            /* Empty Search/Filter State */
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xl">
              <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No matching products found</h3>
              <p className="text-sm text-gray-500 mb-6">
                Try refining your search terms or adjusting the filters.
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 text-sm font-bold rounded-lg transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured & Popular Gear Section */}
              {selectedCategoryId === 'all' && !searchQuery && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse"></span>
                      Featured & Popular Gear
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">Top Rated by AssetFlow Customers</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.filter(p => p.rating && p.rating >= 4.8).slice(0, 2).map(product => {
                      const productPrice = product.price !== undefined ? product.price : 150;
                      const isAvailable = product.available !== undefined ? product.available : true;
                      return (
                        <div 
                          key={`featured-${product.id}`}
                          className="relative bg-gradient-to-r from-brand-50/20 to-white border border-brand-100 rounded-2xl p-5 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 bg-brand-600 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow">
                            Featured
                          </div>
                          <div className="w-full md:w-32 h-32 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                            <ProductCardImage imageUrl={product.image_url} sku={product.sku} alt={product.name} />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-brand-600 uppercase tracking-wider">
                                {getCategoryName(product.category_id)}
                              </span>
                              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center text-amber-500 font-bold">
                                  <StarIcon className="w-3.5 h-3.5 mr-0.5 fill-amber-500" />
                                  <span>{product.rating?.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {isAvailable ? 'In Stock' : 'Rented'}
                                </span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-4">
                              <div>
                                <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">Day Rate</span>
                                <span className="text-sm font-extrabold text-brand-600">${productPrice}/day</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/store/product/${product.id}`}
                                  className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg transition-colors"
                                >
                                  Details
                                </Link>
                                <button
                                  onClick={() => navigate(`/store/product/${product.id}?configure=true`)}
                                  disabled={!isAvailable}
                                  className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                                >
                                  Rent
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Main Catalog Grid */}
              <section className="space-y-4">
                {selectedCategoryId === 'all' && !searchQuery && (
                  <h2 className="text-lg font-bold text-gray-900 border-b border-gray-250 pb-2">
                    All Rental Catalog
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map(product => {
                    const productPrice = product.price !== undefined ? product.price : 150;
                    const isAvailable = product.available !== undefined ? product.available : true;
                    const ratingValue = product.rating !== undefined ? product.rating : 4.7;

                    return (
                      <div 
                        key={product.id}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col h-full"
                      >
                        {/* Image Container */}
                        <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
                          <ProductCardImage imageUrl={product.image_url} sku={product.sku} alt={product.name} />
                          <button
                            onClick={(e) => toggleWishlist(e, product.id)}
                            disabled={wishlistLoadingIds.has(product.id)}
                            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-10 disabled:opacity-50"
                            title={wishlistIds.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            {wishlistLoadingIds.has(product.id) ? (
                              <svg className="animate-spin w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : wishlistIds.has(product.id) ? (
                              <HeartIconSolid className="w-4 h-4 text-red-500" />
                            ) : (
                              <HeartIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                            )}
                          </button>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold bg-gray-100 text-brand-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {getCategoryName(product.category_id)}
                              </span>
                              <span className="text-[9px] font-mono text-gray-400">
                                {product.sku}
                              </span>
                            </div>
                            
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                              {product.name}
                            </h3>
                            
                            {product.description && (
                              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-2 pt-1">
                              {/* Quality Rating */}
                              <div className="flex items-center text-amber-500 text-xs font-semibold">
                                <StarIcon className="w-3.5 h-3.5 mr-0.5 fill-amber-500" />
                                <span>{ratingValue.toFixed(1)}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              {/* Availability status badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                isAvailable 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {isAvailable ? 'In Stock' : 'Rented'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-4 gap-2">
                            <div>
                              <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                                Day Rate
                              </span>
                              <span className="text-sm font-extrabold text-brand-600">
                                ${productPrice}<span className="text-[9px] font-normal text-gray-400">/day</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Link 
                                to={`/store/product/${product.id}`}
                                className="inline-flex items-center px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg transition-colors"
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => navigate(`/store/product/${product.id}?configure=true`)}
                                disabled={!isAvailable}
                                className="inline-flex items-center px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                              >
                                Rent
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
