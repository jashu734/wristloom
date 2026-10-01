import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== STARTING DATABASE REPAIR FOR ACCOUNT MIX-UP ===');

  const targetEmail = 'saijashwanth0808@gmail.com';
  const targetGoogleAccountId = '101131296228414036968';

  // 1. Ensure User record exists for saijashwanth0808@gmail.com
  let saiUser = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { accounts: true, creditWallet: true }
  });

  const defaultPasswordHash = await bcrypt.hash('Sai@wristloom2026', 12);

  if (!saiUser) {
    console.log(`Creating new User record for: ${targetEmail}...`);
    saiUser = await prisma.user.create({
      data: {
        email: targetEmail,
        name: 'Sai Jashwanth',
        role: 'CUSTOMER',
        passwordHash: defaultPasswordHash,
        creditWallet: {
          create: { balance: 0 }
        }
      },
      include: { accounts: true, creditWallet: true }
    });
    console.log(`✓ Created User ${saiUser.id} (${saiUser.email})`);
  } else {
    console.log(`User already exists: ${saiUser.id} (${saiUser.email})`);
    if (!saiUser.passwordHash) {
      await prisma.user.update({
        where: { id: saiUser.id },
        data: { passwordHash: defaultPasswordHash }
      });
      console.log(`✓ Set default password for ${saiUser.email}`);
    }
  }

  // 2. Ensure testuser@wristloom.com has a known password and no foreign accounts
  const testUserPasswordHash = await bcrypt.hash('Test@wristloom2026', 12);
  const testUser = await prisma.user.update({
    where: { email: 'testuser@wristloom.com' },
    data: {
      passwordHash: testUserPasswordHash,
      name: 'Test User'
    }
  });
  console.log(`✓ Updated testuser@wristloom.com password and name`);

  // 3. Re-link Google Account 101131296228414036968 (saijashwanth0808@gmail.com) to saiUser
  const saiAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: 'google',
        providerAccountId: targetGoogleAccountId
      }
    }
  });

  if (saiAccount) {
    console.log(`Found Google Account for ${targetGoogleAccountId}, currently linked to: ${saiAccount.userId}`);
    if (saiAccount.userId !== saiUser.id) {
      await prisma.account.update({
        where: { id: saiAccount.id },
        data: { userId: saiUser.id }
      });
      console.log(`✓ Re-linked Google Account ${targetGoogleAccountId} to User ${saiUser.id} (${saiUser.email})`);
    } else {
      console.log(`Google Account is already correctly linked to ${saiUser.id}`);
    }
  } else {
    console.log(`No existing account found for ${targetGoogleAccountId}`);
  }

  // 4. Re-link or remove the other mismatched Google Account (jashu73492@gmail.com) from testuser
  const jashuAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: 'google',
        providerAccountId: '111477859591469460624'
      }
    }
  });

  if (jashuAccount) {
    const jashuUser = await prisma.user.findUnique({ where: { email: 'jashu73492@gmail.com' } });
    if (jashuUser) {
      await prisma.account.update({
        where: { id: jashuAccount.id },
        data: { userId: jashuUser.id }
      });
      console.log(`✓ Re-linked Google Account 111477859591469460624 to Technician User ${jashuUser.id} (${jashuUser.email})`);
    } else {
      await prisma.account.delete({ where: { id: jashuAccount.id } });
      console.log(`✓ Removed stale account 111477859591469460624`);
    }
  }

  // 5. Verification
  console.log('\n=== VERIFICATION AFTER REPAIR ===');
  const verifiedSai = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { accounts: true, orders: true, bookingsAsCustomer: true }
  });
  console.log('Sai User:', {
    id: verifiedSai?.id,
    email: verifiedSai?.email,
    name: verifiedSai?.name,
    role: verifiedSai?.role,
    accountsCount: verifiedSai?.accounts.length,
    ordersCount: verifiedSai?.orders.length,
    bookingsCount: verifiedSai?.bookingsAsCustomer.length
  });

  const verifiedTest = await prisma.user.findUnique({
    where: { email: 'testuser@wristloom.com' },
    include: { accounts: true, orders: true, bookingsAsCustomer: true }
  });
  console.log('Test User:', {
    id: verifiedTest?.id,
    email: verifiedTest?.email,
    name: verifiedTest?.name,
    role: verifiedTest?.role,
    accountsCount: verifiedTest?.accounts.length,
    ordersCount: verifiedTest?.orders.length,
    bookingsCount: verifiedTest?.bookingsAsCustomer.length
  });

  console.log('=== DATABASE REPAIR COMPLETED SUCCESSFULLY ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
