import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../errors';

/**
 * requireAuth — ensures a valid JWT was provided and userId is set in context.
 * Returns 401 if the request is unauthenticated.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context || !req.context.userId) {
    return next(new AuthenticationError('Authentication required. Please sign in to continue.'));
  }
  next();
};

/**
 * requireRole — ensures the authenticated user has one of the allowed roles.
 * Returns 401 if unauthenticated, 403 if authenticated but wrong role.
 * 
 * Usage: router.get('/admin/users', requireAuth, requireRole('admin'), handler)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.context || !req.context.userId) {
      return next(new AuthenticationError('Authentication required. Please sign in to continue.'));
    }

    const userRole = req.context.role || '';
    if (!roles.includes(userRole)) {
      return next(
        new AuthorizationError(
          `Access denied. This area requires one of: [${roles.join(', ')}]. Your role: ${userRole || 'none'}.`
        )
      );
    }

    next();
  };
};

/**
 * requireOrganizationAccess — ensures the authenticated user has an organizationId.
 * This is the tenant boundary guard.
 */
export const requireOrganizationAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context || !req.context.userId) {
    return next(new AuthenticationError('Authentication required.'));
  }
  if (!req.context.organizationId) {
    return next(new AuthorizationError('Tenant organization context is required.'));
  }
  next();
};
