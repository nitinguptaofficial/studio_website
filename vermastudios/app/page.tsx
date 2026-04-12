'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SectionTitle from './components/SectionTitle';
import ServiceCard from './components/ServiceCard';
import TestimonialCard from './components/TestimonialCard';
import ScrollReveal from './components/ScrollReveal';
import { API_URL } from '@/app/lib/api';

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
  videoUrl?: string;
}

import SlideshowImage from './components/SlideshowImage';

// Fallback Unsplash video (free to use, high quality cinematic footage)
const HERO_VIDEO_URL =
  '/hero.mp4'; // fallback tiny demo; replace with your own video

export default function Home() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

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

  // Subtle parallax on hero video
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stats counter trigger
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ==================== HERO ==================== */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          minHeight: '700px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#1a1240',
        }}
      >
        {/* Animated dark gradient — sits behind the video as fallback */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1a1240 0%, #0e2a26 30%, #1a1240 60%, #0e1a30 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite',
            zIndex: 0,
          }}
        />

        {/* Background Video — z-index 1 so it always sits above the gradient fallback */}
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          style={{
            transform: `scale(1.07) translateY(${scrollY * 0.15}px)`,
            transition: 'transform 0.1s linear',
            zIndex: 1,
          }}
          onError={(e) => {
            // Hide on error — gradient fallback below will show through
            (e.currentTarget as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Cinematic gradient overlay — z-index 2 so it sits above the video */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
            zIndex: 2,
          }}
        />

        {/* Peacock teal vignette bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 110%, rgba(0,191,165,0.10) 0%, transparent 70%)',
            zIndex: 2,
          }}
        />

        {/* Hero Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: '860px',
            padding: '0 24px',
          }}
        >
          {/* Badge */}
          <div
            className="animate-fadeInUp hero-badge-shimmer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 20px',
              border: '1px solid rgba(0,191,165,0.45)',
              borderRadius: '100px',
              marginBottom: '28px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-teal)',
                boxShadow: '0 0 8px var(--color-teal)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-teal)',
              }}
            >
              Welcome to Verma Studio 297
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 500,
              color: '#fafafa',
              lineHeight: 1.05,
              marginBottom: '28px',
              letterSpacing: '-0.02em',
            }}
            className="animate-fadeInUp delay-200"
          >
            Capturing
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #00BFA5, #a87899, #00BFA5)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              Moments,
            </span>{' '}
            <br />
            Creating Memories.
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'rgba(250, 250, 250, 0.72)',
              maxWidth: '560px',
              margin: '0 auto 44px',
              lineHeight: 1.75,
              fontWeight: 300,
            }}
            className="animate-fadeInUp delay-300"
          >
            Verma Studio, established in 1991, has been a trusted name in professional photography. We focus on understanding our clients' requirements and capturing every special moment with creativity and perfection.
          </p>

          <div
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            className="animate-fadeInUp delay-400"
          >
            <Link href="/contact" className="bg-[#00637C] text-white text-[20px]" style={{ borderRadius: '2px', padding: '16px 40px' }}>
              Book a Session
            </Link>
            <Link href="/work" className="bg-white text-[#00637C] text-[20px]" style={{ borderRadius: '2px', padding: '16px 40px' }}>
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="scroll-bounce"
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(248, 246, 250, 0.45)',
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          <span>Scroll</span>
          <svg width="14" height="22" viewBox="0 0 16 24" fill="none">
            <rect x="6" y="1" width="4" height="8" rx="2" stroke="rgba(0,191,165,0.6)" strokeWidth="1.5" />
            <circle cx="8" cy="5" r="1.5" fill="rgba(0,191,165,0.85)" />
            <path d="M4 16 L8 21 L12 16" stroke="rgba(0,191,165,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Wavy SVG bottom edge */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 3,
            lineHeight: 0,
            overflow: 'hidden',
          }}
        >
          <svg
            viewBox="0 0 1440 90"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '90px' }}
          >
            <path
              d="M0,30 C200,80 400,0 600,45 C800,90 1000,10 1200,50 C1300,70 1380,35 1440,30 L1440,90 L0,90 Z"
              fill="#dfd7ea"
            />
          </svg>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      {services.length > 0 && (
        <section className="section" style={{ background: '#dfd7ea', overflow: 'hidden' }}>
          <div className="container">
            <ScrollReveal animation="fadeUp">
              <SectionTitle subtitle="What We Offer" title="Our Services" />
            </ScrollReveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {services.map((service, index) => (
                <ScrollReveal key={service.id} animation="fadeUp" delay={index * 100}>
                  <ServiceCard
                    icon={service.icon}
                    title={service.name}
                    description={service.description}
                    index={index}
                  />
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal animation="fadeUp" delay={200}>
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Link href="/services" className="btn btn-dark">
                  Explore All Services
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ==================== PORTFOLIO PREVIEW ==================== */}
      {portfolio.length > 0 && (
        <section className="section section-dark" style={{ overflow: 'hidden' }}>
          <div className="container">
            <ScrollReveal animation="fadeUp">
              <SectionTitle subtitle="Our Portfolio" title="Featured Work" light />
            </ScrollReveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {portfolio.map((item, i) => (
                <ScrollReveal
                  key={item.id}
                  animation={i % 3 === 0 ? 'slideLeft' : i % 3 === 2 ? 'slideRight' : 'fadeUp'}
                  delay={i * 80}
                >
                  <div
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
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 1,
                      }}
                    >
                      <p
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-teal)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          marginBottom: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#fafafa' }}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal animation="fadeUp" delay={200}>
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Link href="/work" className="btn btn-outline">
                  View All Work
                </Link>
              </div>
            </ScrollReveal>
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
      <section
        ref={statsRef}
        style={{
          padding: '100px 0',
          background: 'linear-gradient(135deg, #1a1240 0%, #0e2a26 50%, #1a1240 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '4px solid var(--color-teal)',
          borderBottom: '4px solid var(--color-teal)',
        }}
      >
        {/* Decorative teal orb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,191,165,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '32px',
              textAlign: 'center',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={statsVisible ? 'stat-animate' : ''}
                style={{
                  animationDelay: `${i * 100}ms`,
                  opacity: statsVisible ? undefined : 0,
                }}
              >
                <p
                  style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    color: 'var(--color-teal)',
                    lineHeight: 1,
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.number}
                </p>
                <div
                  style={{
                    width: '30px',
                    height: '3px',
                    background: 'var(--color-teal)',
                    margin: '0 auto 12px',
                    opacity: 0.7,
                    borderRadius: '2px',
                  }}
                />
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(250,250,250,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: repeat(4"] {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 48px !important;
            }
          }
        `}</style>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="section" style={{ background: '#e8e2f0', overflow: 'hidden' }}>
        <div className="container">
          <ScrollReveal animation="fadeUp">
            <SectionTitle subtitle="Client Stories" title="What Our Clients Say" />
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Link href="/write-review" className="btn btn-outline" style={{ color: 'var(--color-black)', borderColor: 'var(--color-teal)' }}>
                Write a Review
              </Link>
            </div>
          </ScrollReveal>
          {testimonials.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {testimonials.map((testimonial, i) => (
                <ScrollReveal
                  key={testimonial.id}
                  animation={i % 2 === 0 ? 'slideLeft' : 'slideRight'}
                  delay={i * 100}
                >
                  <TestimonialCard {...testimonial} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>No client stories yet. Be the first to write a review!</p>
          )}
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section
        style={{
          position: 'relative',
          padding: '140px 0',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(26, 18, 64, 0.88)',
          }}
        />
        {/* Teal glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,191,165,0.10) 0%, transparent 70%)',
          }}
        />
        <ScrollReveal animation="fadeUp">
          <div
            className="container"
            style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--color-teal)',
                marginBottom: '20px',
              }}
            >
              Start Your Journey
            </p>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 50px)',
                fontWeight: 800,
                color: '#fafafa',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Create Something Beautiful?
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(250, 250, 250, 0.65)',
                maxWidth: '500px',
                margin: '0 auto 40px',
                fontWeight: 300,
                lineHeight: 1.75,
              }}
            >
              Let&apos;s bring your vision to life. Book a session today and let us capture your story.
            </p>
            <Link
              href="/contact"
              className="btn btn-primary"
              style={{ padding: '18px 56px', borderRadius: '2px', fontSize: '13px' }}
            >
              Get in Touch
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
