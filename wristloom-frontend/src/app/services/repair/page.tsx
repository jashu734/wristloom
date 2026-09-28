import type { Metadata } from 'next';
import { BookingWizard } from '@/components/booking/BookingWizard';

export const metadata: Metadata = {
  title: 'Book a Repair Service',
  description: 'Book a certified Wristloom technician for at-home watch repair. Select your service, enter watch details, choose your address and time slot.',
};

export default function RepairServicesPage() {
  return <BookingWizard />;
}
