import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export class AdminRepository extends BaseRepository {
  async listCustomers(connection?: QueryConnection): Promise<RowDataPacket[]> {
    const sql = `
      SELECT c.*, o.name as organization_name 
      FROM customers c 
      LEFT JOIN organizations o ON c.organization_id = o.id
      ORDER BY c.created_at DESC
    `;
    return this.query<RowDataPacket[]>(sql, [], connection);
  }

  async listProducts(connection?: QueryConnection): Promise<RowDataPacket[]> {
    const sql = `
      SELECT p.*, o.name as organization_name, c.name as category_name
      FROM products p
      LEFT JOIN organizations o ON p.organization_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    return this.query<RowDataPacket[]>(sql, [], connection);
  }

  async listAssets(connection?: QueryConnection): Promise<RowDataPacket[]> {
    const sql = `
      SELECT a.*, p.name as product_name, o.name as organization_name
      FROM assets a
      JOIN variants v ON a.product_variant_id = v.id
      JOIN products p ON v.product_id = p.id
      LEFT JOIN organizations o ON a.organization_id = o.id
      ORDER BY a.created_at DESC
    `;
    return this.query<RowDataPacket[]>(sql, [], connection);
  }

  async listTransactions(connection?: QueryConnection): Promise<RowDataPacket[]> {
    const sql = `
      SELECT t.*, c.first_name, c.last_name, o.name as organization_name
      FROM rental_transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      ORDER BY t.transaction_date DESC
    `;
    return this.query<RowDataPacket[]>(sql, [], connection);
  }
}
