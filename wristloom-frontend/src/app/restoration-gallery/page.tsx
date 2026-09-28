import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_RESTORATIONS, MOCK_TECHNICIANS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Restoration Gallery',
  description: 'Before and after transformations by Wristloom\'s master watchmakers. Full case refinishing, movement service, and dial restoration showcased in detail.',
};

export default function RestorationGalleryPage() {
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Atelier</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Restoration Gallery
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Every restoration is a dialogue between a watchmaker and a timepiece. These are the results of those conversations.
            </p>
          </div>
        </div>

        <div className="container-wl py-16 space-y-16">
          {MOCK_RESTORATIONS.map((project) => {
            const tech = MOCK_TECHNICIANS.find((t) => t.id === project.technician_id);
            return (
              <article key={project.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before / After */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-2">Before</p>
                    <div className="aspect-square overflow-hidden rounded-[2px] border border-[rgba(176,141,87,0.10)]">
                      <img
                        src={project.before_images[0]}
                        alt={`${project.watch_brand} ${project.watch_model} before restoration`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">After</p>
                    <div className="aspect-square overflow-hidden rounded-[2px] border border-[rgba(176,141,87,0.20)]">
                      <img
                        src={project.after_images[0]}
                        alt={`${project.watch_brand} ${project.watch_model} after restoration`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">
                    {project.watch_brand}
                  </p>
                  <h2 className="font-display text-2xl text-[#EDE6D6] mb-1">{project.watch_model}</h2>
                  <p className="font-mono text-xs tracking-widest uppercase text-[rgba(237,230,214,0.40)] mb-4">
                    Ref. {project.reference_number}
                  </p>
                  <p className="text-sm text-[rgba(237,230,214,0.60)] leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Work performed */}
                  <div className="mb-6">
                    <h3 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-3">
                      Work Performed
                    </h3>
                    <ul className="space-y-1.5">
                      {project.work_performed.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-xs text-[rgba(237,230,214,0.55)]">
                          <span className="text-[#B08D57] flex-shrink-0 mt-0.5">—</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-6 text-[rgba(237,230,214,0.35)]">
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase mb-0.5">Technician</p>
                      <p className="font-mono text-xs text-[rgba(237,230,214,0.55)]">{tech?.name ?? 'Wristloom Atelier'}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase mb-0.5">Duration</p>
                      <p className="font-mono text-xs text-[rgba(237,230,214,0.55)]">{project.duration_days} days</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SiteWrapper>
  );
}
