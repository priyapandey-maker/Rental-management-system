import { Request, Response, NextFunction } from 'express';
import { FulfillmentService } from '../services/fulfillment.service';
import { validateString } from '../utils/validators';

const fulfillmentService = new FulfillmentService();

export const createFulfillment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const userId = req.context.userId || 'system';
    const transactionId = validateString(req.body.transaction_id, 'transaction_id', 36, 36);

    const fulfillment = await fulfillmentService.createFulfillment(orgId, transactionId, userId);
    res.status(201).json(fulfillment);
  } catch (error) {
    next(error);
  }
};

export const getFulfillment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const fulfillment = await fulfillmentService.getFulfillmentById(id, orgId);
    res.json(fulfillment);
  } catch (error) {
    next(error);
  }
};

export const getFulfillmentByTx = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateString(req.params.txId, 'txId', 1, 36);
    const fulfillment = await fulfillmentService.getFulfillmentByTransactionId(txId, orgId);
    res.json(fulfillment);
  } catch (error) {
    next(error);
  }
};
