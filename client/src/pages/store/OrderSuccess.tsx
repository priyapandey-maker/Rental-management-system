import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const OrderSuccess = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string>('');
  
  // Note: Since this is a frontend demo and the backend /transactions API isn't 
  // fully exposed for public unauthenticated cart consumption, we simulate the 
  // order receipt by keeping the cart items briefly in a separate local storage 
  // key (e.g. 'demo_last_order') before clearing them out.
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    // In a real app we'd fetch this from the backend by an ID in the URL.
    // For the demo, we pull whatever was just checked out, or show a fallback.
    const items = JSON.parse(localStorage.getItem('demo_last_order') || '[]');
    setOrderItems(items);

    // Generate a mock order ID
    const randomId = `SO${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    setOrderId(randomId);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const subTotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryCharges = orderItems.length > 0 ? 15 : 0;
  const total = subTotal + deliveryCharges;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900 pb-12 pt-8 print:p-0 print:m-0 print:text-black">
      
      {/* Non-printable back navigation */}
      <div className="mb-6 print:hidden">
        <Link to="/store" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Discover
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
        
        {/* Success Header */}
        <div className="text-center mb-12 border-b border-gray-200 print:border-gray-300 pb-10">
          <div className="mx-auto w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 print:hidden border border-green-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 print:text-black mb-4 tracking-tight">Thank you for your order</h1>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6">
            <div className="bg-gray-50 print:bg-gray-100 px-6 py-3 rounded-xl border border-gray-200 print:border-gray-300 flex flex-col items-center">
              <span className="text-xs text-gray-500 print:text-gray-600 uppercase font-bold tracking-wider mb-1">Order Number</span>
              <span className="text-xl font-bold text-brand-600 print:text-brand-600 font-mono">{orderId}</span>
            </div>
          </div>
        </div>

        {/* Payment Confirmation */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-10 flex items-start print:hidden">
          <svg className="w-6 h-6 text-brand-600 mr-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold text-brand-900 text-lg mb-1">Your Payment has been processed</h3>
            <p className="text-sm text-brand-700">Demo payment simulation complete. Your rental contract has been updated.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          
          {/* Delivery & Billing Summary */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 print:text-gray-600 uppercase tracking-wider mb-4 border-b border-gray-200 print:border-gray-300 pb-2">Delivery & Billing</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-500 print:text-gray-500 uppercase mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700 print:text-black font-semibold leading-relaxed">
                  John Doe<br/>
                  123 Rental Ave, Apt 4B<br/>
                  San Francisco, CA 94107
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 print:text-gray-500 uppercase mb-1">Billing Address</p>
                <p className="text-sm text-gray-700 print:text-black font-semibold leading-relaxed">
                  Same as Delivery Address
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 print:text-gray-600 uppercase tracking-wider mb-4 border-b border-gray-200 print:border-gray-300 pb-2">Order Summary</h3>
            
            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No items found for this order.</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-64 overflow-y-auto print:max-h-none print:overflow-visible custom-scrollbar pr-2 space-y-4">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="pr-4">
                        <p className="font-bold text-gray-900 print:text-black mb-1">{item.productName}</p>
                        {item.variantName && <p className="text-xs text-brand-600 font-bold mb-1">{item.variantName}</p>}
                        <p className="text-xs text-gray-500 font-mono mb-1">{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</p>
                        <p className="text-gray-550 print:text-gray-600 text-xs">Qty: {item.quantity} x ${item.unitPrice}</p>
                      </div>
                      <span className="font-bold text-gray-900 print:text-black whitespace-nowrap">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-200 print:border-gray-300 text-sm">
                  <div className="flex justify-between text-gray-500 print:text-gray-600">
                    <span>Rental Sub Total</span>
                    <span className="font-medium text-gray-900 print:text-black">${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 print:text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-medium text-gray-900 print:text-black">${deliveryCharges.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 print:border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-700 print:text-black">Total Paid</span>
                    <span className="text-2xl font-black text-brand-600 print:text-black">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-gray-200 print:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">A confirmation receipt has been generated.</p>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-bold rounded-xl shadow transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
            <Link 
              to="/store/rentals"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow transition-colors flex items-center text-sm"
            >
              View My Rentals
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Print-only Footer Branding */}
        <div className="hidden print:block mt-16 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
          <p className="font-bold text-black mb-1">AssetFlow</p>
          <p>Thank you for choosing our equipment rental services.</p>
        </div>

      </div>
    </div>
  );
};
