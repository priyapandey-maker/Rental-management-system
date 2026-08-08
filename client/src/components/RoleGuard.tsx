import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard — protects routes by role.
 *
 * - If loading: shows a spinner (prevents auth flash).
 * - If not authenticated: redirects to /login.
 * - If authenticated but wrong role: redirects to the correct portal or shows 403.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, redirectTo }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Route user to their correct portal
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
    if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    if (role === 'customer') return <Navigate to="/store" replace />;
    // Fallback — not authenticated properly
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute — redirects already-authenticated users to their portal.
 * Use this to wrap /login, /signup so logged-in users are bounced to their dashboard.
 */
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
    if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    return <Navigate to="/store" replace />;
  }

  return <>{children}</>;
};
