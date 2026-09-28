import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = {
  title: 'Add Timepiece',
  description: 'Acquire and list a new luxury watch into the Wristloom catalog',
};

export default function AddProductPage() {
  return <ProductForm isEditing={false} />;
}
