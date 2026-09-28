'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Archive,
  Shield,
  RefreshCw,
  Wrench,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  ChevronRight,
  Star,
  Clock,
  Package,
  LogOut,
  Edit2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge, HealthBadge } from '@/components/primitives/Badge';
import { MOCK_VAULT_ITEMS, MOCK_REVIEWS, MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

// ─── Mock account data ────────────────────────────────────────
const DEMO_USER = {
  name: 'Ravi Desai',
  email: 'ravi.desai@email.com',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=85',
  member_since: '2022-03-15',
  credit_balance: 48500,
  tier: 'Collector',
};

const RECENT_ACTIVITY = [
  { id: 'act-1', type: 'service', label: 'Full Service & Overhaul completed', sub: 'Rolex Submariner · Arjun Mehta', date: '2024-11-15', icon: Wrench },
  { id: 'act-2', type: 'purchase', label: 'Watch purchased', sub: 'Omega Speedmaster Professional', date: '2024-10-28', icon: Package },
  { id: 'act-3', type: 'auth', label: 'Authentication certificate issued', sub: 'Audemars Piguet Royal Oak', date: '2024-09-12', icon: Shield },
  { id: 'act-4', type: 'credit', label: 'Platform credit awarded', sub: 'Trade-in completion bonus · ₹4,500', date: '2024-08-30', icon: CreditCard },
];

const QUICK_LINKS = [
  { label: 'Watch Vault', desc: 'Manage your collection', href: '/watch-vault', icon: Archive },
  { label: 'Authentication', desc: 'Verify a timepiece', href: '/authentication', icon: Shield },
  { label: 'Book a Repair', desc: 'House-call service', href: '/services/repair', icon: Wrench },
  { label: 'Trade-In', desc: 'Value your watch', href: '/trade-in', icon: RefreshCw },
  { label: 'Workshops', desc: 'Build your own watch', href: '/workshops', icon: Calendar },
  { label: 'Shop', desc: 'Browse timepieces', href: '/shop', icon: Package },
];

type Tab = 'overview' | 'vault' | 'orders' | 'credits' | 'settings';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  profileImage: string | null;
  createdAt: string;
  creditWallet?: { balance: number };
}

