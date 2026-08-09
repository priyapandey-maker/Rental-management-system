import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { validateString, validateEmail, validateOptionalString, validateOptionalEnum } from '../utils/validators';

const customerService = new CustomerService();

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const customer_number = validateString(req.body.customer_number, 'customer_number', 1, 50);
    const first_name = validateString(req.body.first_name, 'first_name', 1, 100);
    const last_name = validateString(req.body.last_name, 'last_name', 1, 100);
    const email = validateEmail(req.body.email, 'email');
    const phone = validateOptionalString(req.body.phone, 'phone', 30);
    const company_name = validateOptionalString(req.body.company_name, 'company_name', 255);
    const tax_id = validateOptionalString(req.body.tax_id, 'tax_id', 50);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'inactive', 'blacklisted']);

    const customer = await customerService.createCustomer(orgId, {
      customer_number,
      first_name,
      last_name,
      email,
      phone,
      company_name,
      tax_id,
      status: status ?? undefined
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const customer = await customerService.getCustomerById(id, orgId);
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const first_name = validateOptionalString(req.body.first_name, 'first_name', 100);
    const last_name = validateOptionalString(req.body.last_name, 'last_name', 100);
    const email = req.body.email !== undefined ? validateEmail(req.body.email, 'email') : undefined;
    const phone = validateOptionalString(req.body.phone, 'phone', 30);
    const company_name = validateOptionalString(req.body.company_name, 'company_name', 255);
    const tax_id = validateOptionalString(req.body.tax_id, 'tax_id', 50);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'inactive', 'blacklisted']);

    const customer = await customerService.updateCustomer(id, orgId, {
      first_name: first_name ?? undefined,
      last_name: last_name ?? undefined,
      email,
      phone,
      company_name,
      tax_id,
      status: status ?? undefined
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || undefined;
    const result = await customerService.listCustomersPaginated(orgId, page, limit, search);
    res.json({
      data: result.data,
      pagination: {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
