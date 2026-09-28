'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { format } from 'date-fns';
import { Wrench, MapPin, Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Step5Review() {
  const {
    serviceType, estimatedPrice, depositAmount,
    watchBrand, watchModel, watchReferenceNumber, issueDescription, issueImages,
    address, scheduledDate, scheduledTimeStart, timeSlotLabel,
    setStep,
  } = useBookingStore();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 5 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Review Your Booking</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          Confirm all details before proceeding to payment.
        </p>
      </div>

      <div className="space-y-4">
        {/* Service */}
        <ReviewSection icon={<Wrench className="w-4 h-4 text-[#B08D57]" />} title="Service">
          <p className="text-sm text-[#EDE6D6]">{serviceType}</p>
          <p className="font-mono text-xs text-[rgba(237,230,214,0.50)] mt-0.5">
            Estimated: {formatCurrency(estimatedPrice)}
          </p>
          {watchBrand && (
            <p className="text-xs text-[rgba(237,230,214,0.50)] mt-2">
              {watchBrand} {watchModel} {watchReferenceNumber ? `· Ref. ${watchReferenceNumber}` : ''}
            </p>
          )}
          {issueDescription && (
            <p className="text-xs text-[rgba(237,230,214,0.40)] mt-1 leading-relaxed">{issueDescription}</p>
          )}
          {issueImages.length > 0 && (
            <div className="flex gap-2 mt-2">
              {issueImages.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-[2px] border border-[rgba(176,141,87,0.15)]" />
              ))}
            </div>
          )}
        </ReviewSection>

        {/* Address */}
        {address && (
          <ReviewSection icon={<MapPin className="w-4 h-4 text-[#B08D57]" />} title="Service Address">
            <p className="text-sm text-[#EDE6D6]">{address.fullName}</p>
            <p className="text-xs text-[rgba(237,230,214,0.55)] mt-0.5">{address.formattedAddress}</p>
            {address.addressLine2 && (
              <p className="text-xs text-[rgba(237,230,214,0.45)]">{address.addressLine2}</p>
            )}
            <p className="text-xs text-[rgba(237,230,214,0.40)] mt-1">{address.phone}</p>
          </ReviewSection>
        )}

        {/* Date/Time */}
        {scheduledDate && (
          <ReviewSection icon={<Calendar className="w-4 h-4 text-[#B08D57]" />} title="Appointment">
            <p className="text-sm text-[#EDE6D6]">
              {format(new Date(scheduledDate + 'T12:00:00'), 'EEEE, d MMMM yyyy')}
            </p>
            <p className="text-xs text-[rgba(237,230,214,0.55)] mt-0.5">{timeSlotLabel}</p>
          </ReviewSection>
        )}

        {/* Payment breakdown */}
        <div className="bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-3">Payment</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[rgba(237,230,214,0.60)]">Estimated service cost</span>
              <span className="text-[rgba(237,230,214,0.70)]">{formatCurrency(estimatedPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-[#EDE6D6]">Deposit due now (30%)</span>
              <span className="text-[#B08D57]">{formatCurrency(depositAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-[rgba(237,230,214,0.40)] pt-2 border-t border-[rgba(176,141,87,0.10)]">
              <span>Remaining balance</span>
              <span>Due on completion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="ghost" size="lg" onClick={() => setStep(4)} className="flex-1">Back</Button>
        <Button type="button" variant="primary" size="lg" onClick={() => setStep(6)} className="flex-1">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">{title}</span>
      </div>
      {children}
    </div>
  );
}
