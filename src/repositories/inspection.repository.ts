import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface InspectionInsert {
  id: string;
  organization_id: string;
  return_line_id: string;
  asset_id: string;
  condition_status: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
  damage_classification: string | null;
  damage_severity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';
  chargeable_damage: number;
  notes: string | null;
  inspected_at: string;
  inspector_id: string | null;
}

export interface InspectionRow extends InspectionInsert, RowDataPacket {
  created_at: string;
  updated_at: string;
}

export class InspectionRepository extends BaseRepository {
  async create(data: InspectionInsert, conn?: QueryConnection): Promise<void> {
    const sql = `
      INSERT INTO asset_inspections (
        id, organization_id, return_line_id, asset_id, condition_status,
        damage_classification, damage_severity, chargeable_damage, notes, inspected_at, inspector_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.query<ResultSetHeader>(
      sql,
      [
        data.id,
        data.organization_id,
        data.return_line_id,
        data.asset_id,
        data.condition_status,
        data.damage_classification,
        data.damage_severity,
        data.chargeable_damage,
        data.notes,
        data.inspected_at,
        data.inspector_id
      ],
      conn
    );
  }

  async findById(id: string, orgId: string, conn?: QueryConnection): Promise<InspectionRow | null> {
    const sql = `SELECT * FROM asset_inspections WHERE id = ? AND organization_id = ?`;
    return this.queryOne<InspectionRow>(sql, [id, orgId], conn);
  }

  async findByReturnLineId(returnLineId: string, orgId: string, conn?: QueryConnection): Promise<InspectionRow | null> {
    const sql = `SELECT * FROM asset_inspections WHERE return_line_id = ? AND organization_id = ?`;
    return this.queryOne<InspectionRow>(sql, [returnLineId, orgId], conn);
  }

  async listByReturnId(returnId: string, orgId: string, conn?: QueryConnection): Promise<InspectionRow[]> {
    const sql = `
      SELECT i.* FROM asset_inspections i
      JOIN rental_return_lines l ON i.return_line_id = l.id
      WHERE l.return_id = ? AND i.organization_id = ?
    `;
    return this.query<InspectionRow[]>(sql, [returnId, orgId], conn);
  }
}
