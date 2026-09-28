'use client';

import * as React from 'react';
import { MOCK_WORKSHOPS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Clock, Users, Calendar, CheckCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';

type Workshop = (typeof MOCK_WORKSHOPS)[0];

export function WorkshopsClient() {
  const [selectedWorkshop, setSelectedWorkshop] = React.useState<Workshop | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    experience: 'None',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingConfirmed, setBookingConfirmed] = React.useState<{
    ref: string;
    workshop: Workshop;
    date: string;
  } | null>(null);

  const handleOpenBooking = (ws: Workshop) => {
    setSelectedWorkshop(ws);
    setSelectedDate(ws.dates[0]?.date ?? '');
    setBookingConfirmed(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `WS-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingConfirmed({
        ref,
        workshop: selectedWorkshop,
        date: selectedDate,
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container-wl py-16 space-y-8">
      {MOCK_WORKSHOPS.map((ws) => {
        const spotsLeft = ws.max_participants - ws.current_participants;
        return (
          <article
            key={ws.id}
            className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden hover:border-[rgba(176,141,87,0.25)] transition-all"
          >
            {/* Cover image */}
            <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
              <img
                src={ws.cover_image_url}
                alt={ws.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span
                    className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-[1px] border mr-2 ${
                      ws.difficulty === 'Beginner'
                        ? 'text-emerald-400 border-emerald-700/40 bg-emerald-900/20'
                        : ws.difficulty === 'Intermediate'
                        ? 'text-amber-400 border-amber-700/40 bg-amber-900/20'
                        : 'text-[#E8A0B0] border-[rgba(107,39,55,0.40)] bg-[rgba(107,39,55,0.20)]'
                    }`}
                  >
                    {ws.difficulty}
                  </span>
                </div>
                <p className="font-mono text-lg text-[#B08D57] flex-shrink-0">
                  {formatCurrency(ws.price)}
                </p>
              </div>

              <h2 className="font-display text-xl text-[#EDE6D6] mb-2">{ws.title}</h2>
              <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed mb-4 flex-1">
                {ws.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-5 text-[rgba(237,230,214,0.45)]">
                <span className="flex items-center gap-1.5 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" aria-hidden /> {ws.duration_hours}h session
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono">
                  <Users className="w-3.5 h-3.5" aria-hidden /> Max {ws.max_participants} participants
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5" aria-hidden /> {ws.dates.length} upcoming dates
                </span>
              </div>

              {/* Dates */}
              <div className="mb-5">
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-2">
                  Upcoming Sessions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ws.dates.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      className="font-mono text-[10px] tracking-wider text-[rgba(237,230,214,0.55)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.12)] px-2 py-1 rounded-[1px]"
                    >
                      {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.time}
                      <span className="text-[rgba(237,230,214,0.30)] ml-1">({d.spots_remaining} spots)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor + CTA */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-[rgba(176,141,87,0.08)]">
                <p className="text-xs text-[rgba(237,230,214,0.45)]">
                  Master Horologist: <span className="text-[rgba(237,230,214,0.75)]">{ws.instructor_name}</span>
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={spotsLeft === 0}
                  onClick={() => handleOpenBooking(ws)}
                >
                  {spotsLeft > 0 ? 'Book Workshop' : 'Sold Out'}
                </Button>
              </div>
            </div>
          </article>
        );
      })}

      {/* Booking Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
                <span className="font-display text-base text-[#EDE6D6]">Reserve Workshop Bench</span>
              </div>
              <button
                onClick={() => {
                  setSelectedWorkshop(null);
                  setBookingConfirmed(null);
                }}
                className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl text-[#EDE6D6]">Reservation Confirmed</h3>
                <p className="text-xs text-[rgba(237,230,214,0.60)] leading-relaxed max-w-sm mx-auto">
                  Your horologist bench for <strong className="text-[#EDE6D6]">{bookingConfirmed.workshop.title}</strong> has been reserved.
                </p>
                <div className="p-4 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[rgba(237,230,214,0.45)]">Reference:</span>
                    <span className="font-mono text-[#B08D57] font-semibold">{bookingConfirmed.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(237,230,214,0.45)]">Session:</span>
                    <span className="text-[#EDE6D6]">{new Date(bookingConfirmed.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(237,230,214,0.45)]">Fee:</span>
                    <span className="font-mono text-[#B08D57]">{formatCurrency(bookingConfirmed.workshop.price)}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="md" className="flex-1" asChild>
                    <Link href="/account">View in My Account</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setSelectedWorkshop(null);
                      setBookingConfirmed(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                <div>
                  <h4 className="font-display text-lg text-[#EDE6D6] mb-1">{selectedWorkshop.title}</h4>
                  <p className="font-mono text-xs text-[#B08D57]">{formatCurrency(selectedWorkshop.price)} · {selectedWorkshop.duration_hours} hours</p>
                </div>

                <div>
                  <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                    Select Available Session Date *
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  >
                    {selectedWorkshop.dates.map((d) => (
                      <option key={d.id} value={d.date} className="bg-[#14110F]">
                        {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {d.time} ({d.spots_remaining} spots available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Confirming Reservation...' : `Confirm & Reserve Bench (${formatCurrency(selectedWorkshop.price)})`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
