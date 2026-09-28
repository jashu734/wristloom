'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { Battery, Wrench, Droplets, Eye, Shield, Layers, Sparkles } from 'lucide-react';

const SERVICES = [
  { id: 'battery-replacement', label: 'Battery Replacement', price: 1500, icon: Battery,
    desc: 'Genuine replacement cell with gasket check and pressure test.' },
  { id: 'strap-repair', label: 'Strap / Bracelet Repair', price: 3500, icon: Wrench,
    desc: 'Link sizing, clasp repair, leather strap fitting.' },
  { id: 'movement-service', label: 'Movement Servicing', price: 18000, icon: Layers,
    desc: 'Full disassembly, ultrasonic cleaning, re-lubrication, and timing regulation.' },
  { id: 'watch-cleaning', label: 'Watch Cleaning', price: 4500, icon: Sparkles,
    desc: 'Case, bracelet, and crystal cleaning. No movement work.' },
  { id: 'water-resistance', label: 'Water Resistance Test', price: 2500, icon: Droplets,
    desc: 'Pressure test and gasket replacement where necessary.' },
  { id: 'glass-replacement', label: 'Crystal Replacement', price: 6500, icon: Eye,
    desc: 'Sapphire or mineral crystal replacement with gasket seal.' },
  { id: 'full-restoration', label: 'Full Restoration', price: 45000, icon: Shield,
    desc: 'Complete movement service + case and bracelet refinishing. Includes certification.' },
];

export function Step1ServiceSelect() {
  const { setService, setStep } = useBookingStore();
  const [selected, setSelected] = React.useState<string | null>(null);

  function handleContinue() {
    const svc = SERVICES.find((s) => s.id === selected);
    if (!svc) return;
    setService(svc.label, svc.price);
    setStep(2);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 1 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Select a Service</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          Choose the primary service you require. Our technician will confirm the final scope on arrival.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {SERVICES.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => setSelected(svc.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-[2px] border text-left transition-all ${
              selected === svc.id
                ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                : 'border-[rgba(176,141,87,0.12)] bg-[#1E1A17] hover:border-[rgba(176,141,87,0.25)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center flex-shrink-0 ${
              selected === svc.id ? 'bg-[rgba(176,141,87,0.20)]' : 'bg-[rgba(237,230,214,0.04)]'
            }`}>
              <svc.icon className={`w-4.5 h-4.5 ${selected === svc.id ? 'text-[#B08D57]' : 'text-[rgba(237,230,214,0.40)]'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[#EDE6D6]">{svc.label}</p>
              <p className="text-xs text-[rgba(237,230,214,0.45)] mt-0.5">{svc.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-sm text-[#B08D57]">from ₹{svc.price.toLocaleString('en-IN')}</p>
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue to Watch Details
      </Button>
    </div>
  );
}
