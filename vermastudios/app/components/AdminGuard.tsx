'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Prevent redirect loop if already on login page
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    if (!isAuthenticated()) {
      router.replace('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Prevent flashing protected content before redirect
  if (!isAuthorized && pathname !== '/admin/login') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-gray-500)' }}>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
