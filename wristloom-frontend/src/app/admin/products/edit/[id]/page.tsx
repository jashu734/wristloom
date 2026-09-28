import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Timepiece',
  description: 'Update timepiece specifications, inventory, and valuation',
};

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEditing={true} />;
}
