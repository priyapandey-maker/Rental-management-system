import crypto from 'crypto';
import { getPool } from '../db/pool';

const pool = getPool();

export const demoData = {
  orgId: 'demo-org-uuid',
  userId: 'demo-user-uuid',
  customerId: crypto.randomUUID(),
  categoryId: crypto.randomUUID(),
  productId: crypto.randomUUID(),
  variantId: crypto.randomUUID(),
  assetId: crypto.randomUUID(),
  pricelistId: crypto.randomUUID(),
  rentalPeriodId: crypto.randomUUID(),
  pricelistItemId: crypto.randomUUID()
};

async function seedDemoData() {
  console.log('--- SEEDING DEMO DATA ---');
  
  // Organization
  await pool.query(
    `INSERT INTO organizations (id, name, code, created_at, updated_at) VALUES (?, ?, 'DEMO01', NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [demoData.orgId, 'Demo Rental Co.']
  );
  console.log('✓ Organization created');

  // User
  await pool.query(
    `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
     ON DUPLICATE KEY UPDATE email = VALUES(email)`,
    [demoData.userId, demoData.orgId, 'admin@demorental.co', 'dummy_hash', 'Admin', 'User']
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
     VALUES (?, ?, ?, 'VAR-CAM-STD', 'Camera Kit — Standard', NOW(), NOW())
     ON DUPLICATE KEY UPDATE sku = VALUES(sku)`,
    [demoData.variantId, demoData.orgId, demoData.productId]
  );
  console.log('✓ Variant created');

  // Asset
  await pool.query(
    `INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, lifecycle_status, condition_status, created_at, updated_at)
     VALUES (?, ?, ?, 'CAM-001', 'SN-CAM-12345', 'AVAILABLE', 'GOOD', NOW(), NOW())
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
     VALUES (?, ?, 'Standard Rental Prices', 'DEF', 1, NOW(), NOW())
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
