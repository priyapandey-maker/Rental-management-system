import crypto from 'crypto';
import { RentalConfigRepository, RentalSettingsRow, LateFeeRuleRow } from '../repositories/rentalConfig.repository';
import { PricingRepository } from '../repositories/pricing.repository';
import { NotFoundError, ValidationError } from '../errors';

export class RentalConfigService {
  constructor(
    private configRepo = new RentalConfigRepository(),
    private pricingRepo = new PricingRepository()
  ) {}

  async getSettings(orgId: string): Promise<RentalSettingsRow> {
    const settings = await this.configRepo.findSettings(orgId);
    if (!settings) {
      throw new NotFoundError(`Rental settings not found for organization '${orgId}'`);
    }
    return settings;
  }

  async updateSettings(
    orgId: string,
    userId: string,
    data: {
      default_pricelist_id: string;
      deposit_type: 'FIXED' | 'PERCENTAGE';
      default_deposit_value: number;
      grace_period_minutes: number;
      late_fee_unit: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
      late_fee_rate: number;
      maximum_late_fee?: number | null;
      pickup_enabled?: boolean;
      delivery_enabled?: boolean;
    }
  ): Promise<RentalSettingsRow> {
    const pricelist = await this.pricingRepo.findPricelistById(data.default_pricelist_id, orgId);
    if (!pricelist) {
      throw new NotFoundError(`Default pricelist with ID '${data.default_pricelist_id}' not found in this organization`);
    }

    const settings = {
      organization_id: orgId,
      default_pricelist_id: data.default_pricelist_id,
      deposit_type: data.deposit_type,
      default_deposit_value: data.default_deposit_value,
      grace_period_minutes: data.grace_period_minutes,
      late_fee_unit: data.late_fee_unit,
      late_fee_rate: data.late_fee_rate,
      maximum_late_fee: data.maximum_late_fee ?? null,
      pickup_enabled: data.pickup_enabled !== false ? 1 : 0,
      delivery_enabled: data.delivery_enabled === true ? 1 : 0,
      updated_by: userId
    };

    await this.configRepo.upsertSettings(settings);
    return this.getSettings(orgId);
  }

  async createLateFeeRule(
    orgId: string,
    data: {
      name: string;
      charging_unit: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
      rate: number;
      grace_period_minutes?: number;
      maximum_fee?: number | null;
      valid_from?: string | null;
      valid_to?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ): Promise<LateFeeRuleRow> {
    if (data.valid_from && data.valid_to) {
      if (new Date(data.valid_to) < new Date(data.valid_from)) {
        throw new ValidationError('valid_to date must be after valid_from date');
      }
    }

    const id = crypto.randomUUID();
    const rule = {
      id,
      organization_id: orgId,
      name: data.name,
      charging_unit: data.charging_unit,
      rate: data.rate,
      grace_period_minutes: data.grace_period_minutes ?? 0,
      maximum_fee: data.maximum_fee ?? null,
      valid_from: data.valid_from ?? null,
      valid_to: data.valid_to ?? null,
      status: data.status ?? 'ACTIVE'
    };

    await this.configRepo.createLateFeeRule(rule);
    const created = await this.configRepo.findLateFeeRuleById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created late fee rule');
    }
    return created;
  }

  async getLateFeeRuleById(id: string, orgId: string): Promise<LateFeeRuleRow> {
    const rule = await this.configRepo.findLateFeeRuleById(id, orgId);
    if (!rule) {
      throw new NotFoundError(`Late fee rule with ID '${id}' not found`);
    }
    return rule;
  }

  async listLateFeeRules(orgId: string): Promise<LateFeeRuleRow[]> {
    return this.configRepo.listLateFeeRules(orgId);
  }
}
