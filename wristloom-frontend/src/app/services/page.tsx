import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ServiceEntryPoints } from '@/components/editorial/ServiceEntryPoints';
import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { Wrench, Shield, RefreshCw, Archive, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atelier & Horological Services',
  description: 'Explore Wristloom\'s comprehensive suite of luxury watch ownership services: Doorstep Repair & Overhaul, Master Authentication, Vault Asset Management, Trade-In Valuations, and Workshops.',
};

export default function ServicesPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header Banner */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] relative overflow-hidden">
          <div className="container-wl py-16 md:py-20">
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

        {/* Detailed Services Grid */}
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
