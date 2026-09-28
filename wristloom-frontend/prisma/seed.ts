import { db } from '../src/lib/db';

const INITIAL_PRODUCTS = [
  {
    slug: 'rolex-submariner-date-126610ln',
    name: 'Submariner Date',
    brand: 'Rolex',
    referenceNumber: '126610LN',
    price: 1450000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90',
      'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&q=90',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
    ],
    description: 'The reference in professional dive watches. The Submariner Date combines technical performance underwater with the refinement expected of a Rolex timepiece.',
    craftsmanshipNarrative: 'Machined from a single block of Oystersteel with virtually scratchproof ceramic Cerachrom bezel.',
    movementType: 'Automatic',
    movementCaliber: 'Cal. 3235',
    powerReserve: '70 hours',
    caseMaterial: 'Oystersteel (904L)',
    caseSize: '41mm',
    caseThickness: '12.5mm',
    dialColor: 'Black',
    crystal: 'Sapphire with Cyclops lens',
    waterResistance: '300m / 1,000ft',
    condition: 'New',
    year: 2024,
    inStock: true,
    stockCount: 3,
    collection: 'Oyster Professional',
    tags: ['dive', 'professional', 'iconic', 'steel'],
  },
  {
    slug: 'omega-speedmaster-professional-moonwatch',
    name: 'Speedmaster Professional Moonwatch',
    brand: 'Omega',
    referenceNumber: '310.30.42.50.01.002',
    price: 820000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=90',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=90',
    ],
    description: 'The legendary Moonwatch. Certified by NASA for all manned space missions.',
    craftsmanshipNarrative: 'Features the Co-Axial Master Chronometer Calibre 3861 with silicon balance spring.',
    movementType: 'Manual',
    movementCaliber: 'Cal. 3861',
    powerReserve: '50 hours',
    caseMaterial: 'Stainless Steel',
    caseSize: '42mm',
    caseThickness: '13.2mm',
    dialColor: 'Step Black',
    crystal: 'Sapphire Crystal',
    waterResistance: '50m',
    condition: 'New',
    year: 2024,
    inStock: true,
    stockCount: 5,
    collection: 'Speedmaster',
    tags: ['chronograph', 'space', 'heritage'],
  },
  {
    slug: 'patek-philippe-aquanaut-5167a',
    name: 'Aquanaut Extra Flat',
    brand: 'Patek Philippe',
    referenceNumber: '5167A-001',
    price: 3850000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=90',
    ],
    description: 'Modern, sporty, and exceptionally refined. The rounded octagonal case inspired by the Nautilus.',
    craftsmanshipNarrative: 'Hand-finished Caliber 26-330 S C with 21K gold central rotor and Patek Philippe Seal.',
    movementType: 'Automatic',
    movementCaliber: 'Cal. 26-330 S C',
    powerReserve: '45 hours',
    caseMaterial: 'Stainless Steel',
    caseSize: '40.8mm',
    caseThickness: '8.1mm',
    dialColor: 'Embossed Black',
    crystal: 'Sapphire',
    waterResistance: '120m',
    condition: 'Certified Pre-Owned',
    year: 2023,
    inStock: true,
    stockCount: 1,
    collection: 'Aquanaut',
    tags: ['haute-horlogerie', 'sport', 'steel'],
  },
  {
    slug: 'audemars-piguet-royal-oak-15500st',
    name: 'Royal Oak Selfwinding',
    brand: 'Audemars Piguet',
    referenceNumber: '15500ST.OO.1220ST.01',
    price: 4200000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=90',
    ],
    description: 'The icon of modern watch design. Gérald Genta design with "Grande Tapisserie" dial pattern.',
    craftsmanshipNarrative: 'Case and integrated bracelet hand-satin-brushed with polished bevels.',
    movementType: 'Automatic',
    movementCaliber: 'Calibre 4302',
    powerReserve: '70 hours',
    caseMaterial: 'Stainless Steel',
    caseSize: '41mm',
    caseThickness: '10.4mm',
    dialColor: 'Blue Tapisserie',
    crystal: 'Glareproofed Sapphire',
    waterResistance: '50m',
    condition: 'New',
    year: 2024,
    inStock: true,
    stockCount: 2,
    collection: 'Royal Oak',
    tags: ['integrated-bracelet', 'iconic', 'luxury'],
  },
  {
    slug: 'cartier-santos-de-cartier-wssa0018',
    name: 'Santos de Cartier Large',
    brand: 'Cartier',
    referenceNumber: 'WSSA0018',
    price: 760000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=90',
    ],
    description: 'The world\'s first purpose-designed men\'s wristwatch, created in 1904 for aviator Alberto Santos-Dumont.',
    craftsmanshipNarrative: 'QuickSwitch interchangeable strap system and SmartLink bracelet adjustment system.',
    movementType: 'Automatic',
    movementCaliber: 'Calibre 1847 MC',
    powerReserve: '42 hours',
    caseMaterial: 'Steel with 7-sided crown set with synthetic faceted blue spinel',
    caseSize: '39.8mm',
    caseThickness: '9.38mm',
    dialColor: 'Silvered Opaline',
    crystal: 'Sapphire',
    waterResistance: '100m',
    condition: 'New',
    year: 2024,
    inStock: true,
    stockCount: 4,
    collection: 'Santos',
    tags: ['aviator', 'classic', 'art-deco'],
  },
  {
    slug: 'iwc-portugieser-chronograph-iw371605',
    name: 'Portugieser Chronograph',
    brand: 'IWC Schaffhausen',
    referenceNumber: 'IW371605',
    price: 790000,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=90',
    ],
    description: 'One of IWC\'s most iconic models. Clean, open dial with two recessed totalizers and characteristic feuille hands.',
    craftsmanshipNarrative: 'IWC-manufactured 69355 calibre visible through the sapphire glass back.',
    movementType: 'Automatic',
    movementCaliber: 'Calibre 69355',
    powerReserve: '46 hours',
    caseMaterial: 'Stainless Steel',
    caseSize: '41mm',
    caseThickness: '13.1mm',
    dialColor: 'Silver-Plated with Blue Accents',
    crystal: 'Sapphire, convex, antireflective',
    waterResistance: '30m',
    condition: 'New',
    year: 2024,
    inStock: true,
    stockCount: 3,
    collection: 'Portugieser',
    tags: ['chronograph', 'dress', 'classic'],
  },
];

