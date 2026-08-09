import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { validateString, validateOptionalEnum } from '../utils/validators';

const adminService = new AdminService();

// ─── Helper ───────────────────────────────────────────────────────────────────
function parsePagination(req: Request, defaultLimit = 20) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  return { page, limit };
}

function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await adminService.getPlatformDashboard();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const listVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req);
    const search = (req.query.search as string) || undefined;
    const result = await adminService.listVendorsPaginated(page, limit, search);
    res.json({ data: result.data, pagination: paginationMeta(page, limit, result.total) });
  } catch (err) {
    next(err);
  }
};

export const updateVendorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateString(req.params.id, 'id', 1, 36);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'inactive', 'suspended']) as any;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }
    await adminService.updateVendorStatus(id, status);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req);
    const search = (req.query.search as string) || undefined;
    const result = await adminService.listCustomersPaginated(page, limit, search);
    res.json({ data: result.data, pagination: paginationMeta(page, limit, result.total) });
  } catch (err) {
    next(err);
  }
};

import { CustomerService } from '../services/customer.service';
const customerService = new CustomerService();

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = validateString(req.body.organization_id, 'organization_id', 3, 36);
    // Call the existing customer service with the provided orgId
    const customer = await customerService.createCustomer(orgId, {
      customer_number: req.body.customer_number,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      status: req.body.status,
    });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

// ─── Products ────────────────────────────────────────────────────────────────
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req);
    const search = (req.query.search as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const result = await adminService.listProductsPaginated(page, limit, search, status);
    res.json({ data: result.data, pagination: paginationMeta(page, limit, result.total) });
  } catch (err) {
    next(err);
  }
};

// ─── Assets ──────────────────────────────────────────────────────────────────
export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req);
    const search = (req.query.search as string) || undefined;
    const lifecycleStatus = (req.query.lifecycle_status as string) || undefined;
    const result = await adminService.listAssetsPaginated(page, limit, search, lifecycleStatus);
    res.json({ data: result.data, pagination: paginationMeta(page, limit, result.total) });
  } catch (err) {
    next(err);
  }
};

// ─── Transactions ────────────────────────────────────────────────────────────
export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req);
    const status = (req.query.status as string) || undefined;
    const result = await adminService.listTransactionsPaginated(page, limit, status);
    res.json({ data: result.data, pagination: paginationMeta(page, limit, result.total) });
  } catch (err) {
    next(err);
  }
};
