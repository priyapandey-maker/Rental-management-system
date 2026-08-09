import { Request, Response, NextFunction } from 'express';
import { AdjustmentService } from '../services/adjustment.service';
import { validateString, validateOptionalString, validateNumber, validateEnum } from '../utils/validators';

const adjustmentService = new AdjustmentService();

export const createAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const transaction_id = validateString(req.body.transaction_id, 'transaction_id', 3, 36);
    const asset_id = validateOptionalString(req.body.asset_id, 'asset_id', 36);
    const reason = validateString(req.body.reason, 'reason', 1, 255);
    const amount = validateNumber(req.body.amount, 'amount', 0);
    const status = req.body.status !== undefined ? validateEnum(req.body.status, 'status', ['PENDING', 'APPLIED', 'WAIVED', 'PAID']) : undefined;

    const adjustment = await adjustmentService.createAdjustment(orgId, {
      transaction_id,
      asset_id,
      reason,
      amount,
      status
    });
    res.status(201).json(adjustment);
  } catch (error) {
    next(error);
  }
};

export const getAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const adjustment = await adjustmentService.getAdjustmentById(id, orgId);
    res.json(adjustment);
  } catch (error) {
    next(error);
  }
};

export const listAdjustments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateString(req.params.txId, 'txId', 1, 36);
    const adjustments = await adjustmentService.listAdjustmentsByTransactionId(txId, orgId);
    res.json(adjustments);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const status = validateEnum(req.body.status, 'status', ['PENDING', 'APPLIED', 'WAIVED', 'PAID']);

    const adjustment = await adjustmentService.updateAdjustmentStatus(id, orgId, status);
    res.json(adjustment);
  } catch (error) {
    next(error);
  }
};
