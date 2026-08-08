import crypto from 'crypto';
import { AllocationRepository, AllocationRow } from '../repositories/allocation.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { NotFoundError, ConflictError, ValidationError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class AllocationService {
  constructor(
    private allocationRepo = new AllocationRepository(),
    private assetRepo = new AssetRepository(),
    private txRepo = new TransactionRepository()
  ) {}

  async createAllocation(
    orgId: string,
    data: {
      transaction_line_id: string;
      asset_id: string;
      quantity?: number;
    }
  ): Promise<AllocationRow> {
    const qty = data.quantity ?? 1;
    if (qty <= 0) {
      throw new ValidationError('Quantity must be greater than zero');
    }

    const line = await this.allocationRepo.findTransactionLineById(data.transaction_line_id, orgId);
    if (!line) {
      throw new NotFoundError(`Transaction line with ID '${data.transaction_line_id}' not found in this organization`);
    }

    const asset = await this.assetRepo.findById(data.asset_id, orgId);
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${data.asset_id}' not found in this organization`);
    }

    const tx = await this.txRepo.findTransactionById(line.transaction_id, orgId);
    if (!tx) {
      throw new NotFoundError(`Parent transaction for line not found`);
    }
    if (tx.status !== 'CONFIRMED' && tx.status !== 'ACTIVE') {
      throw new ConflictError(`Cannot allocate assets to a transaction in status '${tx.status}'`);
    }

    if (asset.product_variant_id !== line.variant_id) {
      throw new ConflictError(`Asset variant '${asset.product_variant_id}' does not match transaction line variant '${line.variant_id}'`);
    }

    if (asset.lifecycle_status !== 'AVAILABLE') {
      throw new ConflictError(`Asset is not AVAILABLE for allocation. Current status is '${asset.lifecycle_status}'`);
    }

    const id = crypto.randomUUID();

    return runInTransaction(async (conn) => {
      await this.assetRepo.updateLifecycleStatus(data.asset_id, orgId, 'ALLOCATED', conn);

      await this.allocationRepo.create({
        id,
        organization_id: orgId,
        transaction_line_id: data.transaction_line_id,
        asset_id: data.asset_id,
        status: 'ALLOCATED',
        quantity: qty
      }, conn);

      const created = await this.allocationRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created allocation');
      }
      return created;
    });
  }

  async getAllocationById(id: string, orgId: string): Promise<AllocationRow> {
    const allocation = await this.allocationRepo.findById(id, orgId);
    if (!allocation) {
      throw new NotFoundError(`Allocation with ID '${id}' not found`);
    }
    return allocation;
  }

  async listAllocationsByLineId(lineId: string, orgId: string): Promise<AllocationRow[]> {
    const line = await this.allocationRepo.findTransactionLineById(lineId, orgId);
    if (!line) {
      throw new NotFoundError(`Transaction line with ID '${lineId}' not found in this organization`);
    }
    return this.allocationRepo.listByTransactionLineId(lineId, orgId);
  }
}
