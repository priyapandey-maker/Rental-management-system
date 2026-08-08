import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-bold text-white tracking-tight">Express Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors focus:outline-none bg-gray-800 hover:bg-gray-700 p-1.5 rounded-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Card Details</label>
            <input 
              type="text" 
              placeholder="XXXX XXXX XXXX XXXX" 
              value={card}
              onChange={(e) => setCard(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-mono tracking-widest placeholder-gray-600"
            />
            {errors.card && <p className="mt-1 text-xs text-red-400">{errors.card}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
              {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Zip</label>
              <input type="text" value={zip} onChange={e => setZip(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
              {errors.zip && <p className="mt-1 text-xs text-red-400">{errors.zip}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 text-sm" />
              {errors.country && <p className="mt-1 text-xs text-red-400">{errors.country}</p>}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-5 border-t border-gray-800 bg-gray-900/80">
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

  const subTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryCharges = 15; // Passed from F4 implicitly for demo
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

  const executeDemoPayment = () => {
    // Demo safety: We do NOT store card info anywhere.
    // Transfer items to last_order for the invoice, then clear the cart
    localStorage.setItem('demo_last_order', JSON.stringify(cartItems));
    localStorage.removeItem('demo_cart');
    window.dispatchEvent(new Event('cart_updated'));
    navigate('/store/success');
  };

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-100 pb-12">
      {/* Checkout Breadcrumb */}
      <div className="flex items-center space-x-4 mb-10 text-sm font-medium border-b border-gray-800 pb-6 flex-wrap gap-y-3">
        <span className="text-gray-500">Order</span>
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-500">Address</span>
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-bold px-3 py-1 bg-gray-800 rounded-lg">Payment</span>
        
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
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white">Delivery & Billing</h2>
              <Link to="/store/checkout" className="text-sm font-medium text-brand-400 hover:text-brand-300">Edit</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">John Doe<br/>123 Rental Ave, Apt 4B<br/>San Francisco, CA 94107</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billing Address</p>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">Same as Delivery Address</p>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            {/* Demo warning badge */}
            <div className="absolute top-0 right-0 bg-yellow-900/80 text-yellow-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-b border-l border-yellow-800/50 rounded-bl-lg backdrop-blur-md">
              Frontend Demo Simulation
            </div>

            <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
            
            <div className="border border-brand-500 bg-brand-900/10 rounded-xl p-6 mb-6 relative">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center">
                    <input type="radio" checked readOnly className="focus:ring-brand-500 h-5 w-5 text-brand-600 bg-gray-900 border-gray-600" />
                    <span className="ml-4 font-bold text-white">Credit / Debit Card</span>
                 </div>
                 <div className="flex gap-2 opacity-70">
                    {/* Mock card icons */}
                    <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
                    <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
                    <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700"></div>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="XXXX XXXX XXXX XXXX" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono tracking-widest placeholder-gray-600" 
                  />
                  {errors.card && <p className="mt-1.5 text-sm text-red-400">{errors.card}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono placeholder-gray-600" />
                    {errors.expiry && <p className="mt-1.5 text-sm text-red-400">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">CVC</label>
                    <input type="text" placeholder="123" value={cardCvc} onChange={e => setCardCvc(e.target.value)} className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-mono placeholder-gray-600" />
                    {errors.cvc && <p className="mt-1.5 text-sm text-red-400">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={saveDetails}
                onChange={() => setSaveDetails(!saveDetails)}
                className="rounded border-gray-600 bg-gray-900 text-brand-600 focus:ring-brand-500 h-5 w-5 transition-colors"
              />
              <span className="ml-3 font-medium text-gray-400 group-hover:text-white transition-colors">Save my payment details for future rentals</span>
            </label>
          </section>

          <div className="flex justify-between items-center pt-4">
            <Link to="/store/checkout" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Address
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Pay */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div className="pr-4">
                    <p className="font-bold text-white mb-1 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-500 font-mono mb-1">{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-white whitespace-nowrap">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 text-sm pt-6 border-t border-gray-800 mb-8">
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
                <span className="text-3xl font-extrabold text-brand-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayNow}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-brand-900/20 transition-all flex justify-center items-center text-lg"
            >
              Pay Now
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Secure 256-bit encrypted simulated checkout
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
