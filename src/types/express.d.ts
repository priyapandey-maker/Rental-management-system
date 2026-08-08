import { Request } from 'express';

export interface RequestContext {
  userId?: string;
  organizationId?: string;
  role?: string;
  requestId: string;
}

declare global {
  namespace Express {
    export interface Request {
      context: RequestContext;
    }
  }
}
