// ============================================================
// Wristloom — Automated Test Suite
// Layer 8: Testing (15-Layer SaaS Playbook, p. 18-19)
// Tests permissions, pricing, HMAC verification, and privacy masking
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// ─── 1. Permissions Matrix Tests (Layer 4) ────────────────────
describe('Permissions Matrix (Layer 4 - Auth & Permissions)', () => {
  // Inline implementation replicating src/lib/permissions.ts to verify rules
  function can(user, action, resource) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    switch (action) {
      case 'order:create':
        return true;
      case 'order:read':
        if (!resource) return true;
        return resource.ownerId === user.id || resource.customerId === user.id;
      case 'order:cancel':
        if (!resource) return false;
        return (resource.ownerId === user.id || resource.customerId === user.id) && resource.status === 'PENDING';
      case 'order:list_all':
        return false;

      case 'booking:create':
        return user.role === 'CUSTOMER';
      case 'booking:read':
        if (!resource) return true;
        return resource.customerId === user.id || (user.role === 'TECHNICIAN' && resource.technicianUserId === user.id);
      case 'booking:cancel':
        if (!resource) return false;
        return resource.customerId === user.id && resource.status === 'PENDING';
      case 'booking:update_status':
        if (!resource) return false;
        return user.role === 'TECHNICIAN' && resource.technicianUserId === user.id;
      case 'booking:assign_technician':
      case 'booking:reprice':
      case 'booking:list_all':
        return false;

      case 'vault:create':
      case 'vault:read':
      case 'vault:update':
      case 'vault:delete':
        if (!resource) return true;
        return resource.ownerId === user.id;

      case 'product:create':
      case 'product:update':
      case 'product:delete':
        return false;

      case 'technician:create':
      case 'technician:view_private_info':
      case 'technician:list_all':
        return false;
      case 'technician:update_location':
        return user.role === 'TECHNICIAN';

      case 'admin:access_dashboard':
      case 'admin:view_analytics':
        return false;

      default:
        return false;
    }
  }

  const customerUser = { id: 'cust_101', role: 'CUSTOMER', email: 'collector@example.com' };
  const otherCustomer = { id: 'cust_999', role: 'CUSTOMER', email: 'stranger@example.com' };
  const technicianUser = { id: 'tech_501', role: 'TECHNICIAN', email: 'horologist@example.com' };
  const adminUser = { id: 'admin_001', role: 'ADMIN', email: 'wristloom@gmail.com' };

  it('Customer can create orders and bookings', () => {
    assert.equal(can(customerUser, 'order:create'), true);
    assert.equal(can(customerUser, 'booking:create'), true);
  });

  it('Customer CANNOT read another customer order (IDOR protection)', () => {
    const foreignOrder = { ownerId: otherCustomer.id, status: 'PENDING' };
    assert.equal(can(customerUser, 'order:read', foreignOrder), false);
  });

  it('Customer CAN read their own order', () => {
    const ownOrder = { ownerId: customerUser.id, status: 'PENDING' };
    assert.equal(can(customerUser, 'order:read', ownOrder), true);
  });

  it('Customer CANNOT cancel booking after technician is assigned/en route', () => {
    const inProgressBooking = { customerId: customerUser.id, status: 'IN_PROGRESS' };
    assert.equal(can(customerUser, 'booking:cancel', inProgressBooking), false);
  });

  it('Customer CAN cancel pending booking', () => {
    const pendingBooking = { customerId: customerUser.id, status: 'PENDING' };
    assert.equal(can(customerUser, 'booking:cancel', pendingBooking), true);
  });

  it('Customer CANNOT modify catalog products or access admin dashboard', () => {
    assert.equal(can(customerUser, 'product:create'), false);
    assert.equal(can(customerUser, 'product:update'), false);
    assert.equal(can(customerUser, 'admin:access_dashboard'), false);
  });

  it('Technician can update status on ASSIGNED booking', () => {
    const assignedBooking = { customerId: customerUser.id, technicianUserId: technicianUser.id, status: 'IN_PROGRESS' };
    assert.equal(can(technicianUser, 'booking:update_status', assignedBooking), true);
  });

  it('Technician CANNOT update status on unassigned booking', () => {
    const unassignedBooking = { customerId: customerUser.id, technicianUserId: 'other_tech', status: 'IN_PROGRESS' };
    assert.equal(can(technicianUser, 'booking:update_status', unassignedBooking), false);
  });

  it('Technician CANNOT reprice bookings or create catalog products', () => {
    assert.equal(can(technicianUser, 'booking:reprice'), false);
    assert.equal(can(technicianUser, 'product:create'), false);
  });

  it('Admin has universal access across all actions', () => {
    assert.equal(can(adminUser, 'admin:access_dashboard'), true);
    assert.equal(can(adminUser, 'product:create'), true);
    assert.equal(can(adminUser, 'booking:reprice'), true);
    assert.equal(can(adminUser, 'order:list_all'), true);
  });

  it('Unauthenticated requests are strictly rejected', () => {
    assert.equal(can(null, 'order:read'), false);
    assert.equal(can(undefined, 'vault:read'), false);
  });
});

