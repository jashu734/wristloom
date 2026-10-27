// ============================================================
// Wristloom — Public Brands API Route
// GET: Returns list of active brands with product counts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');

    const where: any = {
      isActive: true,
    };

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const brands = await db.brand.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        websiteUrl: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        brands: brands.map((b) => ({
          ...b,
          productCount: b._count.products,
        })),
        total: brands.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('[Public Brands GET Error]', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to retrieve active brands' },
      { status: 500 }
    );
  }
}
