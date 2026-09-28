'use client';

import * as React from 'react';
import type { FAQItem } from '@/lib/types';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/primitives/Accordion';

export function FAQAccordion({ items, categories }: { items: FAQItem[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const allCategories = ['All', ...categories.filter((c) => items.some((i) => i.category === c))];
  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="container-wl py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">
        {/* Category sidebar */}
        <aside>
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-4">
            Categories
          </h2>
          <nav className="space-y-1">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left text-sm px-3 py-2 rounded-[2px] transition-colors ${
                  activeCategory === cat
                    ? 'text-[#B08D57] bg-[rgba(176,141,87,0.08)]'
                    : 'text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Questions */}
        <div>
          <Accordion type="single" collapsible className="space-y-0">
            {filtered.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <p className="text-[rgba(237,230,214,0.45)] text-sm">
              No questions in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
