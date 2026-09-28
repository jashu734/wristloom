import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">Privacy Policy</h1>
            <p className="text-[rgba(237,230,214,0.45)] text-sm mt-2">Last updated: September 2025</p>
          </div>
        </div>
        <div className="container-wl py-16 max-w-3xl mx-auto">
          <div className="space-y-10 text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
            {[
              { title: 'Information We Collect', body: 'We collect information you provide directly — name, email address, phone number, postal address, and payment details — when you create an account, make a purchase, submit a watch for authentication or repair, or contact our concierge. We also collect data about your interactions with the platform: watch searches, pages viewed, services enquired about, and Watch Vault usage.' },
              { title: 'How We Use Your Information', body: 'We use your information to provide and improve our services, process transactions, communicate with you about your orders and services, personalise your experience on the platform, and comply with our legal obligations. We do not sell your personal information to third parties.' },
              { title: 'Data Security', body: 'All data is encrypted in transit and at rest. Payment information is processed by PCI-DSS compliant payment processors and is never stored on Wristloom servers. Access to your account and Watch Vault is protected by industry-standard authentication.' },
              { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. You may also request a copy of all data we hold about you in a portable format. To exercise these rights, contact privacy@wristloom.com. We respond to all requests within 30 days.' },
              { title: 'Cookies', body: 'We use essential cookies to keep you signed in and remember your preferences. We use analytics cookies (with your consent) to understand how the platform is used and improve it. You can withdraw cookie consent at any time through your account settings.' },
              { title: 'Contact', body: 'For privacy-related enquiries, contact our Data Protection Officer at privacy@wristloom.com or write to us at our registered address.' },
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
