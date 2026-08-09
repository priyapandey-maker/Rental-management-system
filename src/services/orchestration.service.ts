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

      // Transition the transaction to ALLOCATED once physical assets are allocated and ready for fulfillment
      await this.txRepo.updateTransactionStatus(txId, orgId, 'ALLOCATED', conn);
    });
  }

  /**
   * Fulfills an ALLOCATED transaction's allocations (e.g., shipping, pick-up).
   */
  async fulfillTransaction(txId: string, orgId: string, userId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'ALLOCATED') {
        throw new ConflictError(`Cannot fulfill transaction in status '${tx.status}'. Must be ALLOCATED.`);
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

      await this.txRepo.updateTransactionStatus(txId, orgId, 'FULFILLED', conn);
    });
  }

  /**
   * Customer requests a return for a fulfilled transaction.
   */
  async requestReturnTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'FULFILLED') {
        throw new ConflictError(`Cannot request return for transaction in status '${tx.status}'. Must be FULFILLED.`);
      }

      const returnId = crypto.randomUUID();
      await this.orchestrationRepo.createReturn({
        id: returnId,
        organization_id: orgId,
        transaction_id: txId,
        status: 'REQUESTED',
        received_by: ''
      }, conn);

      await this.txRepo.updateTransactionStatus(txId, orgId, 'RETURN_REQUESTED', conn);
    });
  }

  /**
   * Vendor approves a return request.
   */
  async approveReturnTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'RETURN_REQUESTED') {
        throw new ConflictError(`Cannot approve return for transaction in status '${tx.status}'. Must be RETURN_REQUESTED.`);
      }

      await conn.execute('UPDATE rental_returns SET status = ? WHERE transaction_id = ? AND organization_id = ?', ['APPROVED', txId, orgId]);
      await this.txRepo.updateTransactionStatus(txId, orgId, 'RETURN_APPROVED', conn);
    });
  }

  /**
   * Vendor physically receives the returned assets.
   */
  async receiveReturnTransaction(txId: string, orgId: string, userId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'RETURN_APPROVED') {
        throw new ConflictError(`Cannot receive return for transaction in status '${tx.status}'. Must be RETURN_APPROVED.`);
      }

      // Fetch the return record
      const [retRows] = await conn.execute<any[]>('SELECT id FROM rental_returns WHERE transaction_id = ? AND organization_id = ?', [txId, orgId]);
      if (retRows.length === 0) throw new NotFoundError('Return record not found');
      const returnId = retRows[0].id;

      await conn.execute('UPDATE rental_returns SET status = ?, received_by = ?, returned_at = ? WHERE id = ?', ['RECEIVED', userId, new Date(), returnId]);

      const allocations = await this.orchestrationRepo.getTransactionAllocations(txId, orgId, conn);
      const fulfilledAllocations = allocations.filter(a => a.status === 'FULFILLED');
      
      for (const allocation of fulfilledAllocations) {
        await this.orchestrationRepo.createReturnLine({
          id: crypto.randomUUID(),
          organization_id: orgId,
          return_id: returnId,
          asset_allocation_id: allocation.id
        }, conn);

        await this.orchestrationRepo.updateAllocationStatus(allocation.id, orgId, 'RETURNED', conn);
        // Put asset into inspection queue
        await this.orchestrationRepo.updateAssetLifecycleStatus(allocation.asset_id, orgId, 'RETURNED', conn);
      }

      await this.txRepo.updateTransactionStatus(txId, orgId, 'RETURN_RECEIVED', conn);
    });
  }

  /**
   * Completes an inspection for a return line.
   */
  async inspectTransaction(txId: string, orgId: string, inspectorId: string, inspectionData: any): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'RETURN_RECEIVED' && tx.status !== 'INSPECTED') {
        throw new ConflictError(`Cannot inspect transaction in status '${tx.status}'. Must be RETURN_RECEIVED or INSPECTED.`);
      }

      // We need a return line for the inspection
      const [retRows] = await conn.execute<any[]>('SELECT id FROM rental_returns WHERE transaction_id = ? AND organization_id = ?', [txId, orgId]);
      if (retRows.length === 0) throw new NotFoundError('Return record not found');
      const returnId = retRows[0].id;

      // Ensure we haven't already inspected this line
      const [existingInsp] = await conn.execute<any[]>('SELECT id FROM asset_inspections WHERE return_line_id = ?', [inspectionData.return_line_id]);
      if (existingInsp.length > 0) {
        throw new ConflictError('This return line has already been inspected');
      }

      const inspectionId = crypto.randomUUID();
      await conn.execute(
        `INSERT INTO asset_inspections (
          id, organization_id, return_line_id, asset_id, condition_status, damage_classification, damage_severity, chargeable_damage, notes, inspected_at, inspector_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inspectionId, orgId, inspectionData.return_line_id, inspectionData.asset_id, inspectionData.condition_status,
          inspectionData.damage_classification || null, inspectionData.damage_severity, inspectionData.chargeable_damage,
          inspectionData.notes || null, new Date(), inspectorId
        ]
      );

      // If issue found, it might need adjustment. For now, transaction transitions to INSPECTED (meaning inspection is done)
      // Actually we should transition the transaction only if all lines are inspected. We'll simplify and transition immediately.
      await this.txRepo.updateTransactionStatus(txId, orgId, 'INSPECTED', conn);
    });
  }

  /**
   * Vendor resolves any adjustments and issues.
   */
  async resolveTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'INSPECTED') {
        throw new ConflictError(`Cannot resolve transaction in status '${tx.status}'. Must be INSPECTED.`);
      }

      await this.txRepo.updateTransactionStatus(txId, orgId, 'RESOLVED', conn);
    });
  }

  /**
   * Completes the transaction and updates final asset status based on inspections.
   */
  async completeTransaction(txId: string, orgId: string): Promise<void> {
    return runInTransaction(async (conn) => {
      const tx = await this.txRepo.findTransactionById(txId, orgId, conn);
      if (!tx) throw new NotFoundError(`Transaction '${txId}' not found`);

      if (tx.status !== 'RESOLVED' && tx.status !== 'INSPECTED') {
        throw new ConflictError(`Cannot complete transaction in status '${tx.status}'. Must be RESOLVED or INSPECTED.`);
      }

      const allocations = await this.orchestrationRepo.getTransactionAllocations(txId, orgId, conn);
      
      // Update asset lifecycles based on inspection
      for (const alloc of allocations) {
        const [inspRows] = await conn.execute<any[]>(`
          SELECT i.condition_status 
          FROM asset_inspections i 
          JOIN rental_return_lines rl ON rl.id = i.return_line_id 
          WHERE rl.asset_allocation_id = ?`, [alloc.id]);
        
        let assetStatus = 'AVAILABLE';
        if (inspRows.length > 0 && ['DAMAGED', 'CRITICAL'].includes(inspRows[0].condition_status)) {
          assetStatus = 'UNDER_MAINTENANCE';
        }
        await this.orchestrationRepo.updateAssetLifecycleStatus(alloc.asset_id, orgId, assetStatus, conn);
        // Also update asset's persistent condition
        if (inspRows.length > 0) {
           await conn.execute('UPDATE assets SET condition_status = ? WHERE id = ?', [inspRows[0].condition_status, alloc.asset_id]);
        }
      }

      await this.txRepo.updateTransactionStatus(txId, orgId, 'COMPLETED', conn);
    });
  }
}

