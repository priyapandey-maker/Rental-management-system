import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setResetLink(null);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccess(response.data.message);
      if (response.data.demoResetToken) {
        setResetLink(`/reset-password?token=${response.data.demoResetToken}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleReset}>
      <div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Reset Password</h3>
        <p className="text-gray-500 text-sm text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
          <p className="mb-2">{success}</p>
          {resetLink && (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-300">
              <p className="text-gray-600 text-xs mb-1">DEMO MODE - Reset link generated locally:</p>
              <Link to={resetLink} className="text-brand-600 font-bold hover:underline break-all">
                Click here to reset password
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Email ID</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm shadow-sm"
            placeholder="Enter your email"
          />
        </div>
      )}

      {!success && (
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            Send Reset Link
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Remembered your password? </span>
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log In
        </Link>
      </div>
    </form>
  );
};
