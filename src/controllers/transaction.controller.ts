import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import {
  validateUuid,
  validateNumber,
  validateDate,
  validateOptionalUuid,
  validateOptionalNumber,
} from '../utils/validators';

const txService = new TransactionService();

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const userId = req.context.userId;
    const customerId = validateUuid(req.body.customer_id, 'customer_id');

    const tx = await txService.createTransaction(orgId, customerId, userId);
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateUuid(req.params.id, 'id');

    const tx = await txService.getTransaction(id, orgId);
    res.json(tx);
  } catch (err) {
    next(err);
  }
};

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txs = await txService.listTransactions(orgId);
    res.json(txs);
  } catch (err) {
    next(err);
  }
};

export const addTransactionLine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    const data = {
      product_id: validateUuid(req.body.product_id, 'product_id'),
      variant_id: validateOptionalUuid(req.body.variant_id, 'variant_id'),
      quantity: validateNumber(req.body.quantity, 'quantity', 1),
      rental_start_date: new Date(validateDate(req.body.rental_start_date, 'rental_start_date')),
      rental_end_date: new Date(validateDate(req.body.rental_end_date, 'rental_end_date')),
      unit_price: validateNumber(req.body.unit_price, 'unit_price', 0),
      deposit_amount: validateOptionalNumber(req.body.deposit_amount, 'deposit_amount') ?? 0,
      late_fee_rate: validateOptionalNumber(req.body.late_fee_rate, 'late_fee_rate') ?? 0,
      pricelist_id: validateOptionalUuid(req.body.pricelist_id, 'pricelist_id')
    };

    const result = await txService.addTransactionLine(orgId, txId, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const confirmTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await txService.confirmTransaction(txId, orgId);
    res.json({ message: 'Transaction confirmed successfully' });
  } catch (err) {
    next(err);
  }
};

export const cancelTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.params.id, 'id');

    await txService.cancelTransaction(txId, orgId);
    res.json({ message: 'Transaction cancelled successfully' });
  } catch (err) {
    next(err);
  }
};
