import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface VariantInsert {
  id: string;
  organization_id: string;
  product_id: string;
  sku: string;
  name: string;
  barcode: string | null;
  status: 'active' | 'inactive' | 'archived';
}

export interface VariantRow extends VariantInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface VariantAttributeValueRow extends RowDataPacket {
  variant_id: string;
  attribute_value_id: string;
  created_at: string;
}

export class VariantRepository extends BaseRepository {
  async create(
    variant: VariantInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO variants (id, organization_id, product_id, sku, name, barcode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        variant.id,
        variant.organization_id,
        variant.product_id,
        variant.sku,
        variant.name,
        variant.barcode,
        variant.status
      ],
      connection
    );
  }

  async findById(id: string, organizationId: string, connection?: QueryConnection): Promise<VariantRow | null> {
    const sql = `SELECT * FROM variants WHERE id = ? AND organization_id = ?`;
    return this.queryOne<VariantRow>(sql, [id, organizationId], connection);
  }

  async findBySku(sku: string, organizationId: string, connection?: QueryConnection): Promise<VariantRow | null> {
    const sql = `SELECT * FROM variants WHERE sku = ? AND organization_id = ?`;
    return this.queryOne<VariantRow>(sql, [sku, organizationId], connection);
  }

  async listByProductId(productId: string, organizationId: string, connection?: QueryConnection): Promise<VariantRow[]> {
    const sql = `SELECT * FROM variants WHERE product_id = ? AND organization_id = ? ORDER BY name ASC`;
    return this.query<VariantRow[]>(sql, [productId, organizationId], connection);
  }

  async addAttributeValue(variantId: string, attributeValueId: string, connection?: QueryConnection): Promise<void> {
    const sql = `INSERT INTO variant_attribute_values (variant_id, attribute_value_id) VALUES (?, ?)`;
    await this.query<ResultSetHeader>(sql, [variantId, attributeValueId], connection);
  }

  async getAttributeValuesForVariant(variantId: string, connection?: QueryConnection): Promise<string[]> {
    const sql = `SELECT attribute_value_id FROM variant_attribute_values WHERE variant_id = ?`;
    const rows = await this.query<RowDataPacket[]>(sql, [variantId], connection);
    return rows.map((r) => r.attribute_value_id);
  }
}
