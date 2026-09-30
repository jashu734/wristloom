// ============================================================
// Wristloom Frontend — NextAuth.js v5 Configuration
// Manages session cookies, OAuth redirects, JWT strategy
// ============================================================

import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { isAdminEmail, UserRole } from '@/lib/roles';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: UserRole; phone?: string | null } & DefaultSession['user'];
  }
  interface User { role: UserRole; phone?: string | null }
}

function sanitizeAvatar(url?: string | null): string | null {
  if (!url) return null;
  // Strip large data URLs to prevent JWT cookie bloat (>4KB breaks HTTP requests)
  if (url.startsWith('data:') || url.length > 2048) {
    return null;
  }
  return url;
}

function CustomAuthAdapter(prisma: typeof db) {
  const baseAdapter = PrismaAdapter(prisma);
  return {
    ...baseAdapter,
    async createUser(data: any) {
      const emailLower = data.email?.toLowerCase().trim();
      const isDedicatedAdmin = isAdminEmail(emailLower);
      const user = await prisma.user.create({
        data: {
          name: data.name ?? null,
          email: emailLower,
          emailVerified: data.emailVerified ?? null,
          profileImage: sanitizeAvatar(data.image ?? data.profileImage),
          role: isDedicatedAdmin ? 'ADMIN' : 'CUSTOMER',
        },
      });
      // Auto-create wallet for new customer
      try {
        if (!isDedicatedAdmin) {
          await prisma.creditWallet.create({ data: { customerId: user.id, balance: 0 } });
        }
      } catch (e) {
        console.warn('Wallet creation note:', e);
      }
      return { ...user, image: user.profileImage ?? null };
    },
    async updateUser(data: any) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email?.toLowerCase().trim();
      if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
      if (data.image !== undefined) updateData.profileImage = sanitizeAvatar(data.image);
      if (data.profileImage !== undefined) updateData.profileImage = sanitizeAvatar(data.profileImage);
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
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
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
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14-day lifetime
  },
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
        intendedRole: { label: 'Intended Role', type: 'text' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;
        const emailLower = (credentials.email as string).toLowerCase().trim();
        const user = await db.user.findUnique({ where: { email: emailLower } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;

        const isDedicatedAdmin = isAdminEmail(emailLower);
        let actualRole = user.role;
        if (isDedicatedAdmin && actualRole !== 'ADMIN') {
          await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
          actualRole = 'ADMIN';
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: actualRole,
          phone: user.phone,
          image: sanitizeAvatar(user.profileImage),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'CUSTOMER';
        token.phone = (user as any).phone ?? null;
        if (user.image) token.picture = sanitizeAvatar(user.image);
        if (user.name) token.name = user.name;
        if (user.email) token.email = (user.email as string).toLowerCase().trim();
        token.lastDbCheck = Date.now();
      }

      const emailLower = (token.email as string | undefined)?.toLowerCase().trim();
      if (isAdminEmail(emailLower)) {
        token.role = 'ADMIN';
      }

      // Throttle DB refresh to at most once every 60 seconds
      const now = Date.now();
      const lastCheck = typeof token.lastDbCheck === 'number' ? token.lastDbCheck : 0;
      const shouldCheckDb = Boolean(emailLower && (!lastCheck || now - lastCheck > 60000));

      if (shouldCheckDb && emailLower) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: emailLower },
            select: { id: true, name: true, role: true, phone: true, profileImage: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            if (dbUser.name) token.name = dbUser.name;
            token.role = isAdminEmail(emailLower) ? 'ADMIN' : dbUser.role;
            token.phone = dbUser.phone ?? null;
            if (dbUser.profileImage) token.picture = sanitizeAvatar(dbUser.profileImage);
          }
          token.lastDbCheck = now;
        } catch (e) {
          console.error('[auth] Error fetching user role in jwt callback:', e);
        }
      }

      if (!token.role) {
        token.role = isAdminEmail(emailLower) ? 'ADMIN' : 'CUSTOMER';
      }
      if (trigger === 'update' && session) {
        const updateData = session.user ?? session;
        if (updateData.name !== undefined) token.name = updateData.name;
        if (updateData.phone !== undefined) token.phone = updateData.phone;
        if (updateData.image !== undefined) token.picture = sanitizeAvatar(updateData.image);
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = (token.email as string).toLowerCase().trim();
        session.user.role = (isAdminEmail(token.email as string) ? 'ADMIN' : (token.role as UserRole)) ?? 'CUSTOMER';
        session.user.phone = (token.phone as string | null) ?? null;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async signIn({ account }: any) {
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
