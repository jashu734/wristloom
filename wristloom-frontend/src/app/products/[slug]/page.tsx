import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/commerce/ProductDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.brand} ${product.name} — ${product.reference_number}`,
    description: product.description,
  };
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <SiteWrapper>
      <ProductDetailClient product={product} />
    </SiteWrapper>
  );
}
