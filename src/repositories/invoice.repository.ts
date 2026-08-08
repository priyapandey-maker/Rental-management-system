import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface InvoiceRow extends RowDataPacket {
  id: string;
  organization_id: string;
  transaction_id: string;
  customer_id: string;
  invoice_number: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  subtotal_amount: string;
  tax_amount: string;
  total_amount: string;
  issued_at: Date | null;
  due_date: Date | null;
}

export class InvoiceRepository extends BaseRepository {
  async createInvoice(
    data: {
      id: string;
      organization_id: string;
      transaction_id: string;
      customer_id: string;
      invoice_number: string;
      status: string;
      subtotal_amount: string;
      tax_amount: string;
      total_amount: string;
      due_date: Date | null;
    },
    conn?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_invoices (
        id, organization_id, transaction_id, customer_id, invoice_number, 
        status, subtotal_amount, tax_amount, total_amount, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_id,
      data.customer_id,
      data.invoice_number,
      data.status,
      data.subtotal_amount,
      data.tax_amount,
      data.total_amount,
      data.due_date
    ], conn);
  }

  async findInvoiceById(id: string, orgId: string, conn?: QueryConnection): Promise<InvoiceRow | null> {
    const sql = `SELECT * FROM rental_invoices WHERE id = ? AND organization_id = ?`;
    return this.queryOne<InvoiceRow>(sql, [id, orgId], conn);
  }

  async updateInvoiceStatus(
    id: string, 
    orgId: string, 
    status: string, 
    issuedAt?: Date | null,
    conn?: QueryConnection
  ): Promise<void> {
    if (status === 'ISSUED' && issuedAt) {
      const sql = `UPDATE rental_invoices SET status = ?, issued_at = ? WHERE id = ? AND organization_id = ?`;
      await this.query(sql, [status, issuedAt, id, orgId], conn);
    } else {
      const sql = `UPDATE rental_invoices SET status = ? WHERE id = ? AND organization_id = ?`;
      await this.query(sql, [status, id, orgId], conn);
    }
  }

  async listInvoicesByTransaction(txId: string, orgId: string, conn?: QueryConnection): Promise<InvoiceRow[]> {
    const sql = `SELECT * FROM rental_invoices WHERE transaction_id = ? AND organization_id = ? ORDER BY created_at DESC`;
    return this.query<InvoiceRow[]>(sql, [txId, orgId], conn);
  }
}
