// ============================================================
// Wristloom — Authoritative Service Catalog & Pricing
// Single source of truth for repair, authentication & restoration
// ============================================================

export interface BookableService {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  depositPercentage: number;
  estimatedDuration: string;
  description: string;
}

export const BOOKABLE_SERVICES: BookableService[] = [
  {
    id: 'battery-replacement',
    name: 'Battery Replacement',
    slug: 'battery-replacement',
    basePrice: 1500,
    depositPercentage: 0.3,
    estimatedDuration: '1 day',
    description: 'Genuine Swiss/Japanese power cell installation with gasket inspection and pressure testing.',
  },
  {
    id: 'strap-repair',
    name: 'Strap / Bracelet Repair',
    slug: 'strap-repair',
    basePrice: 3500,
    depositPercentage: 0.3,
    estimatedDuration: '2–3 days',
    description: 'Precision link sizing, clasp refurbishment, ultrasonic cleaning, and bespoke leather fitting.',
  },
  {
    id: 'movement-service',
    name: 'Movement Servicing & Overhaul',
    slug: 'movement-service',
    basePrice: 18000,
    depositPercentage: 0.3,
    estimatedDuration: '14–21 days',
    description: 'Complete caliber disassembly, ultrasonic bath, epilame coating, synthetic oiling, and timing regulation.',
  },
  {
    id: 'watch-cleaning',
    name: 'Atelier Exterior Spa',
    slug: 'watch-cleaning',
    basePrice: 4500,
    depositPercentage: 0.3,
    estimatedDuration: '1–2 days',
    description: 'Ultrasonic case and bracelet decontamination, crystal buffing, and hygienic treatment.',
  },
  {
    id: 'water-resistance',
    name: 'Water Resistance Re-Sealing',
    slug: 'water-resistance',
    basePrice: 2500,
    depositPercentage: 0.3,
    estimatedDuration: '2–4 days',
    description: 'Crown, pusher, and caseback gasket replacement with multi-bar dry and wet vacuum testing.',
  },
  {
    id: 'glass-replacement',
    name: 'Crystal Replacement',
    slug: 'glass-replacement',
    basePrice: 6500,
    depositPercentage: 0.3,
    estimatedDuration: '3–5 days',
    description: 'OEM-spec synthetic sapphire or mineral crystal replacement with high-pressure bezel seal.',
  },
  {
    id: 'full-restoration',
    name: 'Full Horological Restoration',
    slug: 'full-restoration',
    basePrice: 45000,
    depositPercentage: 0.3,
    estimatedDuration: '30–45 days',
    description: 'Archival heritage restoration: laser welding, case geometry recovery, dial conservation, and movement overhaul.',
  },
];

const SERVICE_ALIASES: Record<string, string> = {
  regular_service: 'movement-service',
  'regular-service': 'movement-service',
  'regular service': 'movement-service',
  repair: 'movement-service',
  overhaul: 'movement-service',
  battery: 'battery-replacement',
  'battery replacement': 'battery-replacement',
  strap: 'strap-repair',
  'strap repair': 'strap-repair',
  cleaning: 'watch-cleaning',
  spa: 'watch-cleaning',
  water: 'water-resistance',
  'water-resistance': 'water-resistance',
  glass: 'glass-replacement',
  crystal: 'glass-replacement',
  restoration: 'full-restoration',
};

export function findServiceByNameOrId(nameOrId: string): BookableService | undefined {
  if (!nameOrId) return undefined;
  const normalized = nameOrId.trim().toLowerCase();
  const resolvedId = SERVICE_ALIASES[normalized] || normalized;

  return (
    BOOKABLE_SERVICES.find(
      (s) =>
        s.id.toLowerCase() === resolvedId ||
        s.name.toLowerCase() === resolvedId ||
        s.slug.toLowerCase() === resolvedId ||
        s.id.toLowerCase() === normalized ||
        s.name.toLowerCase() === normalized ||
        s.slug.toLowerCase() === normalized
    ) ||
    BOOKABLE_SERVICES.find(
      (s) =>
        s.name.toLowerCase().includes(normalized) ||
        normalized.includes(s.id.toLowerCase())
    )
  );
}

export function calculateServicePrice(nameOrId: string): { basePrice: number; depositAmount: number; serviceName: string } {
  const service = findServiceByNameOrId(nameOrId);
  if (!service) {
    throw new Error(`Unknown service: "${nameOrId}". Please choose a valid service from the catalog.`);
  }

  const depositAmount = Math.round(service.basePrice * service.depositPercentage);
  return {
    basePrice: service.basePrice,
    depositAmount,
    serviceName: service.name,
  };
}
