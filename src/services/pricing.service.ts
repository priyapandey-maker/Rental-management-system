import crypto from 'crypto';
import { PricingRepository, RentalPeriodRow, PricelistRow, PricelistItemRow } from '../repositories/pricing.repository';
import { VariantRepository } from '../repositories/variant.repository';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class PricingService {
  constructor(
    private pricingRepo = new PricingRepository(),
    private variantRepo = new VariantRepository()
  ) {}

  // Rental Periods
  async createRentalPeriod(
    orgId: string,
    data: {
      code: string;
      name: string;
      unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
      duration_value: number;
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ): Promise<RentalPeriodRow> {
    const existing = await this.pricingRepo.findRentalPeriodByCode(data.code, orgId);
    if (existing) {
      throw new ConflictError(`Rental period with code '${data.code}' already exists in this organization`);
    }

    const id = crypto.randomUUID();
    const period = {
      id,
      organization_id: orgId,
      code: data.code,
      name: data.name,
      unit: data.unit,
      duration_value: data.duration_value,
      status: data.status ?? 'ACTIVE'
    };

    await this.pricingRepo.createRentalPeriod(period);
    const created = await this.pricingRepo.findRentalPeriodById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created rental period');
    }
    return created;
  }

  async getRentalPeriodById(id: string, orgId: string): Promise<RentalPeriodRow> {
    const period = await this.pricingRepo.findRentalPeriodById(id, orgId);
    if (!period) {
      throw new NotFoundError(`Rental period with ID '${id}' not found`);
    }
    return period;
  }

  async listRentalPeriods(orgId: string): Promise<RentalPeriodRow[]> {
    return this.pricingRepo.listRentalPeriods(orgId);
  }

  // Pricelists
  async createPricelist(
    orgId: string,
    data: {
      code: string;
      name: string;
      is_default?: boolean;
      valid_from?: string | null;
      valid_to?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ): Promise<PricelistRow> {
    const existing = await this.pricingRepo.findPricelistByCode(data.code, orgId);
    if (existing) {
      throw new ConflictError(`Pricelist with code '${data.code}' already exists in this organization`);
    }

    const id = crypto.randomUUID();
    const shouldBeDefault = !!data.is_default;

    return runInTransaction(async (conn) => {
      if (shouldBeDefault) {
        await this.pricingRepo.clearDefaultsForPricelists(orgId, conn);
      }

      const list = {
        id,
        organization_id: orgId,
        code: data.code,
        name: data.name,
        is_default: shouldBeDefault ? 1 : 0,
        valid_from: data.valid_from ?? null,
        valid_to: data.valid_to ?? null,
        status: data.status ?? 'ACTIVE'
      };

      await this.pricingRepo.createPricelist(list, conn);
      const created = await this.pricingRepo.findPricelistById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created pricelist');
      }
      return created;
    });
  }

  async getPricelistById(id: string, orgId: string): Promise<PricelistRow> {
    const list = await this.pricingRepo.findPricelistById(id, orgId);
    if (!list) {
      throw new NotFoundError(`Pricelist with ID '${id}' not found`);
    }
    return list;
  }

  async listPricelists(orgId: string): Promise<PricelistRow[]> {
    return this.pricingRepo.listPricelists(orgId);
  }

  // Pricelist Items
  async createPricelistItem(
    orgId: string,
    data: {
      pricelist_id: string;
      product_variant_id: string;
      rental_period_id: string;
      unit_price: number;
      min_quantity?: number;
      max_quantity?: number | null;
      valid_from?: string | null;
      valid_to?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ): Promise<PricelistItemRow> {
    await this.getPricelistById(data.pricelist_id, orgId);

    const variant = await this.variantRepo.findById(data.product_variant_id, orgId);
    if (!variant) {
      throw new NotFoundError(`Product variant with ID '${data.product_variant_id}' not found in this organization`);
    }

    const period = await this.pricingRepo.findRentalPeriodById(data.rental_period_id, orgId);
    if (!period) {
      throw new NotFoundError(`Rental period with ID '${data.rental_period_id}' not found in this organization`);
    }

    const minQty = data.min_quantity ?? 1;
    if (data.max_quantity !== undefined && data.max_quantity !== null) {
      if (data.max_quantity < minQty) {
        throw new ValidationError('max_quantity must be greater than or equal to min_quantity');
      }
    }

    const duplicate = await this.pricingRepo.findDuplicateItem(data.pricelist_id, data.product_variant_id, data.rental_period_id, minQty);
    if (duplicate) {
      throw new ConflictError('A pricelist item with the same variant, rental period, and minimum quantity already exists and is ACTIVE');
    }

    const id = crypto.randomUUID();
    const item = {
      id,
      pricelist_id: data.pricelist_id,
      product_variant_id: data.product_variant_id,
      rental_period_id: data.rental_period_id,
      unit_price: data.unit_price,
      min_quantity: minQty,
      max_quantity: data.max_quantity ?? null,
      valid_from: data.valid_from ?? null,
      valid_to: data.valid_to ?? null,
      status: data.status ?? 'ACTIVE'
    };

    await this.pricingRepo.createPricelistItem(item);
    const created = await this.pricingRepo.findPricelistItemById(id);
    if (!created) {
      throw new Error('Failed to retrieve created pricelist item');
    }
    return created;
  }

  async listPricelistItems(pricelistId: string, orgId: string): Promise<PricelistItemRow[]> {
    await this.getPricelistById(pricelistId, orgId);
    return this.pricingRepo.listPricelistItems(pricelistId);
  }
}
