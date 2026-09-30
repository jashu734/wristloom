// ============================================================
// Wristloom — Core TypeScript Entity Types
// ============================================================

// ─── Enums & Unions ──────────────────────────────────────────

export type WatchHealthStatus =
  | 'Excellent'
  | 'Healthy'
  | 'Service Recommended'
  | 'Service Due'
  | 'Requires Attention';

export type RequestStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type RepairStatus =
  | 'confirmed'
  | 'technician_en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type UserRole = 'customer' | 'technician' | 'admin';

// ─── User / Auth ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  credit_balance: number;
}

// ─── Watch Vault ─────────────────────────────────────────────

export interface VaultItem {
  id: string;
  owner_id: string;
  watch_name: string;
  brand: string;
  reference_number: string;
  movement: string;
  case_size: string; // e.g. "40mm"
  dial_color?: string;
  strap_material?: string;
  photo_urls: string[];
  document_urls: string[];
  purchase_date?: string;
  purchase_price?: number;
  last_service_date?: string;
  service_due_date?: string;
  health_status: WatchHealthStatus;
  notes?: string;
  serial_number?: string;
  year_of_manufacture?: number;
  service_history: ServiceHistoryEntry[];
  created_at: string;
}

export interface ServiceHistoryEntry {
  id: string;
  vault_item_id: string;
  date: string;
  service_type: string;
  description: string;
  technician_name: string;
  cost?: number;
  warranty_until?: string;
  before_photo_url?: string;
  after_photo_url?: string;
}

// ─── Trade-In ────────────────────────────────────────────────

export interface TradeInRequest {
  id: string;
  customer_id?: string;
  watch_brand: string;
  watch_model: string;
  reference_number: string;
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  photo_urls: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  desired_credit_use: string;
  status: RequestStatus;
  valuation_credit?: number;
  trade_in_reference: string;
  notes?: string;
  created_at: string;
}

// ─── Authentication / Appraisal ──────────────────────────────

export interface AppraisalRequest {
  id: string;
  customer_id?: string;
  watch_brand: string;
  watch_model: string;
  reference_number: string;
  description: string;
  ownership_context: string;
  photo_urls: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: RequestStatus;
  appraisal_reference: string;
  certification_id?: string;
  result?: 'authentic' | 'non_authentic' | 'inconclusive';
  notes?: string;
  created_at: string;
}

export interface AuthenticationCertificate {
  id: string;
  appraisal_request_id: string;
  vault_item_id?: string;
  certification_id: string;
  issued_at: string;
  valid_until: string;
  authenticator_name: string;
  components_verified: string[];
  condition_rating: number; // 1-10
  notes: string;
}

// ─── Contact ─────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  created_at: string;
}

// ─── Technician ──────────────────────────────────────────────

export interface Technician {
  id: string;
  user_id: string;
  name: string;
  portrait_url: string;
  bio: string;
  years_experience: number;
  certifications: TechnicianCertification[];
  specializations: string[];
  brands_serviced: string[];
  rating: number; // 1-5
  completed_services: number;
  available: boolean;
  current_location?: { lat: number; lng: number };
  reviews: Review[];
}

export interface TechnicianCertification {
  id: string;
  name: string;
  issuer: string;
  issued_at: string;
  expires_at?: string;
  badge_url?: string;
}

// ─── Reviews ─────────────────────────────────────────────────

export interface Review {
  id: string;
  technician_id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number; // 1-5
  title: string;
  body: string;
  service_type: string;
  watch_brand?: string;
  created_at: string;
  verified: boolean;
}

// ─── Repair Booking ──────────────────────────────────────────

export interface RepairBooking {
  id: string;
  customer_id?: string;
  technician_id: string;
  service_type: string;
  service_description: string;
  address: string;
  lat?: number;
  lng?: number;
  scheduled_date: string;
  scheduled_time: string;
  status: RepairStatus;
  booking_reference: string;
  deposit_paid: boolean;
  deposit_amount: number;
  watch_brand?: string;
  watch_model?: string;
  notes?: string;
  before_photo_urls?: string[];
  after_photo_urls?: string[];
  created_at: string;
}

