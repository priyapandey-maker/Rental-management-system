import { getPool } from '../db/pool';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const pool = getPool();

export const demoData = {
  orgId: '6f3875f5-49a2-4bee-9dc1-927b5907020a',
  userId: 'ad8c7dc5-21b9-4282-9410-b0653d35a989',
  customerId: 'd3a6d95c-12fe-4c98-a755-677737be0f26',
  categoryId: '555f0cd2-f6ac-4361-94c2-5beb20f6191b',
  productId: '03b79be2-40e9-468b-95eb-6ce2ac5d1853',
  variantId: 'd07556d6-a3ac-4e60-bfff-31065689ce7f',
  assetId: 'f5c976a3-f98a-4a74-b9f4-b816c6afeb84',
  pricelistId: '7f680b5b-d4cf-4854-8097-d06dff0f1ad0',
  rentalPeriodId: '390c3f43-4906-4d23-b235-e71754b218fe',
  pricelistItemId: '1579d0ca-dedb-476a-902a-8c52687b95c9'
};

async function seedDemoData() {
  console.log('--- SEEDING DEMO DATA ---');
  
  // Organization
  await pool.query(
    `INSERT INTO organizations (id, name, code, created_at, updated_at) VALUES (?, ?, 'DEMO05', NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [demoData.orgId, 'Demo Rental Co.']
  );
  console.log('✓ Organization created');

  // User
  const demoHash = await bcrypt.hash('DemoPassword123!', 10);
  await pool.query(
    `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [demoData.userId, demoData.orgId, 'admin3@demorental.co', demoHash, 'Admin', 'User']
  );
  console.log('✓ User created');

  // Customer
  await pool.query(
    `INSERT INTO customers (id, organization_id, customer_number, email, first_name, last_name, created_at, updated_at)
     VALUES (?, ?, 'CUST-001', 'aarav@example.com', 'Aarav', 'Sharma', NOW(), NOW())
     ON DUPLICATE KEY UPDATE customer_number = VALUES(customer_number)`,
    [demoData.customerId, demoData.orgId]
  );
  console.log('✓ Customer created');

  // Category
  await pool.query(
    `INSERT INTO categories (id, organization_id, name, code, created_at, updated_at)
     VALUES (?, ?, 'Cameras', 'CAM', NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [demoData.categoryId, demoData.orgId]
  );
  console.log('✓ Category created');

  // Product
  await pool.query(
    `INSERT INTO products (id, organization_id, category_id, name, sku, status, created_at, updated_at)
     VALUES (?, ?, ?, 'Professional Camera Kit', 'PROD-CAM-01', 'ACTIVE', NOW(), NOW())
     ON DUPLICATE KEY UPDATE sku = VALUES(sku)`,
    [demoData.productId, demoData.orgId, demoData.categoryId]
  );
  console.log('✓ Product created');

  // Variant
  await pool.query(
    `INSERT INTO variants (id, organization_id, product_id, sku, name, created_at, updated_at)
     VALUES (?, ?, ?, 'VAR-CAM-STD-2', 'Camera Kit — Standard', NOW(), NOW())
     ON DUPLICATE KEY UPDATE sku = VALUES(sku)`,
    [demoData.variantId, demoData.orgId, demoData.productId]
  );
  console.log('✓ Variant created');

  // Asset
  await pool.query(
    `INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, lifecycle_status, condition_status, created_at, updated_at)
     VALUES (?, ?, ?, 'CAM-004', 'SN-CAM-12345', 'AVAILABLE', 'GOOD', NOW(), NOW())
     ON DUPLICATE KEY UPDATE asset_tag = VALUES(asset_tag)`,
    [demoData.assetId, demoData.orgId, demoData.variantId]
  );
  console.log('✓ Asset created');

  // Pricing (Rental Period + Pricelist)
  await pool.query(
    `INSERT INTO rental_periods (id, organization_id, name, code, unit, duration_value, created_at, updated_at)
     VALUES (?, ?, '1 Day', 'DAILY', 'DAY', 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [demoData.rentalPeriodId, demoData.orgId]
  );
  
  await pool.query(
    `INSERT INTO pricelists (id, organization_id, name, code, is_default, created_at, updated_at)
     VALUES (?, ?, 'Standard Rental Prices', 'DEF-V3', 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [demoData.pricelistId, demoData.orgId]
  );

  await pool.query(
    `INSERT INTO pricelist_items (id, pricelist_id, product_variant_id, rental_period_id, unit_price, created_at, updated_at)
     VALUES (?, ?, ?, ?, 150.00, NOW(), NOW())
     ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price)`,
    [demoData.pricelistItemId, demoData.pricelistId, demoData.variantId, demoData.rentalPeriodId]
  );
  console.log('✓ Pricing created');

  console.log('--- SEEDING COMPLETE ---');
  process.exit(0);
}

seedDemoData().catch(console.error);
