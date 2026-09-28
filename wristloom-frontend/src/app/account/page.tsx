import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { AccountClient } from '@/components/account/AccountClient';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your Wristloom account — collection, service history, credits, bookings, and preferences.',
};

export default function AccountPage() {
  return (
    <SiteWrapper>
      <AccountClient />
    </SiteWrapper>
  );
}