export function AccountClient() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [realWalletBalance, setRealWalletBalance] = React.useState<number | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user) {
          setProfile(d.user);
          if (d.user.creditWallet?.balance !== undefined) {
            setRealWalletBalance(d.user.creditWallet.balance);
          }
        }
      })
      .catch(() => {});
  }, [session?.user]);

  const displayName = profile?.name || session?.user?.name || DEMO_USER.name;
  const displayEmail = profile?.email || session?.user?.email || DEMO_USER.email;
  const displayAvatar = profile?.profileImage || session?.user?.image || DEMO_USER.avatar;
  const displayCredits = realWalletBalance !== null ? realWalletBalance : DEMO_USER.credit_balance;
  const memberSinceYear = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : new Date(DEMO_USER.member_since).getFullYear();

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* ── Top header bar ── */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover border border-[rgba(176,141,87,0.25)]"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1E1A17]" aria-label="Online" />
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-0.5">
                  Member since {memberSinceYear}
                </p>
                <h1 className="font-display text-xl text-[#EDE6D6]">{displayName}</h1>
                <p className="text-xs text-[rgba(237,230,214,0.45)]">{displayEmail}</p>
              </div>
            </div>

            {/* Credit balance + tier */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right">
                <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-0.5">
                  Platform Credits
                </p>
                <p className="font-mono text-lg text-[#B08D57]">{formatCurrency(displayCredits)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-0.5">
                  Membership
                </p>
                <Badge variant="brass" dot>{DEMO_USER.tier}</Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'vault', label: 'My Vault' },
                { id: 'orders', label: 'Orders & Services' },
                { id: 'credits', label: 'Credits & Offers' },
                { id: 'settings', label: 'Settings' },
              ] as { id: Tab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-[2px] transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[rgba(176,141,87,0.12)] text-[#B08D57] border border-[rgba(176,141,87,0.25)]'
                    : 'text-[rgba(237,230,214,0.45)] hover:text-[#EDE6D6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="container-wl py-10">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'vault' && <VaultTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'credits' && <CreditsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            profile={profile}
            onProfileUpdate={(updated) => setProfile((prev) => (prev ? { ...prev, ...updated } : null))}
          />
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Watches in Vault', value: '3', sub: 'across 3 brands' },
          { label: 'Services Completed', value: '4', sub: 'since 2022' },
          { label: 'Platform Credits', value: '₹48,500', sub: 'redeemable now' },
          { label: 'Authentications', value: '1', sub: 'certificates issued' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
            <p className="font-mono text-xl text-[#B08D57] mb-1">{s.value}</p>
            <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">{s.label}</p>
            <p className="text-xs text-[rgba(237,230,214,0.30)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent activity */}
        <div>
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((act) => (
              <div key={act.id} className="flex items-center gap-4 bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] rounded-[2px] px-4 py-3">
                <div className="w-8 h-8 rounded-[2px] bg-[rgba(176,141,87,0.08)] flex items-center justify-center flex-shrink-0">
                  <act.icon className="w-3.5 h-3.5 text-[#B08D57]" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#EDE6D6] truncate">{act.label}</p>
                  <p className="text-xs text-[rgba(237,230,214,0.40)] truncate">{act.sub}</p>
                </div>
                <p className="font-mono text-[10px] text-[rgba(237,230,214,0.30)] flex-shrink-0">
                  {new Date(act.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-1.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] p-3 transition-all duration-200"
              >
                <link.icon className="w-4 h-4 text-[rgba(176,141,87,0.55)] group-hover:text-[#B08D57] transition-colors" aria-hidden />
                <p className="text-xs text-[rgba(237,230,214,0.70)] group-hover:text-[#EDE6D6] transition-colors font-medium">{link.label}</p>
                <p className="text-[10px] text-[rgba(237,230,214,0.35)]">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vault Tab ────────────────────────────────────────────────
function VaultTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
          Your Collection ({MOCK_VAULT_ITEMS.length} pieces)
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/watch-vault">Open Full Vault <ChevronRight className="w-3.5 h-3.5" /></Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_VAULT_ITEMS.map((item) => (
          <Link
            key={item.id}
            href="/watch-vault"
            className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={item.photo_urls[0]}
                alt={item.watch_name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4">
              <p className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-1">{item.brand}</p>
              <p className="font-display text-base text-[#EDE6D6] mb-1">{item.watch_name}</p>
              <p className="font-mono text-[10px] text-[rgba(237,230,214,0.35)] mb-3">Ref. {item.reference_number}</p>
              <HealthBadge status={item.health_status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          fetch('/api/orders').then((r) => r.ok ? r.json() : { orders: [] }),
          fetch('/api/bookings').then((r) => r.ok ? r.json() : []),
        ]);
        setOrders(ordersRes.orders ?? []);
        setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const statusColor: Record<string, string> = {
    DELIVERED: 'text-emerald-400',
    COMPLETED: 'text-emerald-400',
    CONFIRMED: 'text-[#B08D57]',
    PROCESSING: 'text-amber-400',
    SHIPPED: 'text-sky-400',
    PENDING: 'text-amber-400',
    TECHNICIAN_ASSIGNED: 'text-sky-400',
    TECHNICIAN_EN_ROUTE: 'text-amber-400 font-bold',
    IN_PROGRESS: 'text-indigo-400',
    CANCELLED: 'text-red-400',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#B08D57] animate-spin" />
      </div>
    );
  }

  const hasItems = orders.length > 0 || bookings.length > 0;

  return (
    <div className="space-y-8">
      {/* Product Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
            Watch Acquisitions ({orders.length})
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">Browse Atelier <ChevronRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] rounded-[2px] p-6 text-center">
            <Package className="w-8 h-8 text-[rgba(176,141,87,0.30)] mx-auto mb-2" />
            <p className="text-sm text-[rgba(237,230,214,0.50)]">No timepiece acquisitions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] rounded-[2px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">Purchase</Badge>
                    <span className="font-mono text-[10px] text-[#B08D57] font-semibold">{order.orderReference}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${statusColor[order.status] ?? 'text-[rgba(237,230,214,0.45)]'}`}>
                      {order.status}
                    </span>
                    <span className="font-mono text-sm text-[#EDE6D6] font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[rgba(176,141,87,0.05)] pt-3">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-[rgba(237,230,214,0.70)]">
                      <span>{item.brand} — {item.name} (x{item.quantity})</span>
                      <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-[rgba(237,230,214,0.35)] font-mono">
                  <span>Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>Payment: {order.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">
            Service & Restoration Bookings ({bookings.length})
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/services/repair">Book Service <ChevronRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] rounded-[2px] p-6 text-center">
            <Wrench className="w-8 h-8 text-[rgba(176,141,87,0.30)] mx-auto mb-2" />
            <p className="text-sm text-[rgba(237,230,214,0.50)]">No watch repair or maintenance bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E1A17] border border-[rgba(176,141,87,0.08)] rounded-[2px] p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="brass">Service</Badge>
                    <span className="font-mono text-[9px] text-[rgba(237,230,214,0.40)] uppercase">{booking.bookingReference}</span>
                    <span className={`font-mono text-[10px] uppercase font-medium ${statusColor[booking.status] ?? 'text-[rgba(237,230,214,0.50)]'}`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-[#EDE6D6] font-medium">{booking.serviceType}</p>
                  <p className="text-xs text-[rgba(237,230,214,0.50)] mt-0.5">
                    {booking.watchBrand ? `${booking.watchBrand} ${booking.watchModel || ''}` : 'Timepiece'} · Scheduled for {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({booking.scheduledTimeStart} - {booking.scheduledTimeEnd})
                  </p>
                  {booking.technician?.user && (
                    <p className="text-xs text-[#B08D57] mt-1">
                      Assigned Master Horologist: {booking.technician.user.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {booking.status === 'TECHNICIAN_EN_ROUTE' && (
                    <Button variant="primary" size="sm" asChild>
                      <Link href={`/service-tracking?id=${booking.id}`}>
                        Track Live Radar
                      </Link>
                    </Button>
                  )}
                  {booking.status !== 'TECHNICIAN_EN_ROUTE' && booking.status !== 'CANCELLED' && (
                    <Button variant="subtle" size="sm" asChild>
                      <Link href={`/service-tracking?id=${booking.id}`}>
                        View Status
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Credits Tab ──────────────────────────────────────────────
function CreditsTab() {
  const transactions = [
    { id: 'tx-1', type: 'credit', desc: 'Trade-in completion — TAG Heuer Aquaracer', amount: 24000, date: '2024-08-30' },
    { id: 'tx-2', type: 'credit', desc: 'Loyalty reward — 2 year anniversary', amount: 5000, date: '2024-03-15' },
    { id: 'tx-3', type: 'debit', desc: 'Repair service — Rolex full overhaul (partial)', amount: 8000, date: '2024-11-15' },
    { id: 'tx-4', type: 'credit', desc: 'Referral bonus — Meera Iyer', amount: 3000, date: '2024-07-22' },
    { id: 'tx-5', type: 'credit', desc: 'Workshop attendance reward', amount: 2000, date: '2024-08-03' },
    { id: 'tx-6', type: 'debit', desc: 'Workshop booking', amount: 28000, date: '2024-08-03' },
  ];

  const offers = [
    { title: '15% off next full service', desc: 'Valid on any full service & overhaul. Expires 31 Dec 2025.', code: 'LOYAL15' },
    { title: '₹5,000 trade-in top-up', desc: 'Additional credit when you trade in your next watch before year end.', code: 'TRADE25' },
  ];

  return (
    <div className="space-y-8">
      {/* Balance */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-2">Available Credits</p>
          <p className="font-mono text-3xl text-[#B08D57]">{formatCurrency(48500)}</p>
          <p className="text-xs text-[rgba(237,230,214,0.45)] mt-1">Redeemable on purchases, repairs, and workshops</p>
        </div>
        <Button variant="primary" size="md" asChild>
          <Link href="/shop">Use Credits</Link>
        </Button>
      </div>

      {/* Active offers */}
      <div>
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Active Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div key={offer.code} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5">
              <p className="font-display text-base text-[#EDE6D6] mb-2">{offer.title}</p>
              <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed mb-3">{offer.desc}</p>
              <div className="flex items-center justify-between">
                <code className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.20)] px-2 py-1 rounded-[2px]">
                  {offer.code}
                </code>
                <Button variant="ghost" size="sm">Apply</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Transaction History</h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-4 bg-[#1E1A17] border border-[rgba(176,141,87,0.06)] rounded-[2px] px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[rgba(237,230,214,0.70)] truncate">{tx.desc}</p>
                <p className="font-mono text-[10px] text-[rgba(237,230,214,0.30)] mt-0.5">
                  {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className={`font-mono text-sm flex-shrink-0 ${tx.type === 'credit' ? 'text-emerald-400' : 'text-[rgba(237,230,214,0.45)]'}`}>
                {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────
function SettingsTab({
  profile,
  onProfileUpdate,
}: {
  profile: UserProfile | null;
  onProfileUpdate: (updated: Partial<UserProfile>) => void;
}) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(profile?.name || session?.user?.name || '');
  const [phone, setPhone] = React.useState(profile?.phone || session?.user?.phone || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (profile) {
      if (profile.name !== undefined && profile.name !== null) setName(profile.name);
      if (profile.phone !== undefined && profile.phone !== null) setPhone(profile.phone);
    } else if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.phone) setPhone(session.user.phone);
    }
  }, [profile, session?.user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update profile');
      }

      if (data.user) {
        onProfileUpdate(data.user);
      }

      await update({
        user: { name, phone },
      });

      setIsEditing(false);
      setFeedback({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const [notifications, setNotifications] = React.useState({
    service_reminders: true,
    promotional: false,
    vault_alerts: true,
    community: false,
    new_arrivals: true,
  });

  return (
    <div className="space-y-8 max-w-xl">
      {/* Profile */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)]">Profile</h2>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Profile
            </Button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setName(session?.user?.name ?? '');
                setPhone(session?.user?.phone ?? '');
                setFeedback(null);
              }}
              className="text-xs text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded text-xs mb-3 flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {feedback.text}
          </div>
        )}

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5 space-y-4">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email ?? ''}
                  className="w-full bg-[#14110F]/50 border border-[rgba(176,141,87,0.10)] rounded-[2px] px-3 py-2 text-sm text-[rgba(237,230,214,0.4)] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded-[2px] px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(176,141,87,0.10)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-0.5">Full Name</p>
                  <p className="text-sm text-[#EDE6D6]">{profile?.name || session?.user?.name || 'Valued Collector'}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[rgba(176,141,87,0.06)] pt-3">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-0.5">Email Address</p>
                  <p className="text-sm text-[rgba(237,230,214,0.70)]">{profile?.email || session?.user?.email || '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[rgba(176,141,87,0.06)] pt-3">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-0.5">Phone</p>
                  <p className="text-sm text-[rgba(237,230,214,0.70)]">{profile?.phone || session?.user?.phone || 'Not added'}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Notifications</h2>
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] divide-y divide-[rgba(176,141,87,0.06)]">
          {[
            { key: 'service_reminders', label: 'Service Reminders', desc: 'Alerts when watches in your Vault are due for service' },
            { key: 'vault_alerts', label: 'Vault Alerts', desc: 'Health status changes and warranty expiry warnings' },
            { key: 'new_arrivals', label: 'New Arrivals', desc: 'Notifications when brands you follow have new stock' },
            { key: 'promotional', label: 'Offers & Promotions', desc: 'Member-exclusive deals and credit earning opportunities' },
            { key: 'community', label: 'Community', desc: 'Replies and reactions to your community posts' },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm text-[rgba(237,230,214,0.70)]">{pref.label}</p>
                <p className="text-xs text-[rgba(237,230,214,0.40)] mt-0.5">{pref.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [pref.key]: !n[pref.key as keyof typeof n] }))}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  notifications[pref.key as keyof typeof notifications] ? 'bg-[#B08D57]' : 'bg-[rgba(237,230,214,0.12)]'
                }`}
                aria-checked={notifications[pref.key as keyof typeof notifications]}
                role="switch"
                aria-label={pref.label}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications[pref.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Settings & Sign Out */}
      <div>
        <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">Account Controls</h2>
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5 space-y-3">
          <Button variant="subtle" size="md" className="w-full justify-start gap-3" asChild>
            <Link href="/account/settings">
              <Settings className="w-4 h-4 text-[#B08D57]" /> Advanced Settings & Password
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
