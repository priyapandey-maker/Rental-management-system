import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface RentalPeriodInsert {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  duration_value: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RentalPeriodRow extends RentalPeriodInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface PricelistInsert {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  is_default: number;
  valid_from: string | null;
  valid_to: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PricelistRow extends PricelistInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface PricelistItemInsert {
  id: string;
  pricelist_id: string;
  product_variant_id: string;
  rental_period_id: string;
  unit_price: number;
  min_quantity: number;
  max_quantity: number | null;
  valid_from: string | null;
  valid_to: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PricelistItemRow extends PricelistItemInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class PricingRepository extends BaseRepository {
  // Rental Periods
  async createRentalPeriod(
    period: RentalPeriodInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_periods (id, organization_id, code, name, unit, duration_value, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        period.id,
        period.organization_id,
        period.code,
        period.name,
        period.unit,
        period.duration_value,
        period.status
      ],
      connection
    );
  }

  async findRentalPeriodById(id: string, organizationId: string, connection?: QueryConnection): Promise<RentalPeriodRow | null> {
    const sql = `SELECT * FROM rental_periods WHERE id = ? AND organization_id = ?`;
    return this.queryOne<RentalPeriodRow>(sql, [id, organizationId], connection);
  }

  async findRentalPeriodByCode(code: string, organizationId: string, connection?: QueryConnection): Promise<RentalPeriodRow | null> {
    const sql = `SELECT * FROM rental_periods WHERE code = ? AND organization_id = ?`;
    return this.queryOne<RentalPeriodRow>(sql, [code, organizationId], connection);
  }

  async listRentalPeriods(organizationId: string, connection?: QueryConnection): Promise<RentalPeriodRow[]> {
    const sql = `SELECT * FROM rental_periods WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<RentalPeriodRow[]>(sql, [organizationId], connection);
  }

  // Pricelists
  async createPricelist(
    list: PricelistInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO pricelists (id, organization_id, code, name, is_default, valid_from, valid_to, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        list.id,
        list.organization_id,
        list.code,
        list.name,
        list.is_default,
        list.valid_from,
        list.valid_to,
        list.status
      ],
      connection
    );
  }

  async findPricelistById(id: string, organizationId: string, connection?: QueryConnection): Promise<PricelistRow | null> {
    const sql = `SELECT * FROM pricelists WHERE id = ? AND organization_id = ?`;
    return this.queryOne<PricelistRow>(sql, [id, organizationId], connection);
  }

  async findPricelistByCode(code: string, organizationId: string, connection?: QueryConnection): Promise<PricelistRow | null> {
    const sql = `SELECT * FROM pricelists WHERE code = ? AND organization_id = ?`;
    return this.queryOne<PricelistRow>(sql, [code, organizationId], connection);
  }

  async listPricelists(organizationId: string, connection?: QueryConnection): Promise<PricelistRow[]> {
    const sql = `SELECT * FROM pricelists WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<PricelistRow[]>(sql, [organizationId], connection);
  }

  async clearDefaultsForPricelists(organizationId: string, connection?: QueryConnection): Promise<void> {
    const sql = `UPDATE pricelists SET is_default = FALSE WHERE organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [organizationId], connection);
  }

  // Pricelist Items
  async createPricelistItem(
    item: PricelistItemInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO pricelist_items (id, pricelist_id, product_variant_id, rental_period_id, unit_price, min_quantity, max_quantity, valid_from, valid_to, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        item.id,
        item.pricelist_id,
        item.product_variant_id,
        item.rental_period_id,
        item.unit_price,
        item.min_quantity,
        item.max_quantity,
        item.valid_from,
        item.valid_to,
        item.status
      ],
      connection
    );
  }

  async findPricelistItemById(id: string, connection?: QueryConnection): Promise<PricelistItemRow | null> {
    const sql = `SELECT * FROM pricelist_items WHERE id = ?`;
    return this.queryOne<PricelistItemRow>(sql, [id], connection);
  }

  async listPricelistItems(pricelistId: string, connection?: QueryConnection): Promise<PricelistItemRow[]> {
    const sql = `SELECT * FROM pricelist_items WHERE pricelist_id = ? ORDER BY created_at ASC`;
    return this.query<PricelistItemRow[]>(sql, [pricelistId], connection);
  }

  async findDuplicateItem(
    pricelistId: string,
    variantId: string,
    periodId: string,
    minQty: number,
    connection?: QueryConnection
  ): Promise<PricelistItemRow | null> {
    const sql = `
      SELECT * FROM pricelist_items 
      WHERE pricelist_id = ? AND product_variant_id = ? AND rental_period_id = ? AND min_quantity = ? AND status = 'ACTIVE'
    `;
    return this.queryOne<PricelistItemRow>(sql, [pricelistId, variantId, periodId, minQty], connection);
  }
}
