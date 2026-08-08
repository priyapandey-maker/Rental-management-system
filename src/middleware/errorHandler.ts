import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.context?.requestId || 'unknown';

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Application Error', err, { requestId });
    } else {
      logger.warn('Operational Error', { requestId, message: err.message, statusCode: err.statusCode });
    }

    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        requestId,
      },
    });
  }

  // Unhandled/Unexpected Errors
  logger.error('Unexpected Internal Error', err, { requestId });

  return res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      statusCode: 500,
      requestId,
    },
  });
};
