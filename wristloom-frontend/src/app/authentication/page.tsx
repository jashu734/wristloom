import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { AuthenticationClient } from '@/components/services/AuthenticationClient';

export const metadata: Metadata = {
  title: 'Authentication Center',
  description: 'Submit your pre-owned or vintage timepiece for multi-stage professional authentication by Wristloom\'s certified horologists.',
};

export default function AuthenticationPage() {
  return (
    <SiteWrapper>
      <AuthenticationClient />
    </SiteWrapper>
  );
}