import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial products into Supabase PostgreSQL...');
  for (const prod of INITIAL_PRODUCTS) {
    await db.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
    console.log(`✓ Seeded ${prod.name}`);
  }
  const count = await db.product.count();
  console.log(`✓ Total products in database: ${count}`);

  console.log('Seeding dedicated Admin and Technician accounts...');
  
  // 1. Dedicated Admin: wristloom@gmail.com
  const adminPasswordHash = await bcrypt.hash('Admin@wristloom2026', 12);
  const adminUser = await db.user.upsert({
    where: { email: 'wristloom@gmail.com' },
    update: {
      role: 'ADMIN',
      name: 'Wristloom Administrator',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'wristloom@gmail.com',
      name: 'Wristloom Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98765 00001',
    },
  });
  console.log(`✓ Seeded dedicated Admin: ${adminUser.email} (Role: ${adminUser.role})`);

  // 2. Certified Master Horologist: technician@wristloom.com
  const techPasswordHash = await bcrypt.hash('Tech@wristloom2026', 12);
  const techUser = await db.user.upsert({
    where: { email: 'technician@wristloom.com' },
    update: {
      role: 'TECHNICIAN',
      name: 'Arjun Mehta',
      passwordHash: techPasswordHash,
    },
    create: {
      email: 'technician@wristloom.com',
      name: 'Arjun Mehta',
      passwordHash: techPasswordHash,
      role: 'TECHNICIAN',
      phone: '+91 98765 00002',
    },
  });

  await db.technician.upsert({
    where: { userId: techUser.id },
    update: {
      isAvailable: true,
      isVerified: true,
      rating: 4.95,
      yearsExperience: 12,
    },
    create: {
      userId: techUser.id,
      bio: 'Swiss Horological Academy graduate specializing in high-complication overhauls.',
      yearsExperience: 12,
      specializations: ['Rolex Certified', 'Patek Philippe Complications', 'Tourbillon Regulation'],
      brandsServiced: ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega'],
      rating: 4.95,
      completedServices: 184,
      isVerified: true,
      isAvailable: true,
      currentLatitude: 18.9667,
      currentLongitude: 72.8081,
    },
  });
  console.log(`✓ Seeded Master Horologist: ${techUser.email} (Role: ${techUser.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
