import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

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
      const response = await apiClient.post('/auth/reset-password', { token, password });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleReset}>
      <div>
        <h3 className="text-xl font-bold text-white text-center mb-6">Create New Password</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded-md border border-red-800">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 bg-green-900/50 text-green-200 text-sm rounded-md border border-green-800">
          <p>{success}. Redirecting to login...</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              disabled={!token}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              disabled={!token}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!token}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Password
            </button>
          </div>
        </>
      )}

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
          Back to Log In
        </Link>
      </div>
    </form>
  );
};
