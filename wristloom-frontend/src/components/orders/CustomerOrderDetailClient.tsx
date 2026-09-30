'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Shield,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  referenceNumber?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  strapOption?: any;
}

interface TimelineEvent {
  status: string;
  title: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

interface OrderData {
  id: string;
  orderReference: string;
  userId?: string | null;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID' | 'REFUNDED' | string;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: any;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  trackingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    dispatchNotes?: string;
    subStatus?: string;
    events?: TimelineEvent[];
  } | null;
}

interface CustomerOrderDetailProps {
  order: OrderData;
  initialTab?: 'details' | 'tracking';
}

const STAGES = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Acquisition request received' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & vault logged' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Inspection & calibration' },
  { key: 'PACKED', label: 'Packed', desc: 'Sealed in tamper-evident vault box' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'In transit with armored courier' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier en route to your address' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Securely handed over & signed' },
];

function getStageIndex(status: string, subStatus?: string): number {
  if (status === 'DELIVERED') return 6;
  if (subStatus === 'OUT_FOR_DELIVERY') return 5;
  if (status === 'SHIPPED') return 4;
  if (subStatus === 'PACKED') return 3;
  if (status === 'PROCESSING') return 2;
  if (status === 'CONFIRMED') return 1;
  return 0; // PENDING
}

