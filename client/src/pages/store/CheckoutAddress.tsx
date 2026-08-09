import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const CheckoutAddress = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'pickup' | null>(null);
  const [useSameBilling, setUseSameBilling] = useState(true);
  
  // Delivery Address Form
  const [deliveryName, setDeliveryName] = useState('John Doe');
  const [deliveryStreet, setDeliveryStreet] = useState('123 Rental Ave, Apt 4B');
  const [deliveryCity, setDeliveryCity] = useState('San Francisco, CA');
  const [deliveryZip, setDeliveryZip] = useState('94107');
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

  // Billing Address Form
  const [billingName, setBillingName] = useState('');
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      if (items.length === 0) {
        navigate('/store/cart');
      } else {
        setCartItems(items);
        setLoading(false);
      }
    } catch {
      navigate('/store/cart');
    }
  }, [navigate]);

  const getItemDays = (item: any) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    const diffTime = Math.max(1, end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const subTotal = cartItems.reduce((sum, item) => {
    const days = getItemDays(item);
    return sum + (item.unitPrice * item.quantity * days);
  }, 0);
  const deliveryCharges = deliveryMethod === 'standard' ? 15 : 0;
  const total = subTotal + deliveryCharges;

  const handleContinue = () => {
    const newErrors: { [key: string]: string } = {};

    if (!deliveryMethod) {
      newErrors.deliveryMethod = 'Please select a delivery method.';
    }

    if (!deliveryName || !deliveryStreet || !deliveryCity || !deliveryZip) {
      newErrors.deliveryAddress = 'Please complete all delivery address fields.';
    }

    if (!useSameBilling) {
      if (!billingName || !billingStreet || !billingCity || !billingZip) {
        newErrors.billingAddress = 'Please complete all billing address fields.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Store delivery info in localStorage for backend transaction mapping
      const deliveryInfo = {
        deliveryMethod,
        name: deliveryName,
        street: deliveryStreet,
        city: deliveryCity,
        zip: deliveryZip,
        billingName: useSameBilling ? deliveryName : billingName,
        billingStreet: useSameBilling ? deliveryStreet : billingStreet,
        billingCity: useSameBilling ? deliveryCity : billingCity,
        billingZip: useSameBilling ? deliveryZip : billingZip,
      };
      localStorage.setItem('demo_delivery_info', JSON.stringify(deliveryInfo));
      navigate('/store/payment');
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-900 pb-12">
      
      {/* Checkout Breadcrumb */}
      <div className="flex items-center space-x-4 mb-10 text-sm font-medium border-b border-gray-200 pb-6">
        <span className="text-gray-400">Order</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-brand-600 font-bold px-3 py-1 bg-brand-50 rounded-lg">Address</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-450">Payment</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Address Forms */}
        <div className="flex-1 space-y-10">
          
          {/* Delivery Method */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mr-3 text-sm border border-brand-200">1</span>
              Delivery Method
            </h2>
            
            <div className="space-y-4">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${deliveryMethod === 'standard' ? 'border-brand-500 bg-brand-50/20' : 'border-gray-250 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="deliveryMethod" 
                    value="standard" 
                    checked={deliveryMethod === 'standard'}
                    onChange={() => setDeliveryMethod('standard')}
                    className="focus:ring-brand-500 h-5 w-5 text-brand-600 border-gray-300"
                  />
                  <span className="ml-4 font-bold text-gray-900">Standard Delivery (Home Shipment)</span>
                </div>
                <span className="text-gray-900 font-extrabold">+$15.00</span>
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-brand-500 bg-brand-50/20' : 'border-gray-250 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="deliveryMethod" 
                    value="pickup" 
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="focus:ring-brand-500 h-5 w-5 text-brand-600 border-gray-300"
                  />
                  <span className="ml-4 font-bold text-gray-900">Self Pickup (From Depot Hub)</span>
                </div>
                <span className="text-brand-600 font-extrabold uppercase text-xs tracking-wider">Free</span>
              </label>
            </div>
            {errors.deliveryMethod && <p className="mt-4 text-xs text-red-500 font-bold flex items-center"><svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.deliveryMethod}</p>}
          </section>

          {/* Delivery Address */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mr-3 text-sm border border-brand-200">2</span>
                Delivery Address
              </h2>
              {!isEditingDelivery && (
                <button 
                  onClick={() => setIsEditingDelivery(true)}
                  className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors"
                >
                  Edit Address
                </button>
              )}
            </div>

            {isEditingDelivery ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" value={deliveryName} onChange={e => setDeliveryName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Street Address</label>
                  <input type="text" value={deliveryStreet} onChange={e => setDeliveryStreet(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                    <input type="text" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Postal / ZIP</label>
                    <input type="text" value={deliveryZip} onChange={e => setDeliveryZip(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setIsEditingDelivery(false)} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors shadow">
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl relative">
                <span className="absolute top-4 right-4 text-xs font-bold bg-gray-200 text-gray-650 px-2 py-1 rounded">Main Address</span>
                <p className="font-bold text-gray-900 mb-2">{deliveryName}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{deliveryStreet}<br/>{deliveryCity} {deliveryZip}</p>
              </div>
            )}
            {errors.deliveryAddress && <p className="mt-4 text-xs text-red-500 font-bold flex items-center"><svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.deliveryAddress}</p>}
          </section>

          {/* Billing Address */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mr-3 text-sm border border-brand-200">3</span>
              Billing Address
            </h2>
            
            <label className="flex items-center cursor-pointer mb-6 group">
              <input 
                type="checkbox" 
                checked={useSameBilling}
                onChange={() => setUseSameBilling(!useSameBilling)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-5 w-5 transition-colors"
              />
              <span className="ml-3 font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Use same as Delivery Address</span>
            </label>

            {!useSameBilling && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" value={billingName} onChange={e => setBillingName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Street Address</label>
                  <input type="text" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                    <input type="text" value={billingCity} onChange={e => setBillingCity(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Postal / ZIP</label>
                    <input type="text" value={billingZip} onChange={e => setBillingZip(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm shadow-inner" />
                  </div>
                </div>
              </div>
            )}
            {errors.billingAddress && <p className="mt-4 text-xs text-red-500 font-bold flex items-center"><svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.billingAddress}</p>}
          </section>

          <div className="flex justify-between items-center pt-4">
            <Link to="/store/cart" className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Cart
            </Link>
            <button 
              onClick={handleContinue}
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center"
            >
              Continue to Payment
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map((item, idx) => {
                const days = getItemDays(item);
                return (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="pr-4">
                      <p className="font-bold text-gray-900 mb-1 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-550 font-mono mb-1">{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()} ({days} {days === 1 ? 'day' : 'days'})</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity} x ${item.unitPrice}/day</p>
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap">${(item.unitPrice * item.quantity * days).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-4 text-sm pt-6 border-t border-gray-200 mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Rental Sub Total</span>
                <span className="font-medium text-gray-900">${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charges</span>
                <span className="font-medium text-gray-900">${deliveryCharges.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-brand-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
