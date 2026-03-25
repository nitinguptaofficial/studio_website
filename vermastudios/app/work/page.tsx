'use client';

import { useState, useEffect } from 'react';
import PortfolioGrid from '../components/PortfolioGrid';
import SectionTitle from '../components/SectionTitle';
import { API_URL, getImageUrl } from '@/app/lib/api';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

export default function WorkPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/portfolio`)
      .then(r => r.json())
      .then(data => {
        const mapped = data.map((item: PortfolioItem) => ({
          ...item,
          imageUrl: getImageUrl(item.imageUrl),
        }));
        setItems(mapped);
      })
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
        backgroundImage: 'url(https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1920&h=800&fit=crop)',
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
          }}>Portfolio</p>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#fafafa' }}>Our Work</h1>
          <div className="gold-line" />
        </div>
      </section>

      {/* Portfolio */}
      <section className="section">
        <div className="container">
          <SectionTitle
            subtitle="Browse Our Collection"
            title="Explore Our Portfolio"
          />
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading portfolio...</p>
          ) : items.length > 0 ? (
            <PortfolioGrid items={items} showFilters />
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>Portfolio coming soon. Check back later!</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'var(--color-black)',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#fafafa', marginBottom: '16px' }}>
            Like What You See?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(250, 250, 250, 0.6)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Let us create something beautiful for you. Get in touch to discuss your project.
          </p>
          <a href="/contact" className="btn btn-primary">
            Book a Session
          </a>
        </div>
      </section>
    </>
  );
}
