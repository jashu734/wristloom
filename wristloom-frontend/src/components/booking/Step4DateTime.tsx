'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';

interface Slot {
  start: string;
  end: string;
  label: string;
  available: boolean;
  remaining: number;
}

export function Step4DateTime() {
  const { setDateTime, setStep } = useBookingStore();
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [loading, setLoading] = React.useState(false);

  const today = startOfToday();
  const minDate = addDays(today, 1); // earliest is tomorrow
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  async function fetchSlots(date: Date) {
    setLoading(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/bookings/availability?date=${format(date, 'yyyy-MM-dd')}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDate(date: Date) {
    if (isBefore(date, minDate)) return;
    setSelectedDate(date);
    fetchSlots(date);
  }

  function handleContinue() {
    if (!selectedDate || !selectedSlot) return;
    setDateTime(
      format(selectedDate, 'yyyy-MM-dd'),
      selectedSlot.start,
      selectedSlot.end,
      selectedSlot.label
    );
    setStep(5);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 4 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Select Date & Time</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          Choose a date and available slot. Earliest bookings are the next day.
        </p>
      </div>

      {/* Calendar navigation */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="p-1.5 text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.50)]">
            {format(currentWeekStart, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="p-1.5 text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
            <div key={d} className="text-center font-mono text-[9px] text-[rgba(237,230,214,0.30)] py-1">{d}</div>
          ))}
          {weekDays.map((date) => {
            const disabled = isBefore(date, minDate);
            const selected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleSelectDate(date)}
                disabled={disabled}
                className={`py-2 rounded-[2px] font-mono text-xs transition-all ${
                  selected
                    ? 'bg-[#B08D57] text-[#14110F] font-medium'
                    : disabled
                    ? 'text-[rgba(237,230,214,0.15)] cursor-not-allowed'
                    : 'text-[rgba(237,230,214,0.60)] hover:bg-[rgba(176,141,87,0.10)] hover:text-[#EDE6D6]'
                }`}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-3">
            Available Slots — {format(selectedDate, 'EEEE, d MMMM')}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[rgba(237,230,214,0.40)] py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking availability...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex items-center justify-between p-4 rounded-[2px] border transition-all ${
                    selectedSlot?.start === slot.start
                      ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)]'
                      : slot.available
                      ? 'border-[rgba(176,141,87,0.15)] bg-[#1E1A17] hover:border-[rgba(176,141,87,0.30)]'
                      : 'border-[rgba(237,230,214,0.06)] bg-[#1E1A17] opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${selectedSlot?.start === slot.start ? 'text-[#B08D57]' : 'text-[rgba(176,141,87,0.40)]'}`} />
                    <span className={`text-sm ${selectedSlot?.start === slot.start ? 'text-[#EDE6D6]' : 'text-[rgba(237,230,214,0.65)]'}`}>
                      {slot.label}
                    </span>
                  </div>
                  {slot.available ? (
                    <span className="font-mono text-[9px] text-emerald-400">{slot.remaining} left</span>
                  ) : (
                    <span className="font-mono text-[9px] text-[rgba(237,230,214,0.30)]">Full</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={() => setStep(3)} className="flex-1">Back</Button>
        <Button
          type="button" variant="primary" size="lg" className="flex-1"
          disabled={!selectedDate || !selectedSlot}
          onClick={handleContinue}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
