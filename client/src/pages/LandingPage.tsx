import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Logo } from '../components/Logo';

// Realistic product image map (served from /public/images/)
const CATEGORY_IMAGES: Record<string, string> = {
  CAM: '/images/cat-camera.jpg',
  AUD: '/images/cat-audio.jpg',
  LGT: '/images/cat-lighting.jpg',
  LNS: '/images/cat-lenses.jpg',
  TRP: '/images/cat-tripod.jpg',
  VID: '/images/cat-video.jpg',
  DRN: '/images/cat-drone.jpg',
  PRJ: '/images/cat-projector.jpg',
  'D-CAM': '/images/cat-camera.jpg',
  'D-AUD': '/images/cat-audio.jpg',
  'D-DRN': '/images/cat-drone.jpg',
  'D-LPT': '/images/prod-lpt.png',
  'D-GAM': '/images/prod-gam.png',
  'D-FURN': '/images/prod-furn.png',
  'D-TVP': '/images/prod-tvp.png',
  'D-WRB': '/images/prod-wrb.png',
  'D-HAPP': '/images/prod-happ.png',
  'D-EVT': '/images/prod-evt.png',
  LPT: '/images/prod-lpt.png',
  GAM: '/images/prod-gam.png',
  FURN: '/images/prod-furn.png',
  TVP: '/images/prod-tvp.png',
  WRB: '/images/prod-wrb.png',
  HAPP: '/images/prod-happ.png',
  EVT: '/images/prod-evt.png',
};

const PRODUCT_IMAGES: Record<string, string> = {
  CAM: '/images/cat-camera.jpg',
  AUD: '/images/cat-audio.jpg',
  LGT: '/images/cat-lighting.jpg',
  LNS: '/images/cat-lenses.jpg',
  TRP: '/images/cat-tripod.jpg',
  VID: '/images/cat-video.jpg',
  DRN: '/images/cat-drone.jpg',
  PRJ: '/images/cat-projector.jpg',
  'D-CAM': '/images/cat-camera.jpg',
  'D-AUD': '/images/cat-audio.jpg',
  'D-DRN': '/images/cat-drone.jpg',
  'D-LPT': '/images/prod-lpt.png',
  'D-GAM': '/images/prod-gam.png',
  'D-FURN': '/images/prod-furn.png',
  'D-TVP': '/images/prod-tvp.png',
  'D-WRB': '/images/prod-wrb.png',
  'D-HAPP': '/images/prod-happ.png',
  'D-EVT': '/images/prod-evt.png',
  LPT: '/images/prod-lpt.png',
  GAM: '/images/prod-gam.png',
  FURN: '/images/prod-furn.png',
  TVP: '/images/prod-tvp.png',
  WRB: '/images/prod-wrb.png',
  HAPP: '/images/prod-happ.png',
  EVT: '/images/prod-evt.png',
};
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  TagIcon,
  CubeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Category { id: string; name: string; code: string; }
interface Product {
  id: string; category_id: string; name: string; sku: string;
  description: string | null; rental_type: string; status: string;
}

