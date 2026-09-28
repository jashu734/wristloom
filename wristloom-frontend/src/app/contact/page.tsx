import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { ContactForm } from '@/components/forms/ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Wristloom\'s concierge team for support, enquiries, or to book a consultation.',
};

export default function ContactPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Support</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight">
              Contact Us
            </h1>
          </div>
        </div>

        <div className="container-wl py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-16">
            {/* Info */}
            <div className="space-y-10">
              <div>
                <h2 className="font-display text-2xl text-[#EDE6D6] mb-6">Concierge Support</h2>
                <div className="space-y-5">
                  {[
                    { icon: Phone, label: 'Concierge Line', value: '+91 800 123 4567', sub: 'Mon–Sat, 10:00 AM – 7:00 PM IST' },
                    { icon: Mail, label: 'Email', value: 'concierge@wristloom.com', sub: 'Responses within 4 business hours' },
                    { icon: MapPin, label: 'Atelier', value: 'Horniman Circle, Fort, Mumbai 400001', sub: 'By appointment only' },
                    { icon: Clock, label: 'Business Hours', value: 'Monday – Saturday', sub: '10:00 AM – 7:00 PM IST' },
                  ].map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-[2px] bg-[rgba(176,141,87,0.08)] border border-[rgba(176,141,87,0.15)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#B08D57]" aria-hidden />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-0.5">{label}</p>
                        <p className="text-[#EDE6D6] text-sm">{value}</p>
                        <p className="text-xs text-[rgba(237,230,214,0.45)] mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map visual — static placeholder styled to match brand */}
              <div className="aspect-[16/9] bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-[rgba(176,141,87,0.30)] mx-auto mb-2" />
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.30)]">
                      Horniman Circle, Fort, Mumbai
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iMzAiIHkxPSIwIiB4Mj0iMzAiIHkyPSI2MCIgc3Ryb2tlPSIjQjA4RDU3IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjxsaW5lIHgxPSIwIiB5MT0iMzAiIHgyPSI2MCIgeTI9IjMwIiBzdHJva2U9IiNCMDhENTciIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40" />
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
