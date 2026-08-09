import { Request, Response, NextFunction } from 'express';
import { ReturnService } from '../services/return.service';
import { validateString } from '../utils/validators';

const returnService = new ReturnService();

export const createReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const userId = req.context.userId || 'system';
    const transactionId = validateString(req.body.transaction_id, 'transaction_id', 3, 36);

    const returnRecord = await returnService.createReturn(orgId, transactionId, userId);
    res.status(201).json(returnRecord);
  } catch (error) {
    next(error);
  }
};

export const getReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const returnRecord = await returnService.getReturnById(id, orgId);
    res.json(returnRecord);
  } catch (error) {
    next(error);
  }
};

export const getReturnByTx = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateString(req.params.txId, 'txId', 1, 36);
    const returnRecord = await returnService.getReturnByTransactionId(txId, orgId);
    res.json(returnRecord);
  } catch (error) {
    next(error);
  }
};
