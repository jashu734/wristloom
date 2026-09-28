'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import { CheckCircle, MapPin, Eye } from 'lucide-react';

export function Step7Confirmation() {
  const { bookingReference, bookingId, serviceType, reset } = useBookingStore();

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
      </div>

      <span className="text-overline block mb-3">Booking Confirmed</span>
      <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">You&apos;re all set</h2>
      <p className="text-sm text-[rgba(237,230,214,0.55)] mb-6">
        Your {serviceType} booking has been confirmed. A certified Wristloom technician will be assigned shortly.
      </p>

      {bookingReference && (
        <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 mb-6">
          <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-1">Booking Reference</p>
          <p className="font-mono text-xl text-[#B08D57]">{bookingReference}</p>
          <p className="text-xs text-[rgba(237,230,214,0.40)] mt-2">Keep this reference for all communications</p>
        </div>
      )}

      <div className="space-y-3">
        {bookingId && (
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link href={`/service-tracking/${bookingId}`}>
              <MapPin className="w-4 h-4" />
              Track Your Service
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="lg" className="w-full" asChild>
          <Link href="/account">
            <Eye className="w-4 h-4" />
            View in My Account
          </Link>
        </Button>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[rgba(237,230,214,0.35)] hover:text-[rgba(237,230,214,0.60)] underline underline-offset-4 transition-colors mt-2"
        >
          Book another service
        </button>
      </div>
    </div>
  );
}
