import { Request, Response, NextFunction } from 'express';

// Infrastructure hook for Authentication Context.
// In this foundation package, we provide the hook that future security packages will implement.
// For now, it simply looks for dummy headers to simulate authenticated states for early development,
// OR passes through if unauthenticated (relying on downstream guards).
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rental_demo_jwt_secret_hackathon';

export const authContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context) {
    req.context = { requestId: 'unknown' };
  }

  // 1. Try JWT
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.userId) req.context.userId = payload.userId;
      if (payload.orgId) req.context.organizationId = payload.orgId;
      if (payload.role) req.context.role = payload.role;
      return next();
    } catch (err) {
      // Ignore JWT errors and fallback, or let it pass unauthenticated
    }
  }

  // 2. Fallback to dummy headers for tests / seeded demo user
  const userId = req.header('x-user-id');
  const organizationId = req.header('x-organization-id');
  const role = req.header('x-role');

  if (userId) req.context.userId = userId;
  if (organizationId) req.context.organizationId = organizationId;
  if (role) req.context.role = role;

  next();
};
