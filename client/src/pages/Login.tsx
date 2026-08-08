import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Login = () => {
  // Using demo UUIDs as default to maintain backend contract compatibility
  const [loginId, setLoginId] = useState('demo-user-uuid');
  const [password, setPassword] = useState('demo-org-uuid');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // loginId is treated as email
      const response = await apiClient.post('/auth/login', { email: loginId, password });
      login(response.data.user.id, response.data.user.organizationId, response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid login credentials');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <h3 className="text-xl font-bold text-white text-center mb-6">Sign In</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded-md border border-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="loginId" className="block text-sm font-medium text-gray-300">
          Login ID (Email or User UUID)
        </label>
        <div className="mt-1">
          <input
            id="loginId"
            type="text"
            required
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your login ID"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password (Org UUID for demo)
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log In
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-400">Don't have an account? </span>
        <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
          Register Here
        </Link>
      </div>
    </form>
  );
};
