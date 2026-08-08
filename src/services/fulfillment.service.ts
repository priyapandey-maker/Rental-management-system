import crypto from 'crypto';
import { FulfillmentRepository, FulfillmentRow } from '../repositories/fulfillment.repository';
import { AllocationRepository } from '../repositories/allocation.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { NotFoundError, ConflictError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class FulfillmentService {
  constructor(
    private fulfillmentRepo = new FulfillmentRepository(),
    private allocationRepo = new AllocationRepository(),
    private txRepo = new TransactionRepository(),
    private assetRepo = new AssetRepository()
  ) {}

  async createFulfillment(
    orgId: string,
    transactionId: string,
    userId: string | null
  ): Promise<FulfillmentRow> {
    const tx = await this.txRepo.findTransactionById(transactionId, orgId);
    if (!tx) {
      throw new NotFoundError(`Transaction with ID '${transactionId}' not found`);
    }
    if (tx.status !== 'CONFIRMED') {
      throw new ConflictError(`Cannot fulfill transaction in status '${tx.status}'. Status must be 'CONFIRMED'`);
    }

    const allocations = await this.allocationRepo.listByTransactionId(transactionId, orgId);
    if (allocations.length === 0) {
      throw new ConflictError('Cannot fulfill a transaction with no allocated assets');
    }

    const pendingAllocations = allocations.filter(a => a.status === 'ALLOCATED');
    if (pendingAllocations.length === 0) {
      throw new ConflictError('All allocations for this transaction are already fulfilled or cancelled');
    }

    const id = crypto.randomUUID();

    return runInTransaction(async (conn) => {
      await this.fulfillmentRepo.create({
        id,
        organization_id: orgId,
        transaction_id: transactionId,
        status: 'COMPLETED',
        fulfilled_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        fulfilled_by: userId
      }, conn);

      for (const alloc of pendingAllocations) {
        const lineId = crypto.randomUUID();
        await this.fulfillmentRepo.createLine({
          id: lineId,
          organization_id: orgId,
          fulfillment_id: id,
          asset_allocation_id: alloc.id
        }, conn);

        await this.allocationRepo.updateStatus(alloc.id, orgId, 'FULFILLED', conn);
        await this.assetRepo.updateLifecycleStatus(alloc.asset_id, orgId, 'RENTED', conn);
      }

      await this.txRepo.updateTransactionStatus(transactionId, orgId, 'ACTIVE', conn);

      const created = await this.fulfillmentRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created fulfillment');
      }
      return created;
    });
  }

  async getFulfillmentById(id: string, orgId: string): Promise<FulfillmentRow> {
    const fulfillment = await this.fulfillmentRepo.findById(id, orgId);
    if (!fulfillment) {
      throw new NotFoundError(`Fulfillment with ID '${id}' not found`);
    }
    return fulfillment;
  }

  async getFulfillmentByTransactionId(txId: string, orgId: string): Promise<FulfillmentRow> {
    const fulfillment = await this.fulfillmentRepo.findByTransactionId(txId, orgId);
    if (!fulfillment) {
      throw new NotFoundError(`Fulfillment for transaction '${txId}' not found`);
    }
    return fulfillment;
  }
}
