import type { Metadata } from 'next';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const metadata: Metadata = {
  title: 'Platform Settings',
  description: 'Manage operational parameters, atelier radius, and inventory thresholds',
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
