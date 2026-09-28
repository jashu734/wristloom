'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Accordion Root ───────────────────────────────────────────
const Accordion = AccordionPrimitive.Root;

// ─── Accordion Item ───────────────────────────────────────────
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'border-b border-[rgba(176,141,87,0.15)] last:border-0 group',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

// ─── Accordion Trigger ────────────────────────────────────────
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-5 text-left text-sm font-medium text-[#EDE6D6] transition-all duration-200',
        'hover:text-[#B08D57]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B08D57] focus-visible:ring-offset-0',
        '[&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-[#B08D57]',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 text-[#B08D57] flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

// ─── Accordion Content ────────────────────────────────────────
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm text-[rgba(237,230,214,0.65)]',
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className
    )}
    {...props}
  >
    <div className="pb-5 pt-0 leading-relaxed">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
