import crypto from 'crypto';
import { getPool } from '../db/pool';
import { createApp } from '../app';
import { Server } from 'http';

const pool = getPool();
const app = createApp();

let server: Server;
let baseUrl = '';

const orgA = crypto.randomUUID();
const orgB = crypto.randomUUID();
const userA = crypto.randomUUID();
const userB = crypto.randomUUID();

async function startServer() {
  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://localhost:${addr.port}/api/v1`;
      }
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}

async function makeRequest(method: string, path: string, orgId: string, userId: string, body?: any) {
  const headers: Record<string, string> = {
    'x-organization-id': orgId,
    'x-user-id': userId,
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // text response
  }
  return { status: res.status, body: json || text };
}

async function runTests() {
  console.log('--- Cleaning up DB State ---');
  await pool.query('DELETE FROM rental_payments');
  await pool.query('DELETE FROM rental_invoices');
  await pool.query('DELETE FROM rental_adjustments');
  await pool.query('DELETE FROM asset_inspections');
  await pool.query('DELETE FROM rental_returns');
  await pool.query('DELETE FROM rental_fulfillments');
  await pool.query('DELETE FROM asset_allocations');
  await pool.query('DELETE FROM rental_commercial_snapshots');
  await pool.query('DELETE FROM rental_transaction_lines');
  await pool.query('DELETE FROM rental_transactions');
  await pool.query('DELETE FROM late_fee_rules');
  await pool.query('DELETE FROM rental_settings');
  await pool.query('DELETE FROM pricelist_items');
  await pool.query('DELETE FROM pricelists');
  await pool.query('DELETE FROM rental_periods');
  await pool.query('DELETE FROM assets');
  await pool.query('DELETE FROM variants');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM categories');
  await pool.query('DELETE FROM addresses');
  await pool.query('DELETE FROM customers');
  await pool.query('DELETE FROM user_roles');
  await pool.query('DELETE FROM role_permissions');
  await pool.query('DELETE FROM permissions');
  await pool.query('DELETE FROM roles');
  await pool.query('DELETE FROM users');
  await pool.query('DELETE FROM organizations');

  console.log('--- Setting up DB State ---');
  await pool.query(`INSERT INTO organizations (id, name, code) VALUES (?, 'Org A', 'org-a')`, [orgA]);
  await pool.query(`INSERT INTO organizations (id, name, code) VALUES (?, 'Org B', 'org-b')`, [orgB]);

  await pool.query(`INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name) VALUES (?, ?, 'admin@orga.com', 'hash', 'Admin', 'A')`, [userA, orgA]);
  await pool.query(`INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name) VALUES (?, ?, 'admin@orgb.com', 'hash', 'Admin', 'B')`, [userB, orgB]);

  // Master Data
  const customerA = crypto.randomUUID();
  const customerB = crypto.randomUUID();
  await pool.query(`INSERT INTO customers (id, organization_id, customer_number, email, first_name, last_name) VALUES (?, ?, 'CUST-A', 'a@test.com', 'A', 'User')`, [customerA, orgA]);
  await pool.query(`INSERT INTO customers (id, organization_id, customer_number, email, first_name, last_name) VALUES (?, ?, 'CUST-B', 'b@test.com', 'B', 'User')`, [customerB, orgB]);

  const catA = crypto.randomUUID();
  await pool.query(`INSERT INTO categories (id, organization_id, name, code) VALUES (?, ?, 'Cat A', 'cat-a')`, [catA, orgA]);

  const prodA = crypto.randomUUID();
  await pool.query(`INSERT INTO products (id, organization_id, category_id, name, sku, status) VALUES (?, ?, ?, 'Prod A', 'prod-a', 'active')`, [prodA, orgA, catA]);

  const varA = crypto.randomUUID();
  await pool.query(`INSERT INTO variants (id, organization_id, product_id, sku, name) VALUES (?, ?, ?, 'SKU-A', 'Var A')`, [varA, orgA, prodA]);

  const assetA1 = crypto.randomUUID();
  await pool.query(`INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, lifecycle_status, condition_status) VALUES (?, ?, ?, 'TAG-1', 'SN-1', 'AVAILABLE', 'GOOD')`, [assetA1, orgA, varA]);

  // Rental Config
  const periodId = crypto.randomUUID();
  await pool.query(`INSERT INTO rental_periods (id, organization_id, name, code, unit, duration_value) VALUES (?, ?, 'Daily', 'DAILY', 'DAY', 1)`, [periodId, orgA]);

  const pricelistId = crypto.randomUUID();
  await pool.query(`INSERT INTO pricelists (id, organization_id, name, code, is_default) VALUES (?, ?, 'Default', 'DEF', 1)`, [pricelistId, orgA]);
  
  const itemId = crypto.randomUUID();
  await pool.query(`INSERT INTO pricelist_items (id, pricelist_id, product_variant_id, rental_period_id, unit_price) VALUES (?, ?, ?, ?, 100.00)`, [itemId, pricelistId, varA, periodId]);

  console.log('--- FLOW B: Rental Transaction ---');
  let res = await makeRequest('POST', '/transactions', orgA, userA, { customer_id: customerA });
  const txId = res.body.id;
  if (!txId || res.status !== 201) throw new Error('Failed to create tx: ' + JSON.stringify(res));

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);

  res = await makeRequest('POST', `/transactions/${txId}/lines`, orgA, userA, {
    product_id: prodA,
    product_variant_id: varA,
    rental_period_id: periodId,
    rental_start_date: startDate.toISOString(),
    rental_end_date: endDate.toISOString(),
    unit_price: 100,
    quantity: 1
  });
  if (res.status !== 201) throw new Error('Failed to add line: ' + JSON.stringify(res));

  res = await makeRequest('POST', `/transactions/${txId}/confirm`, orgA, userA);
  if (res.status !== 200) throw new Error('Failed to confirm tx: ' + JSON.stringify(res));

  console.log('--- NEGATIVE TENANT TESTS ---');
  res = await makeRequest('GET', `/transactions/${txId}`, orgB, userB);
  if (res.status !== 404) throw new Error('Tenant isolation failed for GET tx');

  console.log('--- FLOW C: Asset Allocation (Concurrency) ---');
  // Attempt concurrent allocation
  const [alloc1, alloc2] = await Promise.all([
    makeRequest('POST', `/transactions/${txId}/allocate`, orgA, userA),
    makeRequest('POST', `/transactions/${txId}/allocate`, orgA, userA)
  ]);
  
  const successCount = [alloc1.status, alloc2.status].filter(s => s === 200).length;
  console.log(`Concurrency Result: ${successCount} successful allocations out of 2.`);
  if (successCount !== 1) throw new Error('Concurrency test failed. Expected exactly 1 success.');

  console.log('--- FULFILLMENT ---');
  res = await makeRequest('POST', `/transactions/${txId}/fulfill`, orgA, userA);
  if (res.status !== 200) throw new Error('Fulfillment failed: ' + JSON.stringify(res));

  console.log('--- RETURN ---');
  res = await makeRequest('POST', `/transactions/${txId}/return`, orgA, userA, { return_date: new Date().toISOString() });
  if (res.status !== 200) throw new Error('Return failed: ' + JSON.stringify(res));
  const returnId = res.body.id;

  console.log('--- INVOICE ---');
  res = await makeRequest('POST', '/invoices', orgA, userA, { transaction_id: txId, due_date: endDate.toISOString() });
  if (res.status !== 201) throw new Error('Invoice creation failed: ' + JSON.stringify(res));
  const invoiceId = res.body.id;

  res = await makeRequest('POST', `/invoices/${invoiceId}/issue`, orgA, userA);
  if (res.status !== 200) throw new Error('Invoice issue failed: ' + JSON.stringify(res));

  console.log('--- PAYMENT ---');
  res = await makeRequest('POST', '/payments', orgA, userA, { invoice_id: invoiceId, amount: 100, payment_method: 'CARD' });
  if (res.status !== 201) throw new Error('Payment failed: ' + JSON.stringify(res));

  console.log('--- READ LAYER ---');
  res = await makeRequest('GET', '/dashboard', orgA, userA);
  if (res.status !== 200) throw new Error('Dashboard read failed: ' + JSON.stringify(res));
  console.log('Dashboard Data:', res.body);

  res = await makeRequest('GET', '/dashboard', orgB, userB);
  if (res.body.revenue.total !== '0.00') throw new Error('Tenant isolation failed on read dashboard');

  console.log('--- INTEGRATION TESTS PASSED ---');
}

async function main() {
  try {
    await startServer();
    await runTests();
  } catch (err) {
    console.error('Integration test failed:', err);
    process.exitCode = 1;
  } finally {
    await stopServer();
    await pool.end();
  }
}

main();
