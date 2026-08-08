import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { validateUuid, validateNumber, validateString, validateOptionalString } from '../utils/validators';

const paymentService = new PaymentService();

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const invoiceId = validateUuid(req.body.invoice_id, 'invoice_id');
    const amount = validateNumber(req.body.amount, 'amount', 0.01);
    const method = validateString(req.body.payment_method, 'payment_method');
    const referenceNumber = validateOptionalString(req.body.reference_number, 'reference_number');

    const payment = await paymentService.recordPayment(orgId, invoiceId, amount, method, referenceNumber);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateUuid(req.params.id, 'id');

    const payment = await paymentService.getPayment(id, orgId);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

export const listPaymentsByInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const invoiceId = validateUuid(req.params.invoiceId, 'invoiceId');

    const payments = await paymentService.listPaymentsByInvoice(invoiceId, orgId);
    res.json(payments);
  } catch (err) {
    next(err);
  }
};
