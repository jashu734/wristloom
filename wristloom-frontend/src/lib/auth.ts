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
      const user = await prisma.user.create({
        data: {
          name: data.name ?? null,
          email: data.email,
          emailVerified: data.emailVerified ?? null,
          profileImage: data.image ?? data.profileImage ?? null,
          role: 'CUSTOMER',
        },
      });
      // Auto-create wallet for new customer
      try {
        await prisma.creditWallet.create({ data: { customerId: user.id, balance: 0 } });
      } catch (e) {
        console.warn('Wallet creation note:', e);
      }
      return { ...user, image: user.profileImage ?? null };
    },
    async updateUser(data: any) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
      if (data.image !== undefined) updateData.profileImage = data.image;
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
      if (data.phone !== undefined) updateData.phone = data.phone;
      const user = await prisma.user.update({
        where: { id: data.id },
        data: updateData,
      });
      return { ...user, image: user.profileImage ?? null };
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return { ...user, image: user.profileImage ?? null };
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return { ...user, image: user.profileImage ?? null };
    },
    async getUserByAccount(provider_providerAccountId: { provider: string; providerAccountId: string }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      });
      if (!account?.user) return null;
      return { ...account.user, image: account.user.profileImage ?? null };
    },
    async linkAccount(account: any) {
      // Sanitize fields to match exact Prisma Account schema
      const sanitized = {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ? Number(account.expires_at) : null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      };
      return (await prisma.account.create({ data: sanitized })) as any;
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
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          image: user.profileImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'CUSTOMER';
        token.phone = (user as any).phone ?? null;
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }
      if (!token.role || token.role === 'CUSTOMER') {
        if (token.email) {
          try {
            const dbUser = await db.user.findUnique({
              where: { email: token.email },
              select: { id: true, role: true, phone: true, profileImage: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
              if (dbUser.phone) token.phone = dbUser.phone;
              if (dbUser.profileImage && !token.picture) token.picture = dbUser.profileImage;
            }
          } catch (e) {
            console.error('[auth] Error fetching user role in jwt callback:', e);
          }
        }
      }
      if (!token.role) {
        token.role = 'CUSTOMER';
      }
      if (trigger === 'update' && session) {
        const updateData = session.user ?? session;
        if (updateData.name !== undefined) token.name = updateData.name;
        if (updateData.phone !== undefined) token.phone = updateData.phone;
        if (updateData.image !== undefined) token.picture = updateData.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        session.user.role = (token.role as UserRole) ?? 'CUSTOMER';
        session.user.phone = (token.phone as string | null) ?? null;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async signIn({ account }) {
      if (account?.provider === 'google') return true;
      return true;
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
