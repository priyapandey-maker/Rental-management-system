import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [couponCode, setCouponCode] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    if (pass.length < 6 || pass.length > 12) return 'Password must be 6-12 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'Password must contain at least one special character.';
    return null;
  };

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,12})/;
    if (!passwordRegex.test(password)) {
      setError('Password does not meet requirements');
      return;
    }

    try {
      await apiClient.post('/auth/register', { email, password, firstName, lastName });
      setSuccess('Registration successful! Please log in to continue. Note: Coupon Code was not saved (unsupported by backend).');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <div>
        <h3 className="text-xl font-bold text-white text-center mb-6">User Registration</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded-md border border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/50 text-green-200 text-sm rounded-md border border-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Email ID</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Coupon Code <span className="text-gray-500 text-xs">(For new signup)</span></label>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Optional"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Register
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center space-y-2 text-sm">
        <div>
          <span className="text-gray-400">Are you a vendor? </span>
          <Link to="/vendor-signup" className="font-medium text-blue-400 hover:text-blue-300">
            Become a Vendor
          </Link>
        </div>
        <div>
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Log In
          </Link>
        </div>
      </div>
    </form>
  );
};
