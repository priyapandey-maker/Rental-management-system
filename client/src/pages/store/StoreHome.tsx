import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface Product {
  id: string;
  name: string;
  type: string;
  category_id: string;
}

export const StoreHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');

  useEffect(() => {
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
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8 text-gray-100">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white">Equipment Catalog</h2>
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="px-4 py-2 bg-gray-800 rounded-md text-sm font-medium border border-gray-700 text-white"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Left Filter Area */}
      <aside className={`w-full md:w-64 flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Brand</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <label className="flex items-center cursor-pointer hover:text-white"><input type="checkbox" className="mr-3 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> Apple</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="checkbox" className="mr-3 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> Samsung</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="checkbox" className="mr-3 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> Sony</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="checkbox" className="mr-3 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> DJI</label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Color</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedColor('black')}
              className={`w-8 h-8 rounded-full bg-gray-950 ring-2 ring-offset-2 ring-offset-gray-950 transition-all ${selectedColor === 'black' ? 'ring-blue-500' : 'ring-transparent hover:ring-gray-700'}`}
              aria-label="Black"
            ></button>
            <button 
              onClick={() => setSelectedColor('white')}
              className={`w-8 h-8 rounded-full bg-gray-100 ring-2 ring-offset-2 ring-offset-gray-950 transition-all ${selectedColor === 'white' ? 'ring-blue-500' : 'ring-transparent hover:ring-gray-500'}`}
              aria-label="White"
            ></button>
            <button 
              onClick={() => setSelectedColor('blue')}
              className={`w-8 h-8 rounded-full bg-blue-700 ring-2 ring-offset-2 ring-offset-gray-950 transition-all ${selectedColor === 'blue' ? 'ring-blue-500' : 'ring-transparent hover:ring-blue-400'}`}
              aria-label="Blue"
            ></button>
            <button 
              onClick={() => setSelectedColor('red')}
              className={`w-8 h-8 rounded-full bg-red-600 ring-2 ring-offset-2 ring-offset-gray-950 transition-all ${selectedColor === 'red' ? 'ring-blue-500' : 'ring-transparent hover:ring-red-400'}`}
              aria-label="Red"
            ></button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Duration</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" defaultChecked /> All Duration</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> 1 Month</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> 6 Month</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> 1 Year</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> 2 Years</label>
            <label className="flex items-center cursor-pointer hover:text-white"><input type="radio" name="duration" className="mr-3 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" /> 3 Years</label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Price Range</h3>
          <input type="range" className="w-full accent-blue-500" min="0" max="1000" />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="hidden md:flex mb-6 justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Equipment Catalog</h2>
          <select className="text-sm bg-gray-800 border-gray-700 text-white rounded-md py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading products...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No products available at the moment.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => {
                // Simulate an out-of-stock state for demo purposes (e.g., every 4th item)
                const isOutOfStock = idx % 4 === 3;

                return (
                  <Link 
                    key={product.id} 
                    to={isOutOfStock ? "#" : `/store/product/${product.id}`} 
                    className={`group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isOutOfStock ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:border-gray-700 hover:-translate-y-1'}`}
                  >
                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute top-4 right-4 z-10 bg-red-900/80 text-red-100 text-xs font-bold px-3 py-1 rounded backdrop-blur-sm">
                        Out of Stock
                      </div>
                    )}

                    {/* Image Placeholder */}
                    <div className="aspect-w-4 aspect-h-3 bg-gray-800 flex items-center justify-center p-6 h-48 overflow-hidden relative">
                      <svg className={`w-16 h-16 text-gray-600 transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Variant indicators (Simulated based on data presence or random for demo) */}
                      {!isOutOfStock && (
                        <div className="flex gap-1.5 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-100 ring-1 ring-gray-600"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-900 ring-1 ring-gray-600"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-1 ring-gray-600"></span>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{product.type}</p>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          {/* Fake Price due to missing backend property on product model */}
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Rental Rate</p>
                          <p className="text-xl font-bold text-blue-400">
                            $45<span className="text-sm font-normal text-gray-500"> / month</span>
                          </p>
                        </div>
                        
                        {!isOutOfStock && (
                          <span className="text-sm font-medium text-blue-400 bg-blue-900/30 px-3 py-1.5 rounded-md border border-blue-800/50 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            Details
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-md border border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed">Previous</button>
                <button className="px-3 py-1 rounded-md bg-blue-600 text-white font-medium shadow">1</button>
                <button className="px-3 py-1 rounded-md border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">2</button>
                <button className="px-3 py-1 rounded-md border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">3</button>
                <button className="px-3 py-1 rounded-md border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Next</button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
