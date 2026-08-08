import { Request, Response, NextFunction } from 'express';
import { AllocationService } from '../services/allocation.service';
import { validateString, validateOptionalNumber } from '../utils/validators';

const allocationService = new AllocationService();

export const createAllocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const transaction_line_id = validateString(req.body.transaction_line_id, 'transaction_line_id', 36, 36);
    const asset_id = validateString(req.body.asset_id, 'asset_id', 36, 36);
    const quantity = validateOptionalNumber(req.body.quantity, 'quantity', 1);

    const allocation = await allocationService.createAllocation(orgId, {
      transaction_line_id,
      asset_id,
      quantity: quantity ?? undefined
    });
    res.status(201).json(allocation);
  } catch (error) {
    next(error);
  }
};

export const getAllocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const allocation = await allocationService.getAllocationById(id, orgId);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
};

export const listAllocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const lineId = validateString(req.params.lineId, 'lineId', 1, 36);
    const allocations = await allocationService.listAllocationsByLineId(lineId, orgId);
    res.json(allocations);
  } catch (error) {
    next(error);
  }
};
