import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rental_demo_jwt_secret_hackathon';

/**
 * authContext middleware — populates req.context from a valid JWT Bearer token.
 * The x-user-id/x-role header fallback has been intentionally removed to prevent
 * identity spoofing. All protected routes must supply a valid JWT.
 */
export const authContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context) {
    req.context = { requestId: 'unknown' };
  }

  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.userId) req.context.userId = payload.userId;
      if (payload.orgId) req.context.organizationId = payload.orgId;
      if (payload.role) req.context.role = payload.role;
    } catch {
      // Invalid token — context remains unauthenticated; downstream guards will reject.
    }
  }

  next();
};
