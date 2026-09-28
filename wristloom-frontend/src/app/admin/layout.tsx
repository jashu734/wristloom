// ============================================================
// Wristloom — Dedicated Admin Layout
// Server-side authentication and role-based authorization guard
// ============================================================

import * as React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const metadata = {
  title: {
    template: '%s | Wristloom Admin',
    default: 'Wristloom Admin Panel',
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Unauthenticated -> Redirect to login
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  // 2. Authenticated but non-admin -> 403 Forbidden Access Denied
  if (session.user.role !== 'ADMIN') {
    const isTech = session.user.role === 'TECHNICIAN';
    const fallbackDashboard = isTech ? '/technician/dashboard' : '/customer/dashboard';
    const roleLabel = isTech ? 'Technician' : 'Customer';

    return (
      <div className="min-h-screen bg-[#14110F] text-[#EDE6D6] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1E1A17] border border-red-900/40 rounded-[2px] p-8 shadow-2xl space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-red-400 block mb-1">
              403 Forbidden
            </span>
            <h1 className="font-display text-2xl text-[#EDE6D6]">Administrator Access Required</h1>
            <p className="text-xs text-[rgba(237,230,214,0.55)] mt-3 leading-relaxed">
              Your account <span className="font-mono text-[#B08D57]">({session.user.email})</span> is registered as a <strong className="text-[#EDE6D6]">{roleLabel}</strong>. Administrative portals and operations are strictly reserved for platform administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={fallbackDashboard}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#B08D57] text-[#14110F] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px] hover:bg-[#c29f68] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>My Dashboard</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-[rgba(176,141,87,0.30)] text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin -> Dedicated luxury shell
  return (
    <AdminLayoutShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </AdminLayoutShell>
  );
}
