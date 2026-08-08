import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface AttributeInsert {
  id: string;
  organization_id: string;
  name: string;
  code: string;
}

export interface AttributeRow extends AttributeInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export interface AttributeValueInsert {
  id: string;
  attribute_id: string;
  value: string;
  code: string;
}

export interface AttributeValueRow extends AttributeValueInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class AttributeRepository extends BaseRepository {
  async createAttribute(
    attr: AttributeInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `INSERT INTO attributes (id, organization_id, name, code) VALUES (?, ?, ?, ?)`;
    await this.query<ResultSetHeader>(sql, [attr.id, attr.organization_id, attr.name, attr.code], connection);
  }

  async findAttributeById(id: string, organizationId: string, connection?: QueryConnection): Promise<AttributeRow | null> {
    const sql = `SELECT * FROM attributes WHERE id = ? AND organization_id = ?`;
    return this.queryOne<AttributeRow>(sql, [id, organizationId], connection);
  }

  async findAttributeByCode(code: string, organizationId: string, connection?: QueryConnection): Promise<AttributeRow | null> {
    const sql = `SELECT * FROM attributes WHERE code = ? AND organization_id = ?`;
    return this.queryOne<AttributeRow>(sql, [code, organizationId], connection);
  }

  async listAttributes(organizationId: string, connection?: QueryConnection): Promise<AttributeRow[]> {
    const sql = `SELECT * FROM attributes WHERE organization_id = ? ORDER BY name ASC`;
    return this.query<AttributeRow[]>(sql, [organizationId], connection);
  }

  async createAttributeValue(
    val: AttributeValueInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `INSERT INTO attribute_values (id, attribute_id, value, code) VALUES (?, ?, ?, ?)`;
    await this.query<ResultSetHeader>(sql, [val.id, val.attribute_id, val.value, val.code], connection);
  }

  async findAttributeValueById(id: string, connection?: QueryConnection): Promise<AttributeValueRow | null> {
    const sql = `SELECT * FROM attribute_values WHERE id = ?`;
    return this.queryOne<AttributeValueRow>(sql, [id], connection);
  }

  async findAttributeValueByCode(attributeId: string, code: string, connection?: QueryConnection): Promise<AttributeValueRow | null> {
    const sql = `SELECT * FROM attribute_values WHERE attribute_id = ? AND code = ?`;
    return this.queryOne<AttributeValueRow>(sql, [attributeId, code], connection);
  }

  async findValuesByAttributeId(attributeId: string, connection?: QueryConnection): Promise<AttributeValueRow[]> {
    const sql = `SELECT * FROM attribute_values WHERE attribute_id = ? ORDER BY value ASC`;
    return this.query<AttributeValueRow[]>(sql, [attributeId], connection);
  }
}
