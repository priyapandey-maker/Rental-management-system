import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { BaseRepository, QueryConnection } from './base.repository';

export interface OrganizationRow extends RowDataPacket {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export class OrganizationRepository extends BaseRepository {
  async listAll(connection?: QueryConnection): Promise<OrganizationRow[]> {
    const sql = `SELECT * FROM organizations ORDER BY name ASC`;
    return this.query<OrganizationRow[]>(sql, [], connection);
  }

  async findById(id: string, connection?: QueryConnection): Promise<OrganizationRow | null> {
    const sql = `SELECT * FROM organizations WHERE id = ?`;
    return this.queryOne<OrganizationRow>(sql, [id], connection);
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended', connection?: QueryConnection): Promise<void> {
    const sql = `UPDATE organizations SET status = ? WHERE id = ?`;
    await this.query<ResultSetHeader>(sql, [status, id], connection);
  }
}
