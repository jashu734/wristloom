import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function checkUserData() {
  const testUserId = 'cmufde2sc00005gf85rrfixp5';
  const testUser = await prisma.user.findUnique({
    where: { id: testUserId },
    include: {
      accounts: true,
      orders: {
        include: { orderItems: true }
      },
      bookingsAsCustomer: true,
      watchVaultItems: true,
      addresses: true,
      creditWallet: true,
    }
  });

  console.log('=== TEST USER FULL DATA ===');
  console.log('User:', {
    id: testUser?.id,
    email: testUser?.email,
    name: testUser?.name,
    role: testUser?.role,
    createdAt: testUser?.createdAt,
  });
  console.log('Accounts:', testUser?.accounts);
  console.log('Orders:', testUser?.orders);
  console.log('Bookings:', testUser?.bookingsAsCustomer);
  console.log('Vault Watches:', testUser?.vaultWatches);
  console.log('Addresses:', testUser?.addresses);
  console.log('Wallet:', testUser?.wallet);
}

checkUserData().catch(console.error).finally(() => prisma.$disconnect());
