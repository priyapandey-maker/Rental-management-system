import { PoolConnection } from 'mysql2/promise';
import { withTransaction as poolWithTransaction } from './pool';

/**
 * Reusable transaction boundary orchestration.
 * Wraps service layer operations safely inside an active transaction.
 *
 * It will commit if the callback resolves, and will rollback if the callback throws.
 */
export async function runInTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  return poolWithTransaction(callback);
}
