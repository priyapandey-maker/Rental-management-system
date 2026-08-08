import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
  waitForConnections: boolean;
  queueLimit: number;
  connectTimeout: number;
  socketPath?: string;
}

export function getDbConfig(): DbConfig {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'rental_management_db';
  const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10);
  const socketPath = process.env.DB_SOCKET_PATH;

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid DB_PORT environment variable: "${process.env.DB_PORT}"`);
  }

  if (isNaN(connectionLimit) || connectionLimit <= 0) {
    throw new Error(`Invalid DB_CONNECTION_LIMIT environment variable: "${process.env.DB_CONNECTION_LIMIT}"`);
  }

  const config: DbConfig = {
    host,
    port,
    user,
    password,
    database,
    connectionLimit,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
  };

  if (socketPath) {
    config.socketPath = socketPath;
  }

  return config;
}
