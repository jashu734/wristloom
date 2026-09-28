import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { WatchVaultClient } from '@/components/vault/WatchVaultClient';

export const metadata: Metadata = {
  title: 'Watch Vault',
  description: 'Your personal digital collection manager. Track health status, service history, ownership documents, and upcoming maintenance for every watch you own.',
};

export default function WatchVaultPage() {
  return (
    <SiteWrapper>
      <WatchVaultClient />
    </SiteWrapper>
  );
}