export interface WatchHealthRecord {
  id: string;
  vault_item_id: string;
  recorded_at: string;
  health_status: WatchHealthStatus;
  notes: string;
  recorded_by: string;
}

// ─── Workshops ───────────────────────────────────────────────

export interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  instructor_bio: string;
  duration_hours: number;
  max_participants: number;
  current_participants: number;
  price: number;
  components_available: WatchComponent[];
  dates: WorkshopDate[];
  cover_image_url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  location: string;
}

export interface WatchComponent {
  id: string;
  name: string;
  description: string;
  material: string;
  price_addon: number;
  image_url?: string;
}

export interface WorkshopDate {
  id: string;
  date: string;
  time: string;
  spots_remaining: number;
}

export interface WorkshopBooking {
  id: string;
  workshop_id: string;
  customer_id?: string;
  selected_date_id: string;
  selected_components: string[];
  customer_name: string;
  customer_email: string;
  total_price: number;
  status: RequestStatus;
  booking_reference: string;
  assembly_record_url?: string;
  created_at: string;
}

// ─── Incentives & Credits ─────────────────────────────────────

export interface Incentive {
  id: string;
  customer_id: string;
  type: 'repair_completion' | 'trade_in' | 'loyalty' | 'referral';
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applicable_to: string[];
  valid_until: string;
  redeemed: boolean;
  created_at: string;
}

export interface CreditWallet {
  id: string;
  customer_id: string;
  balance: number;
  currency: string;
  transactions: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  created_at: string;
}

// ─── Restoration ─────────────────────────────────────────────

export interface RestorationProject {
  id: string;
  technician_id: string;
  watch_brand: string;
  watch_model: string;
  reference_number: string;
  work_performed: string[];
  before_images: string[];
  after_images: string[];
  duration_days: number;
  completed_at: string;
  description: string;
  featured: boolean;
}

// ─── Community ───────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  body: string;
  category: 'story' | 'collection' | 'discussion' | 'photography' | 'restoration' | 'interview';
  image_urls?: string[];
  watch_brands?: string[];
  likes: number;
  comment_count: number;
  featured: boolean;
  created_at: string;
}

// ─── Commerce ────────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  modelName?: string;
  brand: string;
  reference_number: string;
  referenceNumber?: string;
  price: number;
  purchaseValue?: number;
  currency: string;
  images: string[];
  imageUrl?: string;
  description: string;
  craftsmanship_narrative?: string;
  movement_type: string;
  movementType?: string;
  movement_caliber?: string;
  movementCaliber?: string;
  power_reserve?: string;
  powerReserve?: string;
  case_material?: string;
  caseMaterial?: string;
  case_size: string;
  caseSize?: string;
  case_thickness?: string;
  caseThickness?: string;
  dial_color?: string;
  dialColor?: string;
  crystal?: string;
  water_resistance?: string;
  waterResistance?: string;
  strap_options?: StrapOption[];
  certification?: string;
  condition?: string;
  year?: number;
  in_stock?: boolean;
  inStock?: boolean;
  stock?: number;
  stockCount?: number;
  collection?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrapOption {
  id: string;
  material: string;
  color: string;
  price_addon: number;
  image_url?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_strap?: StrapOption;
}

// ─── Navigation / Content Types ──────────────────────────────

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_avatar?: string;
  customer_location: string;
  service_type: string;
  watch_brand?: string;
  title: string;
  body: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  city: string;
  region: string;
  country: string;
  coverage_area: string;
  availability_status: 'Available' | 'Limited' | 'Coming Soon';
  services_available: string[];
}

export interface CareGuide {
  id: string;
  slug: string;
  title: string;
  category: 'maintenance' | 'storage' | 'handling' | 'seasonal' | 'water-resistance' | 'mechanical' | 'video';
  excerpt: string;
  body: string;
  cover_image?: string;
  read_time_minutes: number;
  published_at: string;
}

export interface InvestmentInsight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  brand_focus?: string;
  cover_image?: string;
  read_time_minutes: number;
  published_at: string;
  disclaimer: string;
}
