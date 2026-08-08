import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../errors';

// Enforces that a request has a valid tenant (organizationId) context.
export const requireTenantContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context || !req.context.userId) {
    return next(new AuthenticationError('Authentication required to access tenant resources'));
  }

  if (!req.context.organizationId) {
    return next(new AuthorizationError('Tenant organization context is required'));
  }

  next();
};
