import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface AllocationInsert {
  id: string;
  organization_id: string;
  transaction_line_id: string;
  asset_id: string;
  status: 'ALLOCATED' | 'FULFILLED' | 'RETURNED' | 'CANCELLED';
  quantity: number;
}

export interface AllocationRow extends AllocationInsert, RowDataPacket {
  allocated_at: string;
  created_at: string;
  updated_at: string;
}

export class AllocationRepository extends BaseRepository {
  async create(data: AllocationInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO asset_allocations (id, organization_id, transaction_line_id, asset_id, status, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.transaction_line_id, data.asset_id, data.status, data.quantity],
      conn
    );
  }

  async findById(id: string, orgId: string, conn?: QueryConnection): Promise<AllocationRow | null> {
    const sql = `SELECT * FROM asset_allocations WHERE id = ? AND organization_id = ?`;
    return this.queryOne<AllocationRow>(sql, [id, orgId], conn);
  }

  async listByTransactionLineId(lineId: string, orgId: string, conn?: QueryConnection): Promise<AllocationRow[]> {
    const sql = `SELECT * FROM asset_allocations WHERE transaction_line_id = ? AND organization_id = ?`;
    return this.query<AllocationRow[]>(sql, [lineId, orgId], conn);
  }

  async listByTransactionId(txId: string, orgId: string, conn?: QueryConnection): Promise<AllocationRow[]> {
    const sql = `
      SELECT a.* FROM asset_allocations a
      JOIN rental_transaction_lines l ON a.transaction_line_id = l.id
      WHERE l.transaction_id = ? AND a.organization_id = ?
    `;
    return this.query<AllocationRow[]>(sql, [txId, orgId], conn);
  }

  async updateStatus(id: string, orgId: string, status: string, conn?: QueryConnection): Promise<void> {
    const sql = `UPDATE asset_allocations SET status = ? WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [status, id, orgId], conn);
  }

  async findTransactionLineById(lineId: string, orgId: string, conn?: QueryConnection): Promise<any | null> {
    const sql = `SELECT * FROM rental_transaction_lines WHERE id = ? AND organization_id = ?`;
    return this.queryOne<any>(sql, [lineId, orgId], conn);
  }
}
