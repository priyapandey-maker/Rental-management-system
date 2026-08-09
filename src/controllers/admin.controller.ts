import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { validateString, validateOptionalEnum } from '../utils/validators';

const adminService = new AdminService();

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await adminService.getPlatformDashboard();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export const listVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await adminService.listVendors();
    res.json(vendors);
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

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listCustomers();
    res.json(data);
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
      status: req.body.status
    });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listProducts();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listAssets();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.listTransactions();
    res.json(data);
  } catch (err) {
    next(err);
  }
};
