import type { Metadata } from 'next';
import { TechnicianAddForm } from '@/components/admin/TechnicianAddForm';

export const metadata: Metadata = {
  title: 'Onboard Master Horologist',
  description: 'Create technician credentials and provision atelier service bay access',
};

export default function AddTechnicianPage() {
  return <TechnicianAddForm />;
}
