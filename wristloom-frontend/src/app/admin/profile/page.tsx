import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ShieldCheck, Mail, User, Clock, KeyRound, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Administrator Profile',
  description: 'Verified administrative credentials and security posture for Wristloom',
};

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const session = await auth();

  const user = await db.user.findUnique({
    where: { email: 'wristloom@gmail.com' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
          Identity & Security
        </span>
        <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Administrator Credentials</h1>
      </div>

      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-[rgba(176,141,87,0.10)]">
          <div className="w-16 h-16 rounded-full bg-[#B08D57] text-[#14110F] flex items-center justify-center font-bold text-2xl flex-shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl text-[#EDE6D6]">{user?.name || 'Wristloom Admin'}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[1px] bg-[rgba(176,141,87,0.15)] text-[#B08D57] border border-[rgba(176,141,87,0.30)] text-[10px] font-mono uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Primary Admin</span>
              </span>
            </div>
            <p className="font-mono text-xs text-[rgba(237,230,214,0.60)] mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#B08D57]" />
              <span>Dedicated Admin Email</span>
            </span>
            <p className="font-mono text-xs text-[#EDE6D6]">wristloom@gmail.com</p>
            <p className="text-[10px] text-[rgba(237,230,214,0.35)] pt-1">
              Guaranteed administrator authority enforced by PostgreSQL database
            </p>
          </div>

          <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-[#B08D57]" />
              <span>Security & RBAC Layer</span>
            </span>
            <p className="font-mono text-xs text-emerald-400">Strict Database Authority (ADMIN)</p>
            <p className="text-[10px] text-[rgba(237,230,214,0.35)] pt-1">
              Public registration blocked; direct API and route enforcement active
            </p>
          </div>

          <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] flex items-center gap-1.5">
              <Server className="w-3 h-3 text-[#B08D57]" />
              <span>Database System Identifier</span>
            </span>
            <p className="font-mono text-[11px] text-[rgba(237,230,214,0.70)] truncate">{user?.id}</p>
          </div>

          <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px] space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#B08D57]" />
              <span>Provisioning Timestamp</span>
            </span>
            <p className="font-mono text-xs text-[rgba(237,230,214,0.70)]">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
