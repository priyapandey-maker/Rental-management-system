import crypto from 'crypto';
import { runInTransaction } from '../db/transaction';
import { PaymentRepository, PaymentRow } from '../repositories/payment.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { ConflictError, NotFoundError } from '../errors';

export class PaymentService {
  constructor(
    private paymentRepo = new PaymentRepository(),
    private invoiceRepo = new InvoiceRepository()
  ) {}

  async recordPayment(
    orgId: string,
    invoiceId: string,
    amount: number,
    method: string,
    referenceNumber: string | null
  ): Promise<PaymentRow> {
    return runInTransaction(async (conn) => {
      const invoice = await this.invoiceRepo.findInvoiceById(invoiceId, orgId, conn);
      if (!invoice) throw new NotFoundError(`Invoice '${invoiceId}' not found`);

      if (invoice.status !== 'ISSUED') {
        throw new ConflictError(`Cannot record payment for invoice in status '${invoice.status}'`);
      }

      if (amount <= 0) {
        throw new ConflictError('Payment amount must be greater than zero');
      }

      const id = crypto.randomUUID();
      await this.paymentRepo.createPayment({
        id,
        organization_id: orgId,
        invoice_id: invoiceId,
        customer_id: invoice.customer_id,
        amount: amount.toFixed(2),
        payment_method: method,
        payment_date: new Date(),
        reference_number: referenceNumber,
        status: 'COMPLETED'
      }, conn);

      // Check if invoice is fully paid
      const payments = await this.paymentRepo.listPaymentsByInvoice(invoiceId, orgId, conn);
      const totalPaid = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      if (totalPaid >= parseFloat(invoice.total_amount)) {
        await this.invoiceRepo.updateInvoiceStatus(invoiceId, orgId, 'PAID', null, conn);
      }

      const created = await this.paymentRepo.findPaymentById(id, orgId, conn);
      if (!created) throw new Error('Failed to retrieve created payment');

      return created;
    });
  }

  async getPayment(id: string, orgId: string): Promise<PaymentRow> {
    const payment = await this.paymentRepo.findPaymentById(id, orgId);
    if (!payment) throw new NotFoundError(`Payment '${id}' not found`);
    return payment;
  }

  async listPaymentsByInvoice(invoiceId: string, orgId: string): Promise<PaymentRow[]> {
    return this.paymentRepo.listPaymentsByInvoice(invoiceId, orgId);
  }
}
