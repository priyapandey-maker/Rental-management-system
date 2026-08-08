import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { DbConfig, getDbConfig } from '../config/db.config';

let poolInstance: Pool | null = null;

export function getPool(overrideConfig?: DbConfig): Pool {
  if (!poolInstance) {
    const config = overrideConfig || getDbConfig();
    poolInstance = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: config.waitForConnections,
      connectionLimit: config.connectionLimit,
      queueLimit: config.queueLimit,
      connectTimeout: config.connectTimeout,
      socketPath: config.socketPath,
      dateStrings: true,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });
  }
  return poolInstance;
}

export async function testConnection(pool?: Pool): Promise<boolean> {
  const targetPool = pool || getPool();
  let connection: PoolConnection | null = null;
  try {
    connection = await targetPool.getConnection();
    await connection.ping();
    return true;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DB Error] Connection test failed: ${errMessage}`);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>,
  pool?: Pool
): Promise<T> {
  const targetPool = pool || getPool();
  const connection = await targetPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
