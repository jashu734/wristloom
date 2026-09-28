import * as React from 'react';
import Link from 'next/link';
import { MOCK_TECHNICIANS } from '@/lib/mock-data';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

// ─── Featured Technicians Strip ───────────────────────────────
// 3-column strip on the home page linking to the full directory

export function FeaturedTechnicians() {
  const technicians = MOCK_TECHNICIANS.slice(0, 3);

  return (
    <section className="section-padding bg-[#1E1A17] border-y border-[rgba(176,141,87,0.08)]" aria-labelledby="technicians-heading">
      <div className="container-wl">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-overline block mb-3">Certified Specialists</span>
            <h2
              id="technicians-heading"
              className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight"
            >
              The Hands Behind Every Service
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/technicians">
              All Technicians <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <Link
              key={tech.id}
              href={`/technicians/${tech.id}`}
              className="group bg-[#14110F] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300"
            >
              {/* Portrait */}
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={tech.portrait_url}
                  alt={tech.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg text-[#EDE6D6] mb-1">{tech.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" aria-hidden />
                  <span className="font-mono text-sm text-[#B08D57]">{tech.rating}</span>
                  <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] uppercase tracking-wider">
                    · {tech.completed_services} services
                  </span>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5">
                  {tech.specializations.slice(0, 2).map((spec) => (
                    <span
                      key={spec}
                      className="font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.45)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.12)] px-2 py-0.5 rounded-[1px]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
