'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Our Work' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`wavy-header ${scrolled ? 'scrolled' : ''}`}
      style={{
        padding: scrolled ? '12px 0' : '20px 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.jpeg" alt="Verma Studio Logo" style={{ height: '60px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }} />
          {/* <span style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '22px',
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            VERMA STUDIO <span style={{ color: 'var(--color-gold)' }}>297</span>
          </span> */}
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: pathname === link.href ? 'var(--color-teal)' : '#1a1a2e',
                transition: 'color 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-teal)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === link.href ? 'var(--color-teal)' : '#1a1a2e')}
            >
              {link.label}
              {pathname === link.href && (
                <span style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-teal)',
                }} />
              )}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '12px' }}>
            Book a Session
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            flexDirection: 'column',
            gap: '5px',
          }}
          aria-label="Toggle menu"
        >
          <span style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: '#1a1240',
            transition: 'all 0.3s ease',
            transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }} />
          <span style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: '#1a1240',
            transition: 'all 0.3s ease',
            opacity: mobileOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: '#1a1240',
            transition: 'all 0.3s ease',
            transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className="mobile-nav"
        style={{
          display: mobileOpen ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '32px 24px',
          background: '#ede8f2',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: 'none',
              fontFamily: 'var(--font-primary)',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: pathname === link.href ? 'var(--color-teal)' : '#1a1a2e',
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/contact" className="btn btn-primary" style={{ marginTop: '8px' }}>
          Book a Session
        </Link>
      </div>

      <style jsx global>{`
        .wavy-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #ede8f2;
          transition: padding 0.3s ease;
          filter: drop-shadow(0 4px 10px rgba(13,17,23,0.07));
        }
        .wavy-header::after {
          content: "";
          position: absolute;
          bottom: -48px;
          left: 0;
          width: 100%;
          height: 48px;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 90' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cpath d='M0,30 C200,80 400,0 600,45 C800,90 1000,10 1200,50 C1300,70 1380,35 1440,30 L1440,0 L0,0 Z' fill='%23ede8f2'/%3E%3C/svg%3E");
          background-size: 100% 100%;
          background-repeat: no-repeat;
          pointer-events: none;
          transform-origin: top;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }

        .wavy-header.scrolled::after {
          transform: scaleY(0);
          opacity: 0;
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}
