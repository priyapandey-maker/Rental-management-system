import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface PaymentRow extends RowDataPacket {
  id: string;
  organization_id: string;
  invoice_id: string;
  customer_id: string;
  amount: string;
  payment_method: string;
  payment_date: Date;
  reference_number: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export class PaymentRepository extends BaseRepository {
  async createPayment(
    data: {
      id: string;
      organization_id: string;
      invoice_id: string;
      customer_id: string;
      amount: string;
      payment_method: string;
      payment_date: Date;
      reference_number: string | null;
      status: string;
    },
    conn?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_payments (
        id, organization_id, invoice_id, customer_id, amount, 
        payment_method, payment_date, reference_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.invoice_id,
      data.customer_id,
      data.amount,
      data.payment_method,
      data.payment_date,
      data.reference_number,
      data.status
    ], conn);
  }

  async findPaymentById(id: string, orgId: string, conn?: QueryConnection): Promise<PaymentRow | null> {
    const sql = `SELECT * FROM rental_payments WHERE id = ? AND organization_id = ?`;
    return this.queryOne<PaymentRow>(sql, [id, orgId], conn);
  }

  async listPaymentsByInvoice(invoiceId: string, orgId: string, conn?: QueryConnection): Promise<PaymentRow[]> {
    const sql = `SELECT * FROM rental_payments WHERE invoice_id = ? AND organization_id = ? ORDER BY payment_date DESC`;
    return this.query<PaymentRow[]>(sql, [invoiceId, orgId], conn);
  }
}
