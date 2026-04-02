'use client';

import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Our Work' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = [
  { href: 'https://instagram.com/verma_studio_297', label: 'Instagram', icon: '📷' },
  { href: 'https://youtube.com/@VERMASTUDIO297', label: 'YouTube', icon: '▶️' },
];

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1a1240 0%, #0e2a26 60%, #12103a 100%)',
      color: 'rgba(236, 228, 248, 0.75)',
      padding: '80px 0 0',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '48px',
          paddingBottom: '60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              VERMA STUDIO <span style={{ color: 'var(--color-teal)' }}>297</span>
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '24px', maxWidth: '300px' }}>
              Capturing Moments, Creating Memories. Verma Studio, established in 1991, has been a trusted name in professional photography.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fafafa',
                    textDecoration: 'none',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-teal)';
                    e.currentTarget.style.background = 'var(--color-teal)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-teal)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: 'rgba(250, 250, 250, 0.6)',
                      fontSize: '14px',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-teal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250, 250, 250, 0.6)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-teal)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>📞</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <a href="tel:9810502795" style={{ color: 'inherit', textDecoration: 'none' }}>+91 98105 02795</a>
                  <a href="tel:9582372497" style={{ color: 'inherit', textDecoration: 'none' }}>+91 95823 72497</a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>✉️</span>
                <a href="mailto:vermastudio297@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>vermastudio297@gmail.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>📷</span>
                <a href="https://instagram.com/verma_studio_297" style={{ color: 'inherit', textDecoration: 'none' }}>@verma_studio_297</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>▶️</span>
                <a href="https://youtube.com/@VERMASTUDIO297" style={{ color: 'inherit', textDecoration: 'none' }}>VERMA STUDIO 297</a>
              </div>
            </div>
          </div>

          {/* Studio Hours */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-teal)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              Studio Hours
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '220px' }}>
                <span>Mon – Fri</span>
                <span style={{ color: '#fafafa' }}>9:00 AM – 7:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '220px' }}>
                <span>Saturday</span>
                <span style={{ color: '#fafafa' }}>10:00 AM – 5:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '220px' }}>
                <span>Sunday</span>
                <span style={{ color: '#fafafa' }}>By Appointment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
          fontSize: '13px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p>© {new Date().getFullYear()} Verma Studio 297. All rights reserved.</p>
          <p style={{ color: 'rgba(250, 250, 250, 0.4)' }}>
            Crafted with passion for photography
          </p>
        </div>
      </div>
    </footer>
  );
}
