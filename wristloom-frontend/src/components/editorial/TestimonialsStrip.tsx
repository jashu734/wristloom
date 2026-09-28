import * as React from 'react';
import Link from 'next/link';
import { MOCK_TESTIMONIALS } from '@/lib/mock-data';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

// ─── Testimonials Strip ───────────────────────────────────────
// 3 featured testimonials on the home page in editorial layout

export function TestimonialsStrip() {
  const featured = MOCK_TESTIMONIALS.filter((t) => t.featured).slice(0, 3);

  return (
    <section className="section-padding bg-[#14110F]" aria-labelledby="testimonials-heading">
      <div className="container-wl">

        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-overline block mb-3">From Our Collectors</span>
            <h2
              id="testimonials-heading"
              className="font-display text-3xl md:text-4xl text-[#EDE6D6] tracking-tight"
            >
              In Their Own Words
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/testimonials">
              All Stories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < testimonial.rating ? 'text-[#B08D57] fill-[#B08D57]' : 'text-[rgba(176,141,87,0.20)]'}`}
                    aria-hidden
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="font-display text-base text-[#EDE6D6] mb-3 leading-snug">
                &ldquo;{testimonial.title}&rdquo;
              </h3>

              {/* Body */}
              <p className="text-sm text-[rgba(237,230,214,0.55)] leading-relaxed flex-1 mb-5">
                {testimonial.body.slice(0, 180)}
                {testimonial.body.length > 180 && '…'}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[rgba(176,141,87,0.10)]">
                {testimonial.customer_avatar ? (
                  <img
                    src={testimonial.customer_avatar}
                    alt={testimonial.customer_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[rgba(176,141,87,0.15)] flex items-center justify-center">
                    <span className="font-mono text-[10px] text-[#B08D57]">
                      {testimonial.customer_name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#EDE6D6] font-medium">{testimonial.customer_name}</p>
                  <p className="font-mono text-[10px] tracking-wider uppercase text-[rgba(237,230,214,0.35)]">
                    {testimonial.customer_location} · {testimonial.service_type}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
