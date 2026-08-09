import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export class AdminRepository extends BaseRepository {
  // ─── Unpaginated (kept for backwards compat) ───────────────────────────────

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
      SELECT a.*, pv.sku as variant_sku, pr.name as product_name, o.name as organization_name
      FROM assets a
      LEFT JOIN product_variants pv ON a.product_variant_id = pv.id
      LEFT JOIN products pr ON pv.product_id = pr.id
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

  // ─── Paginated methods ─────────────────────────────────────────────────────

  async listCustomersPaginated(
    page: number,
    limit: number,
    search?: string,
    connection?: QueryConnection
  ): Promise<PaginatedResult<RowDataPacket>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = '';
    if (search) {
      where = `WHERE (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR o.name LIKE ?)`;
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    const countSql = `
      SELECT COUNT(*) as total
      FROM customers c
      LEFT JOIN organizations o ON c.organization_id = o.id
      ${where}
    `;
    const dataSql = `
      SELECT c.*, o.name as organization_name
      FROM customers c
      LEFT JOIN organizations o ON c.organization_id = o.id
      ${where}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countRows, dataRows] = await Promise.all([
      this.query<RowDataPacket[]>(countSql, [...params], connection),
      this.query<RowDataPacket[]>(dataSql, [...params, limit, offset], connection),
    ]);
    return { data: dataRows, total: (countRows[0] as any).total };
  }

  async listProductsPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    connection?: QueryConnection
  ): Promise<PaginatedResult<RowDataPacket>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const conditions: string[] = [];
    if (search) {
      conditions.push(`(p.name LIKE ? OR p.sku LIKE ? OR o.name LIKE ?)`);
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (status) {
      conditions.push(`p.status = ?`);
      params.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN organizations o ON p.organization_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
    `;
    const dataSql = `
      SELECT p.*, o.name as organization_name, c.name as category_name
      FROM products p
      LEFT JOIN organizations o ON p.organization_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countRows, dataRows] = await Promise.all([
      this.query<RowDataPacket[]>(countSql, [...params], connection),
      this.query<RowDataPacket[]>(dataSql, [...params, limit, offset], connection),
    ]);
    return { data: dataRows, total: (countRows[0] as any).total };
  }

  async listAssetsPaginated(
    page: number,
    limit: number,
    search?: string,
    lifecycleStatus?: string,
    connection?: QueryConnection
  ): Promise<PaginatedResult<RowDataPacket>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const conditions: string[] = [];
    if (search) {
      conditions.push(`(a.asset_tag LIKE ? OR a.serial_number LIKE ? OR pr.name LIKE ?)`);
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (lifecycleStatus) {
      conditions.push(`a.lifecycle_status = ?`);
      params.push(lifecycleStatus);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countSql = `
      SELECT COUNT(*) as total
      FROM assets a
      LEFT JOIN product_variants pv ON a.product_variant_id = pv.id
      LEFT JOIN products pr ON pv.product_id = pr.id
      LEFT JOIN organizations o ON a.organization_id = o.id
      ${where}
    `;
    const dataSql = `
      SELECT a.*, pv.sku as variant_sku, pr.name as product_name, o.name as organization_name
      FROM assets a
      LEFT JOIN product_variants pv ON a.product_variant_id = pv.id
      LEFT JOIN products pr ON pv.product_id = pr.id
      LEFT JOIN organizations o ON a.organization_id = o.id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countRows, dataRows] = await Promise.all([
      this.query<RowDataPacket[]>(countSql, [...params], connection),
      this.query<RowDataPacket[]>(dataSql, [...params, limit, offset], connection),
    ]);
    return { data: dataRows, total: (countRows[0] as any).total };
  }

  async listTransactionsPaginated(
    page: number,
    limit: number,
    status?: string,
    connection?: QueryConnection
  ): Promise<PaginatedResult<RowDataPacket>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = '';
    if (status) {
      where = `WHERE t.status = ?`;
      params.push(status);
    }
    const countSql = `
      SELECT COUNT(*) as total
      FROM rental_transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      ${where}
    `;
    const dataSql = `
      SELECT t.*, c.first_name, c.last_name, o.name as organization_name
      FROM rental_transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      ${where}
      ORDER BY t.transaction_date DESC
      LIMIT ? OFFSET ?
    `;
    const [countRows, dataRows] = await Promise.all([
      this.query<RowDataPacket[]>(countSql, [...params], connection),
      this.query<RowDataPacket[]>(dataSql, [...params, limit, offset], connection),
    ]);
    return { data: dataRows, total: (countRows[0] as any).total };
  }

  async listVendorsPaginated(
    page: number,
    limit: number,
    search?: string,
    connection?: QueryConnection
  ): Promise<PaginatedResult<RowDataPacket>> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = '';
    if (search) {
      where = `WHERE (o.name LIKE ? OR o.slug LIKE ?)`;
      const like = `%${search}%`;
      params.push(like, like);
    }
    const countSql = `SELECT COUNT(*) as total FROM organizations o ${where}`;
    const dataSql = `
      SELECT o.* FROM organizations o
      ${where}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countRows, dataRows] = await Promise.all([
      this.query<RowDataPacket[]>(countSql, [...params], connection),
      this.query<RowDataPacket[]>(dataSql, [...params, limit, offset], connection),
    ]);
    return { data: dataRows, total: (countRows[0] as any).total };
  }
}
