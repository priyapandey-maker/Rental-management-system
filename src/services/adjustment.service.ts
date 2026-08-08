import crypto from 'crypto';
import { AdjustmentRepository, AdjustmentRow } from '../repositories/adjustment.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { NotFoundError, ValidationError } from '../errors';

export class AdjustmentService {
  constructor(
    private adjustmentRepo = new AdjustmentRepository(),
    private txRepo = new TransactionRepository(),
    private assetRepo = new AssetRepository()
  ) {}

  async createAdjustment(
    orgId: string,
    data: {
      transaction_id: string;
      asset_id?: string | null;
      reason: string;
      amount: number;
      status?: 'PENDING' | 'APPLIED' | 'WAIVED' | 'PAID';
    }
  ): Promise<AdjustmentRow> {
    if (data.amount < 0) {
      throw new ValidationError('Adjustment amount must be positive or zero');
    }

    const tx = await this.txRepo.findTransactionById(data.transaction_id, orgId);
    if (!tx) {
      throw new NotFoundError(`Transaction with ID '${data.transaction_id}' not found`);
    }

    if (data.asset_id) {
      const asset = await this.assetRepo.findById(data.asset_id, orgId);
      if (!asset) {
        throw new NotFoundError(`Asset with ID '${data.asset_id}' not found`);
      }
    }

    const id = crypto.randomUUID();
    const adjustment = {
      id,
      organization_id: orgId,
      transaction_id: data.transaction_id,
      asset_id: data.asset_id ?? null,
      reason: data.reason,
      amount: data.amount.toFixed(2),
      status: data.status ?? 'PENDING'
    };

    await this.adjustmentRepo.create(adjustment);
    const created = await this.adjustmentRepo.findById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created adjustment');
    }
    return created;
  }

  async getAdjustmentById(id: string, orgId: string): Promise<AdjustmentRow> {
    const adj = await this.adjustmentRepo.findById(id, orgId);
    if (!adj) {
      throw new NotFoundError(`Adjustment with ID '${id}' not found`);
    }
    return adj;
  }

  async listAdjustmentsByTransactionId(txId: string, orgId: string): Promise<AdjustmentRow[]> {
    const tx = await this.txRepo.findTransactionById(txId, orgId);
    if (!tx) {
      throw new NotFoundError(`Transaction with ID '${txId}' not found`);
    }
    return this.adjustmentRepo.listByTransactionId(txId, orgId);
  }

  async updateAdjustmentStatus(
    id: string,
    orgId: string,
    status: 'PENDING' | 'APPLIED' | 'WAIVED' | 'PAID'
  ): Promise<AdjustmentRow> {
    await this.getAdjustmentById(id, orgId);
    await this.adjustmentRepo.updateStatus(id, orgId, status);
    return this.getAdjustmentById(id, orgId);
  }
}
