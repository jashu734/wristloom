import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TechnicianDashboard } from '@/components/technician/TechnicianDashboard';

export const metadata: Metadata = {
  title: 'Technician Dashboard',
  description: 'Wristloom certified technician portal — view bookings, manage status, and navigate to customers.',
};

export default async function TechnicianPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/technician');
  if (session.user.role !== 'TECHNICIAN' && session.user.role !== 'ADMIN') {
    redirect('/account');
  }
  return <TechnicianDashboard userId={session.user.id} userName={session.user.name ?? 'Technician'} />;
}
