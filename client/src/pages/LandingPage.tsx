import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ProductCardImage } from '../components/store/ProductImage';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CubeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Interfaces matching backend models
interface Category {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  rental_type: 'rentable' | 'consumable' | 'service';
  status: 'active' | 'archived' | 'draft';
}

const MOCK_CATEGORIES = [
  { id: 'cat-cameras-111', name: 'Cameras', code: 'CAM' },
  { id: 'cat-audio-222', name: 'Audio', code: 'AUD' },
  { id: 'cat-lighting-333', name: 'Lighting', code: 'LGT' },
  { id: 'cat-lenses-444', name: 'Lenses', code: 'LNS' }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-camera-111',
    category_id: 'cat-cameras-111',
    name: 'Professional Camera Kit',
    sku: 'PROD-CAM-01',
    description: 'High-end cinema camera package with prime lenses.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-audio-222',
    category_id: 'cat-audio-222',
    name: 'Wireless Lavalier Mic',
    sku: 'PROD-AUD-01',
    description: 'Dual-channel wireless mic kit.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-lighting-333',
    category_id: 'cat-lighting-333',
    name: 'LED Studio Panel Light',
    sku: 'PROD-LGT-01',
    description: 'Bi-color dimmable LED light panel.',
    rental_type: 'rentable',
    status: 'active'
  },
  {
    id: 'prod-lenses-444',
    category_id: 'cat-lenses-444',
    name: 'Cinema Prime Lens Kit',
    sku: 'PROD-LNS-01',
    description: 'F1.4 prime lens set (24mm, 35mm, 50mm, 85mm).',
    rental_type: 'rentable',
    status: 'active'
  }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPublicData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        apiClient.get('/storefront/categories'),
        apiClient.get('/storefront/products')
      ]);

      const catData = catRes as unknown as Category[];
      const prodData = prodRes as unknown as Product[];
      
      setCategories(catData && catData.length > 0 ? catData : MOCK_CATEGORIES);
      
      const activeProducts = (prodData || []).filter(p => p.status === 'active' || (p as any).status === 'ACTIVE');
      setFeaturedProducts(activeProducts.length > 0 ? activeProducts.slice(0, 4) : MOCK_PRODUCTS.slice(0, 4));
    } catch (err) {
      console.warn("Backend API offline. Falling back to storefront simulation data.");
      setCategories(MOCK_CATEGORIES);
      setFeaturedProducts(MOCK_PRODUCTS.slice(0, 4));
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/store?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200">
      
      {/* ──────────────────────────────────────────────────────
          1. HEADER
      ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white uppercase font-display">
                  RMS<span className="text-blue-500">.</span>
                </span>
                <span className="hidden sm:inline-block ml-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-l border-gray-700 pl-3">
                  Rental Management
                </span>
              </Link>
            </div>

            {/* Main Nav (Desktop) */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/store" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Browse Rentals</Link>
              <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#for-vendors" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">For Vendors</a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">Log In</Link>
              <Link to="/signup" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────
          2. HERO SECTION
      ────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-blue-900/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-indigo-900/20 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Rent What You Need.<br/>
              <span className="text-blue-500">Manage Everything You Rent.</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              RMS brings customers, rental products, vendors, inventory, bookings and payments together in one simple rental platform.
            </p>
            
            {/* Search Box */}
            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 shadow-2xl inline-block w-full max-w-2xl text-left">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking to rent?" 
                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-gray-950 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="sm:w-48 relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-8 py-3 border border-gray-800 rounded-xl bg-gray-950 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors sm:w-auto w-full whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link to="/store" className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl border border-gray-700 transition-colors text-center">
                Browse All Rentals
              </Link>
              <Link to="/vendor-signup" className="w-full sm:w-auto text-blue-400 font-bold hover:text-blue-300 px-8 py-3 transition-colors text-center">
                List Your Business &rarr;
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-full relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
              <div className="rounded-xl overflow-hidden mb-4 relative aspect-[4/3] bg-gray-950">
                 <ProductCardImage sku="PROD-CAM-01" alt="Cinema Camera Rig" />
                 <div className="absolute top-4 left-4 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md">
                   Available Now
                 </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">ARRI Alexa Mini Rig</h3>
                  <p className="text-sm text-gray-400">Cameras</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-500">$450</p>
                  <p className="text-xs text-gray-500 uppercase font-bold">Per Day</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-8 top-12 bg-gray-800 border border-gray-700 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-100 hidden md:flex">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Verified Vendors</p>
                <p className="text-xs text-gray-400">Safe & Secure</p>
              </div>
            </div>

            <div className="absolute -left-12 bottom-12 bg-gray-800 border border-gray-700 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700 delay-300 hidden md:flex">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Easy Booking</p>
                <p className="text-xs text-gray-400">Instant confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          3. EXPLORE BY CATEGORY
      ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Explore by Category</h2>
              <p className="text-gray-400 mt-2">Find exactly what you need from our verified catalog.</p>
            </div>
            <Link to="/store" className="text-blue-400 hover:text-blue-300 font-bold hidden sm:block">View All &rarr;</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 8).map((category, idx) => (
              <Link 
                key={category.id} 
                to={`/store?category=${category.id}`}
                className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center hover:border-blue-500/50 hover:bg-gray-900 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 mx-auto bg-gray-800 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <span className="font-bold font-mono text-xs">{category.code || idx + 1}</span>
                </div>
                <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">{category.name}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
             <Link to="/store" className="text-blue-400 font-bold hover:text-blue-300">View All Categories &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          4. HOW IT WORKS & PROBLEM/SOLUTION
      ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-white mb-6">Renting Shouldn't Be Complicated.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12 bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-red-400 border-b border-gray-800 pb-2">The Old Way</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-red-500">✕</span> Scattered product listings</li>
                  <li className="flex items-start gap-2"><span className="text-red-500">✕</span> Unclear availability</li>
                  <li className="flex items-start gap-2"><span className="text-red-500">✕</span> Manual booking & tracking</li>
                  <li className="flex items-start gap-2"><span className="text-red-500">✕</span> Disconnected vendor communication</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-400 border-b border-gray-800 pb-2">With RMS</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">✓</span> Centralized product discovery</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">✓</span> Real-time inventory status</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">✓</span> Seamless checkout & booking</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">✓</span> Complete lifecycle management</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-black shadow-lg">01</div>
              <h3 className="text-lg font-bold text-white">Find What You Need</h3>
              <p className="text-gray-400 text-sm">Browse rental products from available vendors in our verified catalog.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-black shadow-lg">02</div>
              <h3 className="text-lg font-bold text-white">Configure & Book</h3>
              <p className="text-gray-400 text-sm">Choose your variant, rental period and quantity securely online.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-black shadow-lg">03</div>
              <h3 className="text-lg font-bold text-white">Get It Delivered</h3>
              <p className="text-gray-400 text-sm">Complete checkout and track your rental lifecycle from one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          5. CUSTOMERS & VENDORS SPLIT
      ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Customer Section */}
            <div className="bg-gray-950 p-10 sm:p-12 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <GlobeAltIcon className="h-10 w-10 text-blue-500 mb-6" />
                <h2 className="text-3xl font-extrabold text-white mb-4">Everything You Need to Rent With Confidence</h2>
                <p className="text-gray-400 mb-8">
                  Discover products, compare options, configure variants, select dates, and manage your orders securely.
                </p>
                <ul className="space-y-3 mb-10 text-sm text-gray-300 font-medium">
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-gray-600" /> Discover and compare</li>
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-gray-600" /> Configure variants & dates</li>
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-gray-600" /> Manage invoices & orders</li>
                </ul>
                <Link to="/store" className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl border border-gray-700 transition-colors">
                  Start Renting <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Vendor Section */}
            <div id="for-vendors" className="bg-gradient-to-br from-indigo-950 to-gray-950 p-10 sm:p-12 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <BuildingStorefrontIcon className="h-10 w-10 text-indigo-400 mb-6" />
                <h2 className="text-3xl font-extrabold text-white mb-4">Turn Your Inventory Into a Rental Business</h2>
                <p className="text-indigo-200/70 mb-8">
                  RMS gives vendors the tools to list, manage and grow their rental inventory while keeping operations organized.
                </p>
                <ul className="space-y-3 mb-10 text-sm text-indigo-100 font-medium grid grid-cols-2 gap-x-4">
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-indigo-500/50" /> Manage Products</li>
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-indigo-500/50" /> Track Rentals</li>
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-indigo-500/50" /> Track Inventory</li>
                  <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-indigo-500/50" /> Export Reports</li>
                </ul>
                <div className="flex flex-wrap gap-4">
                  <Link to="/vendor-signup" className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                    Become a Vendor
                  </Link>
                  <Link to="/login" className="inline-flex items-center bg-transparent hover:bg-indigo-900/30 text-indigo-300 font-bold py-3 px-6 rounded-xl border border-indigo-700/50 transition-colors">
                    Vendor Login
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          6. TRUST / BENEFITS
      ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <CubeIcon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">One Platform</h3>
              <p className="text-sm text-gray-400">Customers, vendors and rental operations in one connected ecosystem.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <ChartBarIcon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Visibility</h3>
              <p className="text-sm text-gray-400">Know exactly what is available, rented, allocated and returned.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <ShieldCheckIcon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Secure & Organized</h3>
              <p className="text-sm text-gray-400">Keep rental transactions, invoices and payments perfectly structured.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <DocumentTextIcon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Built for Growth</h3>
              <p className="text-sm text-gray-400">Designed to support vendors seamlessly as their rental inventory grows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          7. FEATURED RENTALS
      ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Popular Rentals</h2>
              <p className="text-gray-400 mt-2">Discover equipment recently added to the marketplace.</p>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-950 rounded-2xl border border-gray-800">
              <p className="text-gray-400 font-medium">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/store/product/${product.id}`} className="group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-600 transition-colors shadow-sm hover:shadow-xl">
                  <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
                    <ProductCardImage sku={product.sku} alt={product.name} />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-3 right-3 bg-gray-900/90 text-xs font-bold px-2 py-1 rounded text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      {product.rental_type}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-100 group-hover:text-white mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-4">{product.sku}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Available</span>
                      <span className="text-sm font-bold text-blue-400 hover:text-blue-300">View Details &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
             <Link to="/store" className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl border border-gray-700 transition-colors">
               View All Rentals
             </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          8. FINAL CTA
      ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Make Renting Simpler?</h2>
          <p className="text-lg text-gray-400 mb-10">
            Whether you're looking to rent something or grow a rental business, RMS gives you everything you need to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/store" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg shadow-blue-600/20 text-lg">
              Start Renting
            </Link>
            <Link to="/vendor-signup" className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-10 rounded-xl border border-gray-700 transition-colors text-lg">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          9. FOOTER
      ────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <CubeIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-white uppercase font-display">
                  RMS<span className="text-blue-500">.</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500">Rental management, simplified.</p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/store" className="hover:text-blue-400 transition-colors">Browse Rentals</Link></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                <li><Link to="/vendor-signup" className="hover:text-blue-400 transition-colors">Become a Vendor</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
                <li><Link to="/store" className="hover:text-blue-400 transition-colors">Browse Rentals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Vendors</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Vendor Login</Link></li>
                <li><Link to="/vendor-signup" className="hover:text-blue-400 transition-colors">Vendor Registration</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Rental Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
