import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ServiceEntryPoints } from '@/components/editorial/ServiceEntryPoints';
import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { db } from '@/lib/db';
import { BOOKABLE_SERVICES } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';
import {
  Wrench,
  Shield,
  RefreshCw,
  Archive,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Battery,
  Layers,
  Sparkles,
  Droplets,
  Eye,
  Clock,
  MapPin,
  Star,
  Award,
} from 'lucide-react';
import { ServiceTrackingSearch } from '@/components/tracking/ServiceTrackingSearch';

export const metadata: Metadata = {
  title: 'Atelier & Horological Services | Wristloom',
  description:
    'Explore Wristloom\'s comprehensive suite of luxury watch ownership services: Doorstep Repair & Overhaul, Master Authentication, Vault Asset Management, Trade-In Valuations, and Workshops.',
};

const SERVICE_ICONS: Record<string, any> = {
  'battery-replacement': Battery,
  'strap-repair': Wrench,
  'movement-service': Layers,
  'watch-cleaning': Sparkles,
  'water-resistance': Droplets,
  'glass-replacement': Eye,
  'full-restoration': Shield,
};

export default async function ServicesPage() {
  const technicians = await db.technician.findMany({
    where: { isVerified: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          phone: true,
        },
      },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header Banner */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] relative overflow-hidden">
          <div className="container-wl py-16 md:py-24">
            <span className="text-overline block mb-3">The Atelier Suite</span>
            <h1 className="font-display text-4xl md:text-6xl text-[#EDE6D6] tracking-tight mb-4 max-w-2xl">
              Horological Excellence at Every Stage
            </h1>
            <p className="text-[rgba(237,230,214,0.65)] text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              From precision door-to-door servicing and multi-point provenance verification to secure vault tracking and masterclasses, Wristloom orchestrates complete peace of mind for serious collectors.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/services/repair">
                  Schedule House-Call Repair <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/authentication">Verify a Timepiece</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Watch Service Catalog Menu ─────────────────────── */}
        <section className="container-wl py-16 md:py-20 border-b border-[rgba(176,141,87,0.10)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-px bg-[#B08D57]" />
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
                  Authoritative Workshop Catalog
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight">
                White-Glove Watch Care &amp; Restoration
              </h2>
            </div>
            <p className="text-xs md:text-sm text-[rgba(237,230,214,0.50)] max-w-md">
              Every service is conducted at your doorstep or in our certified cleanroom facility, backed by comprehensive transit insurance and digital Vault certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BOOKABLE_SERVICES.map((svc) => {
              const Icon = SERVICE_ICONS[svc.id] || Wrench;
              return (
                <div
                  key={svc.id}
                  className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 flex flex-col justify-between hover:border-[#B08D57]/60 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-[2px] bg-[rgba(176,141,87,0.10)] border border-[rgba(176,141,87,0.20)] flex items-center justify-center text-[#B08D57]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs text-[#B08D57] bg-[rgba(176,141,87,0.08)] px-2.5 py-1 rounded-[1px] border border-[rgba(176,141,87,0.15)]">
                        from {formatCurrency(svc.basePrice)}
                      </span>
                    </div>

                    <h3 className="font-display text-lg text-[#EDE6D6] mb-2 group-hover:text-[#B08D57] transition-colors">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed mb-4">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[rgba(176,141,87,0.10)] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                      Est. {svc.estimatedDuration}
                    </span>
                    <Link
                      href={`/services/repair?service=${svc.slug}`}
                      className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#B08D57] hover:text-[#EDE6D6] transition-colors font-medium"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── How House-Call Servicing Works ─────────────────── */}
        <section className="bg-[#171412] border-b border-[rgba(176,141,87,0.10)] py-16 md:py-20">
          <div className="container-wl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-2">
                White-Glove Process
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-[#EDE6D6] mb-3">
                How House-Call Servicing Works
              </h2>
              <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed">
                Precision Swiss care brought directly to your residence, executive suite, or private office.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Select & Schedule',
                  desc: 'Pick your watch service, input caliber specifications, and choose a preferred appointment window.',
                },
                {
                  step: '02',
                  title: 'Technician Radar',
                  desc: 'Track your assigned master horologist in real time with dynamic GPS en route telemetry.',
                },
                {
                  step: '03',
                  title: 'Bench Inspection',
                  desc: 'Technician arrives with mobile laminar-flow diagnostics, timing microphones, and ultrasonic units.',
                },
                {
                  step: '04',
                  title: 'Vault Certification',
                  desc: 'Timing delta graphs, pressure test stamps, and 2-year warranty automatically sync to your digital Vault.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] p-6 rounded-[2px] relative"
                >
                  <span className="font-mono text-2xl font-bold text-[#B08D57]/30 block mb-2">
                    {item.step}
                  </span>
                  <h3 className="font-display text-base text-[#EDE6D6] mb-2">{item.title}</h3>
                  <p className="text-xs text-[rgba(237,230,214,0.50)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Certified Technicians Roster ──────────────────── */}
        {technicians.length > 0 && (
          <section className="container-wl py-16 md:py-20 border-b border-[rgba(176,141,87,0.10)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-px bg-[#B08D57]" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">
                    Master Horologists
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight">
                  Certified House-Call Technicians
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[rgba(237,230,214,0.50)] max-w-md">
                All horologists undergo background vetting, carry portable acoustic amplitude analyzers, and are bonded under comprehensive transit insurance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicians.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 flex flex-col sm:flex-row items-start gap-5"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#14110F] border border-[rgba(176,141,87,0.30)] flex-shrink-0">
                    <img
                      src={tech.user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85'}
                      alt={tech.user.name ?? 'Technician'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-lg text-[#EDE6D6] truncate">
                        {tech.user.name}
                      </h3>
                      <div className="flex items-center gap-1 font-mono text-xs text-[#B08D57]">
                        <Star className="w-3.5 h-3.5 fill-[#B08D57]" />
                        <span>{tech.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-[rgba(237,230,214,0.45)] mb-3">
                      {tech.yearsExperience} Years Experience · {tech.completedServices} Completed Services
                    </p>
                    {tech.bio && (
                      <p className="text-xs text-[rgba(237,230,214,0.60)] mb-3 leading-relaxed line-clamp-2">
                        {tech.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {tech.specializations.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="font-mono text-[9px] bg-[#14110F] text-[#B08D57] px-2 py-0.5 rounded-[1px] border border-[rgba(176,141,87,0.15)]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Live Service Tracking Search Card ─────────────── */}
        <section className="container-wl py-16">
          <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-2">
                Live Status Telemetry
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-[#EDE6D6] mb-3">
                Track an Active Service Appointment
              </h2>
              <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
                Enter your booking reference (e.g. WL-SRV-602099) to view real-time technician radar tracking, diagnostic milestones, and delivery estimates.
              </p>
            </div>
            <div className="max-w-xl">
              <ServiceTrackingSearch />
            </div>
          </div>
        </section>

        {/* Ecosystem Services Overview */}
        <ServiceEntryPoints />

        {/* Guarantees Section */}
        <section className="container-wl py-16">
          <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-8 md:p-12">
            <div className="max-w-3xl mb-10">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-2">Our Standard</span>
              <h2 className="font-display text-2xl md:text-3xl text-[#EDE6D6] mb-3">The Wristloom Atelier Pledge</h2>
              <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
                Every service conducted through our atelier or white-glove doorstep network adheres to strict Swiss horological standards, backed by comprehensive Lloyd&apos;s transit insurance and certified archival documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
                <CheckCircle2 className="w-5 h-5 text-[#B08D57] mb-3" />
                <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">2-Year Atelier Warranty</h3>
                <p className="text-xs text-[rgba(237,230,214,0.50)] leading-relaxed">
                  All mechanical overhauls and movement regulations carry our 24-month comprehensive movement accuracy guarantee.
                </p>
              </div>

              <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
                <CheckCircle2 className="w-5 h-5 text-[#B08D57] mb-3" />
                <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">Bonded Technicians</h3>
                <p className="text-xs text-[rgba(237,230,214,0.50)] leading-relaxed">
                  Every house-call watchmaker is background-vetted, certified, and arrives with portable ultrasonic test instrumentation.
                </p>
              </div>

              <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
                <CheckCircle2 className="w-5 h-5 text-[#B08D57] mb-3" />
                <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">Vault Auto-Sync</h3>
                <p className="text-xs text-[rgba(237,230,214,0.50)] leading-relaxed">
                  All service records, diagnostic sheets, timing delta graphs, and certificates automatically deposit into your digital Vault.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteWrapper>
  );
}
