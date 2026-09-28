import * as React from 'react';
import Link from 'next/link';
import { FOOTER_NAV } from '@/lib/constants';

// ─── Footer Mega Menu ─────────────────────────────────────────
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E1A17] border-t border-[rgba(176,141,87,0.12)]" aria-label="Site footer">

      {/* ─── Tagline row ───────────────────────────────── */}
      <div className="border-b border-[rgba(176,141,87,0.08)]">
        <div className="container-wl py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FooterLogo />
              <span className="font-display text-xl text-[#EDE6D6] tracking-tight">Wristloom</span>
            </div>
            <p className="text-sm text-[rgba(237,230,214,0.50)] max-w-sm leading-relaxed">
              The definitive digital ecosystem for discovering, owning, maintaining, authenticating, and trading luxury timepieces.
            </p>
          </div>

          {/* Thread motif accent */}
          <div className="hidden md:block opacity-30">
            <ThreadAccentSVG />
          </div>
        </div>
      </div>

      {/* ─── Mega Menu Grid ────────────────────────────── */}
      <div className="container-wl py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10">

          {/* SHOP */}
          <FooterColumn label="Shop" links={FOOTER_NAV.SHOP} />

          {/* SERVICES */}
          <FooterColumn label="Services" links={FOOTER_NAV.SERVICES} />

          {/* ATELIER */}
          <FooterColumn label="Atelier" links={FOOTER_NAV.ATELIER} />

          {/* HOUSE */}
          <FooterColumn label="House" links={FOOTER_NAV.HOUSE} />

          {/* SUPPORT */}
          <FooterColumn label="Support" links={FOOTER_NAV.SUPPORT} />

          {/* LEGAL */}
          <FooterColumn label="Legal" links={FOOTER_NAV.LEGAL} />
        </div>
      </div>

      {/* ─── Contact Strip ─────────────────────────────── */}
      <div className="border-t border-[rgba(176,141,87,0.08)]">
        <div className="container-wl py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="tel:+918001234567"
              className="font-mono text-[11px] tracking-wider text-[rgba(237,230,214,0.45)] hover:text-[#B08D57] transition-colors uppercase"
            >
              +91 800 123 4567
            </a>
            <a
              href="mailto:concierge@wristloom.com"
              className="font-mono text-[11px] tracking-wider text-[rgba(237,230,214,0.45)] hover:text-[#B08D57] transition-colors"
            >
              concierge@wristloom.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <SocialLink href="#" label="Instagram" icon={<InstagramIcon />} />
            <SocialLink href="#" label="Twitter / X" icon={<TwitterIcon />} />
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ────────────────────────────────── */}
      <div className="border-t border-[rgba(176,141,87,0.06)]">
        <div className="container-wl py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[10px] tracking-widest text-[rgba(237,230,214,0.28)] uppercase">
            © {currentYear} Wristloom. All rights reserved.
          </p>
          <p className="font-mono text-[10px] tracking-widest text-[rgba(237,230,214,0.20)] uppercase">
            Crafted in Time
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Footer Column ────────────────────────────────────────────
function FooterColumn({
  label,
  links,
}: {
  label: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      {/* Section header in mono */}
      <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#B08D57] mb-4">
        {label}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6] transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Social Link ──────────────────────────────────────────────
function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center text-[rgba(237,230,214,0.35)] hover:text-[#B08D57] transition-colors"
    >
      {icon}
    </a>
  );
}

// ─── Logo SVG (compact version) ───────────────────────────────
function FooterLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="16" cy="16" r="12" stroke="#B08D57" strokeWidth="1" fill="none" />
      <rect x="27" y="14" width="3" height="4" rx="1" fill="#B08D57" fillOpacity="0.6" />
      <line x1="16" y1="16" x2="16" y2="10" stroke="#EDE6D6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="16" x2="21" y2="16" stroke="#B08D57" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.5" fill="#B08D57" />
    </svg>
  );
}

// ─── Thread Accent SVG (footer decoration) ────────────────────
function ThreadAccentSVG() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path
            d={`M${i * 30} 30 Q${i * 30 + 15} ${10 + i * 5} ${i * 30 + 30} 30`}
            stroke="#B08D57"
            strokeWidth="0.6"
            strokeOpacity={0.6 - i * 0.1}
            fill="none"
          />
          <path
            d={`M${i * 30} 30 Q${i * 30 + 15} ${50 - i * 5} ${i * 30 + 30} 30`}
            stroke="#B08D57"
            strokeWidth="0.4"
            strokeOpacity={0.3 - i * 0.05}
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Social Icons ─────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
