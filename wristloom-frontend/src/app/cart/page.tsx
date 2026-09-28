'use client';

import * as React from 'react';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus, ShoppingCart, CheckCircle, ShieldCheck, Truck, CreditCard, X, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/store/cartStore';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.price + (i.strapOption?.price_addon ?? 0)) * i.quantity,
    0
  );

  // Avoid SSR hydration mismatch with localStorage-backed store
  const [mounted, setMounted] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState<{
    id: string;
    items: CartItem[];
    subtotal: number;
    shipping: { name: string; email: string; phone: string; address: string; city: string };
    paymentMethod: string;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: 'Mumbai',
    postalCode: '',
    paymentMethod: 'concierge', // 'concierge' | 'online' | 'wire'
  });

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
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
        throw new Error(data.error ?? 'Failed to place order');
      }

      setOrderConfirmed({
        id: data.order.orderReference,
        items: [...items],
        subtotal,
        shipping: {
          name: formData.fullName || 'Valued Collector',
          email: formData.email || 'collector@wristloom.com',
          phone: formData.phone || '+91 98765 43210',
          address: formData.addressLine || 'Private Atelier Residence',
          city: formData.city || 'Mumbai',
        },
        paymentMethod: formData.paymentMethod,
      });
      clearCart();
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating order');
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
                  <span className="text-[rgba(237,230,214,0.55)]">Transit Insurance</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Lloyd&apos;s Insured (Up to ₹50L)</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full" asChild>
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
                      <Link href={`/products/${item.slug}`} className="w-20 h-20 flex-shrink-0 rounded-[2px] overflow-hidden">
                        <img src={item.image} alt={`${item.brand} ${item.name}`} className="w-full h-full object-cover" />
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 border border-[rgba(176,141,87,0.20)] rounded-[2px] flex items-center justify-center text-[rgba(237,230,214,0.55)] hover:border-[#B08D57] hover:text-[#B08D57] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm text-[#EDE6D6] w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                          onClick={() => removeItem(item.id)}
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
                    onClick={() => setIsCheckoutOpen(true)}
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

        {/* ─── Checkout Modal ────────────────────────────────────────── */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
                  <span className="font-display text-lg text-[#EDE6D6]">White-Glove Atelier Checkout</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57]">3. Payment & Settlement</p>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'concierge'
                        ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                        : 'border-[rgba(176,141,87,0.15)] bg-[#14110F]'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="concierge"
                        checked={formData.paymentMethod === 'concierge'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'concierge' })}
                        className="mt-1 accent-[#B08D57]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#EDE6D6] font-medium">
                          <Truck className="w-3.5 h-3.5 text-[#B08D57]" />
                          White-Glove Handover (Card / Banker&apos;s Cheque on Delivery)
                        </div>
                        <p className="text-[11px] text-[rgba(237,230,214,0.45)] mt-0.5">
                          Inspect the timepiece in the presence of our bonded horologist before payment release.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'online'
                        ? 'border-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                        : 'border-[rgba(176,141,87,0.15)] bg-[#14110F]'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'online' })}
                        className="mt-1 accent-[#B08D57]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#EDE6D6] font-medium">
                          <CreditCard className="w-3.5 h-3.5 text-[#B08D57]" />
                          Online Card / NetBanking / UPI Gateway
                        </div>
                        <p className="text-[11px] text-[rgba(237,230,214,0.45)] mt-0.5">
                          Instant cryptographic reservation with 256-bit encrypted escrow payment.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-4 border-t border-[rgba(176,141,87,0.15)]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#B08D57]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Authorizing Timepiece Reservation...
                      </>
                    ) : (
                      <>
                        Authorize & Place Order ({formatCurrency(subtotal)})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-[rgba(237,230,214,0.35)] mt-2">
                    Backed by Wristloom 100% Authenticity Guarantee & 2-Year Atelier Movement Warranty.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SiteWrapper>
  );
}
