import { BaseRepository } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export class DashboardRepository extends BaseRepository {
  async getRevenueSummary(orgId?: string): Promise<{ total: string; pending: string }> {
    let sql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total,
        COALESCE(SUM(CASE WHEN status != 'PAID' THEN total_amount ELSE 0 END), 0) as pending
      FROM rental_invoices 
      WHERE status != 'CANCELLED'
    `;
    const params: any[] = [];
    if (orgId) {
      sql += ' AND organization_id = ?';
      params.push(orgId);
    }
    const rows = await this.query<RowDataPacket[]>(sql, params);
    return { total: rows[0].total, pending: rows[0].pending };
  }

  async getActiveRentalsCount(orgId?: string): Promise<number> {
    let sql = `
      SELECT COUNT(id) as count 
      FROM rental_transactions 
      WHERE status = 'ACTIVE'
    `;
    const params: any[] = [];
    if (orgId) {
      sql += ' AND organization_id = ?';
      params.push(orgId);
    }
    const rows = await this.query<RowDataPacket[]>(sql, params);
    return rows[0].count;
  }

  async getAssetAvailability(orgId?: string): Promise<{ available: number; total: number; rented: number }> {
    let sql = `
      SELECT 
        COUNT(id) as total,
        SUM(CASE WHEN lifecycle_status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN lifecycle_status = 'RENTED' THEN 1 ELSE 0 END) as rented
      FROM assets 
    `;
    const params: any[] = [];
    if (orgId) {
      sql += ' WHERE organization_id = ?';
      params.push(orgId);
    }
    const rows = await this.query<RowDataPacket[]>(sql, params);
    return {
      available: Number(rows[0].available || 0),
      total: Number(rows[0].total || 0),
      rented: Number(rows[0].rented || 0)
    };
  }

  async getOutstandingPaymentsCount(orgId?: string): Promise<number> {
    let sql = `
      SELECT COUNT(id) as count 
      FROM rental_invoices 
      WHERE status IN ('DRAFT', 'ISSUED')
    `;
    const params: any[] = [];
    if (orgId) {
      sql += ' AND organization_id = ?';
      params.push(orgId);
    }
    const rows = await this.query<RowDataPacket[]>(sql, params);
    return rows[0].count;
  }
}
