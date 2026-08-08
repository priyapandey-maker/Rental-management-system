import { createApp } from './app';
import { getAppConfig } from './config/app.config';
import { logger } from './utils/logger';
import { testConnection } from './db/pool';

async function bootstrap() {
  try {
    const config = getAppConfig();
    
    logger.info('Starting Application Foundation...');

    // Verify Database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed on startup');
    }
    logger.info('Database connected successfully');

    const app = createApp();

    app.listen(config.port, () => {
      logger.info(`Rental Management System server started on port ${config.port}`, {
        env: config.env,
      });
    });
  } catch (error) {
    logger.error('Failed to bootstrap application', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

bootstrap();
