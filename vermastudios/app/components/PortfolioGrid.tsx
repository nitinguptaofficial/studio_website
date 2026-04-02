'use client';

import { useState } from 'react';
import Lightbox from './Lightbox';

import SlideshowImage from './SlideshowImage';

interface PortfolioImage {
  id: number;
  url: string;
  type?: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  images?: PortfolioImage[];
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  showFilters?: boolean;
}

const categories = ['All', 'Wedding', 'Events', 'Portraits', 'Commercial'];

export default function PortfolioGrid({ items, showFilters = true }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div>
      {/* Filter Tabs */}
      {showFilters && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 24px',
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--color-gold)' : 'var(--color-gray-300)',
                background: activeCategory === cat ? 'var(--color-gold)' : 'transparent',
                color: activeCategory === cat ? 'var(--color-black)' : 'var(--color-gray-600)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.borderColor = 'var(--color-gold)';
                  e.currentTarget.style.color = 'var(--color-gold)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                  e.currentTarget.style.color = 'var(--color-gray-600)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openLightbox(index)}
            style={{
              position: 'relative',
              paddingBottom: '75%',
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'var(--color-gray-200)',
            }}
          >
            <SlideshowImage images={item.images || []} fallbackUrl={item.imageUrl} />
            {/* Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px',
              }}
              className="portfolio-overlay"
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                const img = e.currentTarget.previousElementSibling as HTMLElement;
                if (img) img.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0';
                const img = e.currentTarget.previousElementSibling as HTMLElement;
                if (img) img.style.transform = 'scale(1)';
              }}
            >
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#fafafa',
                marginBottom: '4px',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {item.category}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={filteredItems.map(item => ({ url: item.imageUrl, title: item.title, type: item.images?.[0]?.type || (item.imageUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1))}
          onNext={() => setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1))}
        />
      )}
    </div>
  );
}
