'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { MapPin, Compass, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const inputClass =
  'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  addressLine1: z.string().min(5, 'Street address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  postalCode: z.string().min(4, 'Pincode required'),
});
type FormData = z.infer<typeof schema>;

export function Step3Address() {
  const { address, setAddress, setStep } = useBookingStore();
  const [saving, setSaving] = React.useState(false);
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(
    address?.latitude && address?.longitude ? { lat: address.latitude, lng: address.longitude } : null
  );
  const [gpsMessage, setGpsMessage] = React.useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: address?.fullName ?? '',
      phone: address?.phone ?? '',
      addressLine1: address?.addressLine1 ?? '',
      addressLine2: address?.addressLine2 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.postalCode ?? '',
    },
  });

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const street = [
              addr.house_number,
              addr.building,
              addr.road || addr.suburb || addr.neighbourhood,
            ]
              .filter(Boolean)
              .join(' ');

            if (street) setValue('addressLine1', street);
            const city = addr.city || addr.town || addr.municipality || addr.district || '';
            if (city) setValue('city', city);
            const state = addr.state || '';
            if (state) setValue('state', state);
            const postcode = addr.postcode || '';
            if (postcode) setValue('postalCode', postcode);

            setGpsMessage(`Coordinates acquired: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
          } else {
            setGpsMessage(`GPS Coordinates locked (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          setGpsMessage(`GPS Coordinates locked (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsMessage('Could not retrieve GPS location. Please check browser permissions.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  async function onSubmit(formData: FormData) {
    setSaving(true);
    try {
      const formatted = [
        formData.addressLine1,
        formData.addressLine2,
        formData.city,
        formData.state,
        formData.postalCode,
      ].filter(Boolean).join(', ');

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 ?? '',
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        formattedAddress: formatted,
        latitude: coords?.lat ?? 0,
        longitude: coords?.lng ?? 0,
        isDefault: false,
      };

      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const saved = res.ok ? await res.json() : null;
      setAddress({ ...payload, latitude: saved?.latitude ?? payload.latitude, longitude: saved?.longitude ?? payload.longitude }, saved?.id);
      setStep(4);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 3 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Service Address</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          Where should our technician come? We&apos;ll save this address for future bookings.
        </p>
      </div>

      <div className="mb-5 flex items-center justify-between p-3 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px]">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#B08D57]" />
          <div>
            <span className="font-mono text-xs text-[#EDE6D6] block">GPS Geolocation</span>
            <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
              {coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Auto-locate home bench for navigation'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14110F] border border-[rgba(176,141,87,0.30)] hover:border-[#B08D57] text-[#EDE6D6] hover:text-[#B08D57] rounded-[2px] text-xs font-mono tracking-wider transition-colors disabled:opacity-50"
        >
          <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin text-[#B08D57]' : 'text-[#B08D57]'}`} />
          <span>{gpsLoading ? 'Locating...' : 'Use Current Location'}</span>
        </button>
      </div>
      {gpsMessage && (
        <div className="mb-4 text-xs font-mono text-[#B08D57] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.25)] px-3.5 py-2 rounded-[2px] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#B08D57] flex-shrink-0" />
          <span>{gpsMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
              Full Name *
            </label>
            <input {...register('fullName')} placeholder="Name for technician" className={inputClass} />
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
              Phone *
            </label>
            <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className={inputClass} />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Street */}
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
            <MapPin size={10} className="inline mr-1 opacity-60" />
            Street Address *
          </label>
          <input
            {...register('addressLine1')}
            placeholder="House No., Building, Street, Area, Landmark"
            className={inputClass}
          />
          {errors.addressLine1 && <p className="text-xs text-red-400 mt-1">{errors.addressLine1.message}</p>}
        </div>

        {/* Line 2 */}
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
            Apartment / Floor <span className="opacity-40">(optional)</span>
          </label>
          <input {...register('addressLine2')} placeholder="Flat 4B, 3rd Floor" className={inputClass} />
        </div>

        {/* City / State / Pincode */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">City *</label>
            <input {...register('city')} placeholder="Mumbai" className={inputClass} />
            {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">State *</label>
            <input {...register('state')} placeholder="Maharashtra" className={inputClass} />
            {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">Pincode *</label>
            <input {...register('postalCode')} placeholder="400001" className={inputClass} />
            {errors.postalCode && <p className="text-xs text-red-400 mt-1">{errors.postalCode.message}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" size="lg" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button type="submit" variant="primary" size="lg" className="flex-1" loading={saving}>
            Continue to Date &amp; Time
          </Button>
        </div>
      </form>
    </div>
  );
}
