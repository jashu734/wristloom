'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
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

export interface BuyNowItem {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  referenceNumber?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  strapOption?: {
    id?: string;
    material?: string;
    price_addon?: number;
  };
}

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutType = searchParams.get('type') || 'cart'; // 'buy-now' | 'cart'
  const isBuyNow = checkoutType === 'buy-now';

  const { data: session } = useSession();
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = React.useState(false);
  const [buyNowItem, setBuyNowItem] = React.useState<BuyNowItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [orderConfirmed, setOrderConfirmed] = React.useState<{
    id: string;
    orderReference: string;
    items: { name: string; brand: string; price: number; quantity: number; imageUrl?: string }[];
    totalAmount: number;
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
    paymentMethod: 'razorpay', // 'razorpay' | 'concierge'
  });

  // Load Buy Now item from sessionStorage on mount
  React.useEffect(() => {
    setMounted(true);
    if (isBuyNow) {
      try {
        const stored = sessionStorage.getItem('wristloom_buy_now_item');
        if (stored) {
          const parsed = JSON.parse(stored);
          setBuyNowItem(parsed);
        }
      } catch (err) {
        console.error('Failed to parse buy-now session item:', err);
      }
    }
  }, [isBuyNow]);

  // Auto-prefill authenticated user details
  React.useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || '',
        email: prev.email || session.user.email || '',
        phone: prev.phone || (session.user as any)?.phone || '',
      }));
    }
  }, [session]);

  // Determine active checkout items
  const activeItems = React.useMemo(() => {
    if (isBuyNow) {
      if (!buyNowItem) return [];
      return [
        {
          id: buyNowItem.id,
          name: buyNowItem.name,
          brand: buyNowItem.brand,
          referenceNumber: buyNowItem.referenceNumber,
          price: buyNowItem.price,
          quantity: buyNowItem.quantity || 1,
          imageUrl: buyNowItem.imageUrl || '/watches/placeholder-watch.svg',
          strapOption: buyNowItem.strapOption,
        },
      ];
    }
    return cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      referenceNumber: item.reference_number,
      price: item.price + (item.strapOption?.price_addon ?? 0),
      quantity: item.quantity,
      imageUrl: item.image,
      strapOption: item.strapOption,
    }));
  }, [isBuyNow, buyNowItem, cartItems]);

  const subtotal = React.useMemo(() => {
    return activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [activeItems]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItems.length === 0) {
      setErrorMsg('No timepieces selected for checkout.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Post order to server
      const orderPayload = {
        items: activeItems.map((item) => ({
          productId: item.id.startsWith('prod-') ? item.id : item.id,
          name: item.name,
          brand: item.brand,
          referenceNumber: item.referenceNumber || undefined,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
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
        throw new Error(data.error ?? 'Failed to initialize acquisition order.');
      }

      const createdOrder = data.order;

      // 2. White-Glove Handover option (settle upon personal handover)
      if (formData.paymentMethod === 'concierge') {
        setOrderConfirmed({
          id: createdOrder.id,
          orderReference: createdOrder.orderReference,
          items: [...activeItems],
          totalAmount: subtotal,
          shipping: {
            name: orderPayload.shippingName,
            email: orderPayload.shippingEmail,
            phone: orderPayload.shippingPhone,
            address: orderPayload.shippingAddress.addressLine,
            city: orderPayload.shippingAddress.city,
          },
          paymentMethod: 'White-Glove Handover',
          paymentStatus: 'UNPAID',
          transactionId: 'SETTLE_ON_HANDOVER',
        });

        if (isBuyNow) {
          sessionStorage.removeItem('wristloom_buy_now_item');
        } else {
          clearCart();
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Online Payment via Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay Payment Gateway SDK failed to initialize. Please check network connection.');
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrder.id, amount: subtotal }),
      });

      const rzpOrder = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(rzpOrder.error || 'Failed to generate payment gateway order.');
      }

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'Wristloom Horological Atelier',
          description: `Order #${createdOrder.orderReference} — Direct Timepiece Acquisition`,
          order_id: rzpOrder.orderId,
          prefill: {
            name: orderPayload.shippingName,
            email: orderPayload.shippingEmail,
            contact: orderPayload.shippingPhone,
          },
          notes: {
            orderReference: createdOrder.orderReference,
            city: orderPayload.shippingAddress.city,
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
                  id: createdOrder.id,
                  orderReference: createdOrder.orderReference,
                  items: [...activeItems],
                  totalAmount: subtotal,
                  shipping: {
                    name: orderPayload.shippingName,
                    email: orderPayload.shippingEmail,
                    phone: orderPayload.shippingPhone,
                    address: orderPayload.shippingAddress.addressLine,
                    city: orderPayload.shippingAddress.city,
                  },
                  paymentMethod: 'Razorpay (Cards / UPI / NetBanking)',
                  paymentStatus: 'FULLY_PAID',
                  transactionId: response.razorpay_payment_id,
                });

                if (isBuyNow) {
                  sessionStorage.removeItem('wristloom_buy_now_item');
                } else {
                  clearCart();
                }
              } else {
                setErrorMsg(verifyData.error || 'Payment signature verification failed.');
              }
            } catch (verifyErr: any) {
              setErrorMsg(verifyErr.message || 'Payment verification encountered an issue.');
            } finally {
              setIsSubmitting(false);
            }
          },
        });

        rzp.open();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#14110F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#B08D57] animate-spin" />
      </div>
    );
  }

  // ─── Order Confirmation Screen ───
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-[#14110F] py-12 md:py-20">
        <div className="container-wl max-w-2xl">
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.30)] rounded-[2px] p-8 md:p-10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(176,141,87,0.12)] border border-[rgba(176,141,87,0.30)] flex items-center justify-center mx-auto text-[#B08D57]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-2">
                Acquisition Confirmed
              </span>
              <h1 className="font-display text-2xl md:text-3xl text-[#EDE6D6]">
                Welcome to Horological Custody
              </h1>
              <p className="text-xs text-[rgba(237,230,214,0.60)] mt-2">
                Your luxury timepiece acquisition has been entered into the Wristloom Atelier ledger.
              </p>
            </div>

            <div className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-5 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[rgba(176,141,87,0.10)] pb-2.5">
                <span className="text-[rgba(237,230,214,0.45)] uppercase">Order Reference</span>
                <span className="text-[#B08D57] font-semibold">{orderConfirmed.orderReference}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(176,141,87,0.10)] pb-2.5">
                <span className="text-[rgba(237,230,214,0.45)] uppercase">Settlement Method</span>
                <span className="text-[#EDE6D6]">{orderConfirmed.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(176,141,87,0.10)] pb-2.5">
                <span className="text-[rgba(237,230,214,0.45)] uppercase">Delivery Address</span>
                <span className="text-[#EDE6D6]">{orderConfirmed.shipping.address}, {orderConfirmed.shipping.city}</span>
              </div>
              <div className="flex justify-between pt-1 font-semibold text-sm">
                <span className="text-[#EDE6D6]">Total Value</span>
                <span className="text-[#B08D57]">{formatCurrency(orderConfirmed.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="primary" size="lg" className="flex-1" asChild>
                <Link href={`/orders/${orderConfirmed.id}/track`}>
                  Track Secure Delivery
                </Link>
              </Button>
              <Button variant="subtle" size="lg" className="flex-1" asChild>
                <Link href="/shop">
                  Continue Browsing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty State (No items for checkout) ───
  if (activeItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#14110F] py-16">
        <div className="container-wl max-w-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.20)] flex items-center justify-center mx-auto text-[#B08D57]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#EDE6D6]">No Timepiece Selected</h1>
            <p className="text-xs text-[rgba(237,230,214,0.50)] mt-2">
              {isBuyNow
                ? 'Your direct purchase session expired or no timepiece was selected.'
                : 'Your shopping cart is currently empty.'}
            </p>
          </div>
          <Button variant="primary" size="md" asChild>
            <Link href="/shop">Explore Watch Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Checkout Form & Summary ───
  return (
    <div className="min-h-screen bg-[#14110F] py-8 md:py-16">
      <div className="container-wl max-w-5xl">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[rgba(176,141,87,0.15)]">
          <Link
            href={isBuyNow && buyNowItem?.slug ? `/products/${buyNowItem.slug}` : '/cart'}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[rgba(237,230,214,0.50)] hover:text-[#B08D57] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBuyNow ? 'Return to Watch' : 'Return to Cart'}
          </Link>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#B08D57] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            {isBuyNow ? 'Direct Acquisition Checkout' : 'Standard Cart Checkout'}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-[2px] flex items-center gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Delivery & Payment Details Form */}
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
              {/* Recipient Details */}
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <h2 className="font-display text-base text-[#EDE6D6] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#B08D57]" />
                    Client & Delivery Address
                  </h2>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57]">
                    Armored Transit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Vikramaditya Singhania"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      Email for Horological Certificate
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="collector@domain.com"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      Contact Phone (Courier Verification)
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      Residential or Office Address Line
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      placeholder="Suite / Bungalow / Street / Locality"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bangalore, Mumbai"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.60)]">
                      Postal PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  <h2 className="font-display text-base text-[#EDE6D6] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#B08D57]" />
                    Settlement & Escrow
                  </h2>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                    Encrypted TLS 1.3
                  </span>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-[2px] border cursor-pointer transition-all ${
                      formData.paymentMethod === 'razorpay'
                        ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                        : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.30)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                      className="mt-1 accent-[#B08D57]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[#EDE6D6]">
                          Instant Electronic Escrow (Razorpay)
                        </span>
                        <Badge variant="brass">UPI · NetBanking · Cards</Badge>
                      </div>
                      <p className="text-[11px] text-[rgba(237,230,214,0.50)] mt-1">
                        Secure instant settlement with zero gateway surcharge. Instant horological certificate issuance.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-[2px] border cursor-pointer transition-all ${
                      formData.paymentMethod === 'concierge'
                        ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                        : 'border-[rgba(176,141,87,0.15)] bg-[#14110F] hover:border-[rgba(176,141,87,0.30)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="concierge"
                      checked={formData.paymentMethod === 'concierge'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'concierge' })}
                      className="mt-1 accent-[#B08D57]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[#EDE6D6]">
                          White-Glove Handover Settlement
                        </span>
                        <Badge variant="oxblood">Verified Handover</Badge>
                      </div>
                      <p className="text-[11px] text-[rgba(237,230,214,0.50)] mt-1">
                        Settle payment via bank RTGS / corporate card upon personal unboxing with our bonded courier.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Timepiece Summary & Price Breakdown */}
          <div className="lg:col-span-5">
            <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 shadow-2xl sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(176,141,87,0.12)]">
                <h2 className="font-display text-base text-[#EDE6D6]">
                  {isBuyNow ? 'Immediate Acquisition' : 'Acquisition Summary'}
                </h2>
                <span className="font-mono text-xs text-[#B08D57]">
                  {activeItems.length} {activeItems.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 pb-3 border-b border-[rgba(176,141,87,0.08)]">
                    <div className="w-16 h-16 rounded-[2px] border border-[rgba(176,141,87,0.15)] bg-[#14110F] p-1.5 flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/watches/placeholder-watch.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#B08D57] block truncate">
                        {item.brand}
                      </span>
                      <p className="text-xs font-medium text-[#EDE6D6] truncate">{item.name}</p>
                      {item.strapOption?.material && (
                        <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                          Strap: {item.strapOption.material}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-[10px] text-[rgba(237,230,214,0.45)]">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-mono text-xs text-[#B08D57] font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculation Table */}
              <div className="space-y-2.5 font-mono text-xs border-b border-[rgba(176,141,87,0.12)] pb-4">
                <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                  <span>Timepiece Subtotal</span>
                  <span className="text-[#EDE6D6]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                  <span>Insured Express Courier</span>
                  <span className="text-emerald-400 font-semibold uppercase text-[10px]">Complimentary</span>
                </div>
                <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                  <span>Transit Insurance (Up to ₹50L)</span>
                  <span className="text-emerald-400 font-semibold uppercase text-[10px]">Included</span>
                </div>
                <div className="flex justify-between text-[rgba(237,230,214,0.60)]">
                  <span>GST (18% Applicable Tax)</span>
                  <span className="text-[rgba(237,230,214,0.40)] text-[10px]">Included in Price</span>
                </div>
              </div>

              {/* Final Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-display text-[#EDE6D6]">Total Acquisition Value</span>
                <span className="font-mono text-xl font-bold text-[#B08D57]">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                form="checkout-form"
                variant="oxblood"
                size="lg"
                className="w-full font-mono text-xs tracking-widest uppercase cursor-pointer py-4"
                loading={isSubmitting}
              >
                {formData.paymentMethod === 'razorpay' ? 'Authorize & Complete Payment' : 'Confirm White-Glove Order'}
              </Button>

              {/* Security assurances */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[rgba(237,230,214,0.40)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>100% Certified Authentic & Insured</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[rgba(237,230,214,0.40)]">
                  <Truck className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Dispatched via Armored Secure Logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
