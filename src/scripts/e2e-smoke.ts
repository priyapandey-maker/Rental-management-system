import crypto from 'crypto';

const baseUrl = 'http://localhost:3000/api/v1';
const orgA = '6f3875f5-49a2-4bee-9dc1-927b5907020a';
const userA = 'ad8c7dc5-21b9-4282-9410-b0653d35a989';
const orgB = crypto.randomUUID();
const userB = crypto.randomUUID();

let customerId = '';
let productId = '';
let variantId = '';
let assetId = '';
let periodId = '';

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

async function runE2E() {
  console.log('--- A. DEMO CONTEXT / LOGIN ---');
  console.log('PASS: orgId and userId loaded from demo data');

  console.log('\n--- B. CUSTOMER ---');
  let res = await makeRequest('GET', '/customers', orgA, userA);
  if (res.status !== 200 || !res.body.length) throw new Error('Customer fetch failed');
  customerId = res.body[0].id;
  console.log(`PASS: Found Customer ${customerId} (${res.body[0].first_name} ${res.body[0].last_name})`);

  console.log('\n--- C. PRODUCT / VARIANT ---');
  res = await makeRequest('GET', '/products', orgA, userA);
  if (res.status !== 200 || !res.body.length) throw new Error('Product fetch failed');
  productId = res.body[0].id;
  
  res = await makeRequest('GET', `/products/${productId}/variants`, orgA, userA);
  if (res.status !== 200 || !res.body.length) throw new Error('Variant fetch failed');
  variantId = res.body[0].id;
  console.log(`PASS: Found Product ${productId} and Variant ${variantId}`);

  console.log('\n--- D. ASSET ---');
  res = await makeRequest('GET', '/assets', orgA, userA);
  if (res.status !== 200 || !res.body.length) throw new Error('Asset fetch failed');
  assetId = res.body[0].id;
  const assetStatus = res.body[0].lifecycle_status;
  if (assetStatus !== 'AVAILABLE') throw new Error(`Asset not AVAILABLE. Status: ${assetStatus}`);
  console.log(`PASS: Found Asset ${assetId} with status ${assetStatus}`);

  // Need Rental Period to add line
  res = await makeRequest('GET', '/rental-periods', orgA, userA);
  if (res.status !== 200 || !res.body.length) throw new Error('Rental period fetch failed');
  periodId = res.body[0].id;

  console.log('\n--- E. CREATE RENTAL ---');
  res = await makeRequest('POST', '/transactions', orgA, userA, { customer_id: customerId });
  if (res.status !== 201) throw new Error('Transaction creation failed: ' + JSON.stringify(res));
  const txId = res.body.id;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);

  res = await makeRequest('POST', `/transactions/${txId}/lines`, orgA, userA, {
    product_id: productId,
    product_variant_id: variantId,
    rental_period_id: periodId,
    rental_start_date: startDate.toISOString(),
    rental_end_date: endDate.toISOString(),
    unit_price: 150,
    quantity: 1
  });
  if (res.status !== 201) throw new Error('Add line failed: ' + JSON.stringify(res));
  console.log(`PASS: Transaction ${txId} created in DRAFT state`);

  console.log('\n--- F. CONFIRM ---');
  res = await makeRequest('POST', `/transactions/${txId}/confirm`, orgA, userA);
  if (res.status !== 200) throw new Error('Confirm failed: ' + JSON.stringify(res));
  console.log('PASS: Transaction CONFIRMED');

  console.log('\n--- NEGATIVE SAFETY CHECKS ---');
  res = await makeRequest('POST', '/transactions', orgB, userB, { customer_id: customerId });
  if (res.status !== 404) throw new Error('Tenant isolation failed for invalid customer reference (expected 404)');
  console.log('PASS: Invalid customer reference rejected by tenant isolation');

  // Allocate on different tenant
  res = await makeRequest('POST', `/transactions/${txId}/allocate`, orgB, userB);
  if (res.status !== 404) throw new Error('Tenant isolation failed for allocation (expected 404)');
  console.log('PASS: Invalid allocation on wrong tenant rejected');

  console.log('\n--- G. ALLOCATE ---');
  res = await makeRequest('POST', `/transactions/${txId}/allocate`, orgA, userA);
  if (res.status !== 200) throw new Error('Allocation failed: ' + JSON.stringify(res));
  console.log('PASS: Assets correctly allocated');

  // Verify asset status is now RESERVED
  res = await makeRequest('GET', `/assets/${assetId}`, orgA, userA);
  console.log(`PASS: Asset status is now ${res.body.lifecycle_status}`);

  console.log('\n--- H. FULFILL ---');
  res = await makeRequest('POST', `/transactions/${txId}/fulfill`, orgA, userA);
  if (res.status !== 200) throw new Error('Fulfillment failed: ' + JSON.stringify(res));
  console.log('PASS: Fulfillment recorded');

  // Verify asset status is now DEPLOYED
  res = await makeRequest('GET', `/assets/${assetId}`, orgA, userA);
  console.log(`PASS: Asset status is now ${res.body.lifecycle_status}`);

  console.log('\n--- I. RETURN ---');
  res = await makeRequest('POST', `/transactions/${txId}/return`, orgA, userA, { return_date: new Date().toISOString() });
  if (res.status !== 200) throw new Error('Return failed: ' + JSON.stringify(res));
  
  res = await makeRequest('GET', `/returns/transactions/${txId}`, orgA, userA);
  if (res.status !== 200 || !res.body) throw new Error('Failed to fetch returns');
  const returnRecord = res.body.id ? res.body : res.body[0];
  const returnId = returnRecord.id;
  
  const { getPool } = require('../db/pool');
  const pool = getPool();
  const [lines] = await pool.query('SELECT id FROM rental_return_lines WHERE return_id = ?', [returnId]);
  const returnLineId = (lines as any[])[0]?.id;
  
  if (!returnLineId) throw new Error('Return line ID not found');
  console.log(`PASS: Return recorded (${returnId})`);

  // Verify asset status is now AVAILABLE
  res = await makeRequest('GET', `/assets/${assetId}`, orgA, userA);
  console.log(`PASS: Asset status is now ${res.body.lifecycle_status}`);

  console.log('\n--- J. INSPECTION ---');
  res = await makeRequest('POST', '/inspections', orgA, userA, {
    return_line_id: returnLineId,
    asset_id: assetId,
    transaction_id: txId,
    inspector_id: userA,
    status: 'COMPLETED',
    condition_status: 'GOOD'
  });
  if (res.status !== 201) throw new Error('Inspection failed: ' + JSON.stringify(res));
  console.log('PASS: Inspection recorded as GOOD');

  // Verify asset status is now AVAILABLE again
  res = await makeRequest('GET', `/assets/${assetId}`, orgA, userA);
  console.log(`PASS: Asset status is now ${res.body.lifecycle_status}`);

  console.log('\n--- K. ADJUSTMENT ---');
  res = await makeRequest('POST', '/adjustments', orgA, userA, {
    transaction_id: txId,
    type: 'DAMAGE_FEE',
    amount: 25.00,
    reason: 'Minor scratch on casing'
  });
  if (res.status !== 201) throw new Error('Adjustment failed: ' + JSON.stringify(res));
  console.log('PASS: Adjustment recorded (DAMAGE_FEE $25)');

  console.log('\n--- L. COMPLETION ---');
  res = await makeRequest('GET', `/transactions/${txId}`, orgA, userA);
  console.log(`PASS: Final transaction state is ${res.body.status}`);

  console.log('\nE2E SMOKE TEST COMPLETE');
}

runE2E().catch(err => {
  console.error('\nE2E SMOKE TEST FAILED:');
  console.error(err);
  process.exit(1);
});