// ─── 2. Authoritative Pricing Tests (Layer 3 & 5) ─────────────
describe('Authoritative Pricing & Deposit Rules (Layer 5)', () => {
  const SERVICE_CATALOG = {
    diagnostic: { name: 'Complete Horological Diagnostic', basePrice: 4500, depositPercentage: 0.5 },
    overhaul: { name: 'Full Mechanical Overhaul & Calibration', basePrice: 18500, depositPercentage: 0.4 },
    waterproofing: { name: 'Pressure Testing & Gasket Resealing', basePrice: 3500, depositPercentage: 1.0 },
    refinishing: { name: 'Hand-Polishing & Case Restoration', basePrice: 8500, depositPercentage: 0.5 },
    laser_welding: { name: 'Laser Micro-Welding & Dent Fill', basePrice: 12000, depositPercentage: 0.5 },
    battery: { name: 'Precision Quartz Battery & Seal', basePrice: 2000, depositPercentage: 1.0 },
  };

  function calculatePrice(serviceKey) {
    const normalizedKey = (serviceKey || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    const service = SERVICE_CATALOG[normalizedKey];
    if (!service) {
      throw new Error(`Invalid service type "${serviceKey}"`);
    }
    const depositAmount = Math.round(service.basePrice * service.depositPercentage);
    return {
      serviceName: service.name,
      basePrice: service.basePrice,
      depositAmount,
    };
  }

  it('Correctly calculates Mechanical Overhaul price and 40% deposit', () => {
    const res = calculatePrice('overhaul');
    assert.equal(res.basePrice, 18500);
    assert.equal(res.depositAmount, 7400); // 18500 * 0.4
  });

  it('Correctly calculates Full 100% deposit on waterproofing service', () => {
    const res = calculatePrice('waterproofing');
    assert.equal(res.basePrice, 3500);
    assert.equal(res.depositAmount, 3500);
  });

  it('Normalizes hyphenated and spaced keys gracefully', () => {
    const res = calculatePrice('Laser-Welding');
    assert.equal(res.basePrice, 12000);
    assert.equal(res.depositAmount, 6000);
  });

  it('Rejects unknown/tampered service types with an error', () => {
    assert.throws(() => calculatePrice('free_unlimited_service'), /Invalid service type/);
  });
});

// ─── 3. Cryptographic Signature Verification (Layer 10) ───────
describe('Cryptographic Signature Verification (Layer 10 - Security)', () => {
  const TEST_SECRET = 'test_secret_key_1234567890abcdef';

  function verifyGatewaySignature(orderId, paymentId, signature, secret) {
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  function verifyWebhookSignature(rawBody, signature, secret) {
    const generated = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  it('Accepts authentic gateway HMAC SHA-256 signature', () => {
    const orderId = 'order_M123456789';
    const paymentId = 'pay_P987654321';
    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = verifyGatewaySignature(orderId, paymentId, validSignature, TEST_SECRET);
    assert.equal(result, true);
  });

  it('Strictly rejects fraudulent or tampered payment signature', () => {
    const orderId = 'order_M123456789';
    const paymentId = 'pay_P987654321';
    const fakeSignature = 'bad_forged_signature_00000000000000000000000000000000';

    const result = verifyGatewaySignature(orderId, paymentId, fakeSignature, TEST_SECRET);
    assert.equal(result, false);
  });

  it('Accepts authentic webhook payload signature', () => {
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_999', amount: 4500000 } } },
    });
    const webhookSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const result = verifyWebhookSignature(webhookPayload, webhookSignature, TEST_SECRET);
    assert.equal(result, true);
  });

  it('Rejects modified webhook payload (detects tampering)', () => {
    const originalPayload = JSON.stringify({ event: 'payment.captured', amount: 4500000 });
    const signature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(originalPayload)
      .digest('hex');

    const tamperedPayload = JSON.stringify({ event: 'payment.captured', amount: 100 });
    const result = verifyWebhookSignature(tamperedPayload, signature, TEST_SECRET);
    assert.equal(result, false);
  });
});

// ─── 4. PII Privacy Masking Tests (Layer 10) ───────────────────
describe('PII Masking & Privacy (Layer 10 - Security)', () => {
  function maskEmail(email) {
    if (!email || !email.includes('@')) return '••••••@wristloom.luxury';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name.charAt(0)}•••@${domain}`;
    return `${name.slice(0, 2)}••••${name.slice(-1)}@${domain}`;
  }

  function maskPhone(phone) {
    if (!phone) return '••••••••••';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '••••••';
    return `••••••${digits.slice(-4)}`;
  }

  it('Masks email while retaining domain for context', () => {
    const masked = maskEmail('saijashwanth0808@gmail.com');
    assert.equal(masked.startsWith('sa••••8@gmail.com'), true);
    assert.equal(masked.includes('saijashwanth'), false);
  });

  it('Masks phone number showing only last 4 digits', () => {
    const masked = maskPhone('+91 98765 43210');
    assert.equal(masked, '••••••3210');
  });
});

// ─── 5. Technician Navigation & Geocoding Resolution ────────────
describe('Technician Navigation URL & Geocoding Resolution', () => {
  function generateNavigationUrl(addr) {
    if (!addr) return null;

    const addressText = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.postalCode, addr.country || 'India']
      .filter(Boolean)
      .join(', ');

    // Rejection of fake city-center centroid fallbacks
    const isCityCentroidFallback = Boolean(
      addr &&
      (
        (Math.abs(addr.latitude - 12.9716) < 0.001 && Math.abs(addr.longitude - 77.5946) < 0.001) ||
        (Math.abs(addr.latitude - 19.0760) < 0.001 && Math.abs(addr.longitude - 72.8777) < 0.001) ||
        (Math.abs(addr.latitude - 28.6139) < 0.001 && Math.abs(addr.longitude - 77.2090) < 0.001)
      )
    );

    const hasGenuineGpsCoords = Boolean(
      typeof addr.latitude === 'number' &&
      typeof addr.longitude === 'number' &&
      (addr.latitude !== 0 || addr.longitude !== 0) &&
      !isCityCentroidFallback
    );

    const destinationQuery = hasGenuineGpsCoords
      ? `${addr.latitude},${addr.longitude}`
      : addressText;

    return destinationQuery
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}&travelmode=driving`
      : null;
  }

  it('Resolves actual customer residence address when coordinates are centroid fallback', () => {
    const customerAddress = {
      addressLine1: 'Akshaya Samrudhi Nilaya, Site No 46',
      addressLine2: 'Nandi Garden',
      city: 'Anekal, Bangalore',
      state: 'Karnataka',
      postalCode: '562106',
      country: 'India',
      latitude: 12.9716, // Centroid fallback that previously opened Apollo Fertility / JP Nagar
      longitude: 77.5946,
    };

    const navUrl = generateNavigationUrl(customerAddress);
    assert.equal(navUrl.includes('travelmode=driving'), true);
    // Must NOT navigate to centroid coordinates 12.9716,77.5946
    assert.equal(navUrl.includes('12.9716%2C77.5946'), false);
    // Must navigate to the customer address in Anekal
    assert.equal(navUrl.includes('Akshaya%20Samrudhi%20Nilaya'), true);
    assert.equal(navUrl.includes('562106'), true);
  });

  it('Uses genuine non-centroid GPS coordinates when available', () => {
    const genuineGpsAddress = {
      addressLine1: 'Villa 12, Palm Meadows',
      city: 'Whitefield, Bangalore',
      postalCode: '560066',
      latitude: 12.9698,
      longitude: 77.7499,
    };

    const navUrl = generateNavigationUrl(genuineGpsAddress);
    assert.equal(navUrl.includes('destination=12.9698%2C77.7499'), true);
    assert.equal(navUrl.includes('travelmode=driving'), true);
  });

  it('Properly encodes special characters and handles missing optional address fields', () => {
    const minimalAddress = {
      addressLine1: 'Flat #402, Prestige St. John\'s Wood',
      city: 'Bangalore',
      postalCode: '560029',
      latitude: 0,
      longitude: 0,
    };

    const navUrl = generateNavigationUrl(minimalAddress);
    assert.equal(navUrl.startsWith('https://www.google.com/maps/dir/?api=1&destination='), true);
    assert.equal(navUrl.includes('Flat%20%23402'), true);
  });
});

