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
  { href: '#', label: 'Instagram', icon: '📷' },
  { href: '#', label: 'Facebook', icon: '📘' },
  { href: '#', label: 'Pinterest', icon: '📌' },
  { href: '#', label: 'YouTube', icon: '▶️' },
];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-black)',
      color: 'rgba(250, 250, 250, 0.7)',
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
              Verma<span style={{ color: 'var(--color-gold)' }}>Studios</span>
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '24px', maxWidth: '300px' }}>
              Capturing timeless moments with artistry and precision. Every frame tells a story worth remembering.
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
                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                    e.currentTarget.style.background = 'var(--color-gold)';
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
              color: 'var(--color-gold)',
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
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
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
              color: 'var(--color-gold)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>📍</span>
                <span>123 Photography Lane,<br />Creative District, Mumbai 400001</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>📞</span>
                <a href="tel:+919876543210" style={{ color: 'inherit', textDecoration: 'none' }}>+91 98765 43210</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>✉️</span>
                <a href="mailto:hello@vermastudios.com" style={{ color: 'inherit', textDecoration: 'none' }}>hello@vermastudios.com</a>
              </div>
            </div>
          </div>

          {/* Studio Hours */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-gold)',
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
          <p>© {new Date().getFullYear()} Verma Studios. All rights reserved.</p>
          <p style={{ color: 'rgba(250, 250, 250, 0.4)' }}>
            Crafted with passion for photography
          </p>
        </div>
      </div>
    </footer>
  );
}
