import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const CustomerLayout = () => {
  const { userId, isAuthenticated, isLoading, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCartCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('demo_cart') || '[]');
      setCartCount(stored.length);
    } catch {
      setCartCount(0);
    }
  };

  const updateWishlistCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(stored.length);
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    window.addEventListener('cart_updated', updateCartCount);
    window.addEventListener('wishlist_updated', updateWishlistCount);
    // Storage event for cross-tab sync
    window.addEventListener('storage', () => {
      updateCartCount();
      updateWishlistCount();
    });
    return () => {
      window.removeEventListener('cart_updated', updateCartCount);
      window.removeEventListener('wishlist_updated', updateWishlistCount);
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
                <Logo size="sm" isLink={false} theme="brand" />
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Home / Discover</Link>
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Products</Link>
                <Link to="/store/wishlist" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Wishlist</Link>
                <Link to="/store/cart" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">Cart</Link>
                <Link to="/store" className="text-gray-700 hover:text-brand-400 font-medium text-sm transition-colors">My Rentals / Orders</Link>
              </nav>
            </div>

            {/* Right: Icons, Profile */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link to="/store/wishlist" className="text-gray-500 hover:text-pink-500 transition-colors relative">
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow">
                    {wishlistCount}
                  </span>
                )}
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
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">Home / Discover</Link>
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-100">Products</Link>
              <Link to="/store/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">Wishlist</Link>
              <Link to="/store/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">Cart</Link>
              <Link to="/store" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200">My Rentals / Orders</Link>
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
          &copy; {new Date().getFullYear()} AssetFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
