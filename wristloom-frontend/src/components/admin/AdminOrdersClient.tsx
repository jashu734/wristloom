'use client';

import * as React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Search, Loader2, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  referenceNumber: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderReference: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: any;
  createdAt: string | Date;
  orderItems: OrderItem[];
  user?: { id: string; name: string | null; email: string } | null;
}

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const PAYMENT_STATUSES = [
  'UNPAID',
  'DEPOSIT_PAID',
  'FULLY_PAID',
  'REFUNDED',
];

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [search, setSearch] = React.useState('');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchRef = o.orderReference.toLowerCase().includes(q);
      const matchName = o.shippingName.toLowerCase().includes(q);
      const matchEmail = o.shippingEmail.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchEmail) return false;
    }
    return true;
  });

  async function updateOrderStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: data.order.status } : o)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePaymentStatus(id: string, paymentStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: data.order.paymentStatus } : o)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(237,230,214,0.30)]" />
          <input
            type="text"
            placeholder="Search orders by reference, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] pl-9 pr-4 py-2 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-[1px] border transition-colors ${
                filterStatus === st
                  ? 'border-[#B08D57] bg-[rgba(176,141,87,0.15)] text-[#B08D57]'
                  : 'border-[rgba(176,141,87,0.10)] bg-[#1E1A17] text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[rgba(176,141,87,0.10)] bg-[rgba(20,17,15,0.40)]">
                {['Reference', 'Customer & Address', 'Items Ordered', 'Total', 'Payment', 'Order Status'].map((h) => (
                  <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(176,141,87,0.06)]">
              {filtered.map((order) => {
                const isUpdating = updatingId === order.id;
                const addr = typeof order.shippingAddress === 'object' ? order.shippingAddress : {};
                return (
                  <tr key={order.id} className="hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-[#B08D57]">{order.orderReference}</span>
                        {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />}
                      </div>
                      <p className="font-mono text-[10px] text-[rgba(237,230,214,0.30)] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <p className="text-[#EDE6D6] font-medium">{order.shippingName}</p>
                      <p className="text-xs text-[rgba(237,230,214,0.45)]">{order.shippingEmail}</p>
                      <p className="text-xs text-[rgba(237,230,214,0.40)]">{order.shippingPhone}</p>
                      <p className="text-[11px] text-[rgba(237,230,214,0.35)] mt-1 max-w-xs truncate">
                        {addr.addressLine}, {addr.city} {addr.postalCode ? `· ${addr.postalCode}` : ''}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="text-xs text-[rgba(237,230,214,0.70)]">
                            <span className="font-mono text-[#B08D57] font-medium">{item.brand}</span> {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top font-mono text-sm text-[#EDE6D6] font-semibold whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        disabled={isUpdating}
                        className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded px-2 py-1 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      >
                        {PAYMENT_STATUSES.map((ps) => (
                          <option key={ps} value={ps}>{ps.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <p className="font-mono text-[9px] text-[rgba(237,230,214,0.30)] uppercase tracking-wider mt-1">
                        Via {order.paymentMethod}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isUpdating}
                        className="bg-[#14110F] border border-[#B08D57]/40 rounded px-2 py-1 text-xs font-semibold text-[#B08D57] focus:border-[#B08D57] focus:outline-none"
                      >
                        {ORDER_STATUSES.map((os) => (
                          <option key={os} value={os}>{os}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
