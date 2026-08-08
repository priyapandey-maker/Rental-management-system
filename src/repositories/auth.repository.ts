import { getPool } from '../db/pool';
import crypto from 'crypto';
import { DatabaseError, NotFoundError } from '../errors';

export class AuthRepository {
  async createUser(data: {
    organizationId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `;

    try {
      await getPool().query(query, [
        id,
        data.organizationId,
        data.email,
        data.passwordHash,
        data.firstName,
        data.lastName
      ]);
      return id;
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already registered for this organization');
      }
      throw new DatabaseError('Failed to create user');
    }
  }

  async findUserByEmail(email: string): Promise<any> {
    const query = `
      SELECT id, organization_id, email, password_hash, first_name, last_name, status
      FROM users
      WHERE email = ?
    `;

    try {
      const [rows]: any = await getPool().query(query, [email]);
      return rows[0] || null;
    } catch (err: any) {
      throw new DatabaseError('Failed to find user by email');
    }
  }

  async createOrganization(name: string, code: string, gstNo?: string, productCategory?: string): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO organizations (id, name, code, status, gst_no, product_category)
      VALUES (?, ?, ?, 'active', ?, ?)
    `;
    
    try {
      await getPool().query(query, [id, name, code, gstNo || null, productCategory || null]);
      return id;
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Simple retry logic by appending random string if code duplicates
        const uniqueCode = `${code}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        return this.createOrganization(name, uniqueCode, gstNo, productCategory);
      }
      throw new DatabaseError('Failed to create organization');
    }
  }

  async storeResetToken(email: string, token: string, expiry: Date): Promise<void> {
    const query = `
      UPDATE users 
      SET reset_token = ?, reset_token_expires_at = ?
      WHERE email = ?
    `;
    try {
      await getPool().query(query, [token, expiry, email]);
    } catch (err: any) {
      throw new DatabaseError('Failed to store reset token');
    }
  }

  async findUserByResetToken(token: string): Promise<any> {
    const query = `
      SELECT id, organization_id, email
      FROM users
      WHERE reset_token = ? AND reset_token_expires_at > NOW()
    `;
    try {
      const [rows]: any = await getPool().query(query, [token]);
      return rows[0] || null;
    } catch (err: any) {
      throw new DatabaseError('Failed to find user by reset token');
    }
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    const query = `
      UPDATE users 
      SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL
      WHERE id = ?
    `;
    try {
      await getPool().query(query, [newPasswordHash, userId]);
    } catch (err: any) {
      throw new DatabaseError('Failed to update password');
    }
  }
}
