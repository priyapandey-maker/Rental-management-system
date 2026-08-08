import express from 'express';
import cors from 'cors';
import { getAppConfig } from './config/app.config';
import { requestLogger } from './middleware/requestLogger';
import { authContext } from './middleware/authContext';
import { errorHandler } from './middleware/errorHandler';
import { appRouter } from './routes';

export const createApp = () => {
  const app = express();
  const config = getAppConfig();

  // 1. Basic Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // 2. Request & Tenant Context setup
  app.use(requestLogger);
  app.use(authContext);

  // 3. Application Routes
  app.use('/api/v1', appRouter);

  // 4. Error Handling (must be last)
  app.use(errorHandler);

  return app;
};
