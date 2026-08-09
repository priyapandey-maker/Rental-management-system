import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface ExpressCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ExpressCheckoutModal: React.FC<ExpressCheckoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [card, setCard] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handlePay = () => {
    const newErrors: { [key: string]: string } = {};
    if (card.replace(/\s/g, '').length < 15) newErrors.card = 'Invalid card number';
    if (!name) newErrors.name = 'Required';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email';
    if (!address) newErrors.address = 'Required';
    if (!zip) newErrors.zip = 'Required';
    if (!city) newErrors.city = 'Required';
    if (!country) newErrors.country = 'Required';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-150 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Express Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors focus:outline-none bg-gray-100 hover:bg-gray-205 p-1.5 rounded-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5 text-gray-900">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Card Details</label>
            <input 
              type="text" 
              placeholder="XXXX XXXX XXXX XXXX" 
              value={card}
              onChange={(e) => setCard(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-mono tracking-widest placeholder-gray-400 shadow-inner"
            />
            {errors.card && <p className="mt-1 text-xs text-red-500 font-bold">{errors.card}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
              {errors.name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
            {errors.address && <p className="mt-1 text-xs text-red-500 font-bold">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
              {errors.city && <p className="mt-1 text-xs text-red-500 font-bold">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Zip</label>
              <input type="text" value={zip} onChange={e => setZip(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
              {errors.zip && <p className="mt-1 text-xs text-red-500 font-bold">{errors.zip}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm shadow-inner" />
              {errors.country && <p className="mt-1 text-xs text-red-500 font-bold">{errors.country}</p>}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-5 border-t border-gray-150 bg-gray-50">
          <button 
            onClick={handlePay}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors flex justify-center items-center"
          >
            Pay Now (Express)
          </button>
        </div>
      </div>
    </div>
  );
};

export const Payment = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [saveDetails, setSaveDetails] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);

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
  const deliveryCharges = 15; 
  const total = subTotal + deliveryCharges;

  const handlePayNow = () => {
    const newErrors: { [key: string]: string } = {};

    if (cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.card = 'Please enter a valid card number.';
    }
    if (!cardExpiry) {
      newErrors.expiry = 'Required';
    }
    if (!cardCvc) {
      newErrors.cvc = 'Required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      executeDemoPayment();
    }
  };

  const executeDemoPayment = async () => {
    // ── Booking Validation & Persistence ──────────────────────────────────────
    const userRole = localStorage.getItem('demo_user_role') || 'customer';
    const userId = localStorage.getItem('demo_user_id') || 'cust-demo-01';
    const orgId = localStorage.getItem('demo_org_id') || '6f3875f5-49a2-4bee-9dc1-927b5907020a';

    const deliveryInfo = JSON.parse(localStorage.getItem('demo_delivery_info') || '{}');

    // Create a new simulated transaction payload
    const newTransactionId = 'tx-' + Math.random().toString(36).substring(2, 11);
    const newTransaction = {
      id: newTransactionId,
      customer_id: userId,
      status: 'CONFIRMED',
      transaction_date: new Date().toISOString(),
      lines: cartItems.map((item, idx) => ({
        id: `line-${newTransactionId}-${idx}`,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        rental_start_date: item.startDate,
        rental_end_date: item.endDate,
        snapshot: {
          unit_price: String(item.unitPrice),
          deposit_amount: '50',
          late_fee_rate: '15'
        }
      }))
    };

    // 1. Persist to API if backend is online
    try {
      // First create standard draft transaction
      const draftTx: any = await apiClient.post('/transactions', {
        customer_id: userId
      });
      
      // Add all lines sequentially
      for (const item of cartItems) {
        await apiClient.post(`/transactions/${draftTx.id}/lines`, {
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          rental_start_date: item.startDate,
          rental_end_date: item.endDate,
          unit_price: item.unitPrice,
          deposit_amount: 50,
          late_fee_rate: 15
        });
      }

      // Confirm transaction
      await apiClient.post(`/transactions/${draftTx.id}/confirm`);
      console.log('Transaction persisted to database successfully:', draftTx.id);
    } catch (apiErr) {
      console.warn('Backend database offline or write failed, proceeding with local simulation persistence:', apiErr);
    }

    // 2. Always write to simulated local storage array to guarantee visibility in Rentals lists
    const existingTxs = JSON.parse(localStorage.getItem('demo_transactions') || '[]');
    existingTxs.unshift(newTransaction);
    localStorage.setItem('demo_transactions', JSON.stringify(existingTxs));

    // Clear cart and complete flow
    localStorage.setItem('demo_last_order', JSON.stringify(cartItems));
    localStorage.removeItem('demo_cart');
    localStorage.removeItem('demo_delivery_info');
    
    window.dispatchEvent(new Event('cart_updated'));
    navigate('/store/success');
  };

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-900 pb-12">
      {/* Checkout Breadcrumb */}
      <div className="flex items-center space-x-4 mb-10 text-sm font-medium border-b border-gray-200 pb-6 flex-wrap gap-y-3">
        <span className="text-gray-400">Order</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-400">Address</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-brand-600 font-bold px-3 py-1 bg-brand-50 rounded-lg">Payment</span>
        
        <div className="ml-auto">
           <button onClick={() => setIsExpressModalOpen(true)} className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow transition-colors">
              Express Checkout
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Payment Form & Summaries */}
        <div className="flex-1 space-y-10">
          
          {/* Delivery & Billing Summary */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Delivery & Billing Summary</h2>
              <Link to="/store/checkout" className="text-sm font-bold text-brand-600 hover:text-brand-550">Edit</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</p>
                <p className="text-sm text-gray-700 leading-relaxed font-semibold">John Doe<br/>123 Rental Ave, Apt 4B<br/>San Francisco, CA 94107</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Address</p>
                <p className="text-sm text-gray-700 leading-relaxed font-semibold">Same as Delivery Address</p>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
            {/* Simulation Warning Badge */}
            <div className="absolute top-0 right-0 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 border-b border-l border-amber-200 rounded-bl-lg">
              Frontend Simulation
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">Secure Payment</h2>
            
            <div className="border border-brand-500 bg-brand-50/10 rounded-xl p-6 mb-6 relative">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center">
                    <input type="radio" checked readOnly className="focus:ring-brand-500 h-5 w-5 text-brand-600 bg-white border-gray-300" />
                    <span className="ml-4 font-bold text-gray-900">Credit / Debit Card</span>
                 </div>
                 <div className="flex gap-1.5 opacity-60">
                    <div className="w-9 h-5 bg-gray-200 rounded border border-gray-300"></div>
                    <div className="w-9 h-5 bg-gray-200 rounded border border-gray-300"></div>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="XXXX XXXX XXXX XXXX" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono tracking-widest placeholder-gray-400 shadow-inner" 
                  />
                  {errors.card && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.card}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono placeholder-gray-400 shadow-inner" />
                    {errors.expiry && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">CVC</label>
                    <input type="text" placeholder="123" value={cardCvc} onChange={e => setCardCvc(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono placeholder-gray-400 shadow-inner" />
                    {errors.cvc && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={saveDetails}
                onChange={() => setSaveDetails(!saveDetails)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-5 w-5 transition-colors"
              />
              <span className="ml-3 font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Save my payment details for future rentals</span>
            </label>
          </section>

          <div className="flex justify-between items-center pt-4">
            <Link to="/store/checkout" className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Address
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Pay */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
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
            
            <div className="space-y-4 text-sm pt-6 border-t border-gray-100 mb-8">
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
                <span className="text-3xl font-extrabold text-brand-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayNow}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center text-lg"
            >
              Pay Now
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Secure simulated booking gateway
            </p>
          </div>
        </div>
      </div>

      <ExpressCheckoutModal 
        isOpen={isExpressModalOpen} 
        onClose={() => setIsExpressModalOpen(false)} 
        onConfirm={executeDemoPayment} 
      />
    </div>
  );
};
