import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  ShoppingCartIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout = () => {
  const { userId, isAuthenticated, isLoading, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      setCartCount(stored.length);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart_updated', updateCartCount);
    // Storage event for cross-tab sync
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cart_updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Auth gate
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role gate: non-customers go to their portal
  if (role === 'admin') return <Navigate to="/dashboard" replace />;
  if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-500 hover:text-gray-900 p-2"
              >
                {showMobileMenu ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>

            {/* Left: Logo & Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/store" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center mr-2">
                  <span className="text-gray-900 font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">RentalStore</span>
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Products</Link>
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Terms & Condition</Link>
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">About Us</Link>
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Contact Us</Link>
              </nav>
            </div>

            {/* Center: Search (Hidden on small screens) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm placeholder-gray-400"
              />
              <button className="absolute right-3 top-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Right: Icons, Profile */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
              
              <Link to="/store" className="text-gray-500 hover:text-pink-500 transition-colors">
                <HeartIcon className="h-6 w-6" />
              </Link>
              
              <Link to="/store/cart" className="text-gray-500 hover:text-brand-400 transition-colors relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-gray-900 bg-brand-600 rounded-full shadow">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
                >
                  <UserCircleIcon className="h-7 w-7" />
                </button>

                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileMenu(false)}
                    ></div>
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-100 ring-1 ring-black ring-opacity-5 z-50 border border-gray-300">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-300">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Customer ({userId?.substring(0, 6)}...)
                            </p>
                          </div>
                          <Link to="/store" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">My Account</Link>
                          <Link to="/store" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">My Orders</Link>
                          <Link to="/store" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">Settings</Link>
                          <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-200 border-t border-gray-300">Logout</button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">Login</Link>
                          <Link to="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">Sign Up</Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-100">Products</Link>
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">Terms & Condition</Link>
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">About Us</Link>
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">Contact Us</Link>
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} RentalStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
