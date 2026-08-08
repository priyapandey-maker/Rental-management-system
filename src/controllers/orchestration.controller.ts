import { Request, Response, NextFunction } from 'express';
import { OrchestrationService } from '../services/orchestration.service';
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

export const returnTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');
    const userId = req.context.userId || '';

    await orchestrationService.returnTransaction(txId, orgId, userId);
    res.json({ message: 'Transaction returned successfully' });
  } catch (err) {
    next(err);
  }
};
