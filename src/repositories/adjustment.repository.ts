import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface AdjustmentInsert {
  id: string;
  organization_id: string;
  transaction_id: string;
  asset_id: string | null;
  reason: string;
  amount: string;
  status: 'PENDING' | 'APPLIED' | 'WAIVED' | 'PAID';
}

export interface AdjustmentRow extends AdjustmentInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class AdjustmentRepository extends BaseRepository {
  async create(data: AdjustmentInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_adjustments (id, organization_id, transaction_id, asset_id, reason, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.transaction_id, data.asset_id, data.reason, data.amount, data.status],
      conn
    );
  }

  async findById(id: string, orgId: string, conn?: QueryConnection): Promise<AdjustmentRow | null> {
    const sql = `SELECT * FROM rental_adjustments WHERE id = ? AND organization_id = ?`;
    return this.queryOne<AdjustmentRow>(sql, [id, orgId], conn);
  }

  async listByTransactionId(txId: string, orgId: string, conn?: QueryConnection): Promise<AdjustmentRow[]> {
    const sql = `SELECT * FROM rental_adjustments WHERE transaction_id = ? AND organization_id = ? ORDER BY created_at DESC`;
    return this.query<AdjustmentRow[]>(sql, [txId, orgId], conn);
  }

  async updateStatus(id: string, orgId: string, status: string, conn?: QueryConnection): Promise<void> {
    const sql = `UPDATE rental_adjustments SET status = ? WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [status, id, orgId], conn);
  }
}
