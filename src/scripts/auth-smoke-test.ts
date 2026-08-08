import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000/api/v1';

async function fetchJSON(url: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

async function runSmokeTest() {
  console.log('--- RUNNING AUTHENTICATION SMOKE TEST ---');

  const testEmail = `smoke-test-${crypto.randomBytes(4).toString('hex')}@example.com`;
  const testPassword = 'TestPassword123!';
  let jwtToken = '';

  try {
    // 1. Register new user
    console.log(`Test 1: Register new user (${testEmail})`);
    const regRes = await fetchJSON(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      firstName: 'Smoke',
      lastName: 'Test'
    });
    console.log(`✓ Registration successful (User ID: ${regRes.userId})`);

    // 2. Login with correct credentials
    console.log(`Test 2: Login with correct credentials`);
    const loginRes = await fetchJSON(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    jwtToken = loginRes.token;
    console.log(`✓ Login successful. JWT received. (User ID: ${loginRes.user.id})`);

    // 3. Login with wrong password
    console.log(`Test 3: Login with wrong password`);
    try {
      await fetchJSON(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123!'
      });
      console.error('❌ Expected failure but login succeeded!');
      process.exit(1);
    } catch (err: any) {
      if (err.status === 401 || err.data?.error === 'Invalid login credentials') {
        console.log('✓ Login correctly rejected wrong password');
      } else {
        console.error('❌ Unexpected error on wrong password:', err.data || err.message);
        process.exit(1);
      }
    }

    // 4. Login with unknown email
    console.log(`Test 4: Login with unknown email`);
    try {
      await fetchJSON(`${BASE_URL}/auth/login`, {
        email: 'nobody@example.com',
        password: testPassword
      });
      console.error('❌ Expected failure but login succeeded!');
      process.exit(1);
    } catch (err: any) {
      if (err.status === 401 || err.data?.error === 'Invalid login credentials') {
        console.log('✓ Login correctly rejected unknown email');
      } else {
        console.error('❌ Unexpected error on unknown email:', err.data || err.message);
        process.exit(1);
      }
    }

    // 5. Vendor Registration -> Login
    console.log(`Test 5: Vendor Registration -> Login`);
    const vendorEmail = `vendor-smoke-${crypto.randomBytes(4).toString('hex')}@example.com`;
    await fetchJSON(`${BASE_URL}/auth/vendor-register`, {
      email: vendorEmail,
      password: testPassword,
      firstName: 'Vendor',
      lastName: 'Smoke',
      companyName: 'Smoke Co',
      gstNo: 'GST123',
      productCategory: 'electronics'
    });
    
    const vendorLoginRes = await fetchJSON(`${BASE_URL}/auth/login`, {
      email: vendorEmail,
      password: testPassword
    });
    console.log(`✓ Vendor login successful. (User ID: ${vendorLoginRes.user.id})`);

    console.log('--- ALL TESTS PASSED ---');
    process.exit(0);

  } catch (err: any) {
    console.error('❌ Test failed with error:', err.data || err.message || err);
    process.exit(1);
  }
}

runSmokeTest();
