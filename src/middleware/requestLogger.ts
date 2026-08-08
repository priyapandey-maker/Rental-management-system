import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Initialize context if it doesn't exist
  if (!req.context) {
    req.context = { requestId: crypto.randomUUID() };
  } else if (!req.context.requestId) {
    req.context.requestId = crypto.randomUUID();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId: req.context.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      organizationId: req.context.organizationId || 'unauthenticated',
    });
  });

  next();
};
