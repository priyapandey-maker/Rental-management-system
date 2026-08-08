import { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../db/pool';

export type QueryConnection = Pool | PoolConnection;

export abstract class BaseRepository {
  /**
   * Helper to execute a raw SQL query.
   * If a connection (from a transaction) is provided, it uses it; otherwise, it uses the global pool.
   */
  protected async query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params: any[] = [],
    connection?: QueryConnection
  ): Promise<T> {
    const conn = connection || getPool();
    const [result] = await conn.query<T>(sql, params);
    return result;
  }

  /**
   * Helper to fetch a single row. Returns null if not found.
   */
  protected async queryOne<T extends RowDataPacket>(
    sql: string,
    params: any[] = [],
    connection?: QueryConnection
  ): Promise<T | null> {
    const result = await this.query<T[]>(sql, params, connection);
    return result.length > 0 ? result[0] : null;
  }
}
