import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function checkUser() {
  const targetEmail = 'saijashwanth0808@gmail.com';
  const u = await prisma.user.findFirst({
    where: {
      email: { equals: targetEmail, mode: 'insensitive' }
    },
    include: {
      accounts: true,
      orders: true,
      bookingsAsCustomer: true,
    }
  });

  console.log(`=== CHECKING USER: ${targetEmail} ===`);
  if (!u) {
    console.log('USER DOES NOT EXIST IN DATABASE!');
  } else {
    console.log('ID:', u.id);
    console.log('Email:', u.email);
    console.log('Name:', u.name);
    console.log('Role:', u.role);
    console.log('Accounts:', u.accounts);
    console.log('Orders count:', u.orders.length);
    console.log('Bookings count:', u.bookingsAsCustomer.length);
  }

  // Also check all users with "sai" in email
  const allSai = await prisma.user.findMany({
    where: { email: { contains: 'sai', mode: 'insensitive' } },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('\nAll users with "sai":', allSai);

  // Check testuser
  const testUser = await prisma.user.findFirst({
    where: { email: { contains: 'testuser', mode: 'insensitive' } },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('\nTestuser record:', testUser);
}

checkUser().catch(console.error).finally(() => prisma.$disconnect());
