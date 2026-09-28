'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV } from '@/lib/constants';
import { Button } from '@/components/primitives/Button';
import { HeaderAuth } from './HeaderAuth';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

// ─── Services Dropdown Config ─────────────────────────────────
const SERVICES_DROPDOWN = [
  { label: 'Repair Services', href: '/services/repair', desc: 'House-call & send-in repairs' },
  { label: 'Authentication', href: '/authentication', desc: 'Multi-stage expert verification' },
  { label: 'Trade-In Program', href: '/trade-in', desc: 'Value your watch for credit' },
  { label: 'Watch Vault', href: '/watch-vault', desc: 'Your personal collection manager' },
  { label: 'Workshops', href: '/workshops', desc: 'Build a watch with a master' },
];

// ─── Header Component ─────────────────────────────────────────
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgba(20,17,15,0.96)] backdrop-blur-md border-b border-[rgba(176,141,87,0.12)]'
          : 'bg-transparent'
      )}
    >
      <div className="container-wl">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ─── Logo ─────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Wristloom — Home"
          >
            <WristloomLogo />
            <div className="hidden sm:block">
              <span className="font-display text-lg text-[#EDE6D6] tracking-tight leading-none">
                Wristloom
              </span>
              <span className="block font-mono text-[9px] text-[#B08D57] tracking-[0.18em] uppercase mt-0.5">
                Crafted in Time
              </span>
            </div>
          </Link>

          {/* ─── Primary Nav — Desktop ──────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {/* Shop */}
            <NavLink href="/shop" active={pathname.startsWith('/shop')}>
              Shop
            </NavLink>

            {/* Services — with dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm transition-colors duration-200 rounded-[2px]',
                  servicesOpen || pathname.startsWith('/authentication') || pathname.startsWith('/trade-in') || pathname.startsWith('/services') || pathname.startsWith('/watch-vault') || pathname.startsWith('/workshops')
                    ? 'text-[#B08D57]'
                    : 'text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6]'
                )}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Services
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    servicesOpen ? 'rotate-180' : ''
                  )}
                  aria-hidden
                />
              </button>

              {/* Dropdown */}
              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 transition-all duration-200',
                  'bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] shadow-2xl rounded-[2px]',
                  servicesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                )}
              >
                <div className="p-2">
                  {SERVICES_DROPDOWN.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col px-3 py-2.5 rounded-[2px] hover:bg-[rgba(176,141,87,0.08)] transition-colors group/item"
                    >
                      <span className="text-sm text-[#EDE6D6] group-hover/item:text-[#B08D57] transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-[rgba(237,230,214,0.45)] mt-0.5">
                        {item.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Vault */}
            <NavLink href="/watch-vault" active={pathname === '/watch-vault'}>
              Vault
            </NavLink>

            {/* Community */}
            <NavLink href="/community" active={pathname === '/community'}>
              Community
            </NavLink>
          </nav>

          {/* ─── Right Actions ─────────────────────────── */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <WishlistLink />

            {/* Cart */}
            <CartLink />

            {/* Auth (Sign In / Notification Bell / User Menu) */}
            <HeaderAuth />

            {/* Book a Service CTA */}
            <div className="hidden lg:block ml-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/services/repair">Book a Service</Link>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ───────────────────────────────── */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-screen' : 'max-h-0'
        )}
      >
        <div className="bg-[rgba(20,17,15,0.98)] backdrop-blur-md border-t border-[rgba(176,141,87,0.12)]">
          <nav className="container-wl py-4 space-y-1" aria-label="Mobile navigation">
            {/* Primary links */}
            <MobileNavLink href="/shop">Shop</MobileNavLink>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] px-3 pt-3 pb-1">
              Services
            </div>
            {SERVICES_DROPDOWN.map((item) => (
              <MobileNavLink key={item.href} href={item.href} indent>
                {item.label}
              </MobileNavLink>
            ))}
            <MobileNavLink href="/community">Community</MobileNavLink>

            <div className="pt-4 pb-2">
              <Button variant="primary" size="md" className="w-full" asChild>
                <Link href="/services/repair">Book a Service</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-2 text-sm transition-colors duration-200 rounded-[2px]',
        active
          ? 'text-[#B08D57]'
          : 'text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6]'
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  indent = false,
}: {
  href: string;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'block py-2.5 text-sm text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] transition-colors',
        indent ? 'px-6' : 'px-3'
      )}
    >
      {children}
    </Link>
  );
}

// ─── Logo SVG ─────────────────────────────────────────────────
function WristloomLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Watch circle */}
      <circle cx="16" cy="16" r="12" stroke="#B08D57" strokeWidth="1" fill="none" />
      {/* Crown */}
      <rect x="27" y="14" width="3" height="4" rx="1" fill="#B08D57" fillOpacity="0.6" />
      {/* Hour hand */}
      <line x1="16" y1="16" x2="16" y2="10" stroke="#EDE6D6" strokeWidth="1.5" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="16" y1="16" x2="21" y2="16" stroke="#B08D57" strokeWidth="1" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.5" fill="#B08D57" />
      {/* Thread-line motif hints */}
      <path d="M7 16 Q10 12 13 16" stroke="#B08D57" strokeWidth="0.4" strokeOpacity="0.5" fill="none" />
      <path d="M19 16 Q22 20 25 16" stroke="#B08D57" strokeWidth="0.4" strokeOpacity="0.5" fill="none" />
    </svg>
  );
}

// ─── Cart Link with Live Badge ────────────────────────────────
function CartLink() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  return (
    <Link
      href="/cart"
      className="relative p-2 text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] transition-colors"
      aria-label={`Shopping cart${count > 0 ? `, ${count} items` : ''}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-[#B08D57] text-[#14110F] font-mono text-[9px] font-bold flex items-center justify-center px-1">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

// ─── Wishlist Link with Live Badge ────────────────────────────
function WishlistLink() {
  const count = useWishlistStore((s) => s.items.length);
  return (
    <Link
      href="/wishlist"
      className="relative p-2 text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] transition-colors"
      aria-label={`Wishlist${count > 0 ? `, ${count} saved items` : ''}`}
    >
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-[#B08D57] text-[#14110F] font-mono text-[9px] font-bold flex items-center justify-center px-1">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

