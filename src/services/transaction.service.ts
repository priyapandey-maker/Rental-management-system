import crypto from 'crypto';
import { TransactionRepository, TransactionRow, TransactionLineRow, CommercialSnapshotRow } from '../repositories/transaction.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from '../repositories/product.repository';
import { VariantRepository } from '../repositories/variant.repository';
import { NotFoundError, ConflictError, ValidationError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class TransactionService {
  constructor(
    private txRepo = new TransactionRepository(),
    private customerRepo = new CustomerRepository(),
    private productRepo = new ProductRepository(),
    private variantRepo = new VariantRepository()
  ) {}

  async createTransaction(orgId: string, customerId: string, userId?: string): Promise<TransactionRow> {
    const customer = await this.customerRepo.findById(customerId, orgId);
    if (!customer) {
      throw new NotFoundError(`Customer '${customerId}' not found in organization`);
    }

    if (customer.status !== 'active') {
      throw new ConflictError(`Customer '${customerId}' is not active`);
    }

    const id = crypto.randomUUID();
    await this.txRepo.createTransaction({
      id,
      organization_id: orgId,
      customer_id: customerId,
      status: 'DRAFT',
      transaction_date: new Date(),
      created_by: userId || null
    });

    const tx = await this.txRepo.findTransactionById(id, orgId);
    if (!tx) throw new Error('Failed to retrieve created transaction');
    return tx;
  }

  async getTransaction(id: string, orgId: string) {
    const tx = await this.txRepo.findTransactionById(id, orgId);
    if (!tx) throw new NotFoundError(`Transaction '${id}' not found`);

    const lines = await this.txRepo.listTransactionLines(id, orgId);
    const lineDetails = await Promise.all(
      lines.map(async (line) => {
        const snapshot = await this.txRepo.findCommercialSnapshotByLineId(line.id, orgId);
        return { ...line, snapshot };
      })
    );

    return { ...tx, lines: lineDetails };
  }

  async listTransactions(orgId: string): Promise<TransactionRow[]> {
    return this.txRepo.listTransactions(orgId);
  }

  async addTransactionLine(
    orgId: string,
    txId: string,
    data: {
      product_id: string;
      variant_id?: string | null;
      quantity: number;
      rental_start_date: Date;
      rental_end_date: Date;
      unit_price: number;
      deposit_amount: number;
      late_fee_rate: number;
      pricelist_id?: string | null;
    }
  ): Promise<{ line: TransactionLineRow; snapshot: CommercialSnapshotRow }> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'DRAFT') {
        throw new ConflictError('Cannot add lines to a non-draft transaction');
      }

      if (data.quantity <= 0) {
        throw new ValidationError('Quantity must be greater than zero');
      }

      if (data.rental_start_date >= data.rental_end_date) {
        throw new ValidationError('Rental start date must be before end date');
      }

      const product = await this.productRepo.findById(data.product_id, orgId);
      if (!product) throw new NotFoundError(`Product '${data.product_id}' not found`);

      if (data.variant_id) {
        const variant = await this.variantRepo.findById(data.variant_id, orgId);
        if (!variant) throw new NotFoundError(`Variant '${data.variant_id}' not found`);
        if (variant.product_id !== data.product_id) {
          throw new ConflictError(`Variant '${data.variant_id}' does not belong to product '${data.product_id}'`);
        }
      }

      const lineId = crypto.randomUUID();
      await this.txRepo.createTransactionLine({
        id: lineId,
        organization_id: orgId,
        transaction_id: txId,
        product_id: data.product_id,
        variant_id: data.variant_id || null,
        quantity: data.quantity,
        rental_start_date: data.rental_start_date,
        rental_end_date: data.rental_end_date
      }, conn);

      const snapshotId = crypto.randomUUID();
      await this.txRepo.createCommercialSnapshot({
        id: snapshotId,
        organization_id: orgId,
        transaction_line_id: lineId,
        pricelist_id: data.pricelist_id || null,
        unit_price: data.unit_price.toFixed(2),
        deposit_amount: data.deposit_amount.toFixed(2),
        late_fee_rate: data.late_fee_rate.toFixed(2)
      }, conn);

      const createdLine = (await this.txRepo.listTransactionLines(txId, orgId, conn)).find(l => l.id === lineId);
      const createdSnapshot = await this.txRepo.findCommercialSnapshotByLineId(lineId, orgId, conn);

      if (!createdLine || !createdSnapshot) {
        throw new Error('Failed to retrieve created line and snapshot');
      }

      return { line: createdLine, snapshot: createdSnapshot };
    });
  }

  async confirmTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'DRAFT') {
        throw new ConflictError(`Cannot confirm transaction in status '${tx.status}'`);
      }

      const lines = await this.txRepo.listTransactionLines(txId, orgId, conn);
      if (lines.length === 0) {
        throw new ConflictError('Cannot confirm a transaction with no lines');
      }

      await this.txRepo.updateTransactionStatus(txId, orgId, 'CONFIRMED', conn);
    });
  }

  async cancelTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'DRAFT' && tx.status !== 'CONFIRMED') {
        throw new ConflictError(`Cannot cancel transaction in status '${tx.status}'`);
      }

      await this.txRepo.updateTransactionStatus(txId, orgId, 'CANCELLED', conn);
    });
  }
}
