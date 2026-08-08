import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface TransactionRow extends RowDataPacket {
  id: string;
  organization_id: string;
  customer_id: string;
  status: 'DRAFT' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  transaction_date: Date;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionLineRow extends RowDataPacket {
  id: string;
  organization_id: string;
  transaction_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  rental_start_date: Date;
  rental_end_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommercialSnapshotRow extends RowDataPacket {
  id: string;
  organization_id: string;
  transaction_line_id: string;
  pricelist_id: string | null;
  unit_price: string;
  deposit_amount: string;
  late_fee_rate: string;
  created_at: Date;
}

export class TransactionRepository extends BaseRepository {
  async createTransaction(data: { id: string, organization_id: string, customer_id: string, status: string, transaction_date: Date, created_by: string | null }, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_transactions (id, organization_id, customer_id, status, transaction_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.customer_id,
      data.status,
      data.transaction_date,
      data.created_by
    ], conn);
  }

  async findTransactionById(id: string, orgId: string, conn?: QueryConnection): Promise<TransactionRow | null> {
    const sql = `SELECT * FROM rental_transactions WHERE id = ? AND organization_id = ?`;
    return this.queryOne<TransactionRow>(sql, [id, orgId], conn);
  }

  async updateTransactionStatus(id: string, orgId: string, status: string, conn?: QueryConnection): Promise<void> {
    const sql = `UPDATE rental_transactions SET status = ? WHERE id = ? AND organization_id = ?`;
    await this.query(sql, [status, id, orgId], conn);
  }

  async listTransactions(orgId: string, conn?: QueryConnection): Promise<TransactionRow[]> {
    const sql = `SELECT * FROM rental_transactions WHERE organization_id = ? ORDER BY created_at DESC`;
    return this.query<TransactionRow[]>(sql, [orgId], conn);
  }

  async createTransactionLine(data: { id: string, organization_id: string, transaction_id: string, product_id: string, variant_id: string | null, quantity: number, rental_start_date: Date, rental_end_date: Date }, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_transaction_lines (
        id, organization_id, transaction_id, product_id, variant_id, quantity, rental_start_date, rental_end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_id,
      data.product_id,
      data.variant_id,
      data.quantity,
      data.rental_start_date,
      data.rental_end_date
    ], conn);
  }

  async listTransactionLines(txId: string, orgId: string, conn?: QueryConnection): Promise<TransactionLineRow[]> {
    const sql = `SELECT * FROM rental_transaction_lines WHERE transaction_id = ? AND organization_id = ?`;
    return this.query<TransactionLineRow[]>(sql, [txId, orgId], conn);
  }

  async createCommercialSnapshot(data: { id: string, organization_id: string, transaction_line_id: string, pricelist_id: string | null, unit_price: string, deposit_amount: string, late_fee_rate: string }, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO rental_commercial_snapshots (
        id, organization_id, transaction_line_id, pricelist_id, unit_price, deposit_amount, late_fee_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_line_id,
      data.pricelist_id,
      data.unit_price,
      data.deposit_amount,
      data.late_fee_rate
    ], conn);
  }

  async findCommercialSnapshotByLineId(lineId: string, orgId: string, conn?: QueryConnection): Promise<CommercialSnapshotRow | null> {
    const sql = `SELECT * FROM rental_commercial_snapshots WHERE transaction_line_id = ? AND organization_id = ?`;
    return this.queryOne<CommercialSnapshotRow>(sql, [lineId, orgId], conn);
  }
}
