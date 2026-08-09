import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HeartIcon as Heart } from '@heroicons/react/24/solid';
import { ProductCardImage } from '../../components/store/ProductImage';

interface Product {
  id: string;
  name: string;
  type: string;
  sku?: string;
  description?: string | null;
  image_url?: string;
  in_stock?: boolean;
}

export function Wishlist() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // 1. Fetch Wishlist IDs
      const wishRes = await apiClient.get('/storefront/wishlist');
      let ids: string[] = [];
      if (Array.isArray(wishRes)) {
        ids = wishRes;
      } else if (wishRes && Array.isArray((wishRes as any).data)) {
        ids = (wishRes as any).data;
      }

      // 2. Fetch all products
      const prodRes = await apiClient.get('/storefront/products');
      let allProducts: Product[] = [];
      if (Array.isArray(prodRes)) {
        allProducts = prodRes;
      } else if (prodRes && Array.isArray((prodRes as any).data)) {
        allProducts = (prodRes as any).data;
      }

      // Filter products that are in the wishlist
      const wishlistedProducts = allProducts.filter(p => ids.includes(p.id));
      setProducts(wishlistedProducts);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (removingId === productId) return;
    setRemovingId(productId);
    try {
      await apiClient.delete(`/storefront/wishlist/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove from wishlist. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading wishlist...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          My Wishlist
        </h1>
        <span className="text-gray-500 font-medium">{products.length} {products.length === 1 ? 'item' : 'items'}</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Explore our catalog and save items you like!</p>
          <Button onClick={() => navigate('/store')} variant="primary">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow group overflow-hidden border border-gray-200 rounded-2xl">
              <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-200/50 overflow-hidden relative">
                <ProductCardImage imageUrl={product.image_url} sku={product.sku || ''} alt={product.name} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(product.id);
                  }}
                  disabled={removingId === product.id}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:scale-110 transition-transform shadow-sm disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  title="Remove from wishlist"
                >
                  {removingId === product.id ? (
                    <svg className="animate-spin w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Heart className="w-5 h-5 fill-red-500" />
                  )}
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-brand-600 font-bold tracking-wide uppercase mb-1">{product.sku}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-grow">{product.description}</p>
                )}
                <div className="flex gap-2 mt-auto pt-2">
                  <Button
                    onClick={() => navigate(`/store/product/${product.id}`)}
                    variant="primary"
                    className="flex-1 text-xs font-bold"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

