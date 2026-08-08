import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service';
import { validateString, validateOptionalBoolean, validateEnum, validateOptionalEnum, validateNumber, validateOptionalNumber, validateOptionalDate } from '../utils/validators';

const pricingService = new PricingService();

// Rental Periods
export const createRentalPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const code = validateString(req.body.code, 'code', 1, 50);
    const name = validateString(req.body.name, 'name', 1, 100);
    const unit = validateEnum(req.body.unit, 'unit', ['HOUR', 'DAY', 'WEEK', 'MONTH']);
    const duration_value = validateNumber(req.body.duration_value, 'duration_value', 0.01);
    const status = validateOptionalEnum(req.body.status, 'status', ['ACTIVE', 'INACTIVE']);

    const period = await pricingService.createRentalPeriod(orgId, {
      code,
      name,
      unit,
      duration_value,
      status: status ?? undefined
    });
    res.status(201).json(period);
  } catch (error) {
    next(error);
  }
};

export const listRentalPeriods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const periods = await pricingService.listRentalPeriods(orgId);
    res.json(periods);
  } catch (error) {
    next(error);
  }
};

// Pricelists
export const createPricelist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const code = validateString(req.body.code, 'code', 1, 50);
    const name = validateString(req.body.name, 'name', 1, 150);
    const is_default = validateOptionalBoolean(req.body.is_default, 'is_default') ?? undefined;
    const valid_from = validateOptionalDate(req.body.valid_from, 'valid_from');
    const valid_to = validateOptionalDate(req.body.valid_to, 'valid_to');
    const status = validateOptionalEnum(req.body.status, 'status', ['ACTIVE', 'INACTIVE']);

    const list = await pricingService.createPricelist(orgId, {
      code,
      name,
      is_default,
      valid_from,
      valid_to,
      status: status ?? undefined
    });
    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

export const getPricelist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const list = await pricingService.getPricelistById(id, orgId);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const listPricelists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const lists = await pricingService.listPricelists(orgId);
    res.json(lists);
  } catch (error) {
    next(error);
  }
};

// Pricelist Items
export const createPricelistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const pricelistId = validateString(req.params.id, 'id', 1, 36);
    const product_variant_id = validateString(req.body.product_variant_id, 'product_variant_id', 36, 36);
    const rental_period_id = validateString(req.body.rental_period_id, 'rental_period_id', 36, 36);
    const unit_price = validateNumber(req.body.unit_price, 'unit_price', 0);
    const min_quantity = validateOptionalNumber(req.body.min_quantity, 'min_quantity', 0.001);
    const max_quantity = validateOptionalNumber(req.body.max_quantity, 'max_quantity', 0.001);
    const valid_from = validateOptionalDate(req.body.valid_from, 'valid_from');
    const valid_to = validateOptionalDate(req.body.valid_to, 'valid_to');
    const status = validateOptionalEnum(req.body.status, 'status', ['ACTIVE', 'INACTIVE']);

    const item = await pricingService.createPricelistItem(orgId, {
      pricelist_id: pricelistId,
      product_variant_id,
      rental_period_id,
      unit_price,
      min_quantity: min_quantity ?? undefined,
      max_quantity,
      valid_from,
      valid_to,
      status: status ?? undefined
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const listPricelistItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const pricelistId = validateString(req.params.id, 'id', 1, 36);
    const items = await pricingService.listPricelistItems(pricelistId, orgId);
    res.json(items);
  } catch (error) {
    next(error);
  }
};
