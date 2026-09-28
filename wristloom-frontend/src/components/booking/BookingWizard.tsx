'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Step1ServiceSelect } from './Step1ServiceSelect';
import { Step2WatchDetails } from './Step2WatchDetails';
import { Step3Address } from './Step3Address';
import { Step4DateTime } from './Step4DateTime';
import { Step5Review } from './Step5Review';
import { Step6Payment } from './Step6Payment';
import { Step7Confirmation } from './Step7Confirmation';
import { CheckCircle } from 'lucide-react';

const STEPS = [
  'Service',
  'Watch Details',
  'Address',
  'Date & Time',
  'Review',
  'Payment',
  'Confirmed',
];

export function BookingWizard() {
  const step = useBookingStore((s) => s.step);

  return (
    <div className="min-h-screen bg-[#14110F]">
      {/* Progress Header */}
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] sticky top-0 z-30">
        <div className="container-wl py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <React.Fragment key={n}>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done
                        ? 'bg-[#B08D57]'
                        : active
                          ? 'bg-[rgba(176,141,87,0.15)] border border-[#B08D57]'
                          : 'bg-[rgba(237,230,214,0.06)] border border-[rgba(237,230,214,0.12)]'
                        }`}
                    >
                      {done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#14110F]" />
                      ) : (
                        <span className={`font-mono text-[9px] ${active ? 'text-[#B08D57]' : 'text-[rgba(237,230,214,0.30)]'}`}>
                          {n}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono text-[9px] tracking-widest uppercase hidden sm:block ${active ? 'text-[#B08D57]' : done ? 'text-[rgba(237,230,214,0.50)]' : 'text-[rgba(237,230,214,0.25)]'
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px min-w-[16px] transition-colors ${done ? 'bg-[#B08D57]' : 'bg-[rgba(237,230,214,0.10)]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="container-wl py-10">
        {step === 1 && <Step1ServiceSelect />}
        {step === 2 && <Step2WatchDetails />}
        {step === 3 && <Step3Address />}
        {step === 4 && <Step4DateTime />}
        {step === 5 && <Step5Review />}
        {step === 6 && <Step6Payment />}
        {step === 7 && <Step7Confirmation />}
      </div>
    </div>
  );
}
