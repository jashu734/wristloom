import { redirect } from 'next/navigation';

// warranty-policy redirects to /warranty for clean URLs
export default function WarrantyPolicyPage() {
  redirect('/warranty');
}
