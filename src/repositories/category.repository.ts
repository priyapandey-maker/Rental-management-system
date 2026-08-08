import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface CategoryInsert {
  id: string;
  organization_id: string;
  parent_id: string | null;
  name: string;
  code: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface CategoryRow extends CategoryInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class CategoryRepository extends BaseRepository {
  async create(
    category: CategoryInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO categories (id, organization_id, parent_id, name, code, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        category.id,
        category.organization_id,
        category.parent_id,
        category.name,
        category.code,
        category.description,
        category.status
      ],
      connection
    );
  }

  async findById(id: string, organizationId: string, connection?: QueryConnection): Promise<CategoryRow | null> {
    const sql = `SELECT * FROM categories WHERE id = ? AND organization_id = ?`;
    return this.queryOne<CategoryRow>(sql, [id, organizationId], connection);
  }

  async findByCode(code: string, organizationId: string, connection?: QueryConnection): Promise<CategoryRow | null> {
    const sql = `SELECT * FROM categories WHERE code = ? AND organization_id = ?`;
    return this.queryOne<CategoryRow>(sql, [code, organizationId], connection);
  }

  async list(organizationId: string, connection?: QueryConnection): Promise<CategoryRow[]> {
    const sql = `SELECT * FROM categories WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<CategoryRow[]>(sql, [organizationId], connection);
  }
}
