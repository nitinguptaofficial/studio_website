'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
