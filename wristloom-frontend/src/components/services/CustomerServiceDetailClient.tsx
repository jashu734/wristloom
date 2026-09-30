'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Wrench,
  Watch,
  User,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  Truck,
  ExternalLink,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { formatCurrency } from '@/lib/utils';

interface ServiceHistoryItem {
  id: string;
  date: string;
  serviceType: string;
  description: string;
  technicianName: string;
  cost?: number | null;
  createdAt: string;
}

interface ServiceBookingData {
  id: string;
  bookingReference: string;
  customerId: string;
  technicianId?: string | null;
  serviceType: string;
  watchBrand?: string | null;
  watchModel?: string | null;
  watchReferenceNumber?: string | null;
  issueDescription?: string | null;
  issueImages: string[];
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  addressId?: string | null;
  status: string;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  depositAmount?: number | null;
  paymentStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  address?: {
    id: string;
    formattedAddress: string;
    addressLine1?: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  technician?: {
    id: string;
    rating: number;
    specializations: string[];
    yearsExperience: number;
    brandsServiced: string[];
    user: {
      id: string;
      name: string | null;
      phone: string | null;
      profileImage?: string | null;
      email: string;
    };
  } | null;
  serviceHistory?: ServiceHistoryItem[];
}

interface CustomerServiceDetailProps {
  booking: ServiceBookingData;
}

const SERVICE_STAGES = [
  { key: 'PENDING', label: 'Service Requested', desc: 'Booking submitted by collector' },
  { key: 'CONFIRMED', label: 'Booking Confirmed', desc: 'Intake slot verified by atelier' },
  { key: 'TECHNICIAN_ASSIGNED', label: 'Horologist Assigned', desc: 'Certified master watchmaker allocated' },
  { key: 'TECHNICIAN_EN_ROUTE', label: 'Courier / Transit', desc: 'Secure transit or house-call en route' },
  { key: 'TECHNICIAN_ARRIVED', label: 'Diagnostic Intake', desc: 'Watch intake & physical assessment' },
  { key: 'IN_PROGRESS', label: 'Service In Progress', desc: 'Movement overhaul, lubrication & timing' },
  { key: 'COMPLETED', label: 'Restoration Completed', desc: 'Quality inspected, sealed & authenticated' },
];

function getServiceStageIndex(status: string): number {
  if (status === 'COMPLETED') return 6;
  if (status === 'IN_PROGRESS') return 5;
  if (status === 'TECHNICIAN_ARRIVED') return 4;
  if (status === 'TECHNICIAN_EN_ROUTE') return 3;
  if (status === 'TECHNICIAN_ASSIGNED') return 2;
  if (status === 'CONFIRMED') return 1;
  return 0; // PENDING
}

export function CustomerServiceDetailClient({ booking }: CustomerServiceDetailProps) {
  const currentStage = getServiceStageIndex(booking.status);

  const cleanPhone = (booking.technician?.user.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
        `Hello ${booking.technician?.user.name}, this is regarding my WristLoom service request #${booking.bookingReference} for ${booking.watchBrand || 'my watch'}.`
      )}`
    : null;

  const cost = booking.finalPrice ?? booking.estimatedPrice ?? 8500;
  const estimatedCompletion = new Date(
    new Date(booking.scheduledDate).getTime() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#EDE6D6] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[rgba(237,230,214,0.50)] hover:text-[#B08D57] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders & Services</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(176,141,87,0.15)]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Badge variant="brass">Restoration & Servicing</Badge>
                <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">•</span>
                <span className="font-mono text-xs text-[rgba(237,230,214,0.60)]">
                  Requested on{' '}
                  {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-[#EDE6D6] tracking-tight">
                Service #{booking.bookingReference}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/service-tracking?id=${booking.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-mono text-xs uppercase tracking-wider font-semibold shadow-lg transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Service Telemetry</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Status Highlight Banner */}
        <div className="bg-[#141210] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(176,141,87,0.08),transparent_70%)] pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[rgba(176,141,87,0.10)]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08D57] block mb-1">
                Atelier Workshop Status
              </span>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl text-[#EDE6D6]">
                  {SERVICE_STAGES[currentStage]?.label || booking.status.replace(/_/g, ' ')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-[1px] font-mono text-[10px] uppercase tracking-wider bg-[rgba(176,141,87,0.15)] text-[#B08D57] border border-[rgba(176,141,87,0.30)]">
                  {booking.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                  Est. Completion
                </span>
                <span className="font-mono text-sm text-[#EDE6D6] font-semibold">
                  {estimatedCompletion}
                </span>
              </div>

              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                  Payment Status
                </span>
                <span
                  className={`font-mono text-xs uppercase font-medium ${
                    booking.paymentStatus === 'FULLY_PAID' || booking.paymentStatus === 'PAID'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 7-Stage Visual Lifecycle Bar */}
          <div className="pt-8 pb-2">
            <div className="relative">
              <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-[rgba(176,141,87,0.15)] z-0">
                <div
                  className="h-full bg-gradient-to-r from-[#B08D57] to-[#C5A059] transition-all duration-700"
                  style={{
                    width: `${(currentStage / (SERVICE_STAGES.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-6 relative z-10">
                {SERVICE_STAGES.map((stg, idx) => {
                  const isCompleted = idx < currentStage;
                  const isCurrent = idx === currentStage;

                  return (
                    <div
                      key={stg.key}
                      className="flex md:flex-col items-start md:items-center gap-3 md:text-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-[#B08D57] text-[#0E0C0A]'
                            : isCurrent
                            ? 'bg-[#0E0C0A] border-2 border-[#B08D57] text-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.5)]'
                            : 'bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] text-[rgba(237,230,214,0.25)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B08D57] animate-ping" />
                        ) : (
                          <span className="font-mono text-[10px]">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 md:flex-initial">
                        <p
                          className={`font-mono text-xs uppercase tracking-wider ${
                            isCurrent
                              ? 'text-[#B08D57] font-bold'
                              : isCompleted
                              ? 'text-[#EDE6D6] font-medium'
                              : 'text-[rgba(237,230,214,0.30)]'
                          }`}
                        >
                          {stg.label}
                        </p>
                        <p className="text-[10px] text-[rgba(237,230,214,0.45)] mt-0.5 max-w-[120px] md:mx-auto">
                          {stg.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Latest Update Note if available */}
        {booking.notes && (
          <div className="bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-5">
            <div className="flex items-center gap-2 mb-1.5 text-[#B08D57]">
              <FileText className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Latest Atelier Update Note
              </span>
            </div>
            <p className="text-sm text-[#EDE6D6] leading-relaxed pl-6">{booking.notes}</p>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Watch & Service Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Watch Specifications Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[rgba(176,141,87,0.10)]">
                <Watch className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-lg text-[#EDE6D6]">Timepiece Specifications</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Manufacture & Brand
                  </span>
                  <p className="text-[#EDE6D6] font-semibold text-sm mt-0.5">
                    {booking.watchBrand || 'Horological Timepiece'}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Model
                  </span>
                  <p className="text-[#EDE6D6] font-medium text-sm mt-0.5">
                    {booking.watchModel || 'Atelier Registered'}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Reference Number
                  </span>
                  <p className="font-mono text-[#EDE6D6] mt-0.5">
                    {booking.watchReferenceNumber || 'Verified during intake'}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Condition Assessment
                  </span>
                  <p className="text-emerald-400 font-mono mt-0.5">Under Diagnostic Evaluation</p>
                </div>
              </div>

              {booking.issueDescription && (
                <div className="pt-3 border-t border-[rgba(176,141,87,0.08)]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block mb-1">
                    Client Reported Symptoms & Requests
                  </span>
                  <p className="text-xs text-[rgba(237,230,214,0.70)] leading-relaxed bg-[#1E1A17] p-3 rounded-[2px] border border-[rgba(176,141,87,0.08)]">
                    {booking.issueDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Service & Appointment Details Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[rgba(176,141,87,0.10)]">
                <Wrench className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-lg text-[#EDE6D6]">Service Scope & Schedule</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Service Type
                  </span>
                  <p className="text-[#EDE6D6] font-semibold text-sm mt-0.5">
                    {booking.serviceType}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Scheduled Appointment
                  </span>
                  <p className="text-[#EDE6D6] mt-0.5">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    ({booking.scheduledTimeStart} – {booking.scheduledTimeEnd})
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Restoration Cost Estimate
                  </span>
                  <p className="font-mono text-[#B08D57] font-semibold text-base mt-0.5">
                    {formatCurrency(cost)}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                    Settlement Status
                  </span>
                  <p className="font-mono text-xs uppercase text-[#EDE6D6] mt-0.5">
                    {booking.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Milestone History Log */}
            {booking.serviceHistory && booking.serviceHistory.length > 0 && (
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <Clock className="w-4 h-4 text-[#B08D57]" />
                  <h3 className="font-display text-base text-[#EDE6D6]">
                    Service History & Milestones
                  </h3>
                </div>

                <div className="space-y-4 pl-2">
                  {booking.serviceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-2 border-[rgba(176,141,87,0.30)] pl-4 py-1 relative"
                    >
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#B08D57]" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#EDE6D6] font-semibold">
                          {item.serviceType}
                        </span>
                        <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[rgba(237,230,214,0.70)] mt-1">
                        {item.description}
                      </p>
                      <p className="font-mono text-[10px] text-[#B08D57] mt-1">
                        Logged by: {item.technicianName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Horologist & Intake Location */}
          <div className="space-y-6">
            {/* Assigned Master Horologist Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                <User className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-display text-sm text-[#EDE6D6]">Assigned Horologist</h3>
              </div>

              {booking.technician?.user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center font-mono text-sm text-[#B08D57] flex-shrink-0">
                      {booking.technician.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-base text-[#EDE6D6]">
                        {booking.technician.user.name}
                      </p>
                      <p className="font-mono text-[10px] text-[#B08D57] uppercase tracking-wider">
                        Master Horologist · {booking.technician.rating || '4.95'} ★
                      </p>
                    </div>
                  </div>

                  {booking.technician.specializations &&
                    booking.technician.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {booking.technician.specializations.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[1px] font-mono text-[9px] text-[rgba(237,230,214,0.60)]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="pt-2 border-t border-[rgba(176,141,87,0.08)] flex gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 rounded-[2px] font-mono text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {booking.technician.user.phone && (
                      <a
                        href={`tel:${booking.technician.user.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E1A17] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.20)] text-[#B08D57] rounded-[2px] font-mono text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-[rgba(237,230,214,0.50)]">
                    Allocation in progress. An accredited atelier technician will be assigned
                    shortly.
                  </p>
                </div>
              )}
            </div>

            {/* Service Intake / Appointment Location Card */}
            {booking.address && (
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                  <MapPin className="w-4 h-4 text-[#B08D57]" />
                  <h3 className="font-display text-sm text-[#EDE6D6]">Intake Location</h3>
                </div>
                <div className="text-xs space-y-1 text-[rgba(237,230,214,0.70)]">
                  <p className="leading-relaxed">
                    {booking.address.formattedAddress || booking.address.addressLine1}
                  </p>
                  {booking.address.addressLine2 && <p>{booking.address.addressLine2}</p>}
                  <p className="font-mono text-[#B08D57]">
                    {[booking.address.city, booking.address.state, booking.address.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Atelier Guarantee */}
            <div className="bg-[rgba(176,141,87,0.04)] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 text-xs text-[rgba(237,230,214,0.60)] space-y-2">
              <div className="flex items-center gap-2 text-[#B08D57]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                  12-Month Service Warranty
                </span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Every overhaul comes with a 1-year mechanical guarantee and digital acoustic
                amplitude certification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
