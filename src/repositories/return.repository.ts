import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface ReturnInsert {
  id: string;
  organization_id: string;
  transaction_id: string;
  status: 'PENDING' | 'RECEIVED';
  returned_at: string | null;
  received_by: string | null;
}

export interface ReturnRow extends ReturnInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface ReturnLineInsert {
  id: string;
  organization_id: string;
  return_id: string;
  asset_allocation_id: string;
}

export interface ReturnLineRow extends ReturnLineInsert, RowDataPacket {
  created_at: string;
}

export class ReturnRepository extends BaseRepository {
  async create(data: ReturnInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_returns (id, organization_id, transaction_id, status, returned_at, received_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.transaction_id, data.status, data.returned_at, data.received_by],
      conn
    );
  }

  async findById(id: string, orgId: string, conn?: QueryConnection): Promise<ReturnRow | null> {
    const sql = `SELECT * FROM rental_returns WHERE id = ? AND organization_id = ?`;
    return this.queryOne<ReturnRow>(sql, [id, orgId], conn);
  }

  async findByTransactionId(txId: string, orgId: string, conn?: QueryConnection): Promise<ReturnRow | null> {
    const sql = `SELECT * FROM rental_returns WHERE transaction_id = ? AND organization_id = ?`;
    return this.queryOne<ReturnRow>(sql, [txId, orgId], conn);
  }

  async createLine(data: ReturnLineInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_return_lines (id, organization_id, return_id, asset_allocation_id)
      VALUES (?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.return_id, data.asset_allocation_id],
      conn
    );
  }

  async listLines(returnId: string, orgId: string, conn?: QueryConnection): Promise<ReturnLineRow[]> {
    const sql = `SELECT * FROM rental_return_lines WHERE return_id = ? AND organization_id = ?`;
    return this.query<ReturnLineRow[]>(sql, [returnId, orgId], conn);
  }

  async findLineById(id: string, orgId: string, conn?: QueryConnection): Promise<ReturnLineRow | null> {
    const sql = `SELECT * FROM rental_return_lines WHERE id = ? AND organization_id = ?`;
    return this.queryOne<ReturnLineRow>(sql, [id, orgId], conn);
  }
}
