import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface AddressInsert {
  id: string;
  organization_id: string;
  customer_id: string;
  type: 'billing' | 'shipping' | 'primary' | 'other';
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number;
}

export interface AddressRow extends AddressInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class AddressRepository extends BaseRepository {
  async create(
    address: AddressInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO addresses (id, organization_id, customer_id, type, address_line1, address_line2, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        address.id,
        address.organization_id,
        address.customer_id,
        address.type,
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
        address.is_default
      ],
      connection
    );
  }

  async findById(id: string, organizationId: string, connection?: QueryConnection): Promise<AddressRow | null> {
    const sql = `SELECT * FROM addresses WHERE id = ? AND organization_id = ?`;
    return this.queryOne<AddressRow>(sql, [id, organizationId], connection);
  }

  async findByCustomerId(customerId: string, organizationId: string, connection?: QueryConnection): Promise<AddressRow[]> {
    const sql = `SELECT * FROM addresses WHERE customer_id = ? AND organization_id = ? ORDER BY created_at ASC`;
    return this.query<AddressRow[]>(sql, [customerId, organizationId], connection);
  }

  async update(
    id: string,
    organizationId: string,
    updates: Partial<Pick<AddressRow, 'type' | 'address_line1' | 'address_line2' | 'city' | 'state' | 'postal_code' | 'country' | 'is_default'>>,
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
    const sql = `UPDATE addresses SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, params, connection);
  }

  async clearDefaultsForCustomer(customerId: string, organizationId: string, connection?: QueryConnection): Promise<void> {
    const sql = `UPDATE addresses SET is_default = 0 WHERE customer_id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [customerId, organizationId], connection);
  }
}
