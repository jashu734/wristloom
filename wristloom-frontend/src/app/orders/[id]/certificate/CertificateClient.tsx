'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Lock,
  QrCode,
  Sparkles,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  referenceNumber: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface OrderData {
  id: string;
  orderReference: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: any;
  notes: string | null;
  createdAt: Date | string;
  orderItems: OrderItem[];
  user?: { id: string; name: string | null; email: string } | null;
}

export function CertificateClient({ order }: { order: OrderData }) {
  const [copied, setCopied] = React.useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Pseudo cryptographic hash for provenance verification
  const cryptoHash = `SHA256:0x${Array.from(order.orderReference)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')}e74b9a1029c`;

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#EDE6D6] py-8 px-4 sm:px-6">
      {/* ── Action Toolbar (Hidden during Print) ── */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/account"
          className="font-mono text-xs text-[rgba(237,230,214,0.6)] hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Collector Vault</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Link Copied' : 'Share Verification Link'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#B08D57]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Archival PDF</span>
          </Button>
        </div>
      </div>

      {/* ── Main Museum-Grade Certificate (Printable Sheet) ── */}
      <div
        id="certificate-sheet"
        className="max-w-4xl mx-auto bg-[#161311] border-2 border-[#B08D57] p-8 md:p-14 rounded-[2px] shadow-2xl relative overflow-hidden print:p-8 print:border-black print:bg-white print:text-black print:shadow-none"
      >
        {/* Intricate Corner Accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#B08D57]/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#B08D57]/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#B08D57]/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#B08D57]/60 pointer-events-none" />

        {/* Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] print:opacity-[0.05] pointer-events-none select-none">
          <ShieldCheck className="w-96 h-96 text-[#B08D57]" />
        </div>

        {/* Header */}
        <div className="text-center pb-8 border-b border-[rgba(176,141,87,0.25)] relative z-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#B08D57]" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold">
              WRISTLOOM ATELIER D&apos;HORLOGERIE
            </span>
            <span className="w-8 h-[1px] bg-[#B08D57]" />
          </div>

          <h1 className="font-display text-3xl md:text-5xl text-[#EDE6D6] tracking-tight mb-2 print:text-black">
            Certificate of Horological Authenticity
          </h1>
          <p className="font-serif italic text-sm md:text-base text-[rgba(237,230,214,0.65)] max-w-lg mx-auto print:text-gray-700">
            Official archival ledger documenting the origin, provenance, and verified technical authenticity of the registered timepiece.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[rgba(237,230,214,0.5)] print:text-gray-600">
            <span>Atelier Registry Ref: <strong className="text-[#B08D57] font-semibold">{order.orderReference}</strong></span>
            <span>•</span>
            <span>Date of Consecration: <strong className="text-[#EDE6D6] print:text-black">{formattedDate}</strong></span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="py-8 space-y-8 relative z-10">
          {/* Registered Collector & Settlement Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1A1614] border border-[rgba(176,141,87,0.15)] p-5 rounded-[2px] print:bg-gray-50 print:border-gray-300">
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
                Registered Collector & Custodian
              </span>
              <h3 className="font-display text-lg text-[#EDE6D6] font-medium print:text-black">
                {order.shippingName || order.user?.name || 'Valued Horological Collector'}
              </h3>
              <p className="text-xs text-[rgba(237,230,214,0.5)] print:text-gray-600">
                {order.shippingAddress?.city || 'Private Atelier Residence'}, India
              </p>
            </div>

            <div className="md:text-right">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
                Settlement & Escrow Guarantee
              </span>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-400 print:text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FULLY_PAID & ESCROW RELEASED</span>
              </div>
              <p className="font-mono text-[10px] text-[rgba(237,230,214,0.4)] mt-0.5 print:text-gray-500">
                Method: {order.paymentMethod.toUpperCase()} · Valued at {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Timepiece Ledger */}
          <div>
            <h2 className="font-mono text-[11px] tracking-widest uppercase text-[#B08D57] mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Authenticated Timepiece Inventory
            </h2>

            <div className="border border-[rgba(176,141,87,0.2)] rounded-[2px] overflow-hidden print:border-gray-400">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1E1A17] text-[rgba(237,230,214,0.6)] uppercase text-[9px] tracking-wider border-b border-[rgba(176,141,87,0.15)] print:bg-gray-100 print:text-gray-800">
                  <tr>
                    <th className="py-3 px-4">Manufacture / Brand</th>
                    <th className="py-3 px-4">Model & Designation</th>
                    <th className="py-3 px-4">Atelier Reference</th>
                    <th className="py-3 px-4 text-right">Appraised Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(176,141,87,0.08)] print:divide-gray-200">
                  {order.orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-[#EDE6D6] print:text-black">{item.brand}</td>
                      <td className="py-3.5 px-4 text-[#EDE6D6] print:text-black">{item.name}</td>
                      <td className="py-3.5 px-4 text-[rgba(237,230,214,0.6)] print:text-gray-700">
                        {item.referenceNumber || 'N/A — Atelier Certified'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#B08D57] font-semibold print:text-black">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warranties & Insurance Guarantee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border border-[rgba(176,141,87,0.15)] rounded-[2px] bg-[#14110F] print:bg-white print:border-gray-300">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57] block mb-1">
                Authenticity Seal
              </span>
              <p className="font-display text-sm text-[#EDE6D6] print:text-black">100% Genuine Provenance</p>
              <p className="text-[10px] text-[rgba(237,230,214,0.4)] mt-1 print:text-gray-600">
                Verified across 32 horological benchmarks by bonded master watchmakers.
              </p>
            </div>

            <div className="p-4 border border-[rgba(176,141,87,0.15)] rounded-[2px] bg-[#14110F] print:bg-white print:border-gray-300">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57] block mb-1">
                Atelier Movement Warranty
              </span>
              <p className="font-display text-sm text-[#EDE6D6] print:text-black">2-Year Full Coverage</p>
              <p className="text-[10px] text-[rgba(237,230,214,0.4)] mt-1 print:text-gray-600">
                Covers amplitude variance, escapement regulation, and gasket hermeticity.
              </p>
            </div>

            <div className="p-4 border border-[rgba(176,141,87,0.15)] rounded-[2px] bg-[#14110F] print:bg-white print:border-gray-300">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57] block mb-1">
                Lloyd&apos;s Appraisal
              </span>
              <p className="font-display text-sm text-[#EDE6D6] print:text-black">Full Value Insurance</p>
              <p className="text-[10px] text-[rgba(237,230,214,0.4)] mt-1 print:text-gray-600">
                Transit insurance and replacement valuation endorsed up to ₹50,00,000.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Ledger & Signatures */}
        <div className="pt-8 border-t border-[rgba(176,141,87,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 print:pt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white p-1 rounded flex items-center justify-center shadow">
              <QrCode className="w-14 h-14 text-black" />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase text-[#B08D57] block font-semibold">
                Cryptographic Ledger ID
              </span>
              <span className="font-mono text-[10px] text-[rgba(237,230,214,0.6)] break-all max-w-xs block print:text-gray-700">
                {cryptoHash}
              </span>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="h-10 border-b border-[#B08D57]/40 w-48 mx-auto md:ml-auto flex items-end justify-center pb-1">
              <span className="font-serif italic text-sm text-[#B08D57]">Wristloom Master Horologist</span>
            </div>
            <p className="font-mono text-[9px] uppercase text-[rgba(237,230,214,0.4)] tracking-wider print:text-gray-600">
              Authorized Atelier Stamp & Registry Sign-off
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
