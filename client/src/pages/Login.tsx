import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter a valid email address and password.');
      return;
    }

    try {
      const response: any = await apiClient.post('/auth/login', { email, password });
      
      // Store the real JWT and user context
      login(response.user.id, response.user.organizationId, response.user.role, response.token);
      
      // Route based on role
      if (response.user.role === 'vendor' || response.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/store');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Rental Management</h2>
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Customer Login</h3>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/30 text-red-400 text-sm rounded-xl border border-red-800/50 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Log In
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm border-t border-gray-800 pt-6 space-y-3">
            <div>
              <span className="text-gray-400 font-medium">Don't have an account? </span>
              <Link to="/signup" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
                Register Here
              </Link>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Are you a vendor? </span>
              <Link to="/vendor-signup" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
                Vendor Portal
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
