import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

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

export const ProductImage: React.FC<{ sku?: string; className?: string }> = ({ sku, className = "w-full h-full" }) => {
  const normSku = (sku || '').toUpperCase();

  // 1. Cameras
  if (normSku.includes('CAM')) {
    return (
      <svg className={`${className} text-blue-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="38" width="46" height="32" rx="4" fill="#1e293b" />
        <rect x="30" y="30" width="16" height="8" rx="1.5" fill="#334155" />
        <circle cx="70" cy="54" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="70" cy="54" r="6" fill="#38bdf8" />
        <path d="M12 44h8v20h-8z" fill="#334155" />
        <path d="M30 30h20" strokeWidth="3" />
      </svg>
    );
  }

  // 2. Audio
  if (normSku.includes('AUD')) {
    return (
      <svg className={`${className} text-emerald-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="35" y="42" width="30" height="42" rx="4" fill="#1e293b" />
        <line x1="50" y1="42" x2="50" y2="18" strokeWidth="3" />
        <circle cx="50" cy="18" r="3" fill="#10b981" />
        <rect x="42" y="50" width="16" height="10" rx="1.5" fill="#0f172a" />
        <line x1="45" y1="55" x2="55" y2="55" stroke="#10b981" strokeWidth="2" />
        <path d="M65 72c10 0 15-8 15-18" />
        <circle cx="80" cy="54" r="3" fill="#0f172a" />
        <rect x="78" y="46" width="4" height="8" fill="#334155" />
      </svg>
    );
  }

  // 3. Lighting
  if (normSku.includes('LGT')) {
    return (
      <svg className={`${className} text-amber-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="25" y="25" width="50" height="40" rx="2" fill="#1e293b" />
        <rect x="30" y="30" width="40" height="30" fill="#fef08a" />
        <circle cx="36" cy="36" r="2" fill="#f59e0b" />
        <circle cx="45" cy="36" r="2" fill="#f59e0b" />
        <circle cx="54" cy="36" r="2" fill="#f59e0b" />
        <circle cx="63" cy="36" r="2" fill="#f59e0b" />
        <circle cx="36" cy="45" r="2" fill="#f59e0b" />
        <circle cx="45" cy="45" r="2" fill="#f59e0b" />
        <circle cx="54" cy="45" r="2" fill="#f59e0b" />
        <circle cx="63" cy="45" r="2" fill="#f59e0b" />
        <circle cx="36" cy="54" r="2" fill="#f59e0b" />
        <circle cx="45" cy="54" r="2" fill="#f59e0b" />
        <circle cx="54" cy="54" r="2" fill="#f59e0b" />
        <circle cx="63" cy="54" r="2" fill="#f59e0b" />
        <path d="M25 25l-12-8v56l12-8z" fill="#334155" />
        <path d="M75 25l12-8v56l-12-8z" fill="#334155" />
        <path d="M50 65v25" />
        <path d="M36 90h28" />
      </svg>
    );
  }

  // 4. Lenses
  if (normSku.includes('LNS')) {
    return (
      <svg className={`${className} text-rose-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 25h40v14H30z" fill="#334155" />
        <path d="M25 39h50v40H25z" fill="#1e293b" />
        <rect x="28" y="46" width="44" height="8" fill="#0f172a" />
        <rect x="28" y="60" width="44" height="8" fill="#0f172a" />
        <ellipse cx="50" cy="25" rx="20" ry="5" fill="#38bdf8" />
        <line x1="34" y1="72" x2="38" y2="72" />
        <line x1="34" y1="75" x2="40" y2="75" />
      </svg>
    );
  }

  // 5. Tripods
  if (normSku.includes('TRP')) {
    return (
      <svg className={`${className} text-teal-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="42" y="20" width="16" height="14" rx="2" fill="#334155" />
        <path d="M58 24h18" strokeWidth="3.5" />
        <circle cx="50" cy="34" r="5" fill="#1e293b" />
        <line x1="50" y1="39" x2="50" y2="52" strokeWidth="4" />
        <line x1="50" y1="52" x2="24" y2="92" strokeWidth="3" />
        <line x1="50" y1="52" x2="50" y2="94" strokeWidth="3" />
        <line x1="50" y1="52" x2="76" y2="92" strokeWidth="3" />
        <rect x="34" y="70" width="6" height="5" fill="#0f172a" />
        <rect x="47" y="72" width="6" height="5" fill="#0f172a" />
        <rect x="60" y="70" width="6" height="5" fill="#0f172a" />
      </svg>
    );
  }

  // 6. Video
  if (normSku.includes('VID')) {
    return (
      <svg className={`${className} text-purple-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="38" width="44" height="46" rx="4" fill="#1e293b" />
        <line x1="36" y1="38" x2="24" y2="16" strokeWidth="3" />
        <circle cx="24" cy="16" r="3" fill="#a855f7" />
        <line x1="64" y1="38" x2="76" y2="16" strokeWidth="3" />
        <circle cx="76" cy="16" r="3" fill="#a855f7" />
        <rect x="36" y="46" width="28" height="16" rx="1.5" fill="#0f172a" />
        <path d="M40 54h14" stroke="#a855f7" strokeWidth="2" />
        <circle cx="38" cy="72" r="3" fill="#334155" />
        <circle cx="50" cy="72" r="3" fill="#334155" />
        <circle cx="62" cy="72" r="3" fill="#334155" />
      </svg>
    );
  }

  // 7. Drones
  if (normSku.includes('DRN')) {
    return (
      <svg className={`${className} text-sky-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="45" rx="20" ry="10" fill="#1e293b" />
        <line x1="34" y1="42" x2="16" y2="28" strokeWidth="3.5" />
        <line x1="66" y1="42" x2="84" y2="28" strokeWidth="3.5" />
        <line x1="34" y1="48" x2="14" y2="62" strokeWidth="3.5" />
        <line x1="66" y1="48" x2="86" y2="62" strokeWidth="3.5" />
        <line x1="8" y1="28" x2="24" y2="28" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="76" y1="28" x2="92" y2="28" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="6" y1="62" x2="22" y2="62" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="78" y1="62" x2="94" y2="62" strokeWidth="2.5" stroke="#38bdf8" />
        <circle cx="50" cy="60" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    );
  }

  // 8. Projectors
  if (normSku.includes('PRJ')) {
    return (
      <svg className={`${className} text-indigo-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="38" width="64" height="36" rx="4" fill="#1e293b" />
        <circle cx="34" cy="56" r="10" fill="#0f172a" />
        <circle cx="34" cy="56" r="6" fill="#6366f1" />
        <circle cx="34" cy="56" r="3" fill="#e0e7ff" />
        <rect x="26" y="32" width="10" height="6" fill="#334155" />
        <line x1="56" y1="48" x2="74" y2="48" strokeWidth="2" />
        <line x1="56" y1="54" x2="74" y2="54" strokeWidth="2" />
        <line x1="56" y1="60" x2="74" y2="60" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className={`${className} text-gray-600`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="25" width="50" height="50" rx="4" fill="#1e293b" />
      <path d="M25 60l15-15 10 10 15-15 10 10" />
      <circle cx="38" cy="38" r="5" fill="#334155" />
    </svg>
  );
};

export const ProductCardImage: React.FC<{ imageUrl?: string; sku: string; alt: string }> = ({ imageUrl, sku, alt }) => {
  const [error, setError] = useState(false);

  if (imageUrl && !error) {
    return (
      <img 
        src={imageUrl} 
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return <ProductImage sku={sku} className="w-full h-full p-8 object-contain" />;
};

export const StoreHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories')
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
    <div className="space-y-10 text-gray-100 pb-16">
      
      {/* Compact Hero Banner */}
      <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl space-y-3 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Rent Premium Equipment Instantly
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
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
            className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 shadow-inner"
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
        <aside className="w-full lg:w-64 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button 
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                  selectedCategoryId === 'all' 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
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
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">Sort By</h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recommended">Recommended</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
            </select>
          </div>

          {(searchQuery || selectedCategoryId !== 'all' || sortBy !== 'recommended') && (
            <button
              onClick={handleClearFilters}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-gray-700"
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
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="aspect-video bg-gray-800 rounded-xl"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-800 rounded w-full pt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error Display State */
            <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl">
              <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-white mb-2">Unable to load products</h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button 
                onClick={fetchData}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            /* Empty Search/Filter State */
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xl">
              <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
              </svg>
              <h3 className="text-lg font-bold text-white mb-2">No matching products found</h3>
              <p className="text-sm text-gray-400 mb-6">
                Try refining your search terms or selecting a different category.
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-bold rounded-lg transition-colors"
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
                  className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 transition-all flex flex-col"
                >
                  {/* Stable Aspect-Ratio Image Container */}
                  <div className="aspect-video bg-gray-950 flex items-center justify-center border-b border-gray-800/50 overflow-hidden relative">
                    <ProductCardImage imageUrl={product.image_url} sku={product.sku} alt={product.name} />
                  </div>

                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-gray-800 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {getCategoryName(product.category_id)}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {product.sku}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-850 flex items-end justify-between mt-auto">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Standard Rate
                        </span>
                        <span className="text-lg font-extrabold text-blue-400">
                          $150.00<span className="text-xs font-normal text-gray-500"> / day</span>
                        </span>
                      </div>
                      <Link 
                        to={`/product/${product.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow"
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
