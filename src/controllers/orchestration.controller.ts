import { Request, Response, NextFunction } from 'express';
import { OrchestrationService } from '../services/orchestration.service';
import { ReturnService } from '../services/return.service';
import { validateUuid } from '../utils/validators';

const orchestrationService = new OrchestrationService();

export const allocateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await orchestrationService.allocateTransaction(txId, orgId);
    res.json({ message: 'Assets allocated successfully' });
  } catch (err) {
    next(err);
  }
};

export const fulfillTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');
    const userId = req.context.userId || '';

    await orchestrationService.fulfillTransaction(txId, orgId, userId);
    res.json({ message: 'Transaction fulfilled successfully' });
  } catch (err) {
    next(err);
  }
};

export const requestReturnTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await orchestrationService.requestReturnTransaction(txId, orgId);
    res.json({ message: 'Return requested successfully' });
  } catch (err) {
    next(err);
  }
};

export const approveReturnTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await orchestrationService.approveReturnTransaction(txId, orgId);
    res.json({ message: 'Return approved successfully' });
  } catch (err) {
    next(err);
  }
};

export const receiveReturnTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');
    const userId = req.context.userId || '';

    await orchestrationService.receiveReturnTransaction(txId, orgId, userId);
    res.json({ message: 'Return received successfully' });
  } catch (err) {
    next(err);
  }
};

export const inspectTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');
    const userId = req.context.userId || '';
    
    await orchestrationService.inspectTransaction(txId, orgId, userId, req.body);
    res.json({ message: 'Inspection completed successfully' });
  } catch (err) {
    next(err);
  }
};

export const resolveTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await orchestrationService.resolveTransaction(txId, orgId);
    res.json({ message: 'Transaction resolved successfully' });
  } catch (err) {
    next(err);
  }
};

export const completeTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await orchestrationService.completeTransaction(txId, orgId);
    res.json({ message: 'Transaction completed successfully' });
  } catch (err) {
    next(err);
  }
};
