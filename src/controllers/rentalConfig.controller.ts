import { Request, Response, NextFunction } from 'express';
import { RentalConfigService } from '../services/rentalConfig.service';
import { validateString, validateOptionalBoolean, validateEnum, validateOptionalEnum, validateNumber, validateOptionalNumber, validateOptionalDate } from '../utils/validators';

const configService = new RentalConfigService();

// Rental Settings
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const settings = await configService.getSettings(orgId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const userId = req.context.userId || 'system';
    const default_pricelist_id = validateString(req.body.default_pricelist_id, 'default_pricelist_id', 3, 36);
    const deposit_type = validateEnum(req.body.deposit_type, 'deposit_type', ['FIXED', 'PERCENTAGE']);
    const default_deposit_value = validateNumber(req.body.default_deposit_value, 'default_deposit_value', 0);
    const grace_period_minutes = validateNumber(req.body.grace_period_minutes, 'grace_period_minutes', 0);
    const late_fee_unit = validateEnum(req.body.late_fee_unit, 'late_fee_unit', ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']);
    const late_fee_rate = validateNumber(req.body.late_fee_rate, 'late_fee_rate', 0);
    const maximum_late_fee = validateOptionalNumber(req.body.maximum_late_fee, 'maximum_late_fee', 0);
    const pickup_enabled = validateOptionalBoolean(req.body.pickup_enabled, 'pickup_enabled') ?? undefined;
    const delivery_enabled = validateOptionalBoolean(req.body.delivery_enabled, 'delivery_enabled') ?? undefined;

    const settings = await configService.updateSettings(orgId, userId, {
      default_pricelist_id,
      deposit_type,
      default_deposit_value,
      grace_period_minutes,
      late_fee_unit,
      late_fee_rate,
      maximum_late_fee,
      pickup_enabled,
      delivery_enabled
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Late Fee Rules
export const createLateFeeRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const name = validateString(req.body.name, 'name', 1, 150);
    const charging_unit = validateEnum(req.body.charging_unit, 'charging_unit', ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']);
    const rate = validateNumber(req.body.rate, 'rate', 0);
    const grace_period_minutes = validateOptionalNumber(req.body.grace_period_minutes, 'grace_period_minutes', 0) ?? undefined;
    const maximum_fee = validateOptionalNumber(req.body.maximum_fee, 'maximum_fee', 0);
    const valid_from = validateOptionalDate(req.body.valid_from, 'valid_from');
    const valid_to = validateOptionalDate(req.body.valid_to, 'valid_to');
    const status = validateOptionalEnum(req.body.status, 'status', ['ACTIVE', 'INACTIVE']);

    const rule = await configService.createLateFeeRule(orgId, {
      name,
      charging_unit,
      rate,
      grace_period_minutes,
      maximum_fee,
      valid_from,
      valid_to,
      status: status ?? undefined
    });
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
};

export const getLateFeeRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const rule = await configService.getLateFeeRuleById(id, orgId);
    res.json(rule);
  } catch (error) {
    next(error);
  }
};

export const listLateFeeRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const rules = await configService.listLateFeeRules(orgId);
    res.json(rules);
  } catch (error) {
    next(error);
  }
};
