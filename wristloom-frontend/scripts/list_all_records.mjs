import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderReference: true,
      userId: true,
      shippingEmail: true,
      shippingName: true,
      totalAmount: true,
      status: true,
      createdAt: true
    }
  });
  console.log('ALL ORDERS (' + orders.length + '):');
  console.log(JSON.stringify(orders, null, 2));

  const bookings = await prisma.repairBooking.findMany({
    select: {
      id: true,
      bookingReference: true,
      customerId: true,
      watchBrand: true,
      watchModel: true,
      serviceType: true,
      status: true,
      createdAt: true
    }
  });
  console.log('\nALL BOOKINGS (' + bookings.length + '):');
  console.log(JSON.stringify(bookings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
