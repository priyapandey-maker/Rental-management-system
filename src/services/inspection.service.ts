import crypto from 'crypto';
import { InspectionRepository, InspectionRow } from '../repositories/inspection.repository';
import { ReturnRepository } from '../repositories/return.repository';
import { AssetRepository } from '../repositories/asset.repository';
import { AllocationRepository } from '../repositories/allocation.repository';
import { NotFoundError, ConflictError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class InspectionService {
  constructor(
    private inspectionRepo = new InspectionRepository(),
    private returnRepo = new ReturnRepository(),
    private assetRepo = new AssetRepository(),
    private allocationRepo = new AllocationRepository()
  ) {}

  async createInspection(
    orgId: string,
    data: {
      return_line_id: string;
      condition_status: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
      damage_classification?: string | null;
      damage_severity?: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';
      chargeable_damage?: boolean;
      notes?: string | null;
      inspector_id: string | null;
    }
  ): Promise<InspectionRow> {
    const returnLine = await this.returnRepo.findLineById(data.return_line_id, orgId);
    if (!returnLine) {
      throw new NotFoundError(`Return line with ID '${data.return_line_id}' not found in this organization`);
    }

    const existing = await this.inspectionRepo.findByReturnLineId(data.return_line_id, orgId);
    if (existing) {
      throw new ConflictError(`Inspection already recorded for return line '${data.return_line_id}'`);
    }

    const alloc = await this.allocationRepo.findById(returnLine.asset_allocation_id, orgId);
    if (!alloc) {
      throw new NotFoundError('Asset allocation for return line not found');
    }

    const asset = await this.assetRepo.findById(alloc.asset_id, orgId);
    if (!asset) {
      throw new NotFoundError('Asset for return line not found');
    }

    const id = crypto.randomUUID();
    const severity = data.damage_severity ?? 'NONE';
    const chargeable = data.chargeable_damage === true ? 1 : 0;

    return runInTransaction(async (conn) => {
      await this.inspectionRepo.create({
        id,
        organization_id: orgId,
        return_line_id: data.return_line_id,
        asset_id: asset.id,
        condition_status: data.condition_status,
        damage_classification: data.damage_classification ?? null,
        damage_severity: severity,
        chargeable_damage: chargeable,
        notes: data.notes ?? null,
        inspected_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        inspector_id: data.inspector_id
      }, conn);

      if (data.condition_status === 'DAMAGED' || data.condition_status === 'CRITICAL') {
        await this.assetRepo.updateConditionStatus(asset.id, orgId, data.condition_status, conn);
        await this.assetRepo.updateLifecycleStatus(asset.id, orgId, 'UNDER_MAINTENANCE', conn);
      }

      const created = await this.inspectionRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created inspection');
      }
      return created;
    });
  }

  async getInspectionById(id: string, orgId: string): Promise<InspectionRow> {
    const inspection = await this.inspectionRepo.findById(id, orgId);
    if (!inspection) {
      throw new NotFoundError(`Inspection with ID '${id}' not found`);
    }
    return inspection;
  }

  async listInspectionsByReturnId(returnId: string, orgId: string): Promise<InspectionRow[]> {
    const ret = await this.returnRepo.findById(returnId, orgId);
    if (!ret) {
      throw new NotFoundError(`Return record with ID '${returnId}' not found`);
    }
    return this.inspectionRepo.listByReturnId(returnId, orgId);
  }
}
