'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/contacts', label: 'Contacts', icon: '✉️' },
    { href: '/admin/portfolio', label: 'Portfolio', icon: '🖼️' },
    { href: '/admin/events', label: 'Events', icon: '📸' },
    { href: '/admin/services', label: 'Services', icon: '💼' },
    { href: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
    { href: '/admin/about', label: 'About Page', icon: '📄' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--color-black)',
      color: '#fafafa',
      padding: '32px 0',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 24px', marginBottom: '48px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-gold)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Verma Admin
        </h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                color: isActive ? 'var(--color-gold)' : 'rgba(250, 250, 250, 0.7)',
                background: isActive ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
                borderRight: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                fontSize: '15px',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fafafa';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(250, 250, 250, 0.7)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(250, 250, 250, 0.5)',
          textDecoration: 'none',
          fontSize: '14px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fafafa'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(250, 250, 250, 0.5)'}
        >
          <span>←</span> Back to Website
        </Link>
      </div>
    </aside>
  );
}
