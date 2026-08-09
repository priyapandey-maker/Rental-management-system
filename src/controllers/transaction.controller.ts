import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import {
  validateString,
  validateNumber,
  validateDate,
  validateOptionalString,
  validateOptionalNumber,
} from '../utils/validators';

const txService = new TransactionService();

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const userId = req.context.userId;
    const customerId = validateString(req.body.customer_id, 'customer_id', 1, 36);

    const tx = await txService.createTransaction(orgId, customerId, userId);
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);

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
    const txId = validateString(req.params.id, 'id', 1, 36);

    const data = {
      product_id: validateString(req.body.product_id, 'product_id', 1, 36),
      variant_id: validateOptionalString(req.body.variant_id, 'variant_id', 36),
      quantity: validateNumber(req.body.quantity, 'quantity', 1),
      rental_start_date: new Date(validateDate(req.body.rental_start_date, 'rental_start_date')),
      rental_end_date: new Date(validateDate(req.body.rental_end_date, 'rental_end_date')),
      unit_price: validateNumber(req.body.unit_price, 'unit_price', 0),
      deposit_amount: validateOptionalNumber(req.body.deposit_amount, 'deposit_amount') ?? 0,
      late_fee_rate: validateOptionalNumber(req.body.late_fee_rate, 'late_fee_rate') ?? 0,
      pricelist_id: validateOptionalString(req.body.pricelist_id, 'pricelist_id', 36)
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
    const txId = validateString(req.params.id, 'id', 1, 36);

    await txService.confirmTransaction(txId, orgId);
    res.json({ message: 'Transaction confirmed successfully' });
  } catch (err) {
    next(err);
  }
};

export const cancelTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateString(req.params.id, 'id', 1, 36);

    await txService.cancelTransaction(txId, orgId);
    res.json({ message: 'Transaction cancelled successfully' });
  } catch (err) {
    next(err);
  }
};
