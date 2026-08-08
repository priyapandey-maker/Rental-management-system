import crypto from 'crypto';
import { runInTransaction } from '../db/transaction';
import { OrchestrationRepository } from '../repositories/orchestration.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ConflictError, NotFoundError } from '../errors';

export class OrchestrationService {
  constructor(
    private orchestrationRepo = new OrchestrationRepository(),
    private txRepo = new TransactionRepository()
  ) {}

  /**
   * Orchestrates the allocation of physical assets to a CONFIRMED transaction.
   * Atomically locks assets using FOR UPDATE SKIP LOCKED to guarantee concurrency safety.
   */
  async allocateTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'CONFIRMED') {
        throw new ConflictError(`Cannot allocate assets for transaction in status '${tx.status}'. Must be CONFIRMED.`);
      }

      const lines = await this.txRepo.listTransactionLines(txId, orgId, conn);
      
      for (const line of lines) {
        // Find available assets using SKIP LOCKED to skip assets already locked by concurrent requests
        const availableAssets = await this.orchestrationRepo.findAvailableAssetsForUpdate({
          organizationId: orgId,
          productId: line.product_id,
          variantId: line.variant_id,
          startDate: line.rental_start_date,
          endDate: line.rental_end_date,
          quantity: line.quantity
        }, conn);

        if (availableAssets.length < line.quantity) {
          throw new ConflictError(
            `Insufficient available physical assets to allocate line ${line.id} for product ${line.product_id}. ` +
            `Requested: ${line.quantity}, Available: ${availableAssets.length}`
          );
        }

        // Allocate the assets
        for (const asset of availableAssets) {
          const allocationId = crypto.randomUUID();
          await this.orchestrationRepo.createAssetAllocation({
            id: allocationId,
            organization_id: orgId,
            transaction_line_id: line.id,
            asset_id: asset.id,
            status: 'ALLOCATED',
            quantity: 1
          }, conn);

          // We mark the asset's lifecycle as ALLOCATED just as a cache/indicator, 
          // though actual temporal bounds are managed by the allocation rows.
          await this.orchestrationRepo.updateAssetLifecycleStatus(asset.id, orgId, 'ALLOCATED', conn);
        }
      }

      // Transition the transaction to ACTIVE once physical assets are allocated and ready for fulfillment
      await this.txRepo.updateTransactionStatus(txId, orgId, 'ACTIVE', conn);
    });
  }

  /**
   * Fulfills an ACTIVE transaction's allocations (e.g., shipping, pick-up).
   */
  async fulfillTransaction(txId: string, orgId: string, userId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'ACTIVE') {
        throw new ConflictError(`Cannot fulfill transaction in status '${tx.status}'. Must be ACTIVE.`);
      }

      const allocations = await this.orchestrationRepo.getTransactionAllocations(txId, orgId, conn);
      if (allocations.length === 0) {
        throw new ConflictError('No asset allocations found for this transaction to fulfill');
      }

      const pendingAllocations = allocations.filter(a => a.status === 'ALLOCATED');
      if (pendingAllocations.length === 0) {
        throw new ConflictError('No pending allocations to fulfill');
      }

      const fulfillmentId = crypto.randomUUID();
      await this.orchestrationRepo.createFulfillment({
        id: fulfillmentId,
        organization_id: orgId,
        transaction_id: txId,
        status: 'COMPLETED',
        fulfilled_by: userId
      }, conn);

      for (const allocation of pendingAllocations) {
        await this.orchestrationRepo.createFulfillmentLine({
          id: crypto.randomUUID(),
          organization_id: orgId,
          fulfillment_id: fulfillmentId,
          asset_allocation_id: allocation.id
        }, conn);

        await this.orchestrationRepo.updateAllocationStatus(allocation.id, orgId, 'FULFILLED', conn);
        await this.orchestrationRepo.updateAssetLifecycleStatus(allocation.asset_id, orgId, 'RENTED', conn);
      }
    });
  }

  /**
   * Receives a return of fulfilled assets.
   */
  async returnTransaction(txId: string, orgId: string, userId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'ACTIVE' && tx.status !== 'COMPLETED') {
        throw new ConflictError(`Cannot return transaction in status '${tx.status}'.`);
      }

      const allocations = await this.orchestrationRepo.getTransactionAllocations(txId, orgId, conn);
      const fulfilledAllocations = allocations.filter(a => a.status === 'FULFILLED');
      
      if (fulfilledAllocations.length === 0) {
        throw new ConflictError('No fulfilled allocations found to return');
      }

      const returnId = crypto.randomUUID();
      await this.orchestrationRepo.createReturn({
        id: returnId,
        organization_id: orgId,
        transaction_id: txId,
        status: 'RECEIVED',
        received_by: userId
      }, conn);

      for (const allocation of fulfilledAllocations) {
        await this.orchestrationRepo.createReturnLine({
          id: crypto.randomUUID(),
          organization_id: orgId,
          return_id: returnId,
          asset_allocation_id: allocation.id
        }, conn);

        await this.orchestrationRepo.updateAllocationStatus(allocation.id, orgId, 'RETURNED', conn);
        await this.orchestrationRepo.updateAssetLifecycleStatus(allocation.asset_id, orgId, 'AVAILABLE', conn);
      }

      // If all items are returned, we can close the transaction
      const allAllocations = await this.orchestrationRepo.getTransactionAllocations(txId, orgId, conn);
      const allReturned = allAllocations.every(a => a.status === 'RETURNED');
      if (allReturned && tx.status !== 'COMPLETED') {
        await this.txRepo.updateTransactionStatus(txId, orgId, 'COMPLETED', conn);
      }
    });
  }
}
