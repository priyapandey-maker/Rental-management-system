import { Router } from 'express';

export const appRouter = Router();

// Health check endpoint
appRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Future domain routes will be registered here (e.g., customers, assets, rentals).
