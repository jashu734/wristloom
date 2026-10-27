import { Suspense } from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { CheckoutClient } from '@/components/commerce/CheckoutClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Direct Atelier Acquisition | Wristloom',
  description: 'Secure acquisition and insured transit for fine luxury timepieces.',
};

export default function CheckoutPage() {
  return (
    <SiteWrapper>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#14110F] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#B08D57] animate-spin" />
          </div>
        }
      >
        <CheckoutClient />
      </Suspense>
    </SiteWrapper>
  );
}
