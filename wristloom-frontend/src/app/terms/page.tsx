import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">Terms of Service</h1>
            <p className="text-[rgba(237,230,214,0.45)] text-sm mt-2">Last updated: September 2025</p>
          </div>
        </div>
        <div className="container-wl py-16 max-w-3xl mx-auto">
          <div className="space-y-10 text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
            {[
              { title: 'Acceptance of Terms', body: 'By accessing or using Wristloom, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform or services.' },
              { title: 'Service Descriptions', body: 'Wristloom provides a luxury watch marketplace, authentication services, repair and restoration services, trade-in programme, Watch Vault digital collection management, and collector education content. Service availability may vary by location. Descriptions of all services are provided in good faith based on the information available at time of listing.' },
              { title: 'Authentication Services', body: 'Wristloom authentication is conducted by certified professionals using industry-standard methods. An Authentication Certificate represents our professional opinion based on the examination performed and the information available. It does not constitute a guarantee against all future claims of inauthenticity, nor does it constitute legal certification of provenance.' },
              { title: 'Trade-In Programme', body: 'Trade-in valuations are valid for 30 days from the date of issue. Platform credit issued in exchange for trade-in watches does not expire and cannot be converted to cash. Credit can only be used on the Wristloom platform.' },
              { title: 'Limitation of Liability', body: 'To the fullest extent permitted by applicable law, Wristloom\'s liability for any claim arising from the use of our services is limited to the amount paid for the service in question. We are not liable for indirect, incidental, or consequential damages.' },
              { title: 'Governing Law', body: 'These Terms of Service are governed by the laws of India. Any disputes arising from these terms or from the use of Wristloom services shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.' },
            ].map((s) => (
              <div key={s.title}>
                <h2 className="font-display text-xl text-[#EDE6D6] mb-3 pb-3 border-b border-[rgba(176,141,87,0.10)]">{s.title}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
