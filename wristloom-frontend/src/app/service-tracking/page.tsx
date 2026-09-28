import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceTrackingSearch } from '../../components/tracking/ServiceTrackingSearch';
import { ShieldCheck, MapPin, Clock, Award, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Live Service Tracking | Wristloom Atelier',
  description: 'Track your luxury watch service, white-glove courier, or horologist appointment in real time.',
};

export default function ServiceTrackingLandingPage() {
  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#EDE6D6] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(176,141,87,0.12)] border border-[rgba(176,141,87,0.25)] text-xs font-mono uppercase tracking-widest text-[#B08D57] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] animate-pulse" />
            White-Glove Telemetry
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#EDE6D6] mb-4 tracking-tight">
            Track Your Service
          </h1>
          <p className="text-sm sm:text-base text-[rgba(237,230,214,0.65)] max-w-xl mx-auto font-sans leading-relaxed">
            Monitor your timekeeper&apos;s journey from doorstep intake, ultrasonic movement servicing, precision timing calibration, to secure hand-off.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-[#141210] border border-[rgba(176,141,87,0.2)] rounded-lg p-6 sm:p-8 shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(176,141,87,0.08),transparent_70%)] pointer-events-none" />
          <h2 className="text-lg font-display text-[#EDE6D6] mb-2">Look Up Service Reference</h2>
          <p className="text-xs text-[rgba(237,230,214,0.5)] mb-6">
            Enter your booking ID or tracking code provided in your booking confirmation email or SMS.
          </p>
          <ServiceTrackingSearch />
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-lg p-5">
            <div className="w-9 h-9 rounded bg-[rgba(176,141,87,0.1)] border border-[rgba(176,141,87,0.2)] flex items-center justify-center text-[#B08D57] mb-4">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">Live GPS En Route</h3>
            <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
              Real-time technician transit visualization with dynamic ETA updates for white-glove home appointments.
            </p>
          </div>

          <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-lg p-5">
            <div className="w-9 h-9 rounded bg-[rgba(176,141,87,0.1)] border border-[rgba(176,141,87,0.2)] flex items-center justify-center text-[#B08D57] mb-4">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">Chain of Custody</h3>
            <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
              Every hand-off and vault movement is digitally signed, insured up to ₹50,00,000, and logged in your Vault.
            </p>
          </div>

          <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-lg p-5">
            <div className="w-9 h-9 rounded bg-[rgba(176,141,87,0.1)] border border-[rgba(176,141,87,0.2)] flex items-center justify-center text-[#B08D57] mb-4">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base text-[#EDE6D6] mb-1.5">Diagnostic Milestones</h3>
            <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
              Step-by-step photographic records of disassembly, acoustic amplitude regulation, and pressure test logs.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 rounded-lg bg-[rgba(176,141,87,0.05)] border border-[rgba(176,141,87,0.15)] text-xs text-[rgba(237,230,214,0.6)]">
          <span>Need to schedule a new restoration or inspection?</span>
          <Link
            href="/services/repair"
            className="inline-flex items-center gap-1.5 text-[#B08D57] hover:text-[#C5A059] font-medium transition-colors"
          >
            Book White-Glove Service <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
