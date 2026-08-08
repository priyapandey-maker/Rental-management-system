import crypto from 'crypto';
import { runInTransaction } from '../db/transaction';
import { InvoiceRepository, InvoiceRow } from '../repositories/invoice.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ConflictError, NotFoundError } from '../errors';

export class InvoiceService {
  constructor(
    private invoiceRepo = new InvoiceRepository(),
    private txRepo = new TransactionRepository()
  ) {}

  async createInvoice(orgId: string, txId: string, dueDate: Date | null): Promise<InvoiceRow> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      // Business rule: Can only invoice CONFIRMED, ACTIVE, or COMPLETED transactions
      if (tx.status === 'DRAFT' || tx.status === 'CANCELLED') {
        throw new ConflictError(`Cannot create invoice for transaction in status '${tx.status}'`);
      }

      const existingInvoices = await this.invoiceRepo.listInvoicesByTransaction(txId, orgId, conn);
      if (existingInvoices.some(i => i.status !== 'CANCELLED')) {
        throw new ConflictError(`An active invoice already exists for this transaction`);
      }

      const lines = await this.txRepo.listTransactionLines(txId, orgId, conn);
      if (lines.length === 0) {
        throw new ConflictError('Cannot invoice a transaction with no lines');
      }

      let subtotal = 0;
      let total = 0;
      // Tax calculation is simplified here but derived from snapshots
      for (const line of lines) {
        const snapshot = await this.txRepo.findCommercialSnapshotByLineId(line.id, orgId, conn);
        if (!snapshot) throw new Error(`Missing commercial snapshot for line ${line.id}`);
        
        // Sum based on frozen snapshots
        const linePrice = parseFloat(snapshot.unit_price) * line.quantity;
        const deposit = parseFloat(snapshot.deposit_amount) * line.quantity;
        
        subtotal += linePrice;
        total += linePrice + deposit; // Simplistic aggregation. Real logic would include specific tax rates.
      }

      const id = crypto.randomUUID();
      const invoiceNumber = `INV-${Date.now()}`;

      await this.invoiceRepo.createInvoice({
        id,
        organization_id: orgId,
        transaction_id: txId,
        customer_id: tx.customer_id,
        invoice_number: invoiceNumber,
        status: 'DRAFT',
        subtotal_amount: subtotal.toFixed(2),
        tax_amount: '0.00', // Assuming 0 for now as per baseline schema
        total_amount: total.toFixed(2),
        due_date: dueDate
      }, conn);

      const created = await this.invoiceRepo.findInvoiceById(id, orgId, conn);
      if (!created) throw new Error('Failed to retrieve created invoice');

      return created;
    });
  }

  async getInvoice(id: string, orgId: string): Promise<InvoiceRow> {
    const invoice = await this.invoiceRepo.findInvoiceById(id, orgId);
    if (!invoice) throw new NotFoundError(`Invoice '${id}' not found`);
    return invoice;
  }

  async issueInvoice(id: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const invoice = await this.invoiceRepo.findInvoiceById(id, orgId, conn);
      if (!invoice) throw new NotFoundError(`Invoice '${id}' not found`);

      if (invoice.status !== 'DRAFT') {
        throw new ConflictError(`Cannot issue invoice in status '${invoice.status}'`);
      }

      await this.invoiceRepo.updateInvoiceStatus(id, orgId, 'ISSUED', new Date(), conn);
    });
  }
}
