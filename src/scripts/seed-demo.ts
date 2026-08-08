import { getPool } from '../db/pool';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const pool = getPool();

export const demoData = {
  orgId: '6f3875f5-49a2-4bee-9dc1-927b5907020a',
  userId: 'ad8c7dc5-21b9-4282-9410-b0653d35a989',
  customerId: 'd3a6d95c-12fe-4c98-a755-677737be0f26',
  pricelistId: '7f680b5b-d4cf-4854-8097-d06dff0f1ad0',
  rentalPeriodId: '390c3f43-4906-4d23-b235-e71754b218fe'
};

const CATEGORIES = [
  { id: 'cat-cameras-111', name: 'Cameras', code: 'CAM', desc: 'Professional cinema and DSLR cameras' },
  { id: 'cat-audio-222', name: 'Audio', code: 'AUD', desc: 'Microphones, mixers, and recorders' },
  { id: 'cat-lighting-333', name: 'Lighting', code: 'LGT', desc: 'LED panels, softboxes, and spotlights' },
  { id: 'cat-lenses-444', name: 'Lenses', code: 'LNS', desc: 'Prime and zoom focal lens packages' },
  { id: 'cat-tripods-555', name: 'Tripods & Supports', code: 'TRP', desc: 'Carbon fiber supports and gimbals' },
  { id: 'cat-video-666', name: 'Video Equipment', code: 'VID', desc: 'Wireless video systems, monitors, and converters' },
  { id: 'cat-drones-777', name: 'Drones', code: 'DRN', desc: '4K recording aerial drones and controllers' },
  { id: 'cat-projectors-888', name: 'Projectors', code: 'PRJ', desc: 'UST and HD projectors for screens' }
];

const PRODUCTS = [
  {
    id: 'prod-camera-111',
    categoryId: 'cat-cameras-111',
    name: 'Professional Camera Kit',
    sku: 'PROD-CAM-01',
    description: 'High-end cinema camera package with prime lenses and stabiliser.',
    variantId: 'var-camera-std-111',
    variantName: 'Camera Kit — Standard',
    variantSku: 'VAR-CAM-STD',
    assetId: 'asset-camera-111',
    assetTag: 'CAM-004'
  },
  {
    id: 'prod-audio-222',
    categoryId: 'cat-audio-222',
    name: 'Wireless Lavalier Microphone',
    sku: 'PROD-AUD-01',
    description: 'Dual-channel wireless mic kit with noise-canceling technology.',
    variantId: 'var-audio-std-222',
    variantName: 'Lavalier Mic — Dual Channel',
    variantSku: 'VAR-AUD-STD',
    assetId: 'asset-audio-222',
    assetTag: 'AUD-001'
  },
  {
    id: 'prod-lighting-333',
    categoryId: 'cat-lighting-333',
    name: 'LED Studio Panel Light',
    sku: 'PROD-LGT-01',
    description: 'Bi-color dimmable LED light panel for studio and field production.',
    variantId: 'var-lighting-std-333',
    variantName: 'LED Studio Panel — 100W',
    variantSku: 'VAR-LGT-STD',
    assetId: 'asset-lighting-333',
    assetTag: 'LGT-001'
  },
  {
    id: 'prod-lenses-444',
    categoryId: 'cat-lenses-444',
    name: 'Cinema Prime Lens Kit',
    sku: 'PROD-LNS-01',
    description: 'F1.4 prime lens set (24mm, 35mm, 50mm, 85mm) with focus gears.',
    variantId: 'var-lenses-std-444',
    variantName: 'Prime Lens Set — Full Frame',
    variantSku: 'VAR-LNS-STD',
    assetId: 'asset-lenses-444',
    assetTag: 'LNS-001'
  },
  {
    id: 'prod-tripods-555',
    categoryId: 'cat-tripods-555',
    name: 'Carbon Fiber Tripod System',
    sku: 'PROD-TRP-01',
    description: 'Ultra-lightweight carbon fiber legs with professional fluid head.',
    variantId: 'var-tripods-std-555',
    variantName: 'Carbon Tripod — 75mm Bowl',
    variantSku: 'VAR-TRP-STD',
    assetId: 'asset-tripods-555',
    assetTag: 'TRP-001'
  },
  {
    id: 'prod-video-666',
    categoryId: 'cat-video-666',
    name: 'HDMI Wireless Transmitter',
    sku: 'PROD-VID-01',
    description: 'HDMI/SDI wireless video transmitter with 500ft range and low latency.',
    variantId: 'var-video-std-666',
    variantName: 'Wireless Video Link — SDI/HDMI',
    variantSku: 'VAR-VID-STD',
    assetId: 'asset-video-666',
    assetTag: 'VID-001'
  },
  {
    id: 'prod-drones-777',
    categoryId: 'cat-drones-777',
    name: 'GPS 4K Camera Drone',
    sku: 'PROD-DRN-01',
    description: 'Foldable quadcopter drone with 3-axis gimbal camera and safety sensors.',
    variantId: 'var-drones-std-777',
    variantName: '4K Video Drone — Pro Bundle',
    variantSku: 'VAR-DRN-STD',
    assetId: 'asset-drones-777',
    assetTag: 'DRN-001'
  },
  {
    id: 'prod-projectors-888',
    categoryId: 'cat-projectors-888',
    name: '4K Ultra Short Throw Projector',
    sku: 'PROD-PRJ-01',
    description: 'High-brightness laser projector for indoor cinema screens.',
    variantId: 'var-projectors-std-888',
    variantName: '4K Laser Projector — 3000 Lumens',
    variantSku: 'VAR-PRJ-STD',
    assetId: 'asset-projectors-888',
    assetTag: 'PRJ-001'
  }
];

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
    `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, user_type, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', 'admin', NOW(), NOW())
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), user_type = VALUES(user_type)`,
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

  // Seed Categories
  for (const cat of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (id, organization_id, name, code, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [cat.id, demoData.orgId, cat.name, cat.code, cat.desc]
    );
  }
  console.log('✓ Categories created');

  // Seed Pricelists & Rental Periods
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
  console.log('✓ Pricelist config created');

  // Seed Products, Variants, Assets, and Pricing Items
  for (const prod of PRODUCTS) {
    // Product
    await pool.query(
      `INSERT INTO products (id, organization_id, category_id, name, sku, description, rental_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'rentable', 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [prod.id, demoData.orgId, prod.categoryId, prod.name, prod.sku, prod.description]
    );

    // Variant
    await pool.query(
      `INSERT INTO variants (id, organization_id, product_id, sku, name, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [prod.variantId, demoData.orgId, prod.id, prod.variantSku, prod.variantName]
    );

    // Asset
    await pool.query(
      `INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, lifecycle_status, condition_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 'GOOD', NOW(), NOW())
       ON DUPLICATE KEY UPDATE asset_tag = VALUES(asset_tag)`,
      [prod.assetId, demoData.orgId, prod.variantId, prod.assetTag, `SN-${prod.sku}-12345`]
    );

    // Pricelist Item ($150.00 rate)
    const pricelistItemId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO pricelist_items (id, pricelist_id, product_variant_id, rental_period_id, unit_price, created_at, updated_at)
       VALUES (?, ?, ?, ?, 150.00, NOW(), NOW())
       ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price)`,
      [pricelistItemId, demoData.pricelistId, prod.variantId, demoData.rentalPeriodId]
    );
  }
  console.log('✓ Products, Variants, Assets, and Pricing created');

  console.log('--- SEEDING COMPLETE ---');
  process.exit(0);
}

seedDemoData().catch(console.error);
