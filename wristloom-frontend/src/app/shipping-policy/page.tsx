import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';

export const metadata: Metadata = { title: 'Shipping Policy' };

export default function ShippingPolicyPage() {
  return (
    <SiteWrapper>
      <PolicyPage title="Shipping Policy" subtitle="We handle every shipment as if it were our own.">
        <PolicySection title="Domestic Shipping (India)">
          <p>All orders are shipped via an insured courier partner with end-to-end tracking. Standard delivery takes 3–5 business days. Express options are available at checkout. Free shipping is included on all orders above ₹50,000.</p>
        </PolicySection>
        <PolicySection title="International Shipping">
          <p>We ship internationally via insured freight to select countries. Delivery times vary between 7–14 business days. All customs duties and import taxes are the responsibility of the recipient. International orders are assessed on a per-shipment basis to ensure appropriate insurance coverage.</p>
        </PolicySection>
        <PolicySection title="Insurance Coverage">
          <p>Every shipment from Wristloom is insured for its full declared value. In the event of loss or damage in transit, we handle the claim process on your behalf. Watches valued over ₹5,00,000 require signature confirmation on delivery.</p>
        </PolicySection>
        <PolicySection title="Packaging">
          <p>All watches are shipped in double-walled custom packaging with individual compartmentalisation, anti-shock padding, and humidity control inserts. Watches with boxes and papers are nested in their original presentation boxes before being placed in the shipping container.</p>
        </PolicySection>
        <PolicySection title="Returns">
          <p>Watches may be returned within 14 days of delivery if they arrive in a condition materially different from the listing description. Authentication Certificate watches carry a 3-day return window for condition-related issues. Please contact concierge@wristloom.com to initiate a return.</p>
        </PolicySection>
      </PolicyPage>
    </SiteWrapper>
  );
}

function PolicyPage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#14110F]">
      <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
        <div className="container-wl py-16">
          <span className="text-overline block mb-3">Legal</span>
          <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-3">{title}</h1>
          <p className="text-[rgba(237,230,214,0.55)] text-base">{subtitle}</p>
        </div>
      </div>
      <div className="container-wl py-16 max-w-3xl mx-auto space-y-10">{children}</div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-[#EDE6D6] mb-3 pb-3 border-b border-[rgba(176,141,87,0.10)]">{title}</h2>
      <div className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
