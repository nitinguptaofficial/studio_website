'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionTitle from './components/SectionTitle';
import ServiceCard from './components/ServiceCard';
import TestimonialCard from './components/TestimonialCard';
import { API_URL, getImageUrl } from '@/app/lib/api';

const stats = [
  { number: '500+', label: 'Happy Clients' },
  { number: '1200+', label: 'Projects Completed' },
  { number: '8+', label: 'Years Experience' },
  { number: '15+', label: 'Awards Won' },
];

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface PortfolioImage {
  id: number;
  url: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  images?: PortfolioImage[];
}

interface TestimonialItem {
  id: number;
  name: string;
  event: string;
  quote: string;
  rating: number;
}

import SlideshowImage from './components/SlideshowImage';

export default function Home() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/services`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/portfolio?featured=true`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/testimonials?featured=true`).then(r => r.json()).catch(() => []),
    ]).then(([s, p, t]) => {
      setServices(s.slice(0, 4));
      setPortfolio(p.slice(0, 6));
      setTestimonials(t);
    });
  }, []);



  return (
    <>
      {/* ==================== HERO ==================== */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&h=1080&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)',
        }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 24px',
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '24px',
          }}
            className="animate-fadeInUp"
          >
            Welcome to Varma Studios
          </p>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
            className="animate-fadeInUp delay-200"
          >
            Capturing<br />
            <span style={{ color: 'var(--color-gold)' }}>Timeless</span> Moments
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(250, 250, 250, 0.75)',
            maxWidth: '560px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
            className="animate-fadeInUp delay-300"
          >
            Where every frame tells a story worth remembering. Professional photography
            that transforms your precious moments into eternal art.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            className="animate-fadeInUp delay-400"
          >
            <Link href="/contact" className="btn btn-primary">
              Book a Session
            </Link>
            <Link href="/work" className="btn btn-outline">
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(250, 250, 250, 0.5)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          <span>Scroll</span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
          }} />
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      {services.length > 0 && (
        <section className="section" style={{ background: 'var(--color-white)' }}>
          <div className="container">
            <SectionTitle
              subtitle="What We Offer"
              title="Our Services"
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}>
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  icon={service.icon}
                  title={service.name}
                  description={service.description}
                  index={index}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link href="/services" className="btn btn-dark">
                Explore All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ==================== PORTFOLIO PREVIEW ==================== */}
      {portfolio.length > 0 && (
        <section className="section section-dark">
          <div className="container">
            <SectionTitle
              subtitle="Our Portfolio"
              title="Featured Work"
              light
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}>
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    paddingBottom: '75%',
                    overflow: 'hidden',
                    background: 'var(--color-gray-800)',
                  }}
                  className="img-hover-zoom"
                >
                  <SlideshowImage images={item.images || []} fallbackUrl={item.imageUrl} />
                  <div className="overlay-gradient" />
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1,
                  }}>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--color-gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      marginBottom: '4px',
                    }}>{item.category}</p>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#fafafa',
                    }}>{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link href="/work" className="btn btn-outline">
                View All Work
              </Link>
            </div>
          </div>

          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="grid-template-columns: repeat(3"] {
                grid-template-columns: 1fr 1fr !important;
              }
            }
            @media (max-width: 480px) {
              div[style*="grid-template-columns: repeat(3"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </section>
      )}

      {/* ==================== STATS ==================== */}
      <section style={{
        padding: '80px 0',
        background: 'var(--color-beige)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
            textAlign: 'center',
          }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <p style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'var(--color-gold)',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>{stat.number}</p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-gray-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: repeat(4"] {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 40px !important;
            }
          }
        `}</style>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      {testimonials.length > 0 && (
        <section className="section" style={{ background: 'var(--color-white)' }}>
          <div className="container">
            <SectionTitle
              subtitle="Client Stories"
              title="What Our Clients Say"
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CTA BANNER ==================== */}
      <section style={{
        position: 'relative',
        padding: '120px 0',
        backgroundImage: 'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=600&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 10, 10, 0.8)',
        }} />
        <div className="container" style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#fafafa',
            marginBottom: '16px',
          }}>
            Ready to Create Something Beautiful?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(250, 250, 250, 0.7)',
            maxWidth: '500px',
            margin: '0 auto 36px',
          }}>
            Let&apos;s bring your vision to life. Book a session today and let us capture your story.
          </p>
          <Link href="/contact" className="btn btn-primary" style={{ padding: '16px 48px' }}>
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
