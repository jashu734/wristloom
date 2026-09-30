'use client';

import * as React from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  X,
  Clock,
  QrCode,
  Smartphone,
  AlertCircle,
  Building2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/store/cartStore';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.price + (i.strapOption?.price_addon ?? 0)) * i.quantity,
    0
  );

  // Avoid SSR hydration mismatch with localStorage-backed store
  const [mounted, setMounted] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [checkoutStep, setCheckoutStep] = React.useState<'details' | 'payment'>('details');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);
  const [activeOrderReference, setActiveOrderReference] = React.useState<string | null>(null);

  // UPI Specific State
  const [upiTab, setUpiTab] = React.useState<'vpa' | 'qr'>('vpa');
  const [upiId, setUpiId] = React.useState('');
  const [upiStatus, setUpiStatus] = React.useState<'idle' | 'waiting' | 'failed' | 'success'>('idle');
  const [upiTimer, setUpiTimer] = React.useState(300);

  // Card Specific State
  const [cardData, setCardData] = React.useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });

  // NetBanking State
  const [selectedBank, setSelectedBank] = React.useState('HDFC');

  const [orderConfirmed, setOrderConfirmed] = React.useState<{
    id: string;
    items: CartItem[];
    subtotal: number;
    shipping: { name: string; email: string; phone: string; address: string; city: string };
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: 'Mumbai',
    postalCode: '',
    paymentMethod: 'upi', // 'upi' | 'card' | 'netbanking' | 'concierge'
  });
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    syncWithServer();
  }, [syncWithServer]);

  // UPI countdown timer
  React.useEffect(() => {
    let interval: any = null;
    if (upiStatus === 'waiting' && upiTimer > 0) {
      interval = setInterval(() => setUpiTimer((t) => t - 1), 1000);
    } else if (upiTimer === 0 && upiStatus === 'waiting') {
      setUpiStatus('failed');
      setErrorMsg('UPI session timed out. Please retry or choose another payment method.');
    }
    return () => clearInterval(interval);
  }, [upiStatus, upiTimer]);

  // Step 1: Proceed from Details to Payment (or confirm Concierge)
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.id.startsWith('prod-') ? undefined : item.id,
          name: item.name,
          brand: item.brand,
          referenceNumber: item.reference_number || undefined,
          price: item.price + (item.strapOption?.price_addon ?? 0),
          quantity: item.quantity,
          imageUrl: item.image,
          strapOption: item.strapOption,
        })),
        totalAmount: subtotal,
        shippingName: formData.fullName || 'Valued Collector',
        shippingEmail: formData.email || 'collector@wristloom.com',
        shippingPhone: formData.phone || '+91 98765 43210',
        shippingAddress: {
          addressLine: formData.addressLine || 'Private Atelier Residence',
          city: formData.city || 'Mumbai',
          postalCode: formData.postalCode || '400001',
          country: 'India',
        },
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to initialize acquisition order');
      }

      const createdOrder = data.order;
      setActiveOrderId(createdOrder.id);
      setActiveOrderReference(createdOrder.orderReference);

      // Concierge Handover bypasses online payment gateway
      if (formData.paymentMethod === 'concierge') {
        setOrderConfirmed({
          id: createdOrder.orderReference,
          items: [...items],
          subtotal,
          shipping: {
            name: formData.fullName || 'Valued Collector',
            email: formData.email || 'collector@wristloom.com',
            phone: formData.phone || '+91 98765 43210',
            address: formData.addressLine || 'Private Atelier Residence',
            city: formData.city || 'Mumbai',
          },
          paymentMethod: 'concierge',
          paymentStatus: 'UNPAID',
          transactionId: 'SETTLE_ON_HANDOVER',
        });
        clearCart();
        setIsCheckoutOpen(false);
      } else {
        // Move to Payment Screen — DO NOT show Order Confirmed yet!
        setCheckoutStep('payment');
        setUpiStatus('idle');
        setUpiTimer(300);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing reservation details');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2a: Send UPI Collect Request
  const handleInitiateUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI VPA address (e.g. collector@okhdfcbank)');
      return;
    }
    setErrorMsg(null);
    setUpiStatus('waiting');
    setUpiTimer(300);
  };

  // Step 2b: Verify UPI Payment (Success or Failure Simulation)
  const handleVerifyUpiPayment = async (simulateDecline = false) => {
    if (!activeOrderId) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          paymentMethod: 'upi',
          upiId: upiId || 'collector@okhdfcbank',
          simulateFailure: simulateDecline,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setUpiStatus('failed');
        throw new Error(verifyData.error ?? 'UPI transaction was declined by bank or timed out.');
      }

      // Payment SUCCEEDED: Only now show Order Confirmed & Thank You
      setUpiStatus('success');
      setOrderConfirmed({
        id: activeOrderReference || activeOrderId,
        items: [...items],
        subtotal,
        shipping: {
          name: formData.fullName || 'Valued Collector',
          email: formData.email || 'collector@wristloom.com',
          phone: formData.phone || '+91 98765 43210',
          address: formData.addressLine || 'Private Atelier Residence',
          city: formData.city || 'Mumbai',
        },
        paymentMethod: 'upi',
        paymentStatus: 'FULLY_PAID',
        transactionId: verifyData.paymentId,
      });
      clearCart();
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2c: Verify Card / NetBanking Payment
  const handleVerifyGenericPayment = async (method: 'card' | 'netbanking', simulateDecline = false) => {
    if (!activeOrderId) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          paymentMethod: method,
          simulateFailure: simulateDecline,
          cardLast4: method === 'card' ? (cardData.number.slice(-4) || '4242') : undefined,
          bank: method === 'netbanking' ? selectedBank : undefined,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error ?? 'Transaction declined by bank.');
      }

      setOrderConfirmed({
        id: activeOrderReference || activeOrderId,
        items: [...items],
        subtotal,
        shipping: {
          name: formData.fullName || 'Valued Collector',
          email: formData.email || 'collector@wristloom.com',
          phone: formData.phone || '+91 98765 43210',
          address: formData.addressLine || 'Private Atelier Residence',
          city: formData.city || 'Mumbai',
        },
        paymentMethod: method,
        paymentStatus: 'FULLY_PAID',
        transactionId: verifyData.paymentId,
      });
      clearCart();
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment authorization declined');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-12">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-5 h-5 text-[#B08D57]" />
              <h1 className="font-display text-3xl text-[#EDE6D6] tracking-tight">Your Cart</h1>
            </div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="container-wl py-12">
          {orderConfirmed ? (
            /* Order Placed State */
            <div className="max-w-2xl mx-auto bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] p-8 md:p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="text-center mb-8">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-2">Order Confirmed & Timepiece Reserved</span>
                <h2 className="font-display text-3xl text-[#EDE6D6] mb-3">Thank You for Your Trust</h2>
                <p className="text-sm text-[rgba(237,230,214,0.60)] max-w-md mx-auto leading-relaxed">
                  Your acquisition has been logged into the Wristloom Atelier Registry. A private concierge will contact you within 2 business hours to coordinate white-glove insured delivery.
                </p>
              </div>

              <div className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 mb-6 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)]">Order Reference</span>
                  <span className="font-mono text-base text-[#B08D57] font-semibold">{orderConfirmed.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Client Name</span>
                  <span className="text-[#EDE6D6] font-medium">{orderConfirmed.shipping.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Destination</span>
                  <span className="text-[#EDE6D6]">{orderConfirmed.shipping.city}, India</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Total Value</span>
                  <span className="font-mono text-sm text-[#B08D57]">{formatCurrency(orderConfirmed.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Settlement Method</span>
                  <span className="text-[#EDE6D6] font-mono uppercase text-[11px]">
                    {orderConfirmed.paymentMethod === 'upi' ? 'Instant UPI Escrow' :
                     orderConfirmed.paymentMethod === 'card' ? 'Encrypted Card Escrow' :
                     orderConfirmed.paymentMethod === 'netbanking' ? 'NetBanking Wire' :
                     'White-Glove Handover'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Payment Status</span>
                  <span className={`font-mono text-[11px] font-semibold ${
                    orderConfirmed.paymentStatus === 'FULLY_PAID' ? 'text-emerald-400' : 'text-[#B08D57]'
                  }`}>
                    {orderConfirmed.paymentStatus === 'FULLY_PAID' ? '● FULLY_PAID / VERIFIED' : '○ PENDING (HANDOVER)'}
                  </span>
                </div>
                {orderConfirmed.transactionId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(237,230,214,0.55)]">Transaction Auth</span>
                    <span className="font-mono text-[10px] text-[rgba(237,230,214,0.7)]">{orderConfirmed.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Transit Insurance</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Lloyd&apos;s Insured (Up to ₹50L)</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href={`/orders/${orderConfirmed.id}/certificate`}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Download Certificate of Authenticity (PDF)
                  </Link>
                </Button>
                <Button variant="subtle" size="md" className="w-full" asChild>
                  <Link href="/account">
                    View in Collector Vault & Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => setOrderConfirmed(null)}
                >
                  Return to Boutique
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty cart state */
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingCart className="w-16 h-16 text-[rgba(176,141,87,0.20)] mb-6" />
              <h2 className="font-display text-xl text-[#EDE6D6] mb-2">Your cart is empty</h2>
              <p className="text-sm text-[rgba(237,230,214,0.45)] mb-8">
                Discover our curated collection of luxury timepieces.
              </p>
              <Button variant="primary" size="lg" asChild>
                <Link href="/shop">
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const itemTotal = (item.price + (item.strapOption?.price_addon ?? 0)) * item.quantity;
                  return (
                    <div key={item.id} className="flex gap-5 bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-4">
                      <Link href={`/products/${item.slug}`} className="w-20 h-20 flex-shrink-0 rounded-[2px] overflow-hidden border border-[rgba(176,141,87,0.15)] bg-[#14110F] flex items-center justify-center">
                        <img src={item.image} alt={`${item.brand} ${item.name}`} className="w-full h-full object-contain p-1" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-0.5">{item.brand}</p>
                        <h2 className="font-display text-base text-[#EDE6D6] mb-1">
                          <Link href={`/products/${item.slug}`} className="hover:text-[#B08D57] transition-colors">
                            {item.name}
                          </Link>
                        </h2>
                        <p className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                          Ref. {item.reference_number}
                          {item.strapOption && <> · {item.strapOption.material}</>}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.strapOption?.id)}
                            className="w-7 h-7 border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[rgba(237,230,214,0.55)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm text-[#EDE6D6] w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.strapOption?.id)}
                            className="w-7 h-7 border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[rgba(237,230,214,0.55)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <p className="font-mono text-sm text-[#B08D57]">{formatCurrency(itemTotal)}</p>
                        <button
                          onClick={() => removeItem(item.id, item.strapOption?.id)}
                          className="text-[rgba(237,230,214,0.35)] hover:text-red-400 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Clear cart */}
                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6 sticky top-24">
                  <h2 className="font-display text-lg text-[#EDE6D6] mb-5">Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgba(237,230,214,0.55)]">Subtotal</span>
                      <span className="font-mono text-sm text-[rgba(237,230,214,0.70)]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgba(237,230,214,0.55)]">Shipping</span>
                      <span className="font-mono text-sm text-emerald-400">Complimentary</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgba(237,230,214,0.55)]">Insurance</span>
                      <span className="font-mono text-sm text-emerald-400">Included</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[rgba(176,141,87,0.10)] mb-5">
                    <div className="flex justify-between">
                      <span className="font-display text-base text-[#EDE6D6]">Total</span>
                      <span className="font-mono text-lg text-[#B08D57]">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mb-3 cursor-pointer"
                    onClick={() => {
                      setCheckoutStep('details');
                      setErrorMsg(null);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>

                  {/* Trust signals */}
                  <div className="mt-5 pt-4 border-t border-[rgba(176,141,87,0.08)] space-y-2">
                    {['Authenticity Guaranteed', 'Fully Insured Shipping', 'Secure Payment'].map((t) => (
                      <p key={t} className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] flex items-center gap-2">
                        <span className="text-[#B08D57]">✓</span> {t}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Checkout & Payment Modal ────────────────────────────────────────── */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
                <div className="flex items-center gap-2">
                  {checkoutStep === 'payment' ? (
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('details')}
                      className="text-[#B08D57] hover:text-[#EDE6D6] mr-1 p-1 -ml-1 transition-colors flex items-center gap-1 text-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Back</span>
                    </button>
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
                  )}
                  <span className="font-display text-lg text-[#EDE6D6]">
                    {checkoutStep === 'payment' ? 'Atelier Payment Terminal' : 'White-Glove Atelier Checkout'}
                  </span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ──────────────── STEP 1: DETAILS & METHOD SELECTION ────────────── */}
              {checkoutStep === 'details' && (
                <form onSubmit={handleProceedToPayment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="p-3 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.15)] rounded text-xs text-[rgba(237,230,214,0.7)] flex items-center justify-between">
                    <span>Total Due:</span>
                    <span className="font-mono text-sm text-[#B08D57] font-semibold">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="space-y-3">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">1. Collector Details</p>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Legal Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">2. Insured Delivery Destination</p>
                    <input
                      type="text"
                      required
                      placeholder="Street Address / Residence"
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City (e.g. Mumbai, Delhi)"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="PIN Code"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">3. Payment & Settlement Method</p>
                    <div className="space-y-2.5">
                      {/* UPI Option */}
                      <div
                        onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                        className={`group relative flex items-start gap-3.5 p-3.5 rounded-[3px] border cursor-pointer transition-all select-none ${
                          formData.paymentMethod === 'upi'
                            ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)] shadow-[0_0_15px_rgba(176,141,87,0.12)]'
                            : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.35)] hover:bg-[#181412]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            formData.paymentMethod === 'upi'
                              ? 'border-[#B08D57] bg-[#B08D57]'
                              : 'border-[rgba(176,141,87,0.30)] bg-transparent group-hover:border-[#B08D57]/60'
                          }`}>
                            {formData.paymentMethod === 'upi' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#14110F]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-[#EDE6D6] font-medium flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-[#B08D57] shrink-0" />
                              <span>Instant UPI Escrow</span>
                            </span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#B08D57]/15 text-[#B08D57] border border-[#B08D57]/30 shrink-0 font-semibold">
                              Zero Fee
                            </span>
                          </div>
                          <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
                            Google Pay, PhonePe, Paytm, BHIM, or Instant Scan &amp; Pay QR.
                          </p>
                        </div>
                      </div>

                      {/* Card Option */}
                      <div
                        onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className={`group relative flex items-start gap-3.5 p-3.5 rounded-[3px] border cursor-pointer transition-all select-none ${
                          formData.paymentMethod === 'card'
                            ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)] shadow-[0_0_15px_rgba(176,141,87,0.12)]'
                            : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.35)] hover:bg-[#181412]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            formData.paymentMethod === 'card'
                              ? 'border-[#B08D57] bg-[#B08D57]'
                              : 'border-[rgba(176,141,87,0.30)] bg-transparent group-hover:border-[#B08D57]/60'
                          }`}>
                            {formData.paymentMethod === 'card' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#14110F]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-[#EDE6D6] font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-[#B08D57] shrink-0" />
                              <span>Credit / Debit Card (256-Bit Escrow)</span>
                            </span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#B08D57]/15 text-[#B08D57] border border-[#B08D57]/30 shrink-0 font-semibold">
                              3D Secure
                            </span>
                          </div>
                          <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
                            Visa, MasterCard, American Express, RuPay with 256-bit encryption.
                          </p>
                        </div>
                      </div>

                      {/* NetBanking Option */}
                      <div
                        onClick={() => setFormData({ ...formData, paymentMethod: 'netbanking' })}
                        className={`group relative flex items-start gap-3.5 p-3.5 rounded-[3px] border cursor-pointer transition-all select-none ${
                          formData.paymentMethod === 'netbanking'
                            ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)] shadow-[0_0_15px_rgba(176,141,87,0.12)]'
                            : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.35)] hover:bg-[#181412]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            formData.paymentMethod === 'netbanking'
                              ? 'border-[#B08D57] bg-[#B08D57]'
                              : 'border-[rgba(176,141,87,0.30)] bg-transparent group-hover:border-[#B08D57]/60'
                          }`}>
                            {formData.paymentMethod === 'netbanking' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#14110F]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-[#EDE6D6] font-medium flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#B08D57] shrink-0" />
                              <span>Direct NetBanking Wire</span>
                            </span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#B08D57]/15 text-[#B08D57] border border-[#B08D57]/30 shrink-0 font-semibold">
                              Direct Wire
                            </span>
                          </div>
                          <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
                            Direct corporate settlement with HDFC, ICICI, SBI, Axis, Kotak.
                          </p>
                        </div>
                      </div>

                      {/* Concierge Handover Option */}
                      <div
                        onClick={() => setFormData({ ...formData, paymentMethod: 'concierge' })}
                        className={`group relative flex items-start gap-3.5 p-3.5 rounded-[3px] border cursor-pointer transition-all select-none ${
                          formData.paymentMethod === 'concierge'
                            ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)] shadow-[0_0_15px_rgba(176,141,87,0.12)]'
                            : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.35)] hover:bg-[#181412]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            formData.paymentMethod === 'concierge'
                              ? 'border-[#B08D57] bg-[#B08D57]'
                              : 'border-[rgba(176,141,87,0.30)] bg-transparent group-hover:border-[#B08D57]/60'
                          }`}>
                            {formData.paymentMethod === 'concierge' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#14110F]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-[#EDE6D6] font-medium flex items-center gap-2">
                              <Truck className="w-4 h-4 text-[#B08D57] shrink-0" />
                              <span>White-Glove Handover</span>
                            </span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 shrink-0 font-semibold">
                              On Inspection
                            </span>
                          </div>
                          <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
                            Inspect the timepiece in the presence of our bonded horologist before payment release.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[rgba(176,141,87,0.15)]">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#B08D57]/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          Initializing Reservation...
                        </>
                      ) : formData.paymentMethod === 'concierge' ? (
                        <>
                          Confirm Handover Reservation ({formatCurrency(subtotal)})
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Continue to Payment ({formatCurrency(subtotal)})
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[rgba(237,230,214,0.35)] mt-2">
                      {formData.paymentMethod === 'concierge'
                        ? 'Settlement collected on delivery after client inspection.'
                        : 'You will enter payment details on the next screen. No charge until authorized.'}
                    </p>
                  </div>
                </form>
              )}

              {/* ──────────────── STEP 2: PAYMENT TERMINAL ────────────────────── */}
              {checkoutStep === 'payment' && (
                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  {/* Reservation Badge */}
                  <div className="bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.4)] block">Timepiece Reservation</span>
                      <span className="font-mono font-medium text-[#B08D57]">{activeOrderReference || activeOrderId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] uppercase text-[rgba(237,230,214,0.4)] block">Escrow Amount</span>
                      <span className="font-mono font-semibold text-[#EDE6D6]">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  {/* ──────────────── METHOD 1: UPI PAYMENT ────────────────────── */}
                  {formData.paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      {/* Sub-tabs: VPA vs QR */}
                      <div className="flex border-b border-[rgba(176,141,87,0.15)] pb-1 gap-4">
                        <button
                          type="button"
                          onClick={() => { setUpiTab('vpa'); setErrorMsg(null); }}
                          className={`font-mono text-xs pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                            upiTab === 'vpa'
                              ? 'text-[#B08D57] border-b-2 border-[#B08D57] font-semibold'
                              : 'text-[rgba(237,230,214,0.45)] hover:text-[#EDE6D6]'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          UPI ID / VPA
                        </button>
                        <button
                          type="button"
                          onClick={() => { setUpiTab('qr'); setErrorMsg(null); }}
                          className={`font-mono text-xs pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                            upiTab === 'qr'
                              ? 'text-[#B08D57] border-b-2 border-[#B08D57] font-semibold'
                              : 'text-[rgba(237,230,214,0.45)] hover:text-[#EDE6D6]'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Scan QR Code
                        </button>
                      </div>

                      {upiTab === 'vpa' && (
                        <div className="space-y-4">
                          {upiStatus === 'idle' && (
                            <form onSubmit={handleInitiateUpi} className="space-y-3">
                              <div>
                                <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-1.5">
                                  Enter Virtual Payment Address (VPA)
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. yourname@okhdfcbank"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2.5 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none font-mono"
                                />
                              </div>

                              {/* Popular handles */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl'].map((handle) => (
                                  <button
                                    key={handle}
                                    type="button"
                                    onClick={() => {
                                      const base = upiId.includes('@') ? upiId.split('@')[0] : (upiId || 'collector');
                                      setUpiId(`${base}${handle}`);
                                    }}
                                    className="font-mono text-[10px] px-2 py-1 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded text-[rgba(237,230,214,0.6)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors"
                                  >
                                    {handle}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="submit"
                                className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#B08D57]/20"
                              >
                                Send Collect Request ({formatCurrency(subtotal)})
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </form>
                          )}

                          {upiStatus === 'waiting' && (
                            <div className="bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded p-5 text-center space-y-4">
                              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <span className="absolute inset-0 rounded-full bg-[#B08D57]/20 animate-ping opacity-75"></span>
                                <div className="w-12 h-12 rounded-full bg-[#1E1A17] border border-[#B08D57] flex items-center justify-center text-[#B08D57]">
                                  <Smartphone className="w-6 h-6 animate-pulse" />
                                </div>
                              </div>

                              <div>
                                <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
                                  Collect Request Sent
                                </span>
                                <h3 className="font-display text-base text-[#EDE6D6] font-medium mb-1">
                                  Approve Payment in Your UPI App
                                </h3>
                                <p className="font-mono text-xs text-[rgba(237,230,214,0.6)]">
                                  Notification dispatched to <span className="text-[#B08D57] font-semibold">{upiId}</span>
                                </p>
                              </div>

                              {/* Countdown timer */}
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded font-mono text-xs text-[rgba(237,230,214,0.7)]">
                                <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                                <span>Expires in {Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, '0')}</span>
                              </div>

                              <p className="text-[11px] text-[rgba(237,230,214,0.4)] max-w-xs mx-auto">
                                Open Google Pay, PhonePe, Paytm, or your banking app and approve the transaction of {formatCurrency(subtotal)}.
                              </p>

                              <div className="pt-2 space-y-2">
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleVerifyUpiPayment(false)}
                                  className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                                >
                                  {isSubmitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                  Approve & Complete Payment
                                </button>

                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleVerifyUpiPayment(true)}
                                  className="w-full py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <AlertCircle className="w-3 h-3 text-red-400" />
                                  Simulate Bank Decline (Test Failure Flow)
                                </button>
                              </div>
                            </div>
                          )}

                          {upiStatus === 'failed' && (
                            <div className="bg-red-950/20 border border-red-500/30 rounded p-4 text-center space-y-3">
                              <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
                                <AlertCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-display text-sm text-[#EDE6D6] font-medium">Payment Authorization Failed</h4>
                                <p className="text-xs text-red-400 mt-1 max-w-sm mx-auto">
                                  {errorMsg || 'The bank declined the transaction or the UPI mandate timed out.'}
                                </p>
                                <p className="text-[10px] text-[rgba(237,230,214,0.4)] mt-1.5">
                                  Your timepiece remains reserved under reference #{activeOrderReference}. No funds were debited.
                                </p>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpiStatus('idle');
                                    setErrorMsg(null);
                                    setUpiTimer(300);
                                  }}
                                  className="flex-1 py-2 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-xs transition-colors cursor-pointer"
                                >
                                  Retry UPI Payment
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCheckoutStep('details');
                                    setErrorMsg(null);
                                  }}
                                  className="flex-1 py-2 rounded bg-[#1E1A17] border border-[rgba(176,141,87,0.2)] text-[rgba(237,230,214,0.7)] hover:text-[#EDE6D6] font-mono text-xs transition-colors cursor-pointer"
                                >
                                  Change Method
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {upiTab === 'qr' && (
                        <div className="bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded p-5 text-center space-y-4">
                          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block">
                            Direct Horological Escrow QR
                          </span>
                          
                          {/* QR Mock graphic with luxury styling */}
                          <div className="w-44 h-44 mx-auto bg-white p-3 rounded-[2px] shadow-xl flex flex-col items-center justify-between">
                            <div className="w-full flex justify-between items-center px-1">
                              <span className="font-mono text-[8px] text-gray-700 tracking-widest font-bold">WRISTLOOM ESCROW</span>
                              <Lock className="w-2.5 h-2.5 text-gray-600" />
                            </div>
                            <QrCode className="w-32 h-32 text-black" />
                            <span className="font-mono text-[8px] text-gray-500 font-semibold">{activeOrderReference}</span>
                          </div>

                          <div className="text-xs text-[rgba(237,230,214,0.6)] space-y-1">
                            <p>Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                            <p className="font-mono text-[#B08D57] font-semibold text-sm">{formatCurrency(subtotal)}</p>
                          </div>

                          <div className="pt-2 space-y-2">
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleVerifyUpiPayment(false)}
                              className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                            >
                              {isSubmitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              I Have Completed QR Transfer
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleVerifyUpiPayment(true)}
                              className="w-full py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              Simulate Transfer Failure
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────── METHOD 2: CARD PAYMENT ───────────────────── */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8921"
                            maxLength={19}
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] font-mono focus:border-[#B08D57] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="NAME AS PRINTED ON CARD"
                            value={cardData.holder}
                            onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                            className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] uppercase focus:border-[#B08D57] focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] font-mono focus:border-[#B08D57] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                              className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] font-mono focus:border-[#B08D57] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleVerifyGenericPayment('card', false)}
                          className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#B08D57]/20 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              Authorizing 256-Bit Escrow...
                            </>
                          ) : (
                            <>
                              Authorize & Pay ({formatCurrency(subtotal)})
                              <Lock className="w-3.5 h-3.5 ml-1" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleVerifyGenericPayment('card', true)}
                          className="w-full py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          Simulate Card Decline (Test Failure Flow)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── METHOD 3: NETBANKING ─────────────────────── */}
                  {formData.paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.5)] block mb-2">
                          Select Banking Institution
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'HDFC', name: 'HDFC Bank' },
                            { id: 'ICICI', name: 'ICICI Bank' },
                            { id: 'SBI', name: 'State Bank of India' },
                            { id: 'AXIS', name: 'Axis Bank' },
                            { id: 'KOTAK', name: 'Kotak Mahindra' },
                            { id: 'OTHER', name: 'Other Scheduled Banks' },
                          ].map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBank(b.id)}
                              className={`p-2.5 rounded border text-left font-mono text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                selectedBank === b.id
                                  ? 'border-[#B08D57] bg-[rgba(176,141,87,0.12)] text-[#EDE6D6]'
                                  : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] text-[rgba(237,230,214,0.6)] hover:border-[rgba(176,141,87,0.3)]'
                              }`}
                            >
                              <span>{b.name}</span>
                              {selectedBank === b.id && <span className="text-[#B08D57]">●</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleVerifyGenericPayment('netbanking', false)}
                          className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#B08D57]/20 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              Connecting to Bank Gateway...
                            </>
                          ) : (
                            <>
                              Authorize {selectedBank} Transfer ({formatCurrency(subtotal)})
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleVerifyGenericPayment('netbanking', true)}
                          className="w-full py-2 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          Simulate Gateway Timeout (Test Failure Flow)
                        </button>
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[rgba(176,141,87,0.10)] flex items-center justify-between text-[10px] text-[rgba(237,230,214,0.4)]">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#B08D57]" />
                      256-Bit Cryptographic Escrow
                    </span>
                    <span>Order Ref: {activeOrderReference}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteWrapper>
  );
}
