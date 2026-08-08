import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface FulfillmentInsert {
  id: string;
  organization_id: string;
  transaction_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  fulfilled_at: string | null;
  fulfilled_by: string | null;
}

export interface FulfillmentRow extends FulfillmentInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface FulfillmentLineInsert {
  id: string;
  organization_id: string;
  fulfillment_id: string;
  asset_allocation_id: string;
}

export interface FulfillmentLineRow extends FulfillmentLineInsert, RowDataPacket {
  created_at: string;
}

export class FulfillmentRepository extends BaseRepository {
  async create(data: FulfillmentInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_fulfillments (id, organization_id, transaction_id, status, fulfilled_at, fulfilled_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.transaction_id, data.status, data.fulfilled_at, data.fulfilled_by],
      conn
    );
  }

  async findById(id: string, orgId: string, conn?: QueryConnection): Promise<FulfillmentRow | null> {
    const sql = `SELECT * FROM rental_fulfillments WHERE id = ? AND organization_id = ?`;
    return this.queryOne<FulfillmentRow>(sql, [id, orgId], conn);
  }

  async findByTransactionId(txId: string, orgId: string, conn?: QueryConnection): Promise<FulfillmentRow | null> {
    const sql = `SELECT * FROM rental_fulfillments WHERE transaction_id = ? AND organization_id = ?`;
    return this.queryOne<FulfillmentRow>(sql, [txId, orgId], conn);
  }

  async createLine(data: FulfillmentLineInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_fulfillment_lines (id, organization_id, fulfillment_id, asset_allocation_id)
      VALUES (?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [data.id, data.organization_id, data.fulfillment_id, data.asset_allocation_id],
      conn
    );
  }

  async listLines(fulfillmentId: string, orgId: string, conn?: QueryConnection): Promise<FulfillmentLineRow[]> {
    const sql = `SELECT * FROM rental_fulfillment_lines WHERE fulfillment_id = ? AND organization_id = ?`;
    return this.query<FulfillmentLineRow[]>(sql, [fulfillmentId, orgId], conn);
  }
}
