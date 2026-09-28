import * as React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface SiteWrapperProps {
  children: React.ReactNode;
  /** Skip adding the header top padding (for pages with hero images that need full-bleed) */
  noHeaderPadding?: boolean;
}

export function SiteWrapper({ children, noHeaderPadding = false }: SiteWrapperProps) {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className={noHeaderPadding ? '' : 'pt-16 md:pt-20'}
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
