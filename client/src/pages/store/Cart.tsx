import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCardImage } from '../../components/store/ProductImage';

interface CartItem {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  startDate: string;
  endDate: string;
  unitPrice: number;
  sku?: string;
}

export const Cart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial loading time for polished UX
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      const saved = JSON.parse(localStorage.getItem('demo_saved_cart') || '[]');
      setItems(stored);
      setSavedItems(saved);
      setLoading(false);
    }, 400);
  }, []);

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newItems = [...items];
    newItems[index].quantity = newQty;
    setItems(newItems);
    localStorage.setItem('demo_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    localStorage.setItem('demo_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const saveForLater = (index: number) => {
    const item = items[index];
    const newSaved = [...savedItems, item];
    setSavedItems(newSaved);
    localStorage.setItem('demo_saved_cart', JSON.stringify(newSaved));
    removeItem(index);
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    // We don't have a backend coupon endpoint, simulate error state
    setCouponStatus('error');
    setTimeout(() => setCouponStatus('idle'), 3000);
  };

  const subTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  // Delivery charges mocked to $15 if items exist
  const deliveryCharges = items.length > 0 ? 15 : 0;
  const total = subTotal + deliveryCharges;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin h-10 w-10 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-lg font-medium tracking-wide">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-100 pb-12">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cart Items */}
        <div className="flex-1 space-y-6">
          {items.length === 0 ? (
            <div className="bg-gray-900 p-12 border border-gray-800 rounded-2xl text-center shadow-xl">
              <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">Looks like you haven't added any rental equipment to your cart yet.</p>
              <Link to="/store" className="inline-flex items-center px-6 py-3 rounded-xl shadow text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800 shadow-xl">
              {items.map((item, idx) => (
                <div key={idx} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                  {/* Image Container */}
                  <div className="w-full sm:w-32 h-32 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <ProductCardImage imageUrl={undefined} sku={item.sku || ''} alt={item.productName} />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.productName}</h3>
                        {item.variantName && <p className="text-sm font-medium text-blue-400">Configuration: {item.variantName}</p>}
                      </div>
                      <p className="text-xl font-bold text-white">${item.unitPrice}</p>
                    </div>

                    <div className="mt-2 bg-gray-950 p-3 rounded-lg border border-gray-800 inline-block w-fit">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rental Period</p>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">{new Date(item.startDate).toLocaleString()}</span>
                        <span className="mx-2 text-gray-600">to</span>
                        <span className="font-medium text-white">{new Date(item.endDate).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-700 w-28 rounded-lg overflow-hidden bg-gray-950 h-10">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(idx, item.quantity - 1)} 
                          disabled={item.quantity <= 1}
                          className="w-8 h-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-extrabold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border-r border-gray-800"
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity} 
                          readOnly 
                          className="flex-1 text-center bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white select-none pointer-events-none" 
                        />
                        <button 
                          type="button"
                          onClick={() => updateQuantity(idx, item.quantity + 1)} 
                          className="w-8 h-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-extrabold transition-colors flex items-center justify-center border-l border-gray-800"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex space-x-4">
                        <button onClick={() => saveForLater(idx)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          Save for later
                        </button>
                        <button onClick={() => removeItem(idx)} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="flex justify-start">
              <Link to="/store" className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Rental Sub Total</span>
                <span className="font-medium text-white">${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Charges</span>
                <span className="font-medium text-white">${deliveryCharges.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-gray-300">Total</span>
                <span className="text-2xl font-bold text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex relative">
                <input 
                  type="text" 
                  placeholder="Apply Coupon" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-l-lg shadow-inner py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500" 
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 border-y border-r border-gray-700 text-white px-5 py-2.5 rounded-r-lg text-sm font-bold hover:bg-gray-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponStatus === 'error' && (
                <p className="text-xs text-red-400 flex items-center">
                   <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                   Invalid or expired coupon code.
                </p>
              )}

              <div className="pt-6 border-t border-gray-800 space-y-3">
                <button 
                  disabled={items.length === 0}
                  onClick={() => navigate('/store/delivery')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>

                <button 
                  disabled={items.length === 0}
                  onClick={() => navigate('/store/delivery')}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3.5 rounded-xl shadow flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay with Saved Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
