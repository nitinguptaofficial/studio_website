'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionTitle from '../components/SectionTitle';
import { API_URL, getImageUrl } from '@/app/lib/api';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  price: string;
  features: string;
}

const processSteps = [
  { step: '01', title: 'Consultation', desc: 'We begin with a detailed discussion to understand your vision, preferences, and requirements.' },
  { step: '02', title: 'Planning', desc: 'Our team creates a detailed shoot plan including locations, timelines, and creative concepts.' },
  { step: '03', title: 'The Shoot', desc: 'On the day, our experienced team captures every moment with precision and creativity.' },
  { step: '04', title: 'Delivery', desc: 'Professional editing, retouching, and delivery of your finalized images in multiple formats.' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then(r => r.json())
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);



  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '60vh',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 10, 0.7)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '16px',
          }}>What We Offer</p>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#fafafa' }}>Our Services</h1>
          <div className="gold-line" />
        </div>
      </section>

      {/* Services List */}
      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading services...</p>
          ) : services.length > 0 ? (
            services.map((service, index) => {
              const featuresList = service.features ? service.features.split(',').map(f => f.trim()).filter(Boolean) : [];
              return (
                <div key={service.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '60px',
                  alignItems: 'center',
                  marginBottom: index < services.length - 1 ? '100px' : '0',
                  direction: index % 2 === 1 ? 'rtl' : 'ltr',
                }}>
                  {/* Image */}
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    direction: 'ltr',
                  }}
                    className="img-hover-zoom"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(service.imageUrl)}
                      alt={service.name}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ direction: 'ltr' }}>
                    <div style={{
                      fontSize: '40px',
                      marginBottom: '16px',
                    }}>{service.icon}</div>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      color: 'var(--color-black)',
                    }}>{service.name}</h2>
                    <div className="gold-line gold-line-left" />
                    <p style={{
                      fontSize: '15px',
                      lineHeight: 1.8,
                      color: 'var(--color-gray-600)',
                      margin: '20px 0 28px',
                    }}>{service.description}</p>
                    {featuresList.length > 0 && (
                      <ul style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        listStyle: 'none',
                        marginBottom: '32px',
                      }}>
                        {featuresList.map((feature) => (
                          <li key={feature} style={{
                            fontSize: '14px',
                            color: 'var(--color-gray-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <span style={{ color: 'var(--color-gold)', fontSize: '12px' }}>✦</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    {service.price && (
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--color-gold)',
                        marginBottom: '24px',
                      }}>{service.price}</p>
                    )}
                    <Link href="/contact" className="btn btn-primary">
                      Request a Quote
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>Services coming soon!</p>
          )}

          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="grid-template-columns: 1fr 1fr"] {
                grid-template-columns: 1fr !important;
                direction: ltr !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* Process */}
      <section className="section section-dark">
        <div className="container">
          <SectionTitle subtitle="How It Works" title="Our Process" light />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
          }}>
            {processSteps.map((item, index) => (
              <div key={item.step} style={{
                textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'rgba(201, 169, 110, 0.15)',
                  lineHeight: 1,
                  marginBottom: '16px',
                }}>{item.step}</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fafafa',
                  marginBottom: '12px',
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(250, 250, 250, 0.6)',
                }}>{item.desc}</p>
                {index < processSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '-16px',
                    width: '32px',
                    height: '1px',
                    background: 'rgba(201, 169, 110, 0.3)',
                  }} />
                )}
              </div>
            ))}
          </div>
          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="grid-template-columns: repeat(4"] {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (max-width: 480px) {
              div[style*="grid-template-columns: repeat(4"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'var(--color-beige)',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '16px' }}>
            Not Sure Which Service Fits?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--color-gray-600)',
            maxWidth: '500px',
            margin: '0 auto 32px',
          }}>
            We are happy to discuss your needs and recommend the perfect photography package for your project.
          </p>
          <Link href="/contact" className="btn btn-dark">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