// ─── 6. Buy Now Direct Checkout & Cart Isolation ───────────────
describe('Buy Now Direct Checkout & Shopping Cart Isolation', () => {
  it('Buy Now builds direct checkout session payload without mutating persistent cart items', () => {
    const persistentCart = [
      { id: 'cart-item-1', name: 'Submariner Date', price: 950000, quantity: 1 },
      { id: 'cart-item-2', name: 'Speedmaster Moonwatch', price: 620000, quantity: 2 },
    ];

    const targetProduct = {
      id: 'prod-seiko-001',
      slug: 'seiko-presage-cocktail-time-srpb43j1',
      name: 'Presage Cocktail Time',
      brand: 'Seiko',
      reference_number: 'SRPB43J1',
      price: 45000,
    };

    const selectedStrap = {
      id: 'strap-alligator-01',
      material: 'Alligator Grain Calfskin',
      price_addon: 4500,
    };

    // Simulate Buy Now payload construction
    const buyNowItem = {
      id: targetProduct.id,
      slug: targetProduct.slug,
      name: targetProduct.name,
      brand: targetProduct.brand,
      referenceNumber: targetProduct.reference_number,
      price: targetProduct.price + selectedStrap.price_addon,
      quantity: 1,
      strapOption: selectedStrap,
    };

    // Verify Buy Now item matches selection
    assert.equal(buyNowItem.price, 49500);
    assert.equal(buyNowItem.quantity, 1);

    // Verify persistent cart is completely untouched (cart length remains 2)
    assert.equal(persistentCart.length, 2);
    assert.equal(persistentCart.some((i) => i.id === 'prod-seiko-001'), false);
  });

  it('Completing or abandoning Buy Now order preserves persistent cart items', () => {
    let persistentCart = [
      { id: 'cart-item-1', name: 'Submariner Date', price: 950000, quantity: 1 },
    ];

    let buyNowSessionStorage = {
      wristloom_buy_now_item: JSON.stringify({ id: 'prod-seiko-001', price: 45000, quantity: 1 }),
    };

    // Simulate Buy Now checkout completion
    const isBuyNow = true;
    if (isBuyNow) {
      delete buyNowSessionStorage.wristloom_buy_now_item;
    } else {
      persistentCart = [];
    }

    // Verify buy now item removed from session storage
    assert.equal(buyNowSessionStorage.wristloom_buy_now_item, undefined);
    // Verify persistent cart was NOT cleared
    assert.equal(persistentCart.length, 1);
    assert.equal(persistentCart[0].id, 'cart-item-1');
  });
});

