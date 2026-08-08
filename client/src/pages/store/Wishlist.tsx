import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HeartIcon as Heart } from '@heroicons/react/24/solid';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // 1. Fetch Wishlist IDs
      const wishRes = await apiClient.get('/storefront/wishlist');
      const ids: string[] = wishRes.data.data;
      setWishlistIds(ids);

      // 2. Fetch all products (In a real app, we'd fetch only wishlist products, but for demo we can fetch all and filter)
      const prodRes = await apiClient.get('/storefront/products');
      const allProducts: Product[] = prodRes.data;

      // Filter products that are in the wishlist
      const wishlistedProducts = allProducts.filter(p => ids.includes(p.id));
      setProducts(wishlistedProducts);
    } catch (err) {
      console.error('Error fetching wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await apiClient.delete(`/storefront/wishlist/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      setWishlistIds(wishlistIds.filter(id => id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading wishlist...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          My Wishlist
        </h1>
        <span className="text-gray-500">{products.length} items</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Explore our catalog and save items you like!</p>
          <Button onClick={() => window.location.href = '/customer/store'} variant="primary">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow group overflow-hidden">
              <div className="relative pt-[75%] bg-gray-100">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:scale-110 transition-transform shadow-sm"
                  title="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 fill-red-500" />
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-sm text-brand-600 font-medium mb-1">{product.sku}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.href = `/customer/store/${product.id}`}
                    variant="primary"
                    className="flex-1"
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
