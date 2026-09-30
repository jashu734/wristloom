'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Wrench,
  Watch,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CustomerDetailClientProps {
  customer: any;
}

export function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  const [activeTab, setActiveTab] = React.useState<'orders' | 'services' | 'vault' | 'addresses'>('orders');

  const totalSpent = (customer.orders || [])
    .filter((o: any) => o.paymentStatus === 'PAID' || o.paymentStatus === 'DEPOSIT_PAID')
    .reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#B08D57]">Customer Dossier</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.30)]">•</span>
              <span className="font-mono text-xs text-[rgba(237,230,214,0.50)]">
                Member since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-display text-2xl text-[#EDE6D6]">{customer.name || 'Anonymous Collector'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] text-right">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(237,230,214,0.40)] block">
              Lifetime Spend
            </span>
            <span className="font-display text-base text-[#B08D57]">{formatCurrency(totalSpent)}</span>
          </div>
        </div>
      </div>

      {/* Info Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[rgba(176,141,87,0.10)] text-[#B08D57]">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">Email Address</span>
            <p className="text-xs text-[#EDE6D6] font-mono truncate">{customer.email}</p>
          </div>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[rgba(176,141,87,0.10)] text-[#B08D57]">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">Phone Contact</span>
            <p className="text-xs text-[#EDE6D6] font-mono">{customer.phone || '—'}</p>
          </div>
        </div>

        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[rgba(176,141,87,0.10)] text-[#B08D57]">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.40)] block">Wallet Credit</span>
            <p className="text-xs text-[#B08D57] font-mono font-semibold">
              {formatCurrency(customer.creditWallet?.balance ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[rgba(176,141,87,0.15)] gap-2">
        {[
          { id: 'orders', label: `Acquisitions (${customer.orders?.length || 0})`, icon: ShoppingBag },
          { id: 'services', label: `Atelier Bookings (${customer.bookingsAsCustomer?.length || 0})`, icon: Wrench },
          { id: 'vault', label: `Watch Vault (${customer.watchVaultItems?.length || 0})`, icon: Watch },
          { id: 'addresses', label: `Addresses (${customer.addresses?.length || 0})`, icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                active
                  ? 'border-[#B08D57] text-[#B08D57] font-semibold bg-[rgba(176,141,87,0.05)]'
                  : 'border-transparent text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 shadow-xl">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {(!customer.orders || customer.orders.length === 0) ? (
              <p className="text-center text-xs font-mono text-[rgba(237,230,214,0.40)] py-8">
                No orders recorded for this collector.
              </p>
            ) : (
              <div className="divide-y divide-[rgba(176,141,87,0.08)]">
                {customer.orders.map((o: any) => (
                  <div key={o.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#EDE6D6] font-medium">#{o.orderReference}</span>
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded-[1px] bg-[rgba(176,141,87,0.10)] text-[#B08D57] border border-[rgba(176,141,87,0.20)]">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-[rgba(237,230,214,0.50)] mt-1">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.orderItems?.length || 0} timepiece(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display text-sm text-[#B08D57]">{formatCurrency(o.totalAmount || 0)}</span>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="px-2.5 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[10px] font-mono uppercase text-[#EDE6D6] rounded-[2px]"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {(!customer.bookingsAsCustomer || customer.bookingsAsCustomer.length === 0) ? (
              <p className="text-center text-xs font-mono text-[rgba(237,230,214,0.40)] py-8">
                No atelier services booked yet.
              </p>
            ) : (
              <div className="divide-y divide-[rgba(176,141,87,0.08)]">
                {customer.bookingsAsCustomer.map((b: any) => (
                  <div key={b.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#EDE6D6] font-medium">#{b.bookingReference}</span>
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded-[1px] bg-amber-950/40 text-amber-300 border border-amber-900/40">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-[rgba(237,230,214,0.60)] mt-1">
                        {b.watchBrand || 'Horology'} {b.watchModel || ''} — {b.serviceType}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[rgba(237,230,214,0.40)]">
                        {new Date(b.scheduledDate).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/admin/service-bookings/${b.id}`}
                        className="px-2.5 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[10px] font-mono uppercase text-[#EDE6D6] rounded-[2px]"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vault Tab */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            {(!customer.watchVaultItems || customer.watchVaultItems.length === 0) ? (
              <p className="text-center text-xs font-mono text-[rgba(237,230,214,0.40)] py-8">
                Collector has not registered any timepieces in their private vault.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.watchVaultItems.map((v: any) => (
                  <div key={v.id} className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px]">
                    <span className="font-mono text-[9px] uppercase text-[#B08D57] block">{v.brand}</span>
                    <p className="text-sm font-medium text-[#EDE6D6]">{v.watchName}</p>
                    {v.referenceNumber && (
                      <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] mt-1">Ref: {v.referenceNumber}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[rgba(237,230,214,0.50)] pt-2 border-t border-[rgba(176,141,87,0.08)]">
                      <span>Condition: {v.healthStatus}</span>
                      <span>Serial: {v.serialNumber || 'Confidential'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {(!customer.addresses || customer.addresses.length === 0) ? (
              <p className="text-center text-xs font-mono text-[rgba(237,230,214,0.40)] py-8">
                No delivery addresses on file.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.addresses.map((a: any) => (
                  <div key={a.id} className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] text-xs space-y-1">
                    <p className="font-medium text-[#EDE6D6]">{a.fullName}</p>
                    <p className="text-[rgba(237,230,214,0.60)]">{a.addressLine1}</p>
                    {a.addressLine2 && <p className="text-[rgba(237,230,214,0.60)]">{a.addressLine2}</p>}
                    <p className="font-mono text-[rgba(237,230,214,0.40)]">
                      {a.city}, {a.state} {a.postalCode}, {a.country}
                    </p>
                    <p className="font-mono text-[rgba(237,230,214,0.50)] pt-1">Phone: {a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
