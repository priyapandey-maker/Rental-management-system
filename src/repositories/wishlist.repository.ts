import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface WishlistInsert {
  id: string;
  organization_id: string;
  customer_id: string;
  product_id: string;
}

export interface WishlistRow extends WishlistInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class WishlistRepository extends BaseRepository {
  async add(
    wishlist: WishlistInsert,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO wishlists (id, organization_id, customer_id, product_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = id
    `;
    await this.query<ResultSetHeader>(
      sql,
      [wishlist.id, wishlist.organization_id, wishlist.customer_id, wishlist.product_id],
      connection
    );
  }

  async remove(
    customerId: string,
    productId: string,
    organizationId: string,
    connection?: QueryConnection
  ): Promise<void> {
    const sql = `DELETE FROM wishlists WHERE customer_id = ? AND product_id = ? AND organization_id = ?`;
    await this.query<ResultSetHeader>(sql, [customerId, productId, organizationId], connection);
  }

  async listByCustomer(
    customerId: string,
    organizationId: string,
    connection?: QueryConnection
  ): Promise<WishlistRow[]> {
    const sql = `
      SELECT w.* 
      FROM wishlists w 
      WHERE w.customer_id = ? AND w.organization_id = ?
      ORDER BY w.created_at DESC
    `;
    return this.query<WishlistRow[]>(sql, [customerId, organizationId], connection);
  }

  async isWishlisted(
    customerId: string,
    productId: string,
    organizationId: string,
    connection?: QueryConnection
  ): Promise<boolean> {
    const sql = `SELECT id FROM wishlists WHERE customer_id = ? AND product_id = ? AND organization_id = ?`;
    const rows = await this.query<RowDataPacket[]>(sql, [customerId, productId, organizationId], connection);
    return rows.length > 0;
  }
}
