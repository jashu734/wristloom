// ============================================================
// Wristloom — App Constants
// ============================================================

// ─── Navigation ──────────────────────────────────────────────

export const PRIMARY_NAV = [
  { label: 'Shop', href: '/shop' },
  { label: 'Services', href: '/authentication' },
  { label: 'Vault', href: '/watch-vault' },
  { label: 'Community', href: '/community' },
] as const;

export const FOOTER_NAV = {
  SHOP: [
    { label: 'Explore Watches', href: '/shop' },
    { label: 'Brands', href: '/shop?filter=brands' },
    { label: 'Collections', href: '/shop?filter=collections' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
  ],
  SERVICES: [
    { label: 'Repair Services', href: '/services/repair' },
    { label: 'Authentication', href: '/authentication' },
    { label: 'Trade-In Program', href: '/trade-in' },
    { label: 'Watch Vault', href: '/watch-vault' },
    { label: 'Workshops', href: '/workshops' },
  ],
  ATELIER: [
    { label: 'Care Guides', href: '/care-guides' },
    { label: 'Watch Care', href: '/watch-care' },
    { label: 'Restoration Gallery', href: '/restoration-gallery' },
    { label: 'Investment Insights', href: '/investment-insights' },
  ],
  HOUSE: [
    { label: 'Technicians', href: '/technicians' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Collector Community', href: '/community' },
    { label: 'Service Locations', href: '/locations' },
  ],
  SUPPORT: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Service Warranty', href: '/warranty' },
  ],
  LEGAL: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
} as const;

// ─── Brand List ──────────────────────────────────────────────

export const WATCH_BRANDS = [
  'Rolex',
  'Patek Philippe',
  'Audemars Piguet',
  'A. Lange & Söhne',
  'Vacheron Constantin',
  'IWC Schaffhausen',
  'Jaeger-LeCoultre',
  'Breguet',
  'Blancpain',
  'Omega',
  'Cartier',
  'Richard Mille',
  'Hublot',
  'TAG Heuer',
  'Panerai',
  'Breitling',
  'Chopard',
  'Zenith',
  'Grand Seiko',
  'Tudor',
] as const;

// ─── Service Types ───────────────────────────────────────────

export const REPAIR_SERVICE_TYPES = [
  { id: 'full_service', label: 'Full Service & Overhaul', description: 'Complete movement disassembly, cleaning, and reassembly', base_price: 18000, duration: '14–21 days' },
  { id: 'crystal_replacement', label: 'Crystal Replacement', description: 'Sapphire or mineral crystal replacement', base_price: 4500, duration: '3–5 days' },
  { id: 'bracelet_service', label: 'Bracelet & Clasp Service', description: 'Link tightening, polishing, and clasp repair', base_price: 2800, duration: '2–3 days' },
  { id: 'water_resistance', label: 'Water Resistance Testing & Sealing', description: 'Gasket replacement and pressure testing', base_price: 3500, duration: '2–4 days' },
  { id: 'battery_replacement', label: 'Battery Replacement', description: 'Quartz battery replacement and pressure testing', base_price: 1200, duration: '1 day' },
  { id: 'strap_replacement', label: 'Strap Replacement', description: 'Leather, rubber, or metal bracelet replacement', base_price: 1500, duration: '1–2 days' },
  { id: 'regulation', label: 'Regulation & Timing', description: 'Movement regulation and accuracy adjustment', base_price: 5500, duration: '5–7 days' },
  { id: 'restoration', label: 'Full Restoration', description: 'Case polishing, dial restoration, and complete movement service', base_price: 35000, duration: '30–45 days' },
] as const;

// ─── FAQ Categories ──────────────────────────────────────────

export const FAQ_CATEGORIES = [
  'Shipping',
  'Insurance',
  'Authentication',
  'Repairs',
  'Service Warranties',
  'House-Call Repairs',
  'Payments',
  'Trade-Ins',
  'Watch Vault',
] as const;

// ─── Community Post Categories ────────────────────────────────

export const COMMUNITY_CATEGORIES = [
  { id: 'story', label: 'Collector Stories' },
  { id: 'collection', label: 'Featured Collections' },
  { id: 'discussion', label: 'Discussions' },
  { id: 'photography', label: 'Watch Photography' },
  { id: 'restoration', label: 'Restoration Stories' },
  { id: 'interview', label: 'Collector Interviews' },
] as const;

// ─── Health Status Config ─────────────────────────────────────

export const HEALTH_STATUS_VALUES = [
  'Excellent',
  'Healthy',
  'Service Recommended',
  'Service Due',
  'Requires Attention',
] as const;