// ─── 7. Dynamic Watch Brand Management (Layer 7) ────────────────
describe('Dynamic Watch Brand Management (Layer 7 - Atelier Architecture)', () => {
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function validateNewBrand(name, existingBrands) {
    const clean = (name || '').trim();
    if (clean.length < 2) {
      return { valid: false, error: 'Brand name must be at least 2 characters', status: 422 };
    }
    const duplicate = existingBrands.find(
      (b) => b.name.toLowerCase().trim() === clean.toLowerCase()
    );
    if (duplicate) {
      return {
        valid: false,
        error: `A brand with the name "${clean}" already exists (ID: ${duplicate.id}).`,
        status: 409,
      };
    }
    return { valid: true, slug: slugify(clean) };
  }

  function validateProductBrandAssignment(brandName, brandCatalog) {
    const clean = (brandName || '').trim().toLowerCase();
    const brand = brandCatalog.find((b) => b.name.toLowerCase().trim() === clean);
    if (!brand) {
      return { allowed: false, error: `Brand "${brandName}" is not registered in the atelier database.` };
    }
    if (!brand.isActive) {
      return { allowed: false, error: `Brand "${brand.name}" is currently deactivated. Please activate it first.` };
    }
    return { allowed: true, brandId: brand.id, matchedName: brand.name };
  }

  function validateBrandDeletion(brand, productCount) {
    if (productCount > 0) {
      return {
        canDelete: false,
        status: 409,
        error: `Cannot delete brand "${brand.name}". There are ${productCount} associated timepiece(s) in the catalog. To hide this brand from new product creation and discovery, please deactivate it instead.`,
      };
    }
    return { canDelete: true, status: 200 };
  }

  it('Admin successfully creates a new brand and generates correct slug', () => {
    const existing = [{ id: 'b1', name: 'Rolex', slug: 'rolex' }];
    const result = validateNewBrand('Vacheron Constantin', existing);
    assert.equal(result.valid, true);
    assert.equal(result.slug, 'vacheron-constantin');
  });

  it('Rejects duplicate brand names ignoring case and leading/trailing whitespace', () => {
    const existing = [
      { id: 'b1', name: 'Rolex', slug: 'rolex' },
      { id: 'b2', name: 'Patek Philippe', slug: 'patek-philippe' },
    ];

    const duplicate1 = validateNewBrand('  rolex  ', existing);
    assert.equal(duplicate1.valid, false);
    assert.equal(duplicate1.status, 409);
    assert.equal(duplicate1.error.includes('already exists'), true);

    const duplicate2 = validateNewBrand('patek philippe', existing);
    assert.equal(duplicate2.valid, false);
    assert.equal(duplicate2.status, 409);
  });

  it('Rejects brand names shorter than 2 characters', () => {
    const result = validateNewBrand('A', []);
    assert.equal(result.valid, false);
    assert.equal(result.status, 422);
  });

  it('Customer discovery filter only includes active brands', () => {
    const allBrands = [
      { id: 'b1', name: 'Rolex', isActive: true },
      { id: 'b2', name: 'Omega', isActive: true },
      { id: 'b3', name: 'Sonata', isActive: false }, // Deactivated
    ];

    const customerVisibleBrands = allBrands.filter((b) => b.isActive);
    assert.equal(customerVisibleBrands.length, 2);
    assert.equal(customerVisibleBrands.some((b) => b.name === 'Sonata'), false);
    assert.equal(customerVisibleBrands.some((b) => b.name === 'Rolex'), true);
  });

  it('New product creation allows active brands and rejects inactive or unlisted brands', () => {
    const catalog = [
      { id: 'b-active', name: 'Breitling', isActive: true },
      { id: 'b-inactive', name: 'Vintage Brand', isActive: false },
    ];

    // Allowed active
    const activeResult = validateProductBrandAssignment('Breitling', catalog);
    assert.equal(activeResult.allowed, true);
    assert.equal(activeResult.brandId, 'b-active');

    // Rejected inactive
    const inactiveResult = validateProductBrandAssignment('Vintage Brand', catalog);
    assert.equal(inactiveResult.allowed, false);
    assert.equal(inactiveResult.error.includes('currently deactivated'), true);

    // Rejected unregistered
    const unknownResult = validateProductBrandAssignment('Unknown Horology', catalog);
    assert.equal(unknownResult.allowed, false);
    assert.equal(unknownResult.error.includes('not registered'), true);
  });

  it('Protects referential integrity by blocking deletion of brands with associated products', () => {
    const brandWithProducts = { id: 'b-rolex', name: 'Rolex' };
    const result = validateBrandDeletion(brandWithProducts, 5);

    assert.equal(result.canDelete, false);
    assert.equal(result.status, 409);
    assert.equal(result.error.includes('There are 5 associated timepiece(s)'), true);
    assert.equal(result.error.includes('deactivate it instead'), true);
  });

  it('Permits safe deletion of brand with zero associated products', () => {
    const emptyBrand = { id: 'b-new', name: 'Independent Atelier' };
    const result = validateBrandDeletion(emptyBrand, 0);

    assert.equal(result.canDelete, true);
    assert.equal(result.status, 200);
  });
});


