'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Users, Eye, ArrowUpRight, ShoppingBag, Wrench, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  joinedDate: string;
  ordersCount: number;
  totalSpent: number;
  bookingsCount: number;
  walletBalance: number;
  city: string;
}

export function AdminCustomersClient({ initialCustomers }: { initialCustomers: CustomerItem[] }) {
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers);
  const [search, setSearch] = React.useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] pl-9 pr-4 py-2 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[rgba(237,230,214,0.50)]">
          <span>Active Collectors: <strong className="text-[#B08D57]">{customers.length}</strong></span>
          <span>Showing: <strong className="text-[#EDE6D6]">{filtered.length}</strong></span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-[rgba(237,230,214,0.40)]">
            No collectors match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(176,141,87,0.10)] bg-[#14110F]/50 text-[9px] font-mono tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                  <th className="px-5 py-3">Collector</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Services</th>
                  <th className="px-5 py-3">Total Spend</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(176,141,87,0.06)] font-mono">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[rgba(176,141,87,0.04)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center font-bold text-xs text-[#B08D57] flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-sans font-medium text-sm text-[#EDE6D6]">{c.name}</p>
                          <span className="text-[9px] text-[rgba(237,230,214,0.40)]">Verified Collector</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[rgba(237,230,214,0.70)]">
                        <Mail className="w-3 h-3 text-[rgba(176,141,87,0.50)]" />
                        <span className="truncate max-w-[170px]">{c.email}</span>
                      </div>
                      {c.phone !== '—' && (
                        <div className="flex items-center gap-1.5 text-[rgba(237,230,214,0.50)]">
                          <Phone className="w-3 h-3 text-[rgba(176,141,87,0.50)]" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[rgba(237,230,214,0.60)]">{c.city}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 bg-[#14110F] border border-[rgba(176,141,87,0.15)] px-2 py-0.5 rounded-[1px] text-[10px] text-[#EDE6D6]">
                        <ShoppingBag className="w-3 h-3 text-[#B08D57]" />
                        <span>{c.ordersCount}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 bg-[#14110F] border border-[rgba(176,141,87,0.15)] px-2 py-0.5 rounded-[1px] text-[10px] text-[#EDE6D6]">
                        <Wrench className="w-3 h-3 text-[#B08D57]" />
                        <span>{c.bookingsCount}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#B08D57] font-semibold">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="px-5 py-4 text-[rgba(237,230,214,0.40)]">
                      {new Date(c.joinedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] text-[10px] text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] rounded-[2px] transition-colors"
                      >
                        <Eye className="w-3 h-3 text-[#B08D57]" />
                        <span>Dossier</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
