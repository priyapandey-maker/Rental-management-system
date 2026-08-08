import { Request, Response, NextFunction } from 'express';

// Infrastructure hook for Authentication Context.
// In this foundation package, we provide the hook that future security packages will implement.
// For now, it simply looks for dummy headers to simulate authenticated states for early development,
// OR passes through if unauthenticated (relying on downstream guards).
export const authContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.context) {
    req.context = { requestId: 'unknown' };
  }

  const userId = req.header('x-user-id');
  const organizationId = req.header('x-organization-id');
  const role = req.header('x-role');

  if (userId) req.context.userId = userId;
  if (organizationId) req.context.organizationId = organizationId;
  if (role) req.context.role = role;

  next();
};
