import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { AccountSettingsClient } from '@/components/account/AccountSettingsClient';

export const metadata: Metadata = {
  title: 'Account Settings — Wristloom',
  description: 'Manage your Wristloom profile, notifications, security settings, and preferences.',
};

export default function AccountSettingsPage() {
  return (
    <SiteWrapper>
      <AccountSettingsClient />
    </SiteWrapper>
  );
}
