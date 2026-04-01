'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Our Work' },
  { href: '/services', label: 'Services' },
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(201, 169, 110, 0.15)' : 'none',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '22px',
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Verma<span style={{ color: 'var(--color-gold)' }}>Studios</span>
          </span>
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
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: pathname === link.href ? 'var(--color-gold)' : 'rgba(250, 250, 250, 0.8)',
                transition: 'color 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === link.href ? 'var(--color-gold)' : 'rgba(250, 250, 250, 0.8)')}
            >
              {link.label}
              {pathname === link.href && (
                <span style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-gold)',
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
            background: '#fafafa',
            transition: 'all 0.3s ease',
            transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }} />
          <span style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: '#fafafa',
            transition: 'all 0.3s ease',
            opacity: mobileOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: '#fafafa',
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
          background: 'rgba(10, 10, 10, 0.98)',
          borderTop: '1px solid rgba(201, 169, 110, 0.15)',
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
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: pathname === link.href ? 'var(--color-gold)' : 'rgba(250, 250, 250, 0.8)',
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
