import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString }, { schema: 'public' });
const prisma = new PrismaClient({ adapter });

const INITIAL_BRANDS = [
  { name: 'Rolex', description: 'Legendary Swiss manufacture known for the Submariner, Daytona, and Oyster Perpetual.', websiteUrl: 'https://www.rolex.com' },
  { name: 'Patek Philippe', description: 'Geneva-based family-owned horological summit, celebrated for the Nautilus, Calatrava, and Grand Complications.', websiteUrl: 'https://www.patek.com' },
  { name: 'Audemars Piguet', description: 'Le Brassus master atelier renowned for the iconic Royal Oak and avant-garde complications.', websiteUrl: 'https://www.audemarspiguet.com' },
  { name: 'Omega', description: 'Pioneering Swiss watchmaker distinguished by Co-Axial escapements, Speedmaster Moonwatch, and Seamaster.', websiteUrl: 'https://www.omegawatches.com' },
  { name: 'Cartier', description: 'The jeweler of kings and king of jewelers, famed for the Santos, Tank, and Ballon Bleu.', websiteUrl: 'https://www.cartier.com' },
  { name: 'IWC Schaffhausen', description: 'Precision Swiss engineering from eastern Switzerland, celebrated for the Portugieser and Pilot’s Watches.', websiteUrl: 'https://www.iwc.com' },
  { name: 'TAG Heuer', description: 'Avant-garde Swiss chronograph pioneer inextricably linked with motorsport timing, Monaco, and Carrera.', websiteUrl: 'https://www.tagheuer.com' },
  { name: 'Tissot', description: 'Innovators by tradition since 1853, delivering high-precision Swiss mechanical and quartz horology.', websiteUrl: 'https://www.tissotwatches.com' },
  { name: 'Rado', description: 'Master of materials celebrated for high-tech ceramic case architectures and minimalist silhouettes.', websiteUrl: 'https://www.rado.com' },
  { name: 'Seiko', description: 'Japanese horological virtuosity encompassing Spring Drive, Mechanical 9S, and Presage artisanal guilloché dials.', websiteUrl: 'https://www.seikowatches.com' },
  { name: 'Citizen', description: 'Pioneers in light-powered Eco-Drive technology, Super Titanium metallurgy, and high-accuracy quartz.', websiteUrl: 'https://www.citizenwatch.com' },
  { name: 'Titan', description: 'India’s premier horological atelier, celebrated for the ultra-thin Titan Edge and handcrafted regalia.', websiteUrl: 'https://www.titan.co.in' },
  { name: 'Fastrack', description: 'Dynamic youth-oriented lifestyle timepieces and smart wearables crafted for everyday resilience.', websiteUrl: 'https://www.fastrack.in' },
  { name: 'Sonata', description: 'Dependable, accessible Indian timepieces renowned for everyday elegance and enduring reliability.', websiteUrl: 'https://www.sonatawatches.in' },
  { name: 'Timex', description: 'Historic American watchmaker known for the Waterbury heritage, Marlin mechanicals, and Indiglo illumination.', websiteUrl: 'https://www.timex.com' },
  { name: 'Casio', description: 'Japanese digital and analog innovators, home to the indestructible G-Shock and Edifice chronographs.', websiteUrl: 'https://www.casio.com' },
  { name: 'Fossil', description: 'American vintage-inspired authentic timepieces blending classic style with contemporary utility.', websiteUrl: 'https://www.fossil.com' },
];

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('--- Starting Brand Migration ---');

  for (const b of INITIAL_BRANDS) {
    const slug = slugify(b.name);
    await prisma.brand.upsert({
      where: { name: b.name },
      update: {
        description: b.description,
        websiteUrl: b.websiteUrl,
        slug,
      },
      create: {
        name: b.name,
        slug,
        description: b.description,
        websiteUrl: b.websiteUrl,
        isActive: true,
      },
    });
    console.log(`Upserted brand: ${b.name} (${slug})`);
  }

  // Now link existing products to brand records
  const allBrands = await prisma.brand.findMany();
  const brandMap = new Map();
  allBrands.forEach((b) => {
    brandMap.set(b.name.toLowerCase().trim(), b.id);
  });

  const products = await prisma.product.findMany();
  console.log(`Linking ${products.length} existing products to Brand records...`);

  let linkedCount = 0;
  for (const p of products) {
    const cleanBrand = (p.brand || '').toLowerCase().trim();
    let targetBrandId = brandMap.get(cleanBrand);

    // If brand not in our predefined list, create it dynamically
    if (!targetBrandId && p.brand) {
      const newSlug = slugify(p.brand);
      const created = await prisma.brand.upsert({
        where: { name: p.brand },
        update: {},
        create: {
          name: p.brand,
          slug: newSlug,
          isActive: true,
        },
      });
      targetBrandId = created.id;
      brandMap.set(cleanBrand, created.id);
      console.log(`Auto-created brand from existing product: ${p.brand}`);
    }

    if (targetBrandId && p.brandId !== targetBrandId) {
      await prisma.product.update({
        where: { id: p.id },
        data: { brandId: targetBrandId },
      });
      linkedCount++;
    }
  }

  console.log(`Successfully updated ${linkedCount} products with brand relationships.`);

  // Validation
  const brandStats = await prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log('--- Brand Summary ---');
  brandStats.forEach((b) => {
    console.log(`• ${b.name} (${b.slug}): ${b._count.products} products [active: ${b.isActive}]`);
  });
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
