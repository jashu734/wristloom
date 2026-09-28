'use client';

import * as React from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/primitives/Button';
import { formatCurrency } from '@/lib/utils';
import { Shield, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Step6Payment() {
  const {
    serviceType, depositAmount, watchBrand, watchModel,
    addressId, scheduledDate, scheduledTimeStart, scheduledTimeEnd,
    issueDescription, issueImages, watchReferenceNumber,
    estimatedPrice, setConfirmed, setStep,
  } = useBookingStore();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handlePayment() {
    setError(null);
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load.');

      // 1. Create booking in DB
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          watchBrand,
          watchModel,
          watchReferenceNumber,
          issueDescription,
          issueImages,
          scheduledDate,
          scheduledTimeStart,
          scheduledTimeEnd,
          addressId,
          estimatedPrice,
          depositAmount,
        }),
      });

      if (!bookingRes.ok) throw new Error('Failed to create booking.');
      const booking = await bookingRes.json();

      // 2. Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, amount: depositAmount }),
      });

      if (!orderRes.ok) throw new Error('Failed to create payment order.');
      const order = await orderRes.json();

      // 3. Open Razorpay checkout or auto-verify in test/demo mode
      if (!window.Razorpay || order.keyId === 'rzp_test_wristloom') {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            razorpay_order_id: order.orderId,
            razorpay_payment_id: `pay_auth_${Date.now()}`,
            razorpay_signature: 'concierge_auth_confirmed',
          }),
        });

        if (!verifyRes.ok) {
          setError('Payment verification failed. Please contact support.');
          return;
        }

        setConfirmed(booking.id, booking.bookingReference);
        setStep(7);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Wristloom',
        description: `${serviceType} — Deposit`,
        order_id: order.orderId,
        theme: { color: '#B08D57' },
        handler: async function (response: any) {
          // 4. Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            setError('Payment verification failed. Please contact support.');
            return;
          }

          setConfirmed(booking.id, booking.bookingReference);
          setStep(7);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message ?? 'Payment failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <span className="text-overline block mb-3">Step 6 of 7</span>
        <h2 className="font-display text-3xl text-[#EDE6D6] mb-2">Secure Payment</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)]">
          A 30% deposit is required to confirm your booking.
        </p>
      </div>

      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[rgba(237,230,214,0.60)]">Deposit (30%)</span>
          <span className="font-mono text-xl text-[#B08D57]">{formatCurrency(depositAmount)}</span>
        </div>
        <p className="text-xs text-[rgba(237,230,214,0.40)] leading-relaxed">
          The remaining {formatCurrency(estimatedPrice - depositAmount)} is payable on service completion after the technician confirms final scope.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 text-xs text-[rgba(237,230,214,0.40)]">
        <Shield className="w-4 h-4 text-[#B08D57]" />
        Secured by Razorpay — UPI, Cards, Net Banking accepted
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-[2px] px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={() => setStep(5)} className="flex-1" disabled={loading}>Back</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={handlePayment} loading={loading}>
          Pay {formatCurrency(depositAmount)}
        </Button>
      </div>
    </div>
  );
}
