import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true }
      }
    }
  });
  console.log('ALL ACCOUNTS IN DB:');
  console.log(JSON.stringify(accounts, null, 2));

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  console.log('\nALL USERS IN DB:');
  console.log(JSON.stringify(allUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
