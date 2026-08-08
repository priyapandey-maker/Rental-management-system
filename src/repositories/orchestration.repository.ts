import { BaseRepository, QueryConnection } from './base.repository';
import { RowDataPacket } from 'mysql2/promise';

export interface AssetAllocationRow extends RowDataPacket {
  id: string;
  organization_id: string;
  transaction_line_id: string;
  asset_id: string;
  status: 'ALLOCATED' | 'FULFILLED' | 'RETURNED' | 'CANCELLED';
  quantity: number;
  allocated_at: Date;
}

export class OrchestrationRepository extends BaseRepository {
  /**
   * Securely lock and find available assets for a specific line interval.
   * Prevents overlap allocation by joining to existing allocations and lines.
   * Utilizes MySQL 8 FOR UPDATE SKIP LOCKED to prevent blocking across concurrent requests
   * that don't need the exact same physical asset instance.
   */
  async findAvailableAssetsForUpdate(
    params: {
      organizationId: string;
      productId: string;
      variantId: string | null;
      startDate: Date;
      endDate: Date;
      quantity: number;
    },
    conn: QueryConnection
  ): Promise<(RowDataPacket & { id: string })[]> {
    let sql = `
      SELECT a.id 
      FROM assets a
      JOIN variants v ON a.product_variant_id = v.id
      WHERE v.product_id = ?
        AND a.organization_id = ?
        AND a.lifecycle_status = 'AVAILABLE'
        AND NOT EXISTS (
          SELECT 1 
          FROM asset_allocations alloc
          JOIN rental_transaction_lines line ON alloc.transaction_line_id = line.id
          WHERE alloc.asset_id = a.id
            AND alloc.status IN ('ALLOCATED', 'FULFILLED')
            AND alloc.organization_id = a.organization_id
            AND (line.rental_start_date < ? AND line.rental_end_date > ?)
        )
    `;
    const queryParams: any[] = [
      params.productId,
      params.organizationId,
      params.endDate, // overlap logic: existing.start < requested.end
      params.startDate // overlap logic: existing.end > requested.start
    ];

    if (params.variantId) {
      sql += ` AND a.product_variant_id = ?`;
      queryParams.push(params.variantId);
    }

    sql += ` LIMIT ? FOR UPDATE SKIP LOCKED`;
    queryParams.push(params.quantity);

    return this.query<(RowDataPacket & { id: string })[]>(sql, queryParams, conn);
  }

  async createAssetAllocation(
    data: {
      id: string;
      organization_id: string;
      transaction_line_id: string;
      asset_id: string;
      status: string;
      quantity: number;
    },
    conn: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO asset_allocations (
        id, organization_id, transaction_line_id, asset_id, status, quantity
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_line_id,
      data.asset_id,
      data.status,
      data.quantity
    ], conn);
  }

  async createFulfillment(
    data: {
      id: string;
      organization_id: string;
      transaction_id: string;
      status: string;
      fulfilled_by: string;
    },
    conn: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_fulfillments (id, organization_id, transaction_id, status, fulfilled_by, fulfilled_at)
      VALUES (?, ?, ?, ?, ?, NOW(3))
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_id,
      data.status,
      data.fulfilled_by
    ], conn);
  }

  async createFulfillmentLine(
    data: {
      id: string;
      organization_id: string;
      fulfillment_id: string;
      asset_allocation_id: string;
    },
    conn: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_fulfillment_lines (id, organization_id, fulfillment_id, asset_allocation_id)
      VALUES (?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.fulfillment_id,
      data.asset_allocation_id
    ], conn);
  }
  
  async createReturn(
    data: {
      id: string;
      organization_id: string;
      transaction_id: string;
      status: string;
      received_by: string;
    },
    conn: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_returns (id, organization_id, transaction_id, status, received_by, returned_at)
      VALUES (?, ?, ?, ?, ?, NOW(3))
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.transaction_id,
      data.status,
      data.received_by
    ], conn);
  }

  async createReturnLine(
    data: {
      id: string;
      organization_id: string;
      return_id: string;
      asset_allocation_id: string;
    },
    conn: QueryConnection
  ): Promise<void> {
    const sql = `
      INSERT INTO rental_return_lines (id, organization_id, return_id, asset_allocation_id)
      VALUES (?, ?, ?, ?)
    `;
    await this.query(sql, [
      data.id,
      data.organization_id,
      data.return_id,
      data.asset_allocation_id
    ], conn);
  }

  async getTransactionAllocations(txId: string, orgId: string, conn?: QueryConnection): Promise<AssetAllocationRow[]> {
    const sql = `
      SELECT alloc.* 
      FROM asset_allocations alloc
      JOIN rental_transaction_lines line ON alloc.transaction_line_id = line.id
      WHERE line.transaction_id = ? AND alloc.organization_id = ?
    `;
    return this.query<AssetAllocationRow[]>(sql, [txId, orgId], conn);
  }

  async updateAllocationStatus(id: string, orgId: string, status: string, conn: QueryConnection): Promise<void> {
    const sql = `UPDATE asset_allocations SET status = ? WHERE id = ? AND organization_id = ?`;
    await this.query(sql, [status, id, orgId], conn);
  }

  async updateAssetLifecycleStatus(assetId: string, orgId: string, status: string, conn: QueryConnection): Promise<void> {
    const sql = `UPDATE assets SET lifecycle_status = ? WHERE id = ? AND organization_id = ?`;
    await this.query(sql, [status, assetId, orgId], conn);
  }
}
