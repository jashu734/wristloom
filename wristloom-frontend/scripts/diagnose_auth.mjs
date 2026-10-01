import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
        }
      }
    }
  });

  console.log('=== USERS AND ACCOUNTS IN DB ===');
  for (const u of users) {
    console.log(`User: ${u.email} (${u.role}) ID: ${u.id} HasPassword: ${Boolean(u.passwordHash)} Accounts:`, u.accounts);
  }

  const bcrypt = (await import('bcryptjs')).default;
  const tu = await prisma.user.findUnique({ where: { email: 'testuser@wristloom.com' } });
  const candidates = ['Test@123', 'testuser123', 'Password@123', 'Admin@wristloom2026', 'Customer@wristloom2026', 'Wristloom@2026', '12345678', 'wristloom123', 'Testuser@123', 'testuser@123', 'test@wristloom.com', 'testuser', 'password'];
  for (const c of candidates) {
    if (await bcrypt.compare(c, tu.passwordHash)) {
      console.log('TESTUSER PASSWORD MATCH:', c);
      break;
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
