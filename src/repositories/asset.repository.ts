import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface AssetInsert {
  id: string;
  organization_id: string;
  product_variant_id: string;
  asset_tag: string;
  serial_number: string | null;
  qr_code: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  condition_status: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
  lifecycle_status: 'AVAILABLE' | 'RESERVED' | 'ALLOCATED' | 'RENTED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED';
  location: string | null;
}

export interface AssetRow extends AssetInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class AssetRepository extends BaseRepository {
  async create(
    asset: AssetInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, qr_code, acquisition_date, acquisition_cost, condition_status, lifecycle_status, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        asset.id,
        asset.organization_id,
        asset.product_variant_id,
        asset.asset_tag,
        asset.serial_number,
        asset.qr_code,
        asset.acquisition_date,
        asset.acquisition_cost,
        asset.condition_status,
        asset.lifecycle_status,
        asset.location
      ],
      connection
    );
  }

  async findById(id: string, organizationId: string, connection?: QueryConnection): Promise<AssetRow | null> {
    const sql = `SELECT * FROM assets WHERE id = ? AND organization_id = ?`;
    return this.queryOne<AssetRow>(sql, [id, organizationId], connection);
  }

  async findByTag(tag: string, organizationId: string, connection?: QueryConnection): Promise<AssetRow | null> {
    const sql = `SELECT * FROM assets WHERE asset_tag = ? AND organization_id = ?`;
    return this.queryOne<AssetRow>(sql, [tag, organizationId], connection);
  }

  async findBySerialNumber(sn: string, organizationId: string, connection?: QueryConnection): Promise<AssetRow | null> {
    const sql = `SELECT * FROM assets WHERE serial_number = ? AND organization_id = ?`;
    return this.queryOne<AssetRow>(sql, [sn, organizationId], connection);
  }

  async findByQrCode(qr: string, organizationId: string, connection?: QueryConnection): Promise<AssetRow | null> {
    const sql = `SELECT * FROM assets WHERE qr_code = ? AND organization_id = ?`;
    return this.queryOne<AssetRow>(sql, [qr, organizationId], connection);
  }

  async list(organizationId: string, connection?: QueryConnection): Promise<AssetRow[]> {
    const sql = `SELECT * FROM assets WHERE organization_id = ? ORDER BY asset_tag ASC`;
    return this.query<AssetRow[]>(sql, [organizationId], connection);
  }
}
