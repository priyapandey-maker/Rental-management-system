import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface RentalSettingsInsert {
  organization_id: string;
  default_pricelist_id: string;
  deposit_type: 'FIXED' | 'PERCENTAGE';
  default_deposit_value: number;
  grace_period_minutes: number;
  late_fee_unit: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  late_fee_rate: number;
  maximum_late_fee: number | null;
  pickup_enabled: number;
  delivery_enabled: number;
  updated_by: string | null;
}

export interface RentalSettingsRow extends RentalSettingsInsert, RowDataPacket {
  updated_at: string;
}

export interface LateFeeRuleInsert {
  id: string;
  organization_id: string;
  name: string;
  charging_unit: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  rate: number;
  grace_period_minutes: number;
  maximum_fee: number | null;
  valid_from: string | null;
  valid_to: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LateFeeRuleRow extends LateFeeRuleInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class RentalConfigRepository extends BaseRepository {
  async findSettings(organizationId: string, connection?: QueryConnection): Promise<RentalSettingsRow | null> {
    const sql = `SELECT * FROM rental_settings WHERE organization_id = ?`;
    return this.queryOne<RentalSettingsRow>(sql, [organizationId], connection);
  }

  async upsertSettings(
    settings: RentalSettingsInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_settings (
        organization_id, default_pricelist_id, deposit_type, default_deposit_value, grace_period_minutes,
        late_fee_unit, late_fee_rate, maximum_late_fee, pickup_enabled, delivery_enabled, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        default_pricelist_id = VALUES(default_pricelist_id),
        deposit_type = VALUES(deposit_type),
        default_deposit_value = VALUES(default_deposit_value),
        grace_period_minutes = VALUES(grace_period_minutes),
        late_fee_unit = VALUES(late_fee_unit),
        late_fee_rate = VALUES(late_fee_rate),
        maximum_late_fee = VALUES(maximum_late_fee),
        pickup_enabled = VALUES(pickup_enabled),
        delivery_enabled = VALUES(delivery_enabled),
        updated_by = VALUES(updated_by)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        settings.organization_id,
        settings.default_pricelist_id,
        settings.deposit_type,
        settings.default_deposit_value,
        settings.grace_period_minutes,
        settings.late_fee_unit,
        settings.late_fee_rate,
        settings.maximum_late_fee,
        settings.pickup_enabled,
        settings.delivery_enabled,
        settings.updated_by
      ],
      connection
    );
  }

  async createLateFeeRule(
    rule: LateFeeRuleInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO late_fee_rules (id, organization_id, name, charging_unit, rate, grace_period_minutes, maximum_fee, valid_from, valid_to, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        rule.id,
        rule.organization_id,
        rule.name,
        rule.charging_unit,
        rule.rate,
        rule.grace_period_minutes,
        rule.maximum_fee,
        rule.valid_from,
        rule.valid_to,
        rule.status
      ],
      connection
    );
  }

  async findLateFeeRuleById(id: string, organizationId: string, connection?: QueryConnection): Promise<LateFeeRuleRow | null> {
    const sql = `SELECT * FROM late_fee_rules WHERE id = ? AND organization_id = ?`;
    return this.queryOne<LateFeeRuleRow>(sql, [id, organizationId], connection);
  }

  async listLateFeeRules(organizationId: string, connection?: QueryConnection): Promise<LateFeeRuleRow[]> {
    const sql = `SELECT * FROM late_fee_rules WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<LateFeeRuleRow[]>(sql, [organizationId], connection);
  }
}
