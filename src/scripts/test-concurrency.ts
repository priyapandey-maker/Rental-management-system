import crypto from 'crypto';
import { getPool } from '../db/pool';
import { OrchestrationService } from '../services/orchestration.service';
import { TransactionService } from '../services/transaction.service';
import { OrchestrationRepository } from '../repositories/orchestration.repository';

const orchService = new OrchestrationService();
const txService = new TransactionService();

async function runTest() {
  const orgId = crypto.randomUUID();
  const customerId = crypto.randomUUID();
  const productId = crypto.randomUUID();
  const variantId = crypto.randomUUID();
  const assetId = crypto.randomUUID();

  console.log('--- Setting up Concurrency Test Environment ---');
  
  const pool = getPool();
  await pool.query(`INSERT INTO organizations (id, name, slug) VALUES (?, 'Test Org', ?)`, [orgId, orgId]);
  await pool.query(`INSERT INTO customers (id, organization_id, email, first_name, last_name) VALUES (?, ?, 'test@test.com', 'Test', 'User')`, [customerId, orgId]);
  await pool.query(`INSERT INTO categories (id, organization_id, name, slug) VALUES (?, ?, 'Cat', 'cat')`, [crypto.randomUUID(), orgId]);
  
  const catId = (await pool.query(`SELECT id FROM categories WHERE organization_id = ? LIMIT 1`, [orgId]) as any)[0][0].id;
  await pool.query(`INSERT INTO products (id, organization_id, category_id, name, type) VALUES (?, ?, ?, 'Test Product', 'RENTAL')`, [productId, orgId, catId]);
  await pool.query(`INSERT INTO variants (id, organization_id, product_id, sku, name) VALUES (?, ?, ?, 'SKU-1', 'Base')`, [variantId, orgId, productId]);
  
  // ONLY ONE PHYSICAL ASSET
  await pool.query(`INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, lifecycle_status) VALUES (?, ?, ?, 'TAG-1', 'AVAILABLE')`, [assetId, orgId, variantId]);

  // 2. Create TWO concurrent transactions wanting 1 asset each for the same date
  const tx1 = await txService.createTransaction(orgId, customerId);
  await txService.addTransactionLine(orgId, tx1.id, {
    product_id: productId,
    variant_id: variantId,
    quantity: 1,
    rental_start_date: new Date('2026-09-01T10:00:00Z'),
    rental_end_date: new Date('2026-09-05T10:00:00Z'),
    unit_price: 10,
    deposit_amount: 0,
    late_fee_rate: 0
  });
  await txService.confirmTransaction(tx1.id, orgId);

  const tx2 = await txService.createTransaction(orgId, customerId);
  await txService.addTransactionLine(orgId, tx2.id, {
    product_id: productId,
    variant_id: variantId,
    quantity: 1,
    rental_start_date: new Date('2026-09-01T10:00:00Z'),
    rental_end_date: new Date('2026-09-05T10:00:00Z'),
    unit_price: 10,
    deposit_amount: 0,
    late_fee_rate: 0
  });
  await txService.confirmTransaction(tx2.id, orgId);

  console.log('--- Triggering Concurrent Allocations (SKIP LOCKED) ---');

  // 3. Race them
  const results = await Promise.allSettled([
    orchService.allocateTransaction(tx1.id, orgId),
    orchService.allocateTransaction(tx2.id, orgId)
  ]);

  let successes = 0;
  let failures = 0;

  for (const r of results) {
    if (r.status === 'fulfilled') successes++;
    if (r.status === 'rejected') {
      failures++;
      console.log('Expected Rejection Message:', r.reason.message);
    }
  }

  console.log(`\nResults: ${successes} Success, ${failures} Failures`);

  if (successes === 1 && failures === 1) {
    console.log('✅ TEST PASSED: Concurrency successfully prevented double allocation!');
  } else {
    console.error('❌ TEST FAILED: Overlap occurred or both failed.');
    process.exit(1);
  }
  
  process.exit(0);
}

runTest().catch(console.error);
