import { Request, Response, NextFunction } from 'express';
import { ReadService } from '../services/read.service';
import { validateOptionalNumber } from '../utils/validators';

const readService = new ReadService();

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const page = validateOptionalNumber(req.query.page, 'page', 1) ?? 1;
    const limit = validateOptionalNumber(req.query.limit, 'limit', 1) ?? 10;

    const result = await readService.listTransactions(orgId, page, Math.min(limit, 100));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const page = validateOptionalNumber(req.query.page, 'page', 1) ?? 1;
    const limit = validateOptionalNumber(req.query.limit, 'limit', 1) ?? 10;

    const result = await readService.listInvoices(orgId, page, Math.min(limit, 100));
    res.json(result);
  } catch (err) {
    next(err);
  }
};
