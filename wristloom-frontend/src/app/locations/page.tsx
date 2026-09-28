import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_LOCATIONS } from '@/lib/mock-data';
import { Badge } from '@/components/primitives/Badge';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service Locations',
  description: 'Wristloom house-call repair and authentication services are available across major Indian cities. Check coverage in your area.',
};

export default function LocationsPage() {
  const available = MOCK_LOCATIONS.filter((l) => l.availability_status === 'Available');
  const limited = MOCK_LOCATIONS.filter((l) => l.availability_status === 'Limited');
  const coming = MOCK_LOCATIONS.filter((l) => l.availability_status === 'Coming Soon');

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Where We Operate</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Service Locations
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Our certified technicians operate across India's major cities. House-call repair, authentication, and concierge services — brought directly to you.
            </p>
          </div>
        </div>

        <div className="container-wl py-16 space-y-12">
          {[
            { label: 'Fully Available', items: available, variant: 'available' as const },
            { label: 'Limited Availability', items: limited, variant: 'limited' as const },
            { label: 'Coming Soon', items: coming, variant: 'coming-soon' as const },
          ].map(({ label, items, variant }) =>
            items.length > 0 ? (
              <div key={label}>
                <div className="flex items-center gap-3 mb-5">
                  <Badge variant={variant} dot>{label}</Badge>
                  <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">
                    {items.length} {items.length === 1 ? 'city' : 'cities'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((loc) => (
                    <div key={loc.id} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <MapPin className="w-4 h-4 text-[#B08D57] flex-shrink-0 mt-0.5" aria-hidden />
                        <div>
                          <h2 className="font-display text-lg text-[#EDE6D6]">{loc.city}</h2>
                          <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">
                            {loc.region}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[rgba(237,230,214,0.50)] mb-3 leading-relaxed">
                        {loc.coverage_area}
                      </p>
                      {loc.services_available.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {loc.services_available.map((s) => (
                            <span key={s} className="font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.45)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.10)] px-2 py-0.5 rounded-[1px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </SiteWrapper>
  );
}
