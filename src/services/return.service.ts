import crypto from 'crypto';
import { ReturnRepository, ReturnRow } from '../repositories/return.repository';
import { AllocationRepository } from '../repositories/allocation.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { NotFoundError, ConflictError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class ReturnService {
  constructor(
    private returnRepo = new ReturnRepository(),
    private allocationRepo = new AllocationRepository(),
    private txRepo = new TransactionRepository(),
    private assetRepo = new AssetRepository()
  ) {}

  async createReturn(
    orgId: string,
    transactionId: string,
    userId: string | null
  ): Promise<ReturnRow> {
    const tx = await this.txRepo.findTransactionById(transactionId, orgId);
    if (!tx) {
      throw new NotFoundError(`Transaction with ID '${transactionId}' not found`);
    }
    if (tx.status !== 'ACTIVE') {
      throw new ConflictError(`Cannot process return for transaction in status '${tx.status}'. Status must be 'ACTIVE'`);
    }

    const allocations = await this.allocationRepo.listByTransactionId(transactionId, orgId);
    const fulfilledAllocations = allocations.filter(a => a.status === 'FULFILLED');
    if (fulfilledAllocations.length === 0) {
      throw new ConflictError('No active fulfillments found to return for this transaction');
    }

    const id = crypto.randomUUID();

    return runInTransaction(async (conn) => {
      await this.returnRepo.create({
        id,
        organization_id: orgId,
        transaction_id: transactionId,
        status: 'RECEIVED',
        returned_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        received_by: userId
      }, conn);

      for (const alloc of fulfilledAllocations) {
        const lineId = crypto.randomUUID();
        await this.returnRepo.createLine({
          id: lineId,
          organization_id: orgId,
          return_id: id,
          asset_allocation_id: alloc.id
        }, conn);

        await this.allocationRepo.updateStatus(alloc.id, orgId, 'RETURNED', conn);
        await this.assetRepo.updateLifecycleStatus(alloc.asset_id, orgId, 'AVAILABLE', conn);
      }

      const updatedAllocations = await this.allocationRepo.listByTransactionId(transactionId, orgId, conn);
      const allReturned = updatedAllocations.every(a => a.status === 'RETURNED' || a.status === 'CANCELLED');
      if (allReturned) {
        await this.txRepo.updateTransactionStatus(transactionId, orgId, 'COMPLETED', conn);
      }

      const created = await this.returnRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created return record');
      }
      return created;
    });
  }

  async getReturnById(id: string, orgId: string): Promise<ReturnRow> {
    const ret = await this.returnRepo.findById(id, orgId);
    if (!ret) {
      throw new NotFoundError(`Return record with ID '${id}' not found`);
    }
    return ret;
  }

  async getReturnByTransactionId(txId: string, orgId: string): Promise<ReturnRow> {
    const ret = await this.returnRepo.findByTransactionId(txId, orgId);
    if (!ret) {
      throw new NotFoundError(`Return record for transaction '${txId}' not found`);
    }
    return ret;
  }
}
