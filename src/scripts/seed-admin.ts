/**
 * seed-admin.ts
 * 
 * Creates/resets the admin user account for the platform.
 * Run this script to ensure a working admin login exists.
 * 
 * Admin credentials:
 *   Email:    admin@assetflow.local
 *   Password: Admin@2024!
 * 
 * Usage: npx ts-node src/scripts/seed-admin.ts
 */

import { getPool } from '../db/pool';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const ADMIN_EMAIL = 'admin@assetflow.local';
const ADMIN_PASSWORD = 'Admin@2024!';
const ADMIN_ORG_NAME = 'Rental Management System';
const ADMIN_ORG_CODE = 'RMS-ADMIN';

const ADMIN_ORG_ID = '00000000-0000-0000-0000-admin0000001';
const ADMIN_USER_ID = '00000000-0000-0000-0000-admin0000002';

async function seedAdmin() {
  const pool = getPool();
  console.log('=== ADMIN SEED SCRIPT ===\n');

  try {
    // 1. Create or update admin organization
    await pool.query(
      `INSERT INTO organizations (id, name, code, status, created_at, updated_at)
       VALUES (?, ?, ?, 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'active'`,
      [ADMIN_ORG_ID, ADMIN_ORG_NAME, ADMIN_ORG_CODE]
    );
    console.log(`✓ Admin organization ready (${ADMIN_ORG_CODE})`);

    // 2. Hash the admin password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 3. Create or update admin user
    await pool.query(
      `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, user_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Platform', 'Admin', 'active', 'admin', NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
         password_hash = VALUES(password_hash), 
         user_type = 'admin', 
         status = 'active'`,
      [ADMIN_USER_ID, ADMIN_ORG_ID, ADMIN_EMAIL, passwordHash]
    );
    console.log(`✓ Admin user ready`);

    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role:     admin`);
    console.log(`  OrgId:    ${ADMIN_ORG_ID}`);
    console.log('\n=== SEED COMPLETE ===');

  } catch (err: any) {
    console.error('Admin seed failed:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
