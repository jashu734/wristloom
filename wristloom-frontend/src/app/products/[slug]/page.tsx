import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/commerce/ProductDetailClient';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import type { Product } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function findProduct(slug: string): Promise<Product | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  // 1. Check PostgreSQL database first (exact case-insensitive match)
  try {
    const dbProduct = await db.product.findFirst({
      where: {
        slug: { equals: normalizedSlug, mode: 'insensitive' },
      },
    });

    if (dbProduct) {
      const purchaseValue = dbProduct.purchaseValue ?? dbProduct.price;
      const primaryImage = dbProduct.imageUrl || (dbProduct.images?.length > 0 ? dbProduct.images[0] : '/watches/placeholder-watch.svg');
      const allImages = dbProduct.images?.length > 0 ? dbProduct.images : [primaryImage];
      const stock = dbProduct.stock ?? dbProduct.stockCount ?? 5;

      return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.modelName || dbProduct.name,
        modelName: dbProduct.modelName || dbProduct.name,
        brand: dbProduct.brand,
        reference_number: dbProduct.referenceNumber || 'N/A',
        referenceNumber: dbProduct.referenceNumber || 'N/A',
        price: purchaseValue,
        purchaseValue: purchaseValue,
        currency: dbProduct.currency || 'INR',
        images: allImages,
        imageUrl: primaryImage,
        description: dbProduct.description,
        craftsmanship_narrative: dbProduct.craftsmanshipNarrative || dbProduct.description,
        movement_type: dbProduct.movementType || 'Automatic',
        movementType: dbProduct.movementType || 'Automatic',
        movement_caliber: dbProduct.movementCaliber || 'In-House Calibre',
        power_reserve: dbProduct.powerReserve || '48 hours',
        case_material: dbProduct.caseMaterial || 'Stainless Steel',
        case_size: dbProduct.caseSize || '40 mm',
        caseSize: dbProduct.caseSize || '40 mm',
        case_thickness: dbProduct.caseThickness || '12 mm',
        caseThickness: dbProduct.caseThickness || '12 mm',
        dial_color: dbProduct.dialColor || 'Black',
        crystal: dbProduct.crystal || 'Sapphire',
        water_resistance: dbProduct.waterResistance || '100m',
        strap_options: [
          { id: 'so-default', material: 'Standard Strap / Bracelet', color: 'Original', price_addon: 0 },
        ],
        condition: dbProduct.condition || 'New',
        in_stock: dbProduct.inStock && stock > 0,
        inStock: dbProduct.inStock && stock > 0,
        stock: stock,
        stockCount: stock,
        collection: dbProduct.collection || '',
        tags: dbProduct.tags || [],
      };
    }
  } catch (err) {
    console.error('Error querying product by slug:', err);
  }

  // 2. Check mock products (exact slug match only)
  const mockMatch = MOCK_PRODUCTS.find(
    (p) => p.slug.toLowerCase() === normalizedSlug
  );
  if (mockMatch) return mockMatch;

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);
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
  const product = await findProduct(slug);
  if (!product) notFound();

  return (
    <SiteWrapper>
      <ProductDetailClient product={product} />
    </SiteWrapper>
  );
}

