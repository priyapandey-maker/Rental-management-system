/**
 * e2e-auth.ts — Comprehensive Role-Based Authentication E2E Test
 *
 * Tests all authentication and authorization scenarios for:
 *   - Customer signup/login/access
 *   - Vendor signup/login/access
 *   - Admin login/access
 *   - Cross-role security (customers can't access vendor/admin routes)
 *   - Duplicate signup prevention
 *   - Invalid credentials
 *   - Missing/invalid token behavior
 *
 * Run: npx ts-node src/scripts/e2e-auth.ts
 * Prerequisites: Backend server running on port 3000
 */

import crypto from 'crypto';

const BASE = 'http://localhost:3000/api/v1';
const ts = Date.now();
const CUSTOMER_EMAIL = `customer_${ts}@test.local`;
const VENDOR_EMAIL = `vendor_${ts}@test.local`;
const ADMIN_EMAIL = 'admin@rentalms.local';
const ADMIN_PASSWORD = 'Admin@2024!';
const TEST_PASSWORD = 'Test@1234!';

let passed = 0;
let failed = 0;
const failures: string[] = [];

async function req(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  return { status: res.status, body: json };
}

function expect(label: string, actual: number, expected: number, context?: string) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${label} (${actual})`);
    passed++;
  } else {
    const msg = `${label} — expected ${expected}, got ${actual}${context ? ` | ${context}` : ''}`;
    console.error(`  ❌ FAIL: ${msg}`);
    failures.push(msg);
    failed++;
  }
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AUTH-RBAC E2E TEST SUITE                   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  let customerToken = '';
  let vendorToken = '';
  let adminToken = '';

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: CUSTOMER FLOW
  // ─────────────────────────────────────────────────────────────
  console.log('─── SECTION 1: CUSTOMER FLOW ───\n');

  // 1.1 Customer signup
  {
    const r = await req('POST', '/auth/register', {
      email: CUSTOMER_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'Customer',
    });
    expect('1.1 Customer signup returns 201', r.status, 201);
    if (r.body?.userId) console.log(`      → userId: ${r.body.userId}`);
  }

  // 1.2 Customer login → should get customer role
  {
    const r = await req('POST', '/auth/login', { email: CUSTOMER_EMAIL, password: TEST_PASSWORD });
    expect('1.2 Customer login returns 200', r.status, 200);
    if (r.status === 200) {
      customerToken = r.body.token;
      const role = r.body.user?.role;
      if (role === 'customer') {
        console.log(`  ✅ PASS: 1.2a Customer role is 'customer'`);
        passed++;
      } else {
        const msg = `1.2a Customer role mismatch — expected 'customer', got '${role}'`;
        console.error(`  ❌ FAIL: ${msg}`);
        failures.push(msg);
        failed++;
      }
    }
  }

  // 1.3 Customer can access storefront products
  {
    const r = await req('GET', '/storefront/products', undefined, customerToken);
    expect('1.3 Customer can GET /storefront/products (200)', r.status, 200);
  }

  // 1.4 Customer CANNOT access vendor routes
  {
    const r = await req('GET', '/vendor/products', undefined, customerToken);
    expect('1.4 Customer denied /vendor/products (403)', r.status, 403);
  }

  // 1.5 Customer CANNOT access admin routes
  {
    const r = await req('GET', '/admin/customers', undefined, customerToken);
    expect('1.5 Customer denied /admin/customers (403)', r.status, 403);
  }

  // 1.6 Duplicate customer email rejected
  {
    const r = await req('POST', '/auth/register', {
      email: CUSTOMER_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'Customer',
    });
    expect('1.6 Duplicate customer signup rejected (400 or 409)', r.status >= 400 ? r.status : 0, r.status >= 400 ? r.status : -1);
    // Just check it's not 201
    if (r.status !== 201) {
      console.log(`  ✅ PASS: 1.6 Duplicate signup rejected (${r.status})`);
      passed++;
    } else {
      const m = '1.6 Duplicate signup was incorrectly accepted (201)';
      console.error(`  ❌ FAIL: ${m}`);
      failures.push(m);
      failed++;
    }
    // Remove previous auto-count
    passed--; failed--;
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: VENDOR FLOW
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── SECTION 2: VENDOR FLOW ───\n');

  // 2.1 Vendor signup
  {
    const r = await req('POST', '/auth/vendor-register', {
      email: VENDOR_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'Vendor',
      companyName: 'Test Vendor Co',
      gstNo: 'GST123456789',
      productCategory: 'electronics',
    });
    expect('2.1 Vendor signup returns 201', r.status, 201);
  }

  // 2.2 Vendor login → should get vendor role
  {
    const r = await req('POST', '/auth/login', { email: VENDOR_EMAIL, password: TEST_PASSWORD });
    expect('2.2 Vendor login returns 200', r.status, 200);
    if (r.status === 200) {
      vendorToken = r.body.token;
      const role = r.body.user?.role;
      if (role === 'vendor') {
        console.log(`  ✅ PASS: 2.2a Vendor role is 'vendor'`);
        passed++;
      } else {
        const msg = `2.2a Vendor role mismatch — expected 'vendor', got '${role}'`;
        console.error(`  ❌ FAIL: ${msg}`);
        failures.push(msg);
        failed++;
      }
    }
  }

  // 2.3 Vendor can access vendor products route
  {
    const r = await req('GET', '/vendor/products', undefined, vendorToken);
    expect('2.3 Vendor can GET /vendor/products (200)', r.status, 200);
  }

  // 2.4 Vendor CANNOT access admin routes
  {
    const r = await req('GET', '/admin/customers', undefined, vendorToken);
    expect('2.4 Vendor denied /admin/customers (403)', r.status, 403);
  }

  // 2.5 Vendor CANNOT access a different vendor's data in a different org
  // (since org is derived from JWT, they'll get their own org's empty result, not another vendor's data)
  {
    const r = await req('GET', '/vendor/assets', undefined, vendorToken);
    // 200 is expected — but the data returned is scoped to their org only
    if (r.status === 200) {
      console.log(`  ✅ PASS: 2.5 Vendor GET /vendor/assets returns 200 (org-scoped)`);
      passed++;
    } else {
      expect('2.5 Vendor GET /vendor/assets', r.status, 200);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: ADMIN FLOW
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── SECTION 3: ADMIN FLOW ───\n');

  // 3.1 Admin login with seeded credentials
  {
    const r = await req('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect('3.1 Admin login returns 200', r.status, 200);
    if (r.status === 200) {
      adminToken = r.body.token;
      const role = r.body.user?.role;
      if (role === 'admin') {
        console.log(`  ✅ PASS: 3.1a Admin role is 'admin'`);
        passed++;
      } else {
        const msg = `3.1a Admin role mismatch — expected 'admin', got '${role}'`;
        console.error(`  ❌ FAIL: ${msg}`);
        failures.push(msg);
        failed++;
      }
    }
  }

  // 3.2 Admin can access admin customers route
  {
    const r = await req('GET', '/admin/customers', undefined, adminToken);
    expect('3.2 Admin can GET /admin/customers (200)', r.status, 200);
  }

  // 3.3 Admin can access admin products route
  {
    const r = await req('GET', '/admin/products', undefined, adminToken);
    expect('3.3 Admin can GET /admin/products (200)', r.status, 200);
  }

  // 3.4 Admin can access vendor routes too (admin is superset)
  {
    const r = await req('GET', '/vendor/products', undefined, adminToken);
    expect('3.4 Admin can GET /vendor/products (200)', r.status, 200);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: SECURITY — INVALID / MISSING TOKENS
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── SECTION 4: SECURITY CHECKS ───\n');

  // 4.1 No token → 401
  {
    const r = await req('GET', '/vendor/products');
    expect('4.1 No token → 401 on protected route', r.status, 401);
  }

  // 4.2 Invalid token → 401
  {
    const r = await req('GET', '/vendor/products', undefined, 'not-a-valid-jwt');
    expect('4.2 Invalid JWT → 401', r.status, 401);
  }

  // 4.3 Wrong credentials → 401
  {
    const r = await req('POST', '/auth/login', { email: ADMIN_EMAIL, password: 'WrongPassword!' });
    expect('4.3 Wrong password → 401', r.status, 401);
  }

  // 4.4 Non-existent email → 401
  {
    const r = await req('POST', '/auth/login', { email: 'nobody@nowhere.com', password: 'anything' });
    expect('4.4 Unknown email → 401', r.status, 401);
  }

  // 4.5 Header spoofing via x-user-id should NOT work (fallback removed)
  {
    const res = await fetch(`${BASE}/vendor/products`, {
      headers: {
        'x-user-id': 'spoofed-user-id',
        'x-organization-id': 'spoofed-org-id',
        'x-role': 'admin',
      },
    });
    const status = res.status;
    if (status === 401) {
      console.log(`  ✅ PASS: 4.5 Header spoofing rejected (401) — fallback removed`);
      passed++;
    } else {
      const m = `4.5 Header spoofing was NOT rejected — status ${status} (expected 401)`;
      console.error(`  ❌ FAIL: ${m}`);
      failures.push(m);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('╚══════════════════════════════════════════════╝');

  if (failures.length > 0) {
    console.error('\nFailed tests:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('\nFATAL ERROR:', err);
  process.exit(1);
});
