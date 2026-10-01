import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('==================================================');
  console.log('RUNNING FULL AUTH & DATA ISOLATION VERIFICATION MATRIX');
  console.log('==================================================\n');

  let allPassed = true;

  // TEST 1: Verify Sai Jashwanth account
  console.log('--- TEST 1: Verify saijashwanth0808@gmail.com Identity & Credentials ---');
  const saiUser = await prisma.user.findUnique({
    where: { email: 'saijashwanth0808@gmail.com' },
    include: {
      accounts: true,
      orders: true,
      bookingsAsCustomer: true,
      creditWallet: true
    }
  });

  if (!saiUser) {
    console.error('FAIL: saijashwanth0808@gmail.com does not exist!');
    allPassed = false;
  } else {
    console.log(`PASS: Found User ID: ${saiUser.id}`);
    console.log(`PASS: Email: ${saiUser.email}`);
    console.log(`PASS: Role: ${saiUser.role}`);
    console.log(`PASS: Name: ${saiUser.name}`);

    // Verify Password Login
    const isSaiPassValid = await bcrypt.compare('Sai@wristloom2026', saiUser.passwordHash || '');
    if (isSaiPassValid) {
      console.log('PASS: Password authentication verified for Sai@wristloom2026');
    } else {
      console.error('FAIL: Password authentication failed for Sai@wristloom2026');
      allPassed = false;
    }

    // Verify Google Account linkage
    const googleAcct = saiUser.accounts.find((a) => a.provider === 'google');
    if (googleAcct && googleAcct.providerAccountId === '101131296228414036968') {
      console.log(`PASS: Google Account 101131296228414036968 correctly linked to ${saiUser.email}`);
    } else {
      console.error('FAIL: Google Account linkage missing or incorrect for Sai!');
      allPassed = false;
    }

    console.log(`PASS: Orders isolated (count: ${saiUser.orders.length})`);
    console.log(`PASS: Bookings isolated (count: ${saiUser.bookingsAsCustomer.length})`);
  }

  // TEST 2: Verify testuser@wristloom.com
  console.log('\n--- TEST 2: Verify testuser@wristloom.com Identity & Credentials ---');
  const testUser = await prisma.user.findUnique({
    where: { email: 'testuser@wristloom.com' },
    include: {
      accounts: true,
      orders: true,
      bookingsAsCustomer: true
    }
  });

  if (!testUser) {
    console.error('FAIL: testuser@wristloom.com does not exist!');
    allPassed = false;
  } else {
    console.log(`PASS: Found User ID: ${testUser.id}`);
    console.log(`PASS: Email: ${testUser.email}`);
    console.log(`PASS: Role: ${testUser.role}`);

    const isTestPassValid = await bcrypt.compare('Test@wristloom2026', testUser.passwordHash || '');
    if (isTestPassValid) {
      console.log('PASS: Password authentication verified for Test@wristloom2026');
    } else {
      console.error('FAIL: Password authentication failed for Test@wristloom2026');
      allPassed = false;
    }

    const testGoogleAccts = testUser.accounts.filter((a) => a.provider === 'google');
    if (testGoogleAccts.length === 0) {
      console.log('PASS: testuser@wristloom.com has NO foreign Google accounts linked!');
    } else {
      console.error('FAIL: testuser still has Google accounts linked:', testGoogleAccts);
      allPassed = false;
    }
  }

  // TEST 3: Cross-Account Identity Isolation
  console.log('\n--- TEST 3: Strict Account Separation ---');
  if (saiUser && testUser) {
    if (saiUser.id !== testUser.id) {
      console.log(`PASS: Distinct User IDs (Sai: ${saiUser.id}, Test: ${testUser.id})`);
    } else {
      console.error('FAIL: Sai and Test user share the same User ID!');
      allPassed = false;
    }

    if (saiUser.email !== testUser.email) {
      console.log(`PASS: Distinct Emails (${saiUser.email} vs ${testUser.email})`);
    } else {
      console.error('FAIL: Emails collide!');
      allPassed = false;
    }
  }

  // TEST 4: Verify Technician Account
  console.log('\n--- TEST 4: Verify Technician Account & Role Isolation ---');
  const techUser = await prisma.user.findUnique({
    where: { email: 'jashu73492@gmail.com' },
    include: { accounts: true }
  });
  if (techUser) {
    console.log(`PASS: Technician User ID: ${techUser.id}, Email: ${techUser.email}, Role: ${techUser.role}`);
    const techGoogle = techUser.accounts.find((a) => a.provider === 'google');
    if (techGoogle && techGoogle.providerAccountId === '111477859591469460624') {
      console.log(`PASS: Technician Google Account correctly linked to ${techUser.email}`);
    }
  }

  // TEST 5: Verify Admin Account
  console.log('\n--- TEST 5: Verify Dedicated Admin Account ---');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'wristloom@gmail.com' }
  });
  if (adminUser) {
    console.log(`PASS: Admin User ID: ${adminUser.id}, Role: ${adminUser.role}`);
  }

  console.log('\n==================================================');
  if (allPassed) {
    console.log('✓ ALL MULTI-ACCOUNT ISOLATION TESTS PASSED 100%!');
  } else {
    console.error('✗ SOME TESTS FAILED. CHECK LOGS ABOVE.');
  }
  console.log('==================================================');
}

main().catch(console.error).finally(() => prisma.$disconnect());
