import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book a Repair Service | Wristloom Atelier',
  description: 'Book a certified Wristloom technician for at-home watch repair. Select your service, enter watch details, choose your address and time slot.',
};

export default function RepairServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#14110F] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#B08D57] animate-spin" />
        </div>
      }
    >
      <BookingWizard />
    </Suspense>
  );
}
