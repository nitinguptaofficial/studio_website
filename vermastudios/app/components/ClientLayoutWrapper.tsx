'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isGallery = pathname?.startsWith('/gallery');
  const hideChrome = isAdmin || isGallery;

  return (
    <>
      {!hideChrome && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
