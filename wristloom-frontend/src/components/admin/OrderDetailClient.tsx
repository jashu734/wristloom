'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { formatCurrency } from '@/lib/utils';

interface OrderDetailProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = React.useState(initialOrder);
  const [status, setStatus] = React.useState(initialOrder.status);
  const [paymentStatus, setPaymentStatus] = React.useState(initialOrder.paymentStatus);

  // Initialize tracking fields from trackingInfo or notes
  let initialTracking: any = initialOrder.trackingInfo;
  if (!initialTracking && initialOrder.notes) {
    try {
      if (initialOrder.notes.startsWith('{')) initialTracking = JSON.parse(initialOrder.notes);
    } catch {}
  }

  const [trackingNumber, setTrackingNumber] = React.useState<string>(
    initialTracking?.trackingNumber || `WLTRK${initialOrder.orderReference?.replace(/[^0-9]/g, '') || '982341'}`
  );
  const [carrier, setCarrier] = React.useState<string>(
    initialTracking?.carrier || 'BlueDart Apex Armored Courier'
  );
  const [estimatedDelivery, setEstimatedDelivery] = React.useState<string>(
    initialTracking?.estimatedDelivery || ''
  );
  const [dispatchNotes, setDispatchNotes] = React.useState<string>(
    initialTracking?.dispatchNotes || ''
  );

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber,
          carrier,
          estimatedDelivery,
          dispatchNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update order status' });
        return;
      }

      setOrder(data.order);
      setMessage({ type: 'success', text: 'Order status & consignment tracking updated. Customer notified.' });
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Network error updating order.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const address = order.shippingAddress || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#B08D57]">Order Record</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.30)]">•</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.50)]">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h1 className="font-display text-2xl text-[#EDE6D6]">#{order.orderReference}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-xs font-mono uppercase tracking-wider text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] rounded-[2px] transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[2px] border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Primary Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <User className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Collector Profile</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] block">
                Full Name
              </span>
              <span className="text-[#EDE6D6] font-medium">{order.shippingName || order.user?.name || '—'}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] block">
                Email
              </span>
              <span className="font-mono text-[rgba(237,230,214,0.80)]">{order.shippingEmail || order.user?.email || '—'}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] block">
                Contact Phone
              </span>
              <span className="font-mono text-[rgba(237,230,214,0.80)]">{order.shippingPhone || '—'}</span>
            </div>
            {order.userId && (
              <div className="pt-2">
                <Link
                  href={`/admin/customers/${order.userId}`}
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-[#B08D57] hover:underline"
                >
                  <span>View Customer Dossier →</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <MapPin className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Delivery Address</h2>
          </div>
          <div className="space-y-2 text-xs text-[rgba(237,230,214,0.80)]">
            <p className="leading-relaxed">
              {address.addressLine || address.addressLine1 || 'Concierge Courier Dispatch'}
            </p>
            {address.addressLine2 && <p className="leading-relaxed">{address.addressLine2}</p>}
            <p className="font-mono">
              {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
            </p>
            <p className="font-mono text-[#B08D57]">{address.country || 'India'}</p>
          </div>
        </div>

        {/* Payment & Settlement */}
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
            <CreditCard className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Payment & Settlement</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.40)]">Total Value</span>
              <span className="font-display text-base text-[#B08D57]">{formatCurrency(order.totalAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.40)]">Payment Method</span>
              <span className="font-mono text-[11px] text-[#EDE6D6] uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.40)]">Payment Status</span>
              <span
                className={`px-2 py-0.5 text-[9px] font-mono rounded-[1px] uppercase tracking-wider ${
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
      </div>

      {/* Status & Consignment Management Bar */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[rgba(176,141,87,0.10)] pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#B08D57]" />
            <h2 className="font-display text-base text-[#EDE6D6]">Fulfillment & Consignment Telemetry</h2>
          </div>
          <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">Admin Control</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Fulfillment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="PENDING">PENDING (Order Placed)</option>
              <option value="CONFIRMED">CONFIRMED (Order Confirmed)</option>
              <option value="PROCESSING">PROCESSING (Vault Retrieval)</option>
              <option value="SHIPPED">SHIPPED (In Transit)</option>
              <option value="DELIVERED">DELIVERED (Signed For)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Payment Settlement
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            >
              <option value="UNPAID">UNPAID</option>
              <option value="DEPOSIT_PAID">DEPOSIT_PAID</option>
              <option value="PAID">PAID / FULLY_PAID</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Consignment Tracking Code
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. WLTRK123456789"
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Armored Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. BlueDart Apex Armored Logistics"
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Estimated Delivery Date
            </label>
            <input
              type="text"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g. 05 Oct 2026"
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-1">
              Dispatch Update Note (Customer-Visible)
            </label>
            <input
              type="text"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Timepiece inspected, sealed in vault box, handed to courier."
              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Progression Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(176,141,87,0.10)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.40)] mr-1">Quick Stage:</span>
            <button
              type="button"
              onClick={() => setStatus('PROCESSING')}
              className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#14110F] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.80)] rounded-[2px]"
            >
              → Processing
            </button>
            <button
              type="button"
              onClick={() => setStatus('SHIPPED')}
              className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#14110F] hover:bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.20)] text-[#B08D57] rounded-[2px]"
            >
              → Shipped
            </button>
            <button
              type="button"
              onClick={() => setStatus('DELIVERED')}
              className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#14110F] hover:bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-[2px]"
            >
              ✓ Delivered
            </button>
          </div>

          <Button onClick={handleUpdate} variant="primary" size="md" loading={isUpdating}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save & Notify Customer</span>
          </Button>
        </div>
      </div>

      {/* Purchased Timepieces */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[rgba(176,141,87,0.10)]">
          <ShoppingBag className="w-4 h-4 text-[#B08D57]" />
          <h2 className="font-display text-lg text-[#EDE6D6]">Purchased Timepieces</h2>
        </div>

        <div className="divide-y divide-[rgba(176,141,87,0.08)]">
          {order.orderItems?.map((item: any) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <div className="w-14 h-14 rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.20)] bg-[#14110F] p-1 flex items-center justify-center flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.20)] flex items-center justify-center flex-shrink-0 text-[#B08D57]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#EDE6D6]">{item.name}</p>
                  <p className="font-mono text-xs text-[#B08D57]">{item.brand}</p>
                  {item.referenceNumber && (
                    <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">Ref: {item.referenceNumber}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-display text-base text-[#EDE6D6]">{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                  Qty: {item.quantity} × {formatCurrency(item.price || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
