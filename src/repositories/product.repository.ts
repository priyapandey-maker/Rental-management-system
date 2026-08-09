import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface ProductInsert {
  id: string;
  organization_id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  image_url?: string | null;
  rental_type: 'rentable' | 'consumable' | 'service';
  status: 'active' | 'archived' | 'draft';
}

export interface ProductRow extends ProductInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class ProductRepository extends BaseRepository {
  async create(
    product: ProductInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO products (id, organization_id, category_id, name, sku, description, image_url, rental_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        product.id,
        product.organization_id,
        product.category_id,
        product.name,
        product.sku,
        product.description,
        product.image_url || null,
        product.rental_type,
        product.status
      ],
      connection
    );
  }

  async findById(id: string, organizationId?: string, connection?: QueryConnection): Promise<ProductRow | null> {
    if (organizationId) {
      const sql = `SELECT * FROM products WHERE id = ? AND organization_id = ?`;
      const res = await this.queryOne<ProductRow>(sql, [id, organizationId], connection);
      if (res) return res;
    }
    const sql = `SELECT * FROM products WHERE id = ?`;
    return this.queryOne<ProductRow>(sql, [id], connection);
  }

  async findBySku(sku: string, organizationId: string, connection?: QueryConnection): Promise<ProductRow | null> {
    const sql = `SELECT * FROM products WHERE sku = ? AND organization_id = ?`;
    return this.queryOne<ProductRow>(sql, [sku, organizationId], connection);
  }

  async update(
    id: string,
    organizationId: string,
    updates: Partial<Pick<ProductRow, 'name' | 'category_id' | 'description' | 'image_url' | 'rental_type' | 'status'>>,
    connection?: QueryConnection
  ): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`\`${key}\` = ?`);
      params.push(value);
    }
    if (fields.length === 0) return;
    params.push(id, organizationId);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, params, connection);
  }

  async list(organizationId: string, connection?: QueryConnection): Promise<ProductRow[]> {
    const sql = `SELECT * FROM products WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<ProductRow[]>(sql, [organizationId], connection);
  }

  async delete(id: string, organizationId: string, connection?: QueryConnection): Promise<void> {
    const sql = `DELETE FROM products WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [id, organizationId], connection);
  }
}
