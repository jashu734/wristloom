'use client';

import * as React from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  X,
  Clock,
  Smartphone,
  AlertCircle,
  Building2,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCartStore, CartItem } from '@/store/cartStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.price + (i.strapOption?.price_addon ?? 0)) * i.quantity,
    0
  );

  const [mounted, setMounted] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);
  const [activeOrderReference, setActiveOrderReference] = React.useState<string | null>(null);

  const [orderConfirmed, setOrderConfirmed] = React.useState<{
    id: string;
    items: CartItem[];
    subtotal: number;
    shipping: { name: string; email: string; phone: string; address: string; city: string };
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
  } | null>(null);

  const { data: session } = useSession();

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: 'Mumbai',
    postalCode: '',
    paymentMethod: 'razorpay', // 'razorpay' | 'concierge'
  });
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    syncWithServer();
  }, [syncWithServer]);

  // Auto-prefill customer details from authenticated session
  React.useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || '',
        email: prev.email || session.user.email || '',
        phone: prev.phone || (session.user as any).phone || '',
      }));
    }
  }, [session]);

  // Quick-add featured watch if cart is empty
  const handleAddFeaturedProduct = () => {
    addItem({
      id: 'prod-seiko-001',
      slug: 'seiko-presage-cocktail-time-srpb43j1',
      name: 'Presage Cocktail Time',
      brand: 'Seiko',
      reference_number: 'SRPB43J1',
      price: 45000,
      image: '/watches/seiko-presage-srpb43j1.png',
      caseSize: '40.5 mm',
      movementType: 'Automatic Cal. 4R35',
      stock: 8,
    });
  };

  // Main Checkout Submission Handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create order in PostgreSQL database
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.id.startsWith('prod-') ? (item.slug || item.reference_number || item.id) : item.id,
          name: item.name,
          brand: item.brand,
          referenceNumber: item.reference_number || undefined,
          price: item.price + (item.strapOption?.price_addon ?? 0),
          quantity: item.quantity,
          imageUrl: item.image,
          strapOption: item.strapOption
            ? {
                id: item.strapOption.id,
                material: item.strapOption.material,
                price_addon: item.strapOption.price_addon || 0,
              }
            : undefined,
        })),
        totalAmount: subtotal,
        shippingName: formData.fullName || session?.user?.name || 'Valued Collector',
        shippingEmail: formData.email || session?.user?.email || 'collector@wristloom.com',
        shippingPhone: formData.phone || (session?.user as any)?.phone || '+91 98765 43210',
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

      // 2. White-Glove Handover option (Settled on personal delivery)
      if (formData.paymentMethod === 'concierge') {
        setOrderConfirmed({
          id: createdOrder.orderReference,
          items: [...items],
          subtotal,
          shipping: {
            name: formData.fullName || session?.user?.name || 'Valued Collector',
            email: formData.email || session?.user?.email || 'collector@wristloom.com',
            phone: formData.phone || (session?.user as any)?.phone || '+91 98765 43210',
            address: formData.addressLine || 'Private Atelier Residence',
            city: formData.city || 'Mumbai',
          },
          paymentMethod: 'White-Glove Handover',
          paymentStatus: 'UNPAID',
          transactionId: 'SETTLE_ON_HANDOVER',
        });
        clearCart();
        setIsCheckoutOpen(false);
        setIsSubmitting(false);
        return;
      }

      // 3. Online Payment via Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay Payment Gateway SDK failed to initialize. Please check network connection.');
      }

      // Create Razorpay payment order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrder.id, amount: subtotal }),
      });

      const rzpOrder = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(rzpOrder.error || 'Failed to generate payment gateway order.');
      }

      // If Razorpay SDK is available, trigger the official checkout modal
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'Wristloom Horological Atelier',
          description: `Order #${createdOrder.orderReference} — Luxury Timepiece Acquisition`,
          order_id: rzpOrder.orderId,
          prefill: {
            name: formData.fullName || session?.user?.name || 'Valued Collector',
            email: formData.email || session?.user?.email || 'collector@wristloom.com',
            contact: formData.phone || (session?.user as any)?.phone || '+91 98765 43210',
          },
          notes: {
            orderReference: createdOrder.orderReference,
            city: formData.city || 'Mumbai',
          },
          theme: {
            color: '#B08D57',
            backdrop_color: '#0E0C0A',
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
          handler: async function (response: any) {
            try {
              setIsSubmitting(true);
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: createdOrder.id,
                  paymentMethod: 'razorpay',
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setOrderConfirmed({
                  id: createdOrder.orderReference,
                  items: [...items],
                  subtotal,
                  shipping: {
                    name: formData.fullName || session?.user?.name || 'Valued Collector',
                    email: formData.email || session?.user?.email || 'collector@wristloom.com',
                    phone: formData.phone || (session?.user as any)?.phone || '+91 98765 43210',
                    address: formData.addressLine || 'Private Atelier Residence',
                    city: formData.city || 'Mumbai',
                  },
                  paymentMethod: 'Razorpay (Cards / UPI / NetBanking)',
                  paymentStatus: 'FULLY_PAID',
                  transactionId: response.razorpay_payment_id,
                });
                clearCart();
                setIsCheckoutOpen(false);
              } else {
                setErrorMsg(verifyData.error || 'Payment signature verification failed.');
              }
            } catch (err: any) {
              setErrorMsg(err.message || 'Error completing payment verification.');
            } finally {
              setIsSubmitting(false);
            }
          },
        });

        // Safe diagnostics capture on payment failure
        rzp.on('payment.failed', function (response: any) {
          console.error('[Razorpay Payment Failed Diagnostic]:', {
            code: response?.error?.code,
            description: response?.error?.description,
            source: response?.error?.source,
            step: response?.error?.step,
            reason: response?.error?.reason,
            order_id: response?.error?.metadata?.order_id,
            payment_id: response?.error?.metadata?.payment_id,
          });
          setIsSubmitting(false);
          const reasonText = response?.error?.description || response?.error?.reason || 'Payment was declined or cancelled.';
          setErrorMsg(`Payment Failed: ${reasonText} (Code: ${response?.error?.code || 'GATEWAY_ERROR'})`);
        });

        rzp.open();
      } else {
        throw new Error('Razorpay client modal could not be launched.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing reservation details');
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
                  Your acquisition order <strong className="text-[#EDE6D6] font-mono">{orderConfirmed.id}</strong> has been confirmed. Our master horologists have begun white-glove inspection.
                </p>
              </div>

              {/* Settlement Summary */}
              <div className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 mb-8 space-y-3">
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
                  <span className="font-mono text-sm text-[#B08D57] font-semibold">{formatCurrency(orderConfirmed.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Payment Method</span>
                  <span className="text-[#EDE6D6] font-mono uppercase text-[11px]">
                    {orderConfirmed.paymentMethod}
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
                    <span className="text-[rgba(237,230,214,0.55)]">Transaction ID</span>
                    <span className="font-mono text-[10px] text-[rgba(237,230,214,0.7)]">{orderConfirmed.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[rgba(237,230,214,0.55)]">Transit Insurance</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Fully Insured Express Transit (Up to ₹50L)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="md" className="flex-1" asChild>
                  <Link href={`/orders/${orderConfirmed.id}/certificate`}>
                    View Authenticity Certificate
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="md" className="flex-1" asChild>
                  <Link href="/shop">
                    Continue Browsing
                  </Link>
                </Button>
              </div>
            </div>
          ) : !mounted || items.length === 0 ? (
            /* Empty Cart View + 1-Click Featured Acquisition */
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center py-10 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-8">
                <ShoppingBag className="w-12 h-12 text-[rgba(237,230,214,0.25)] mx-auto mb-4" />
                <h2 className="font-display text-2xl text-[#EDE6D6] mb-2">Your cart is currently empty</h2>
                <p className="text-sm text-[rgba(237,230,214,0.50)] max-w-sm mx-auto mb-6">
                  Discover our curated collection of luxury timepieces ready for immediate dispatch.
                </p>
                <Button variant="ghost" size="md" asChild>
                  <Link href="/shop">
                    Explore Watch Boutique
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* 1-Click Ready Timepiece Card */}
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-[2px] p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#B08D57]" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold">
                    Featured Timepiece Ready for Immediate Dispatch
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-32 h-32 bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded p-2 flex items-center justify-center shrink-0">
                    <img
                      src="/watches/seiko-presage-srpb43j1.png"
                      alt="Seiko Presage Cocktail Time"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">Seiko</p>
                    <h3 className="font-display text-xl text-[#EDE6D6] mb-1">Presage Cocktail Time 'Skydiving'</h3>
                    <p className="font-mono text-xs text-[rgba(237,230,214,0.4)] mb-2">Ref. SRPB43J1 · Automatic Mechanical 4R35</p>
                    <p className="text-xs text-[rgba(237,230,214,0.6)] leading-relaxed mb-3">
                      Mesmerizing ice-blue sunburst guilloché dial, box-shaped Hardlex crystal, 41-hour power reserve, and 2-year warranty.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                      <span className="font-mono text-lg text-[#B08D57] font-semibold">₹45,000</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          handleAddFeaturedProduct();
                          setIsCheckoutOpen(true);
                        }}
                      >
                        Acquire Now with Razorpay
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              {/* Items List */}
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
                            className="w-7 h-7 border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[rgba(237,230,214,0.55)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm text-[#EDE6D6] w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.strapOption?.id)}
                            className="w-7 h-7 border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[rgba(237,230,214,0.55)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id, item.strapOption?.id)}
                          className="text-[rgba(237,230,214,0.30)] hover:text-red-400 transition-colors cursor-pointer p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="font-mono text-sm text-[#B08D57] font-semibold">{formatCurrency(itemTotal)}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearCart}
                    className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)] hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>

              {/* Order Summary Column */}
              <div>
                <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 sticky top-24 shadow-xl">
                  <h2 className="font-display text-lg text-[#EDE6D6] mb-5">Order Summary</h2>

                  <div className="space-y-3 mb-5 text-sm">
                    <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                      <span>Subtotal</span>
                      <span className="font-mono text-[#EDE6D6]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                      <span>Insured Express Shipping</span>
                      <span className="font-mono text-emerald-400 uppercase text-xs font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                      <span>Transit Insurance (Up to ₹50L)</span>
                      <span className="font-mono text-emerald-400 uppercase text-xs font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                      <span>Applicable Taxes (GST 18%)</span>
                      <span className="font-mono text-[rgba(237,230,214,0.40)] text-xs">Included in price</span>
                    </div>
                    <div className="border-t border-[rgba(176,141,87,0.15)] pt-3 flex justify-between font-semibold">
                      <span className="text-[#EDE6D6]">Total Amount</span>
                      <span className="font-mono text-lg text-[#B08D57]">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mb-3 cursor-pointer"
                    onClick={() => {
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
                    {['100% Authenticity Guaranteed', 'Fully Insured Express Shipping', 'Secured by Razorpay Gateway', '2-Year Official Atelier Warranty'].map((t) => (
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

        {/* ─── Checkout & Razorpay Payment Modal ──────────────────────────── */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
                  <span className="font-display text-lg text-[#EDE6D6]">
                    White-Glove Atelier Checkout
                  </span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="p-3 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.15)] rounded text-xs text-[rgba(237,230,214,0.7)] flex items-center justify-between">
                  <span>Order Total:</span>
                  <span className="font-mono text-sm text-[#B08D57] font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">1. Collector Delivery Details</p>
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
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">2. Insured Destination</p>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address / Residence"
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                    >
                      {['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
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
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">3. Payment Method</p>
                  <div className="space-y-2.5">
                    {/* Razorpay Gateway Option */}
                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                      className={`group relative flex items-start gap-3.5 p-3.5 rounded-[3px] border cursor-pointer transition-all select-none ${
                        formData.paymentMethod === 'razorpay'
                          ? 'border-[#B08D57] bg-[rgba(176,141,87,0.10)] shadow-[0_0_15px_rgba(176,141,87,0.12)]'
                          : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.35)] hover:bg-[#181412]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.paymentMethod === 'razorpay'
                            ? 'border-[#B08D57] bg-[#B08D57]'
                            : 'border-[rgba(176,141,87,0.30)] bg-transparent group-hover:border-[#B08D57]/60'
                        }`}>
                          {formData.paymentMethod === 'razorpay' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#14110F]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm text-[#EDE6D6] font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#B08D57] shrink-0" />
                            <span>Razorpay Secure Gateway</span>
                          </span>
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shrink-0 font-semibold">
                            UPI · Cards · NetBanking
                          </span>
                        </div>
                        <p className="text-xs text-[rgba(237,230,214,0.55)] leading-relaxed">
                          Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), or NetBanking.
                        </p>
                      </div>
                    </div>

                    {/* White-Glove Handover Option */}
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
                          Inspect the timepiece in the presence of our bonded horologist upon personal delivery before balance release.
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

                <div className="pt-4 border-t border-[rgba(176,141,87,0.15)] space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#B08D57]/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Connecting to Secure Gateway...
                      </>
                    ) : formData.paymentMethod === 'concierge' ? (
                      <>
                        Confirm Handover Reservation ({formatCurrency(subtotal)})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Pay with Razorpay ({formatCurrency(subtotal)})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-[rgba(237,230,214,0.4)] pt-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#B08D57]" />
                      256-Bit SSL Encrypted Payment
                    </span>
                    <span>Official Razorpay Partner</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SiteWrapper>
  );
}