const MOCK_CATEGORIES = [
  { id: 'cat-cameras-111', name: 'Cameras & Cinema', code: 'CAM' },
  { id: 'cat-audio-222', name: 'Audio Equipment', code: 'AUD' },
  { id: 'cat-lighting-333', name: 'Lighting & Studio', code: 'LGT' },
  { id: 'cat-lenses-444', name: 'Lenses & Optics', code: 'LNS' },
  { id: 'cat-tripods-555', name: 'Tripods & Supports', code: 'TRP' },
  { id: 'cat-video-666', name: 'Video Equipment', code: 'VID' },
  { id: 'cat-drones-777', name: 'Drones & Aerial', code: 'DRN' },
  { id: 'cat-projectors-888', name: 'Projectors & Displays', code: 'PRJ' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-camera-111', category_id: 'cat-cameras-111', name: 'Professional Camera Kit', sku: 'PROD-CAM-01', description: 'High-end cinema camera with prime lenses.', rental_type: 'rentable', status: 'active' },
  { id: 'prod-audio-222', category_id: 'cat-audio-222', name: 'Wireless Lavalier Mic Kit', sku: 'PROD-AUD-01', description: 'Dual-channel wireless mic with noise-canceling.', rental_type: 'rentable', status: 'active' },
  { id: 'prod-lighting-333', category_id: 'cat-lighting-333', name: 'LED Studio Panel Light', sku: 'PROD-LGT-01', description: 'Bi-color dimmable LED panel for studio use.', rental_type: 'rentable', status: 'active' },
  { id: 'prod-lenses-444', category_id: 'cat-lenses-444', name: 'Cinema Prime Lens Kit', sku: 'PROD-LNS-01', description: 'F1.4 prime lens set with focus gears.', rental_type: 'rentable', status: 'active' },
  { id: 'prod-tripods-555', category_id: 'cat-tripods-555', name: 'Carbon Fiber Tripod', sku: 'PROD-TRP-01', description: 'Ultra-lightweight legs with fluid head.', rental_type: 'rentable', status: 'active' },
  { id: 'prod-drones-777', category_id: 'cat-drones-777', name: 'GPS 4K Camera Drone', sku: 'PROD-DRN-01', description: 'Foldable drone with 3-axis gimbal camera.', rental_type: 'rentable', status: 'active' },
];

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; iconBg: string }> = {
  CAM: { bg: 'bg-sky-50',    accent: 'text-sky-600',    iconBg: 'bg-sky-100' },
  AUD: { bg: 'bg-emerald-50', accent: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  LGT: { bg: 'bg-amber-50',  accent: 'text-amber-600',  iconBg: 'bg-amber-100' },
  LNS: { bg: 'bg-rose-50',   accent: 'text-rose-600',   iconBg: 'bg-rose-100' },
  TRP: { bg: 'bg-teal-50',   accent: 'text-teal-600',   iconBg: 'bg-teal-100' },
  VID: { bg: 'bg-purple-50', accent: 'text-purple-600', iconBg: 'bg-purple-100' },
  DRN: { bg: 'bg-blue-50',   accent: 'text-blue-600',   iconBg: 'bg-blue-100' },
  PRJ: { bg: 'bg-indigo-50', accent: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  'D-CAM': { bg: 'bg-sky-50',    accent: 'text-sky-600',    iconBg: 'bg-sky-100' },
  'D-AUD': { bg: 'bg-emerald-50', accent: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  'D-DRN': { bg: 'bg-blue-50',   accent: 'text-blue-600',   iconBg: 'bg-blue-100' },
  'D-LPT': { bg: 'bg-gray-50',   accent: 'text-gray-600',   iconBg: 'bg-gray-100' },
  'D-GAM': { bg: 'bg-red-50',    accent: 'text-red-600',    iconBg: 'bg-red-100' },
  'D-FURN': { bg: 'bg-orange-50',accent: 'text-orange-600', iconBg: 'bg-orange-100' },
  'D-TVP': { bg: 'bg-pink-50',   accent: 'text-pink-600',   iconBg: 'bg-pink-100' },
  'D-WRB': { bg: 'bg-lime-50',   accent: 'text-lime-600',   iconBg: 'bg-lime-100' },
  'D-HAPP': { bg: 'bg-cyan-50',  accent: 'text-cyan-600',   iconBg: 'bg-cyan-100' },
  'D-EVT': { bg: 'bg-fuchsia-50',accent: 'text-fuchsia-600',iconBg: 'bg-fuchsia-100' },
  LPT: { bg: 'bg-gray-50',   accent: 'text-gray-600',   iconBg: 'bg-gray-100' },
  GAM: { bg: 'bg-red-50',    accent: 'text-red-600',    iconBg: 'bg-red-100' },
  FURN: { bg: 'bg-orange-50',accent: 'text-orange-600', iconBg: 'bg-orange-100' },
  TVP: { bg: 'bg-pink-50',   accent: 'text-pink-600',   iconBg: 'bg-pink-100' },
  WRB: { bg: 'bg-lime-50',   accent: 'text-lime-600',   iconBg: 'bg-lime-100' },
  HAPP: { bg: 'bg-cyan-50',  accent: 'text-cyan-600',   iconBg: 'bg-cyan-100' },
  EVT: { bg: 'bg-fuchsia-50',accent: 'text-fuchsia-600',iconBg: 'bg-fuchsia-100' },
};

const PROD_COLORS: Record<string, { bg: string; badge: string }> = {
  CAM: { bg: 'bg-sky-50',    badge: 'bg-sky-100 text-sky-700' },
  AUD: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  LGT: { bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700' },
  LNS: { bg: 'bg-rose-50',   badge: 'bg-rose-100 text-rose-700' },
  TRP: { bg: 'bg-teal-50',   badge: 'bg-teal-100 text-teal-700' },
  VID: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  DRN: { bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
  PRJ: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
  'D-CAM': { bg: 'bg-sky-50',    badge: 'bg-sky-100 text-sky-700' },
  'D-AUD': { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  'D-DRN': { bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
  'D-LPT': { bg: 'bg-gray-50',   badge: 'bg-gray-100 text-gray-700' },
  'D-GAM': { bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700' },
  'D-FURN': { bg: 'bg-orange-50',badge: 'bg-orange-100 text-orange-700' },
  'D-TVP': { bg: 'bg-pink-50',   badge: 'bg-pink-100 text-pink-700' },
  'D-WRB': { bg: 'bg-lime-50',   badge: 'bg-lime-100 text-lime-700' },
  'D-HAPP': { bg: 'bg-cyan-50',  badge: 'bg-cyan-100 text-cyan-700' },
  'D-EVT': { bg: 'bg-fuchsia-50',badge: 'bg-fuchsia-100 text-fuchsia-700' },
  LPT: { bg: 'bg-gray-50',   badge: 'bg-gray-100 text-gray-700' },
  GAM: { bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700' },
  FURN: { bg: 'bg-orange-50',badge: 'bg-orange-100 text-orange-700' },
  TVP: { bg: 'bg-pink-50',   badge: 'bg-pink-100 text-pink-700' },
  WRB: { bg: 'bg-lime-50',   badge: 'bg-lime-100 text-lime-700' },
  HAPP: { bg: 'bg-cyan-50',  badge: 'bg-cyan-100 text-cyan-700' },
  EVT: { bg: 'bg-fuchsia-50',badge: 'bg-fuchsia-100 text-fuchsia-700' },
};

const getSkuCode = (sku: string) => {
  const match = (sku || '').toUpperCase().match(/(?:PROD|SKU)-(?:D-)?([A-Z]+)-/);
  return match ? match[1] : 'GEN';
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/storefront/categories'),
          apiClient.get('/storefront/products'),
        ]);
        const catData = catRes as unknown as Category[];
        const prodData = prodRes as unknown as Product[];
        setCategories(catData?.length > 0 ? catData : MOCK_CATEGORIES);
        const active = (prodData || []).filter(p => p.status === 'active' || p.status === 'ACTIVE');
        setFeaturedProducts(active.length > 0 ? active.slice(0, 6) : MOCK_PRODUCTS);
      } catch {
        setCategories(MOCK_CATEGORIES);
        setFeaturedProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/store?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ══════════════════════════════════════════
          HEADER — sticky white with shadow on scroll
      ══════════════════════════════════════════ */}
      <header className={`fixed top-0 inset-x-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Brand */}
          <Logo size="md" isLink={true} linkTo="/" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/store" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Browse Rentals</Link>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#for-vendors" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">For Vendors</a>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Log In</Link>
            <Link to="/signup" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">Get Started</Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 font-semibold text-gray-700 rounded-lg hover:bg-gray-50">Browse Rentals</Link>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 font-semibold text-gray-700 rounded-lg hover:bg-gray-50">How It Works</a>
              <a href="#for-vendors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 font-semibold text-gray-700 rounded-lg hover:bg-gray-50">For Vendors</a>
              <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Log In</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          HERO — white background, left copy, right product showcase
      ══════════════════════════════════════════ */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

            {/* Left: Copy + Search */}
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                The Smarter Way to Rent
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
                Find What You Need.<br />
                <span className="text-blue-600">Rent It. Done.</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                Discover products from rental businesses, choose what works for you, and manage your rental from one simple platform.
              </p>

              {/* Marketplace Search Bar */}
              <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] border border-gray-200 p-2 flex flex-col sm:flex-row gap-2 mb-6">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none"
                  />
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-gray-200 mx-1"></div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="sm:w-44 bg-transparent text-gray-600 text-sm font-medium py-3 px-3 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/store" className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                  Browse Rentals <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link to="/vendor-signup" className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                  Become a Vendor
                </Link>
              </div>
            </div>

            {/* Right: Product Card Showcase */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Featured large card — Camera */}
                <div className="col-span-1 bg-violet-50 rounded-2xl p-3 shadow-sm border border-violet-100 group hover:shadow-lg transition-all">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-violet-100">
                    <img
                      src="/images/hero-camera.jpg"
                      alt="Professional Camera Kit"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Cameras</div>
                  <div className="text-sm font-extrabold text-gray-900 leading-tight">Professional Camera Kit</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-base font-black text-blue-600">from $120<span className="text-xs font-semibold text-gray-400">/day</span></div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
                  </div>
                </div>

                {/* Two smaller stacked cards */}
                <div className="col-span-1 flex flex-col gap-4">
                  {/* LED Panel */}
                  <div className="bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-700 group hover:shadow-lg transition-all">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-800">
                      <img
                        src="/images/hero-led-panel.jpg"
                        alt="LED Studio Panel Light"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Lighting</div>
                    <div className="text-xs font-bold text-white leading-tight">LED Studio Panel</div>
                    <div className="text-sm font-black text-blue-400 mt-1">$45<span className="text-[10px] font-semibold text-gray-500">/day</span></div>
                  </div>

                  {/* HDMI Transmitter */}
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 group hover:shadow-lg transition-all">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
                      <img
                        src="/images/hero-hdmi-transmitter.jpg"
                        alt="HDMI Wireless Transmitter"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">Video</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">4K HDMI Transmitter</div>
                    <div className="text-sm font-black text-blue-600 mt-1">$35<span className="text-[10px] font-semibold text-gray-400">/day</span></div>
                  </div>
                </div>
              </div>

              {/* Floating feature badge */}
              <div className="absolute -bottom-4 left-4 right-4 flex justify-center gap-3 flex-wrap">
                {['Easy Booking', 'Verified Vendors', 'Flexible Rentals'].map(label => (
                  <div key={label} className="bg-white shadow-lg border border-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />{label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════ */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: MagnifyingGlassIcon, label: 'Easy Rental Discovery', sub: 'Find what you need fast' },
              { icon: ShieldCheckIcon, label: 'Managed Inventory', sub: 'Verified product catalog' },
              { icon: ClockIcon, label: 'Flexible Durations', sub: 'Daily, weekly or monthly' },
              { icon: TagIcon, label: 'Secure Checkout', sub: 'Safe, structured payments' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-gray-800">{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EXPLORE CATEGORIES
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-blue-300"></span>Categories<span className="w-6 h-px bg-blue-300"></span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Explore What You Can Rent</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Find the right equipment, products and essentials for your next project.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.code] || { bg: 'bg-gray-50', accent: 'text-gray-600', iconBg: 'bg-gray-100' };
              const imgSrc = CATEGORY_IMAGES[cat.code];
              return (
                <Link
                  key={cat.id}
                  to={`/store?category=${cat.id}`}
                  className={`group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${colors.iconBg} flex items-center justify-center`}>
                        <span className="text-2xl font-black text-gray-300">{cat.code}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className={`text-sm font-extrabold ${colors.accent} mb-0.5`}>{cat.name}</div>
                    <div className="text-xs text-gray-400 font-medium">Browse &rarr;</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/store" className="inline-flex items-center gap-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              View All Rentals <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED RENTALS
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
                <span className="w-6 h-px bg-blue-300"></span>Featured<span className="w-6 h-px bg-blue-300"></span>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Popular Rentals</h2>
              <p className="text-gray-500 mt-2">Explore products customers are renting.</p>
            </div>
            <Link to="/store" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
              {featuredProducts.slice(0, 6).map(product => {
                const code = getSkuCode(product.sku);
                const colors = PROD_COLORS[code] || { bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700' };
                const imgSrc = PRODUCT_IMAGES[code];
                return (
                  <Link
                    key={product.id}
                    to={`/store/product/${product.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                          <span className="text-2xl font-black text-gray-200">{code}</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${colors.badge} px-2 py-0.5 rounded-full mb-2 self-start`}>
                        {code}
                      </span>
                      <h3 className="text-sm font-extrabold text-gray-900 leading-tight mb-1 line-clamp-2 flex-1">{product.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-base font-black text-blue-600">Contact for rate</div>
                        <span className="text-xs font-bold text-blue-500 group-hover:text-blue-700 transition-colors">View &rarr;</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link to="/store" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm">
              View All Rentals <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-blue-300"></span>Process<span className="w-6 h-px bg-blue-300"></span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">How Renting Works</h2>
            <p className="text-gray-500 mt-3 text-lg">Simple. Fast. Done.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[calc(33%-24px)] right-[calc(33%-24px)] h-0.5 bg-gray-200 z-0"></div>

            {[
              { step: '01', title: 'Discover', body: 'Find the product you need from the rental catalog.', icon: MagnifyingGlassIcon, color: 'bg-blue-600' },
              { step: '02', title: 'Book', body: 'Choose your variant, quantity and rental period.', icon: CheckCircleIcon, color: 'bg-blue-700' },
              { step: '03', title: 'Enjoy', body: 'Complete delivery/payment and manage your rental.', icon: StarIcon, color: 'bg-blue-800' },
            ].map(({ step, title, body, icon: Icon, color }) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">{step}</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROBLEM / SOLUTION
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-blue-300"></span>Why RMS<span className="w-6 h-px bg-blue-300"></span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Renting Should Be Simple.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
              <h3 className="text-sm font-extrabold text-red-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-600 text-xs font-black">✕</span>
                Without RMS
              </h3>
              <ul className="space-y-3.5">
                {['Scattered product listings across platforms', 'Unclear availability and inventory status', 'Manual coordination and booking', 'Hard-to-track rental lifecycles', 'Disconnected vendor communication'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-red-800">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
              <h3 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-xs font-black">✓</span>
                With RMS
              </h3>
              <ul className="space-y-3.5">
                {['Centralized product discovery in one place', 'Real-time inventory visibility', 'Seamless online booking & checkout', 'Full rental lifecycle management', 'Payments, invoices & tracking built-in'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-blue-900">
                    <CheckCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CUSTOMER + VENDOR SECTIONS
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-6 h-px bg-blue-300"></span>For Everyone<span className="w-6 h-px bg-blue-300"></span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Built for Customers and Vendors</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">For Customers</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Everything You Need to Rent With Confidence</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">From discovery to doorstep, manage your entire rental journey in one place.</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Discover products', 'Compare options', 'Configure variants', 'Select rental dates', 'Add to cart', 'Track orders'].map(feat => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    <CheckCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>

              <Link to="/store" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
                Start Renting <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Vendor Card */}
            <div id="for-vendors" className="bg-gray-900 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center border border-blue-700">
                    <BuildingStorefrontIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">For Vendors</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">Own Rental Inventory?<br/>Turn It Into a Business.</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">RMS gives you the tools to list, manage and grow your rental inventory while keeping operations organized.</p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: CubeIcon, label: 'Products' },
                    { icon: ChartBarIcon, label: 'Analytics' },
                    { icon: UsersIcon, label: 'Customers' },
                    { icon: DocumentTextIcon, label: 'Reports' },
                    { icon: ArrowTrendingUpIcon, label: 'Revenue' },
                    { icon: CurrencyDollarIcon, label: 'Payments' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
                      <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/vendor-signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-900/50">
                    Become a Vendor
                  </Link>
                  <Link to="/login" className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors">
                    Vendor Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST CARDS
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">The RMS Advantage</h2>
            <p className="text-blue-200 text-sm">Built to simplify rentals for everyone on the platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CubeIcon, title: 'One Platform', body: 'Customers, vendors and operations in one connected ecosystem.' },
              { icon: ChartBarIcon, title: 'Real-Time Visibility', body: 'Know what is available, rented, allocated and returned.' },
              { icon: ShieldCheckIcon, title: 'Secure & Organized', body: 'Transactions, invoices and payments kept perfectly structured.' },
              { icon: ArrowTrendingUpIcon, title: 'Built for Growth', body: 'Tools to support vendors as their rental inventory grows.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-colors">
                <Icon className="w-7 h-7 text-blue-200 mb-4" />
                <h3 className="text-base font-extrabold mb-2">{title}</h3>
                <p className="text-blue-100 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">
            <span className="w-6 h-px bg-blue-300"></span>Get Started<span className="w-6 h-px bg-blue-300"></span>
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Ready to Rent Smarter?</h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Discover what you need or start growing your rental business with RMS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/store" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg shadow-blue-200 text-base">
              Browse Rentals
            </Link>
            <Link to="/vendor-signup" className="w-full sm:w-auto border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold py-4 px-10 rounded-xl transition-colors text-base">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <Logo size="sm" isLink={true} linkTo="/" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">Rental management, simplified for customers and vendors.</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link to="/store" className="hover:text-blue-600 transition-colors">Browse Rentals</Link></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><Link to="/vendor-signup" className="hover:text-blue-600 transition-colors">Become a Vendor</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Customers</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Sign Up</Link></li>
                <li><Link to="/store" className="hover:text-blue-600 transition-colors">Browse Rentals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Vendors</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Vendor Login</Link></li>
                <li><Link to="/vendor-signup" className="hover:text-blue-600 transition-colors">Registration</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Analytics</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Rental Management System. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/login" className="hover:text-blue-500">Login</Link>
              <span>·</span>
              <Link to="/signup" className="hover:text-blue-500">Sign Up</Link>
              <span>·</span>
              <Link to="/store" className="hover:text-blue-500">Browse Rentals</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
