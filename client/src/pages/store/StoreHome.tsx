import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ProductImage, ProductCardImage } from '../../components/store/ProductImage';

interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  rental_type: 'rentable' | 'consumable' | 'service';
  status: 'active' | 'archived' | 'draft';
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
}

const MOCK_CATEGORIES = [
  { id: 'cat-cameras-111', name: 'Cameras', code: 'CAM' },
  { id: 'cat-audio-222', name: 'Audio', code: 'AUD' },
  { id: 'cat-lighting-333', name: 'Lighting', code: 'LGT' },
  { id: 'cat-lenses-444', name: 'Lenses', code: 'LNS' },
  { id: 'cat-tripods-555', name: 'Tripods & Supports', code: 'TRP' },
  { id: 'cat-video-666', name: 'Video Equipment', code: 'VID' },
  { id: 'cat-drones-777', name: 'Drones', code: 'DRN' },
  { id: 'cat-projectors-888', name: 'Projectors', code: 'PRJ' }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-camera-111',
    category_id: 'cat-cameras-111',
    name: 'Professional Camera Kit',
    sku: 'PROD-CAM-01',
    description: 'High-end cinema camera package with prime lenses and stabiliser.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-audio-222',
    category_id: 'cat-audio-222',
    name: 'Wireless Lavalier Microphone',
    sku: 'PROD-AUD-01',
    description: 'Dual-channel wireless mic kit with noise-canceling technology.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-lighting-333',
    category_id: 'cat-lighting-333',
    name: 'LED Studio Panel Light',
    sku: 'PROD-LGT-01',
    description: 'Bi-color dimmable LED light panel for studio and field production.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-lenses-444',
    category_id: 'cat-lenses-444',
    name: 'Cinema Prime Lens Kit',
    sku: 'PROD-LNS-01',
    description: 'F1.4 prime lens set (24mm, 35mm, 50mm, 85mm) with focus gears.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-tripods-555',
    category_id: 'cat-tripods-555',
    name: 'Carbon Fiber Tripod System',
    sku: 'PROD-TRP-01',
    description: 'Ultra-lightweight carbon fiber legs with professional fluid head.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-video-666',
    category_id: 'cat-video-666',
    name: 'HDMI Wireless Transmitter',
    sku: 'PROD-VID-01',
    description: 'HDMI/SDI wireless video transmitter with 500ft range and low latency.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-drones-777',
    category_id: 'cat-drones-777',
    name: 'GPS 4K Camera Drone',
    sku: 'PROD-DRN-01',
    description: 'Foldable quadcopter drone with 3-axis gimbal camera and safety sensors.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-projectors-888',
    category_id: 'cat-projectors-888',
    name: '4K Ultra Short Throw Projector',
    sku: 'PROD-PRJ-01',
    description: 'High-brightness laser projector for indoor cinema screens.',
    rental_type: 'rentable',
    status: 'active'
  }
];

export const StoreHome = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/storefront/products'),
        apiClient.get('/storefront/categories')
      ]);

      const productsData = productsRes as unknown as Product[];
      const categoriesData = categoriesRes as unknown as Category[];

      const activeProducts = productsData.filter(
        p => p.status === 'active' || (p as any).status === 'ACTIVE'
      );
      setProducts(activeProducts.length > 0 ? activeProducts : MOCK_PRODUCTS);
      setCategories(categoriesData.length > 0 ? categoriesData : MOCK_CATEGORIES);
    } catch (err: any) {
      console.warn("Backend API offline. Falling back to storefront simulation data.");
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
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
  };

  // Filter and sort computation
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
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
          <div>
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button 
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                  selectedCategoryId === 'all' 
                    ? 'bg-brand-600 text-white font-bold' 
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                All Equipment
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                    selectedCategoryId === category.id 
                      ? 'bg-brand-600 text-white font-bold' 
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">Sort By</h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="recommended">Recommended</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
            </select>
          </div>

          {(searchQuery || selectedCategoryId !== 'all' || sortBy !== 'recommended') && (
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
              {[1, 2, 3, 4, 5, 6].map(i => (
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
                Try refining your search terms or selecting a different category.
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 text-sm font-bold rounded-lg transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Catalog Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <div 
                  key={product.id}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:border-gray-300 transition-all flex flex-col"
                >
                  {/* Stable Aspect-Ratio Image Container */}
                  <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-200/50 overflow-hidden relative">
                    <ProductCardImage imageUrl={product.image_url} sku={product.sku} alt={product.name} />
                  </div>

                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-gray-100 text-brand-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {getCategoryName(product.category_id)}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {product.sku}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-brand-400 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-850 flex items-end justify-between mt-auto">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Standard Rate
                        </span>
                        <span className="text-lg font-extrabold text-brand-400">
                          $150.00<span className="text-xs font-normal text-gray-500"> / day</span>
                        </span>
                      </div>
                      <Link 
                        to={`/store/product/${product.id}`}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow"
                      >
                        View Details
                        <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
