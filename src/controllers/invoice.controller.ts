import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { validateUuid, validateOptionalDate } from '../utils/validators';

const invoiceService = new InvoiceService();

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const txId = validateUuid(req.body.transaction_id, 'transaction_id');
    const dueDateStr = validateOptionalDate(req.body.due_date, 'due_date');
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    const invoice = await invoiceService.createInvoice(orgId, txId, dueDate);
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateUuid(req.params.id, 'id');

    const invoice = await invoiceService.getInvoice(id, orgId);
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

export const issueInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateUuid(req.params.id, 'id');

    await invoiceService.issueInvoice(id, orgId);
    res.json({ message: 'Invoice issued successfully' });
  } catch (err) {
    next(err);
  }
};
