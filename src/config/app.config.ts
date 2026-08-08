import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  env: string;
  corsOrigin: string;
}

export function getAppConfig(): AppConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  const env = process.env.NODE_ENV || 'development';
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: "${process.env.PORT}"`);
  }

  return {
    port,
    env,
    corsOrigin,
  };
}
