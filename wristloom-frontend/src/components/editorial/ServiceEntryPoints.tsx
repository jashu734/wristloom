import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  RefreshCw,
  Wrench,
  Archive,
  Calendar,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

interface ServiceEntry {
  id: string;
  icon: LucideIcon;
  label: string;
  tagline: string;
  description: string;
  href: string;
  accent: string;
  highlight?: boolean;
}

// ─── Service Entry Points ─────────────────────────────────────
// The differentiator grid — entry into each core service

const SERVICES: ServiceEntry[] = [
  {
    id: 'authentication',
    icon: Shield,
    label: 'Authentication',
    tagline: 'Multi-Stage Verification',
    description:
      'Expert authentication by certified horologists. Component inspection, reference verification, condition analysis, and certification — all documented.',
    href: '/authentication',
    accent: 'border-[rgba(176,141,87,0.25)] hover:border-[#B08D57]',
  },
  {
    id: 'trade-in',
    icon: RefreshCw,
    label: 'Trade-In Program',
    tagline: 'Value Your Timepiece',
    description:
      'Submit your watch for valuation. Receive platform credit redeemable toward purchases, repairs, workshops, or restorations.',
    href: '/trade-in',
    accent: 'border-[rgba(176,141,87,0.20)] hover:border-[#B08D57]',
  },
  {
    id: 'repair',
    icon: Wrench,
    label: 'Repair & Restoration',
    tagline: 'At-Home Concierge',
    description:
      'Certified technicians come to you. Select a service, book a time slot, and track your technician in real time on service day.',
    href: '/services/repair',
    accent: 'border-[rgba(107,39,55,0.40)] hover:border-[#6B2737]',
    highlight: true,
  },
  {
    id: 'vault',
    icon: Archive,
    label: 'Watch Vault',
    tagline: 'Your Digital Collection',
    description:
      'A personal asset manager for your collection. Track health status, upload documents, record service history, and monitor upcoming maintenance.',
    href: '/watch-vault',
    accent: 'border-[rgba(176,141,87,0.20)] hover:border-[#B08D57]',
  },
  {
    id: 'workshops',
    icon: Calendar,
    label: 'Workshops',
    tagline: 'Build Your Own Watch',
    description:
      'A guided experience with a master watchmaker. Assemble a timepiece from components, receive a digital assembly record, and add it to your Vault.',
    href: '/workshops',
    accent: 'border-[rgba(176,141,87,0.20)] hover:border-[#B08D57]',
  },
];

export function ServiceEntryPoints() {
  return (
    <section className="section-padding bg-[#1E1A17] border-y border-[rgba(176,141,87,0.08)]" aria-labelledby="services-heading">
      <div className="container-wl">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <span className="text-overline block mb-3">The Ecosystem</span>
          <h2
            id="services-heading"
            className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight mb-4"
          >
            One Platform.
            <br />
            Every Stage of Ownership.
          </h2>
          <p className="text-[rgba(237,230,214,0.55)] text-base leading-relaxed">
            Wristloom is not a watch store. It is an ownership ecosystem — connecting discovery, authentication, maintenance, and trade in a single, continuous relationship.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                href={service.href}
                className={`group relative bg-[#14110F] border ${service.accent} rounded-[2px] p-6 transition-all duration-300 hover:bg-[#14110F] flex flex-col ${
                  // Repair card spans full width on last row if odd total
                  i === 2 ? 'lg:col-span-1' : ''
                }`}
              >
                {/* Highlight badge for the hero service */}
                {service.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-[#E8A0B0] bg-[rgba(107,39,55,0.30)] border border-[rgba(107,39,55,0.40)] px-2 py-0.5 rounded-[1px]">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center mb-5 ${
                  service.highlight
                    ? 'bg-[rgba(107,39,55,0.20)] text-[#E8A0B0]'
                    : 'bg-[rgba(176,141,87,0.10)] text-[#B08D57]'
                }`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>

                {/* Text */}
                <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
                  {service.tagline}
                </p>
                <h3 className="font-display text-lg text-[#EDE6D6] mb-3 group-hover:text-[#B08D57] transition-colors">
                  {service.label}
                </h3>
                <p className="text-sm text-[rgba(237,230,214,0.50)] leading-relaxed flex-1">
                  {service.description}
                </p>

                {/* Arrow */}
                <div className="mt-5 flex items-center gap-2 text-[rgba(176,141,87,0.45)] group-hover:text-[#B08D57] transition-colors">
                  <span className="font-mono text-[10px] tracking-widest uppercase">Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
