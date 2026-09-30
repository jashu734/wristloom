import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteWrapper } from '@/components/layout/SiteWrapper';

export const metadata: Metadata = {
  title: 'Watch Care',
  description: 'Day-to-day watch care guidance from Wristloom\'s certified horologists — how to handle, clean, and maintain your timepieces.',
};

export default function WatchCarePage() {
  const tips = [
    {
      heading: 'Handling',
      items: [
        'Always hold a watch from the case, not the crown. Repeated pressure on the crown wears the stem.',
        'Remove your watch before any activity that involves impact — golf swings, weight training, or even vigorous applause at close range.',
        'When putting a watch on a hard surface, place it face-down on a microfibre cloth, never directly on stone or glass.',
      ],
    },
    {
      heading: 'Cleaning',
      items: [
        'Clean metal bracelets with a soft brush (a toothbrush works well) and warm, soapy water — if your watch is water resistant to at least 50m.',
        'Wipe the case and crystal with a barely damp cloth after saltwater exposure, even if the watch is rated for it.',
        'Avoid chemical contact: perfume, solvents, sunscreen. Apply these first and let them dry before putting on your watch.',
      ],
    },
    {
      heading: 'Storage',
      items: [
        'Store watches individually or in a compartmented box — scratched crystals and cases are often caused by pieces touching each other.',
        'Avoid magnetic storage. Bedside phone chargers, laptop magnetic lids, and hotel room locks are all significant sources.',
        'If storing for an extended period, wind an automatic watch every two to three weeks to keep the lubricants distributed.',
      ],
    },
    {
      heading: 'Service Intervals',
      items: [
        'Most Swiss manufacturers recommend a full service every 5–8 years. High-complication pieces may need attention more frequently.',
        'If your watch is running more than ±15 seconds per day, it is likely due for regulation.',
        'A watch gaining time dramatically then stopping is often a sign of depleted lubricants in the movement.',
      ],
    },
  ];

  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Watch Care Essentials
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              The difference between a watch that lasts a generation and one that deteriorates prematurely is rarely about the watch itself. It is almost always about how it is cared for.
            </p>
          </div>
        </div>

        <div className="container-wl py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tips.map((section) => (
              <div key={section.heading} className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6">
                <h2 className="font-display text-xl text-[#EDE6D6] mb-4 pb-3 border-b border-[rgba(176,141,87,0.10)]">
                  {section.heading}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[rgba(237,230,214,0.60)] leading-relaxed">
                      <span className="text-[#B08D57] flex-shrink-0 mt-0.5 font-mono text-[10px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-8 text-center">
            <h2 className="font-display text-2xl text-[#EDE6D6] mb-3">
              Need a hands-on assessment?
            </h2>
            <p className="text-sm text-[rgba(237,230,214,0.55)] max-w-md mx-auto mb-6">
              Our certified technicians can visit your home to inspect your collection, assess health status, and advise on priority service needs.
            </p>
            <Link
              href="/services/repair"
              className="inline-flex items-center font-mono text-[11px] tracking-widest uppercase px-6 py-3 border border-[rgba(176,141,87,0.30)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] rounded-[2px] transition-colors"
            >
              Book a House Call
            </Link>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
