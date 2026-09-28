import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginRedirectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;
  if (role === 'ADMIN') {
    redirect('/admin/dashboard');
  }
  if (role === 'TECHNICIAN') {
    redirect('/technician/dashboard');
  }
  redirect('/customer/dashboard');
}
