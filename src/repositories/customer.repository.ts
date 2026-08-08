import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface CustomerInsert {
  id: string;
  organization_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  tax_id: string | null;
  status: 'active' | 'inactive' | 'blacklisted';
}

export interface CustomerRow extends CustomerInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class CustomerRepository extends BaseRepository {
  async create(
    customer: CustomerInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO customers (id, organization_id, customer_number, first_name, last_name, email, phone, company_name, tax_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        customer.id,
        customer.organization_id,
        customer.customer_number,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.company_name,
        customer.tax_id,
        customer.status
      ],
      connection
    );
  }

  async findById(id: string, organizationId: string, connection?: QueryConnection): Promise<CustomerRow | null> {
    const sql = `SELECT * FROM customers WHERE id = ? AND organization_id = ?`;
    return this.queryOne<CustomerRow>(sql, [id, organizationId], connection);
  }

  async findByNumber(customerNumber: string, organizationId: string, connection?: QueryConnection): Promise<CustomerRow | null> {
    const sql = `SELECT * FROM customers WHERE customer_number = ? AND organization_id = ?`;
    return this.queryOne<CustomerRow>(sql, [customerNumber, organizationId], connection);
  }

  async findByEmail(email: string, organizationId: string, connection?: QueryConnection): Promise<CustomerRow | null> {
    const sql = `SELECT * FROM customers WHERE email = ? AND organization_id = ?`;
    return this.queryOne<CustomerRow>(sql, [email, organizationId], connection);
  }

  async update(
    id: string,
    organizationId: string,
    updates: Partial<Pick<CustomerRow, 'first_name' | 'last_name' | 'email' | 'phone' | 'company_name' | 'tax_id' | 'status'>>,
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
    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, params, connection);
  }

  async list(organizationId: string, connection?: QueryConnection): Promise<CustomerRow[]> {
    const sql = `SELECT * FROM customers WHERE organization_id = ? ORDER BY customer_number ASC`;
    return this.query<CustomerRow[]>(sql, [organizationId], connection);
  }
}
