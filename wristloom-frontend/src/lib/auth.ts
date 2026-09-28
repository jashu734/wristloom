// ============================================================
// Wristloom Frontend — NextAuth.js v5 Configuration
// Manages session cookies, OAuth redirects, JWT strategy
// DB access is only for auth (PrismaAdapter) — all other
// business logic lives in the backend (Express, port 4000)
// ============================================================

import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: UserRole; phone?: string | null } & DefaultSession['user'];
  }
  interface User { role: UserRole; phone?: string | null }
}

function CustomAuthAdapter(prisma: typeof db) {
  const baseAdapter = PrismaAdapter(prisma);
  return {
    ...baseAdapter,
    async createUser(data: any) {
      const { image, ...rest } = data;
      const user = await baseAdapter.createUser!({
        ...rest,
        profileImage: image ?? null,
      });
      return { ...user, image: (user as any).profileImage ?? null };
    },
    async updateUser(data: any) {
      const { image, ...rest } = data;
      const updateData: any = { ...rest };
      if (image !== undefined) updateData.profileImage = image;
      const user = await baseAdapter.updateUser!(updateData);
      return { ...user, image: (user as any).profileImage ?? null };
    },
    async getUser(id: string) {
      const user = await baseAdapter.getUser!(id);
      if (!user) return null;
      return { ...user, image: (user as any).profileImage ?? null };
    },
    async getUserByEmail(email: string) {
      const user = await baseAdapter.getUserByEmail!(email);
      if (!user) return null;
      return { ...user, image: (user as any).profileImage ?? null };
    },
    async getUserByAccount(provider_providerAccountId: any) {
      const user = await baseAdapter.getUserByAccount!(provider_providerAccountId);
      if (!user) return null;
      return { ...user, image: (user as any).profileImage ?? null };
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: CustomAuthAdapter(db),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email as string } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, image: user.profileImage };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'CUSTOMER';
        token.phone = user.phone ?? null;
      }
      if (!token.role) {
        token.role = 'CUSTOMER';
      }
      if (trigger === 'update' && session?.user) {
        token.name = session.user.name;
        token.phone = session.user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? 'CUSTOMER';
        session.user.phone = (token.phone as string | null) ?? null;
      }
      return session;
    },
    async signIn({ account }) {
      if (account?.provider === 'google') return true;
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        if (user?.id) {
          await db.creditWallet.create({ data: { customerId: user.id, balance: 0 } });
        }
      } catch (err) {
        console.warn('Could not auto-create wallet for new user:', err);
      }
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHENTICATED');
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) throw new Error('UNAUTHORIZED');
  return session;
}
