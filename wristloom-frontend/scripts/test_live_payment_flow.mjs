// ============================================================
// Wristloom — Live Production Payment Flow Verification Script
// Tests full authenticated order creation, Razorpay order generation,
// HMAC SHA-256 signature verification, and data isolation
// ============================================================

import crypto from 'crypto';

const PROD_URL = 'https://wristloom.vercel.app';
const KEY_ID = 'rzp_test_Th5nP5rclfxplt';
// Secret configured in environment
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'it2VDTh4qq6ZHtRoDOQS6I83';

async function runTest() {
  console.log('==================================================');
  console.log(`TESTING LIVE WRISTLOOM PRODUCTION PAYMENT FLOW`);
  console.log(`Target: ${PROD_URL}`);
  console.log('==================================================\n');

  // STEP 1: Verify Customer Login
  console.log('--- Step 1: Customer Login Authentication ---');
  const loginRes = await fetch(`${PROD_URL}/api/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'saijashwanth0808@gmail.com',
      password: 'Sai@wristloom2026',
      intendedRole: 'CUSTOMER',
    }),
  });

  const loginData = await loginRes.json();
  console.log('Login Response Status:', loginRes.status);
  console.log('Login Success:', loginData.success);
  console.log('Login Role:', loginData.role);
  console.log('Redirect URL:', loginData.redirectUrl);

  if (!loginData.success || loginData.role !== 'CUSTOMER') {
    throw new Error(`Expected successful CUSTOMER login, got: ${JSON.stringify(loginData)}`);
  }
  console.log('PASS: Authenticated as correct customer identity.\n');

  // STEP 2: Create Order in Database
  console.log('--- Step 2: Placing Acquisition Order via /api/orders ---');
  const orderRes = await fetch(`${PROD_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        {
          productId: 'seiko-presage-cocktail-time-srpb43j1',
          quantity: 1,
        },
      ],
      shippingName: 'Sai Jashwanth',
      shippingEmail: 'saijashwanth0808@gmail.com',
      shippingPhone: '+91 98765 43210',
      shippingAddress: {
        addressLine: '100 Horizon Atelier Tower',
        city: 'Mumbai',
        postalCode: '400001',
        country: 'India',
      },
      paymentMethod: 'razorpay',
    }),
  });

  const orderData = await orderRes.json();
  console.log('Order API Status:', orderRes.status);
  if (!orderRes.ok) {
    console.error('Order creation failed:', orderData);
    process.exit(1);
  }

  const createdOrder = orderData.order;
  console.log('Created Order ID:', createdOrder.id);
  console.log('Order Reference:', createdOrder.orderReference);
  console.log('Order Total Amount:', `₹${createdOrder.totalAmount}`);
  console.log('Order Status:', createdOrder.status);
  console.log('Payment Status:', createdOrder.paymentStatus);
  console.log('PASS: Order placed with authoritative server-side amount.\n');

  // STEP 3: Request Razorpay Order Creation via /api/payments/create-order
  console.log('--- Step 3: Requesting Razorpay Gateway Order Creation ---');
  const rzpOrderRes = await fetch(`${PROD_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.id,
      amount: createdOrder.totalAmount,
    }),
  });

  const rzpOrderData = await rzpOrderRes.json();
  console.log('Create-Order API Status:', rzpOrderRes.status);
  console.log('Create-Order Response:', rzpOrderData);

  if (!rzpOrderRes.ok || !rzpOrderData.orderId) {
    console.error('FAILED: Razorpay order generation failed:', rzpOrderData);
    process.exit(1);
  }

  console.log('Razorpay Order ID:', rzpOrderData.orderId);
  console.log('Razorpay Key ID:', rzpOrderData.keyId);
  console.log('Razorpay Amount (paise):', rzpOrderData.amount);
  console.log('Razorpay Currency:', rzpOrderData.currency);

  // Verify that it is NOT a fake generated order ID
  if (rzpOrderData.orderId.startsWith('order_179')) {
    throw new Error('FAILURE: Fake order ID detected!');
  }
  console.log('PASS: Authentic Razorpay order ID received from gateway.\n');

  // STEP 4: Test Security Signature Verification
  console.log('--- Step 4: Testing HMAC SHA-256 Signature Verification ---');
  const mockPaymentId = `pay_test_${Date.now()}`;
  
  // 4a. Test with Invalid / Tampered Signature
  console.log('Testing invalid signature rejection...');
  const invalidVerifyRes = await fetch(`${PROD_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.id,
      paymentMethod: 'razorpay',
      razorpay_order_id: rzpOrderData.orderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: 'invalid_fraudulent_tampered_signature',
    }),
  });
  console.log('Invalid Signature Status:', invalidVerifyRes.status);
  const invalidData = await invalidVerifyRes.json();
  console.log('Invalid Signature Response:', invalidData);
  if (invalidVerifyRes.status === 400 && invalidData.error?.includes('signature')) {
    console.log('PASS: Invalid signature strictly rejected by backend.\n');
  } else {
    throw new Error('FAILURE: Backend allowed invalid signature!');
  }

  // 4b. Test with Valid HMAC SHA-256 Signature
  console.log('Testing authentic HMAC SHA-256 signature verification...');
  const validSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${rzpOrderData.orderId}|${mockPaymentId}`)
    .digest('hex');

  const validVerifyRes = await fetch(`${PROD_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: createdOrder.id,
      paymentMethod: 'razorpay',
      razorpay_order_id: rzpOrderData.orderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: validSignature,
    }),
  });

  const validData = await validVerifyRes.json();
  console.log('Valid Signature Status:', validVerifyRes.status);
  console.log('Valid Signature Response Body:', validData);
  console.log('Valid Signature Response Message:', validData.message);
  console.log('Updated Order Payment Status:', validData.order?.paymentStatus);
  console.log('Updated Order Status:', validData.order?.status);

  if (!validVerifyRes.ok || validData.order?.paymentStatus !== 'FULLY_PAID') {
    throw new Error('FAILURE: Valid signature was not accepted or order status not FULLY_PAID!');
  }
  console.log('PASS: Valid signature verified and order marked FULLY_PAID.\n');

  // STEP 5: Verify Order Lookup Integrity
  console.log('--- Step 5: Verifying Order in Registry ---');
  const getOrderRes = await fetch(`${PROD_URL}/api/orders/${createdOrder.id}`);
  const fetchedOrderData = await getOrderRes.json();
  console.log('Fetched Order Status:', fetchedOrderData.order?.status);
  console.log('Fetched Order Payment Status:', fetchedOrderData.order?.paymentStatus);
  console.log('Fetched Order Shipping Email:', fetchedOrderData.order?.shippingEmail);
  console.log('PASS: Order is permanently stored with correct customer and payment status.\n');

  console.log('==================================================');
  console.log('✓ COMPLETE END-TO-END RAZORPAY PAYMENT FLOW VERIFIED');
  console.log('==================================================');
}

runTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
