import { BaseRepository } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface ReadTransactionRow extends RowDataPacket {
  id: string;
  status: string;
  transaction_date: Date;
  customer_first_name: string;
  customer_last_name: string;
}

export interface ReadInvoiceRow extends RowDataPacket {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: string;
  issued_at: Date | null;
  customer_first_name: string;
  customer_last_name: string;
}

export class ReadRepository extends BaseRepository {
  async listTransactionsWithPagination(
    orgId: string,
    limit: number,
    offset: number
  ): Promise<ReadTransactionRow[]> {
    const sql = `
      SELECT 
        t.id, t.status, t.transaction_date, 
        c.first_name as customer_first_name, c.last_name as customer_last_name
      FROM rental_transactions t
      JOIN customers c ON t.customer_id = c.id
      WHERE t.organization_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return this.query<ReadTransactionRow[]>(sql, [orgId, limit, offset]);
  }

  async countTransactions(orgId: string): Promise<number> {
    const sql = `SELECT COUNT(id) as count FROM rental_transactions WHERE organization_id = ?`;
    const rows = await this.query<RowDataPacket[]>(sql, [orgId]);
    return rows[0].count;
  }

  async listInvoicesWithPagination(
    orgId: string,
    limit: number,
    offset: number
  ): Promise<ReadInvoiceRow[]> {
    const sql = `
      SELECT 
        i.id, i.invoice_number, i.status, i.total_amount, i.issued_at,
        c.first_name as customer_first_name, c.last_name as customer_last_name
      FROM rental_invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = ?
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return this.query<ReadInvoiceRow[]>(sql, [orgId, limit, offset]);
  }

  async countInvoices(orgId: string): Promise<number> {
    const sql = `SELECT COUNT(id) as count FROM rental_invoices WHERE organization_id = ?`;
    const rows = await this.query<RowDataPacket[]>(sql, [orgId]);
    return rows[0].count;
  }
}