export function CustomerOrderDetailClient({ order, initialTab = 'details' }: CustomerOrderDetailProps) {
  const [activeTab, setActiveTab] = React.useState<'details' | 'tracking'>(initialTab);
  const [copied, setCopied] = React.useState(false);

  const tracking = order.trackingInfo;
  const currentStageIndex = getStageIndex(order.status, tracking?.subStatus);

  const trackingNumber =
    tracking?.trackingNumber || `WLTRK${order.orderReference.replace(/[^0-9]/g, '') || '982341'}`;
  const carrier = tracking?.carrier || 'BlueDart Apex Armored Logistics';
  const estimatedDelivery =
    tracking?.estimatedDelivery ||
    new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
      'en-IN',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const address = order.shippingAddress || {};

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
                <Badge variant="brass">Watch Acquisition</Badge>
                <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">•</span>
                <span className="font-mono text-xs text-[rgba(237,230,214,0.60)]">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-[#EDE6D6] tracking-tight">
                Order #{order.orderReference}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/orders/${order.orderReference}/certificate`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[2px] bg-[rgba(176,141,87,0.12)] border border-[rgba(176,141,87,0.30)] text-[#B08D57] hover:bg-[#B08D57] hover:text-[#0E0C0A] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Certificate of Authenticity</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-[rgba(176,141,87,0.12)] pb-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-[2px] transition-colors ${
              activeTab === 'details'
                ? 'bg-[rgba(176,141,87,0.15)] text-[#B08D57] border border-[rgba(176,141,87,0.30)]'
                : 'text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]'
            }`}
          >
            Order Details
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-[2px] transition-colors flex items-center gap-2 ${
              activeTab === 'tracking'
                ? 'bg-[rgba(176,141,87,0.15)] text-[#B08D57] border border-[rgba(176,141,87,0.30)]'
                : 'text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Shipment</span>
            {order.status === 'SHIPPED' && (
              <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />
            )}
          </button>
        </div>

        {/* ─── FOCUSED TRACKING VIEW ────────────────────────────── */}
        {activeTab === 'tracking' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Shipment Telemetry Card */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(176,141,87,0.08),transparent_70%)] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[rgba(176,141,87,0.10)]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08D57] block mb-1">
                    White-Glove Courier Telemetry
                  </span>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl text-[#EDE6D6]">
                      Status:{' '}
                      <span className="text-[#B08D57]">
                        {STAGES[currentStageIndex]?.label || order.status}
                      </span>
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-[1px] font-mono text-[10px] uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                      Estimated Delivery
                    </span>
                    <span className="font-mono text-sm text-[#EDE6D6] font-semibold">
                      {estimatedDelivery}
                    </span>
                  </div>

                  <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.12)] px-4 py-2.5 rounded-[2px]">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">
                      Carrier
                    </span>
                    <span className="font-sans text-xs text-[#EDE6D6] font-medium">{carrier}</span>
                  </div>
                </div>
              </div>

              {/* Tracking ID Row */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(176,141,87,0.10)]">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#B08D57]" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.45)] block">
                      Consignment Tracking Code
                    </span>
                    <span className="font-mono text-base text-[#EDE6D6] font-bold tracking-wide">
                      {trackingNumber}
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyTracking}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1A17] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.20)] rounded-[2px] font-mono text-[10px] uppercase text-[#B08D57] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Number'}</span>
                </button>
              </div>

              {/* 7-Stage Visual Timeline Progression */}
              <div className="pt-8 pb-4">
                <div className="relative">
                  {/* Progress Line Desktop */}
                  <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-[rgba(176,141,87,0.15)] z-0">
                    <div
                      className="h-full bg-gradient-to-r from-[#B08D57] to-[#C5A059] transition-all duration-700"
                      style={{
                        width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Stage Points */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-6 relative z-10">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      const isPending = idx > currentStageIndex;

                      return (
                        <div
                          key={stage.key}
                          className="flex md:flex-col items-start md:items-center gap-3 md:text-center"
                        >
                          {/* Node Icon / Indicator */}
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

                          {/* Stage Text */}
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
                              {stage.label}
                            </p>
                            <p className="text-[10px] text-[rgba(237,230,214,0.45)] mt-0.5 max-w-[120px] md:mx-auto">
                              {stage.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Event History Log */}
            {tracking?.events && tracking.events.length > 0 && (
              <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <Clock className="w-4 h-4 text-[#B08D57]" />
                  <h3 className="font-display text-base text-[#EDE6D6]">Dispatch Event Log</h3>
                </div>

                <div className="space-y-4 pl-2">
                  {tracking.events.map((evt, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-[rgba(176,141,87,0.30)] pl-4 py-1 relative"
                    >
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#B08D57]" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#EDE6D6] font-semibold">
                          {evt.title}
                        </span>
                        <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                          {new Date(evt.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {evt.note && (
                        <p className="text-xs text-[rgba(237,230,214,0.60)] mt-1">{evt.note}</p>
                      )}
                      {evt.updatedBy && (
                        <p className="font-mono text-[9px] text-[#B08D57] mt-0.5">
                          Logged by: {evt.updatedBy}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STANDARD ORDER DETAILS VIEW ───────────────────────── */}
        {activeTab === 'details' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Status Summary & Quick Track Banner */}
            <div className="bg-[#141210] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(176,141,87,0.12)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center text-[#B08D57]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[rgba(237,230,214,0.40)]">
                    Current Fulfillment State
                  </p>
                  <p className="font-display text-lg text-[#EDE6D6]">
                    {STAGES[currentStageIndex]?.label || order.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('tracking')}>
                  <Truck className="w-4 h-4 mr-1.5" />
                  <span>Track Consignment</span>
                </Button>
              </div>
            </div>

            {/* Main Details Grid: Items + Destination + Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items Card (2 cols) */}
              <div className="lg:col-span-2 bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <h3 className="font-display text-lg text-[#EDE6D6]">
                    Acquired Timepieces ({order.orderItems?.length || 0})
                  </h3>
                  <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">
                    Certified Horology
                  </span>
                </div>

                <div className="divide-y divide-[rgba(176,141,87,0.08)]">
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      {item.imageUrl ? (
                        <div className="w-20 h-20 bg-[#14110F] border border-[rgba(176,141,87,0.18)] rounded-[2px] overflow-hidden flex-shrink-0 relative p-1.5 flex items-center justify-center">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] flex items-center justify-center text-[rgba(176,141,87,0.40)] flex-shrink-0">
                          <Package className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[10px] text-[#B08D57] uppercase tracking-widest block">
                          {item.brand}
                        </span>
                        <h4 className="font-display text-base text-[#EDE6D6] truncate">
                          {item.name}
                        </h4>
                        {item.referenceNumber && (
                          <p className="font-mono text-[11px] text-[rgba(237,230,214,0.40)] mt-0.5">
                            Ref: {item.referenceNumber}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(176,141,87,0.06)]">
                          <span className="font-mono text-xs text-[rgba(237,230,214,0.50)]">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-mono text-sm text-[#EDE6D6] font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-[rgba(176,141,87,0.12)] space-y-2">
                  <div className="flex justify-between text-xs text-[rgba(237,230,214,0.60)]">
                    <span>Atelier Subtotal</span>
                    <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[rgba(237,230,214,0.60)]">
                    <span>Armored Courier & Transit Vault Insurance</span>
                    <span className="font-mono text-[#B08D57]">Complimentary (₹0)</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[rgba(176,141,87,0.10)] text-[#EDE6D6]">
                    <span>Total Settlement</span>
                    <span className="font-mono text-[#B08D57]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Cards: Shipping & Payment */}
              <div className="space-y-6">
                {/* Shipping Card */}
                <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                    <MapPin className="w-4 h-4 text-[#B08D57]" />
                    <h3 className="font-display text-sm text-[#EDE6D6]">Delivery Destination</h3>
                  </div>
                  <div className="text-xs space-y-1 text-[rgba(237,230,214,0.70)]">
                    <p className="font-semibold text-[#EDE6D6]">{order.shippingName}</p>
                    <p>{address.addressLine || address.addressLine1 || 'Concierge Delivery'}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                    </p>
                    <p className="font-mono text-[11px] text-[rgba(237,230,214,0.45)] pt-1">
                      Phone: {order.shippingPhone}
                    </p>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="bg-[#141210] border border-[rgba(176,141,87,0.12)] rounded-[2px] p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
                    <CreditCard className="w-4 h-4 text-[#B08D57]" />
                    <h3 className="font-display text-sm text-[#EDE6D6]">Settlement Dossier</h3>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[rgba(237,230,214,0.50)]">Method</span>
                      <span className="font-mono uppercase text-[#EDE6D6]">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[rgba(237,230,214,0.50)]">Payment Status</span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-[1px] uppercase ${
                          order.paymentStatus === 'PAID' || order.paymentStatus === 'FULLY_PAID'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assurance Card */}
                <div className="bg-[rgba(176,141,87,0.04)] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 text-xs text-[rgba(237,230,214,0.60)] space-y-2">
                  <div className="flex items-center gap-2 text-[#B08D57]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                      Atelier Assurance
                    </span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    All acquisitions include 24-month worldwide warranty coverage and complimentary
                    first periodic overhaul.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
