import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_TECHNICIANS, MOCK_REVIEWS } from '@/lib/mock-data';
import { Star, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Certified Technicians',
  description: 'Meet Wristloom\'s certified watch specialists — WOSTEP-trained master watchmakers with decades of combined experience across luxury Swiss and Japanese brands.',
};

export default function TechniciansPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        {/* Header */}
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">Certified Specialists</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              The Hands Behind Every Service
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Every Wristloom technician is individually vetted, certified, and continuously assessed. You know exactly who is working on your watch before they arrive.
            </p>
          </div>
        </div>

        <div className="container-wl py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TECHNICIANS.map((tech) => {
              const techReviews = MOCK_REVIEWS.filter((r) => r.technician_id === tech.id);
              return (
                <Link
                  key={tech.id}
                  href={`/technicians/${tech.id}`}
                  className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.30)] rounded-[2px] overflow-hidden transition-all duration-300"
                >
                  {/* Portrait */}
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={tech.portrait_url}
                      alt={tech.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {/* Availability */}
                    <div className="absolute top-3 right-3">
                      <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-[1px] border ${
                        tech.available
                          ? 'text-emerald-400 bg-emerald-900/40 border-emerald-700/40'
                          : 'text-[rgba(237,230,214,0.45)] bg-[rgba(20,17,15,0.60)] border-[rgba(237,230,214,0.15)]'
                      }`}>
                        {tech.available ? 'Available' : 'Fully Booked'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h2 className="font-display text-lg text-[#EDE6D6] group-hover:text-[#B08D57] transition-colors">
                          {tech.name}
                        </h2>
                        <p className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.40)] mt-0.5">
                          {tech.years_experience} Years Experience
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#B08D57] fill-[#B08D57]" aria-hidden />
                        <span className="font-mono text-sm text-[#B08D57]">{tech.rating}</span>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tech.certifications.slice(0, 2).map((cert) => (
                        <div key={cert.id} className="flex items-center gap-1 font-mono text-[9px] tracking-wider uppercase text-[rgba(237,230,214,0.45)] bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.12)] px-2 py-0.5 rounded-[1px]">
                          <Award className="w-2.5 h-2.5 text-[#B08D57]" aria-hidden />
                          {cert.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                      ))}
                    </div>

                    {/* Brands */}
                    <p className="text-xs text-[rgba(237,230,214,0.45)]">
                      {tech.brands_serviced.slice(0, 3).join(' · ')}
                      {tech.brands_serviced.length > 3 && ` · +${tech.brands_serviced.length - 3} more`}
                    </p>

                    {/* Stats row */}
                    <div className="mt-4 pt-3 border-t border-[rgba(176,141,87,0.08)] flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">
                        {tech.completed_services.toLocaleString()} services
                      </span>
                      <span className="font-mono text-[10px] text-[rgba(237,230,214,0.35)]">
                        {techReviews.length} reviews
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}
