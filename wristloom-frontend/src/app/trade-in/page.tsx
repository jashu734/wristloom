import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { TradeInClient } from '@/components/services/TradeInClient';

export const metadata: Metadata = {
  title: 'Trade-In Program',
  description: 'Submit your watch for trade-in valuation and receive Wristloom platform credit redeemable toward purchases, repairs, workshops, or restorations.',
};

export default function TradeInPage() {
  return (
    <SiteWrapper>
      <TradeInClient />
    </SiteWrapper>
  );
}
