const PROD_URL = 'https://wristloom.vercel.app';

async function testProduction() {
  console.log('==================================================');
  console.log('LIVE VERCEL PRODUCTION AUTHENTICATION & SECURITY TESTS');
  console.log('URL: ' + PROD_URL);
  console.log('==================================================\n');

  let allPassed = true;

  // 1. Test Customer Login: saijashwanth0808@gmail.com
  console.log('--- TEST 1: saijashwanth0808@gmail.com Login Verification ---');
  try {
    const res = await fetch(`${PROD_URL}/api/auth/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'saijashwanth0808@gmail.com',
        password: 'Sai@wristloom2026',
        intendedRole: 'CUSTOMER'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.role === 'CUSTOMER') {
      console.log(`PASS: /api/auth/verify-login -> Status 200, Role: ${data.role}, Redirect: ${data.redirectUrl}`);
    } else {
      console.error(`FAIL: Status ${res.status}`, data);
      allPassed = false;
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  // 2. Test Customer Login: testuser@wristloom.com
  console.log('\n--- TEST 2: testuser@wristloom.com Login Verification ---');
  try {
    const res = await fetch(`${PROD_URL}/api/auth/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@wristloom.com',
        password: 'Test@wristloom2026',
        intendedRole: 'CUSTOMER'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.role === 'CUSTOMER') {
      console.log(`PASS: /api/auth/verify-login -> Status 200, Role: ${data.role}, Redirect: ${data.redirectUrl}`);
    } else {
      console.error(`FAIL: Status ${res.status}`, data);
      allPassed = false;
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  // 3. Test Admin Login: wristloom@gmail.com
  console.log('\n--- TEST 3: Admin Login Verification ---');
  try {
    const res = await fetch(`${PROD_URL}/api/auth/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wristloom@gmail.com',
        password: 'Admin@wristloom2026',
        intendedRole: 'CUSTOMER'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.role === 'ADMIN') {
      console.log(`PASS: Admin -> Status 200, Role: ${data.role}, Redirect: ${data.redirectUrl}`);
    } else {
      console.error(`FAIL: Status ${res.status}`, data);
      allPassed = false;
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  // 4. Test Technician Login: technician@wristloom.com
  console.log('\n--- TEST 4: Technician Login Verification ---');
  try {
    const res = await fetch(`${PROD_URL}/api/auth/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'technician@wristloom.com',
        password: 'Tech@wristloom2026',
        intendedRole: 'TECHNICIAN'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.role === 'TECHNICIAN') {
      console.log(`PASS: Technician -> Status 200, Role: ${data.role}, Redirect: ${data.redirectUrl}`);
    } else {
      console.error(`FAIL: Status ${res.status}`, data);
      allPassed = false;
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  // 5. Test Unauthorized Data Isolation on Protected Endpoints
  console.log('\n--- TEST 5: Backend Data Protection & Authorization Enforced ---');
  try {
    const profRes = await fetch(`${PROD_URL}/api/user/profile`);
    console.log(`PASS: /api/user/profile without session -> Status: ${profRes.status} (Unauthorized expected)`);
    if (profRes.status !== 401) allPassed = false;

    const ordRes = await fetch(`${PROD_URL}/api/orders`);
    console.log(`PASS: /api/orders without session -> Status: ${ordRes.status} (Unauthorized expected)`);
    if (ordRes.status !== 401) allPassed = false;

    const bookRes = await fetch(`${PROD_URL}/api/bookings`);
    const bookData = await bookRes.json();
    console.log(`PASS: /api/bookings without session -> Returns empty list (count: ${bookData.length})`);
    if (bookData.length !== 0) allPassed = false;
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  // 6. Test Public Account Page Render
  console.log('\n--- TEST 6: Public Routes Integrity ---');
  try {
    const accRes = await fetch(`${PROD_URL}/account`);
    const html = await accRes.text();
    const hasOldTestUser = html.includes('testuser@wristloom.com');
    const hasDemoUser = html.includes('ravi.desai@email.com');
    console.log(`PASS: /account HTTP status: ${accRes.status}`);
    console.log(`PASS: Contains 'testuser@wristloom.com': ${hasOldTestUser ? 'YES (FAIL)' : 'NO (CLEAN)'}`);
    console.log(`PASS: Contains 'ravi.desai@email.com': ${hasDemoUser ? 'YES (FAIL)' : 'NO (CLEAN)'}`);
    if (hasOldTestUser || hasDemoUser) allPassed = false;
  } catch (e) {
    console.error('FAIL:', e.message);
    allPassed = false;
  }

  console.log('\n==================================================');
  if (allPassed) {
    console.log('✓ ALL LIVE PRODUCTION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('✗ SOME PRODUCTION CHECKS FAILED!');
  }
  console.log('==================================================');
}

testProduction();
